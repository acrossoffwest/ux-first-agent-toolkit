#!/usr/bin/env python
"""Synthesize per-scene Russian narration from a storyboard with Silero TTS.

Writes scene-<id>.wav (16-bit PCM) and durations.json with durations measured
from the rendered audio, never from estimates.
"""

import argparse
import json
import sys
import urllib.request
import wave
from pathlib import Path


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
    parser.add_argument("--sample-rate", type=int, default=48000, choices=[8000, 24000, 48000])
    parser.add_argument("--device", default="cpu")
    args = parser.parse_args()

    storyboard = json.loads(Path(args.storyboard).read_text(encoding="utf-8"))
    scenes = storyboard.get("scenes") or fail("storyboard has no scenes")
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    model = load_model(Path(args.model_file), args.model_url, args.device)
    if args.speaker not in getattr(model, "speakers", [args.speaker]):
        fail(
            f"speaker '{args.speaker}' not available; model offers {model.speakers}. "
            "Refusing to substitute a different voice — set tts.speaker explicitly."
        )

    durations = {}
    for scene in scenes:
        scene_id = scene["id"]
        text = (scene.get("narration") or "").strip()
        if not text:
            if not scene.get("intentionalSilence"):
                fail(f"scene {scene_id}: empty narration without intentionalSilence: true")
            durations[scene_id] = 0.0
            continue
        kwargs = {"speaker": args.speaker, "sample_rate": args.sample_rate}
        if text.startswith("<speak>"):
            audio = model.apply_tts(ssml_text=text, **kwargs)
        else:
            audio = model.apply_tts(text=text, put_accent=True, put_yo=True, **kwargs)
        durations[scene_id] = round(write_wav(out_dir / f"scene-{scene_id}.wav", audio, args.sample_rate), 3)

    (out_dir / "durations.json").write_text(json.dumps(durations, indent=2), encoding="utf-8")
    print(json.dumps({"scenes": len(durations), "out": str(out_dir)}))


if __name__ == "__main__":
    main()
