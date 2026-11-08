#!/usr/bin/env python
"""Synthesize per-scene narration from a storyboard with Silero TTS.

Russian (Cyrillic) text goes to the Russian model; Latin-script runs are
synthesized by a separate English Silero model (female voice by default)
and spliced in, so English terms are pronounced instead of mangled.

Writes scene-<id>.wav (16-bit PCM) and durations.json with durations measured
from the rendered audio, never from estimates.
"""

import argparse
import json
import re
import sys
import urllib.request
import wave
from pathlib import Path

LATIN_RUN = re.compile(r"[A-Za-z][A-Za-z0-9'&+./-]*(?:\s+[A-Za-z][A-Za-z0-9'&+./-]*)*")
ACRONYM = re.compile(r"\b[A-Z]{2,5}s?\b")


def speakable_en(chunk: str, lexicon: dict) -> str:
    """Audio-only rewrite of a Latin run: storyboard lexicon first, then spell acronyms."""
    for word, spoken in lexicon.items():
        chunk = re.sub(rf"(?<![\w-]){re.escape(word)}(?![\w-])", spoken, chunk)
    return ACRONYM.sub(lambda m: " ".join(m.group()), chunk)


def split_segments(text: str):
    """Split text into [('ru'|'en', chunk)] keeping order; punctuation stays with ru."""
    segments = []
    pos = 0
    for match in LATIN_RUN.finditer(text):
        if match.start() > pos:
            segments.append(("ru", text[pos:match.start()]))
        segments.append(("en", match.group()))
        pos = match.end()
    if pos < len(text):
        segments.append(("ru", text[pos:]))
    # punctuation-only chunks (e.g. the ", " between two Latin runs) crash the
    # TTS models — drop them; the inter-segment gap supplies the pause
    return [(lang, chunk) for lang, chunk in segments if re.search(r"\w", chunk)]


def fail(message: str) -> None:
    print(f"error: {message}", file=sys.stderr)
    raise SystemExit(1)


def load_model(model_file: Path, model_url: str, device_name: str):
    import torch

    if not model_file.is_file():
        print(f"downloading model to {model_file} ...", file=sys.stderr)
        model_file.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(model_url, model_file)
    torch.set_num_threads(4)
    model = torch.package.PackageImporter(str(model_file)).load_pickle("tts_models", "model")
    model.to(torch.device(device_name))
    return model


def write_wav(path: Path, audio, sample_rate: int) -> float:
    import numpy as np

    pcm = np.clip(audio.numpy(), -1.0, 1.0)
    pcm16 = (pcm * 32767).astype("<i2")
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        f.writeframes(pcm16.tobytes())
    return len(pcm16) / sample_rate


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--storyboard", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--model-file", default=str(Path.home() / ".cache/ux-toolkit/v5_6_ru.pt"))
    parser.add_argument("--model-url", default="https://models.silero.ai/models/tts/ru/v5_6_ru.pt")
    parser.add_argument("--speaker", default="baya")
    parser.add_argument("--en-model-file", default=str(Path.home() / ".cache/ux-toolkit/v3_en.pt"))
    parser.add_argument("--en-model-url", default="https://models.silero.ai/models/tts/en/v3_en.pt")
    parser.add_argument("--en-speaker", default="en_49")
    parser.add_argument("--sample-rate", type=int, default=48000, choices=[8000, 24000, 48000])
    parser.add_argument("--device", default="cpu")
    args = parser.parse_args()

    storyboard = json.loads(Path(args.storyboard).read_text(encoding="utf-8"))
    scenes = storyboard.get("scenes") or fail("storyboard has no scenes")
    lexicon = storyboard.get("pronounce") or {}
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    model = load_model(Path(args.model_file), args.model_url, args.device)
    if args.speaker not in getattr(model, "speakers", [args.speaker]):
        fail(
            f"speaker '{args.speaker}' not available; model offers {model.speakers}. "
            "Refusing to substitute a different voice — set tts.speaker explicitly."
        )

    en_model = None

    def get_en_model():
        nonlocal en_model
        if en_model is None:
            en_model = load_model(Path(args.en_model_file), args.en_model_url, args.device)
            if args.en_speaker not in getattr(en_model, "speakers", [args.en_speaker]):
                fail(
                    f"English speaker '{args.en_speaker}' not available; model offers "
                    f"{en_model.speakers}. Set tts.en.speaker explicitly."
                )
        return en_model

    def synth_ru(text: str):
        return model.apply_tts(
            text=text, put_accent=True, put_yo=True,
            speaker=args.speaker, sample_rate=args.sample_rate,
        )

    def synth_mixed(text: str):
        import torch

        segments = split_segments(text)
        if all(lang == "ru" for lang, _ in segments):
            return synth_ru(text)
        gap = torch.zeros(int(args.sample_rate * 0.08))
        parts = []
        for lang, chunk in segments:
            if lang == "ru":
                parts.append(synth_ru(chunk))
            else:
                parts.append(get_en_model().apply_tts(
                    text=speakable_en(chunk, lexicon), speaker=args.en_speaker, sample_rate=args.sample_rate,
                ))
            parts.append(gap)
        return torch.cat(parts[:-1])

    durations = {}
    for scene in scenes:
        scene_id = scene["id"]
        text = (scene.get("narration") or "").strip()
        if not text:
            if not scene.get("intentionalSilence"):
                fail(f"scene {scene_id}: empty narration without intentionalSilence: true")
            durations[scene_id] = 0.0
            continue
        if text.startswith("<speak>"):
            audio = model.apply_tts(
                ssml_text=text, speaker=args.speaker, sample_rate=args.sample_rate,
            )
        else:
            audio = synth_mixed(text)
        durations[scene_id] = round(write_wav(out_dir / f"scene-{scene_id}.wav", audio, args.sample_rate), 3)

    (out_dir / "durations.json").write_text(json.dumps(durations, indent=2), encoding="utf-8")
    print(json.dumps({"scenes": len(durations), "out": str(out_dir)}))


if __name__ == "__main__":
    main()
