# ux-first-agent-toolkit

A Claude Code plugin that makes AI agents build **usable** applications, not
just functional ones. It enforces a UX-first lifecycle — product intent →
user stories → flows → interactive mockups → critique → implementation →
Playwright journey tests → narrated UX walkthrough videos (Russian TTS) —
with executable gates at every step.

**The core promise:** no feature code before an approved story, flow, mockup
and acceptance criteria exist — and no "done" before journeys pass and the
narrated video survives QA of its actual rendered soundtrack.

## Install

```bash
# as a Claude Code plugin (marketplace or local)
claude plugin install /path/to/ux-first-agent-toolkit

# toolkit runtime deps (for journey tests and video)
npm install
npx playwright install chromium
bash tools/audio/setup-venv.sh     # Python 3.12 venv with torch, via uv
```

System requirements: Node ≥ 20.6, ffmpeg + ffprobe on PATH,
[uv](https://docs.astral.sh/uv/) for the TTS venv. The Silero model
(`v5_6_ru`, ~60 MB) downloads on first synthesis to `~/.cache/ux-toolkit/`.
No cloud services are required.

## Commands

| Command | Purpose |
|---|---|
| `/ux-init` | Create or inspect UX context (product-intent, artifact status) |
| `/ux-story` | Full story chain: US + UC + flows + prototypes + critique + gate |
| `/ux-build US-###` | Implement a story — hard gate on approved artifacts |
| `/ux-test [US-###]` | Execute journeys + axe scans, per-scenario verdicts |
| `/ux-video US-###` | Record, narrate (Silero `baya`, 48 kHz) and render a walkthrough |
| `/ux-audit` | Independent final audit → SHIP / DO NOT SHIP with evidence |
| `/ux-full-cycle` | All of the above with gates between phases |

Experienced users can invoke skills (`product-discovery`,
`user-story-architect`, `ux-flow-design`, `ux-prototyping`, `ux-critique`,
`ux-audit`, `ux-video-director`, `ux-narration`, `ux-video-qa`) and the
tools under `tools/` directly.

## The video pipeline

```
storyboard.json ─ narrate (Silero) ─ durations.json
      └─ record (Playwright, scenes paced by audio duration) ─ video.webm + events.json
           └─ plan-timeline ─ timeline.json + subtitles.srt
                └─ compose (ffmpeg: adelay+amix, freeze-frames) ─ final.mp4
                     └─ qa-video (ffprobe + silencedetect) ─ qa-report.json  ← the gate
```

Audio-first pacing prevents silent gaps at recording time; QA then measures
the **rendered** soundtrack and fails on unexplained silence over the
configured threshold (`ux.config.json` → `qa.maxTransitionSilenceSec`).
A video "exists" only when `qa-report.json` says `ok: true`.

## Try it on the demo app

```bash
npm run demo &                          # serves examples/demo-app on :4173
node tools/browser/record-journey.mjs \
  --storyboard examples/demo-app/journeys/US-002.storyboard.json \
  --out /tmp/us2 --no-video             # journey test
node tools/video/run-pipeline.mjs \
  examples/demo-app/journeys/US-002.storyboard.json \
  --out artifacts/videos/US-002        # full narrated video + QA
```

`examples/demo-app/` is a complete worked example: TeamBoard (create project,
invite a colleague) with the full artifact chain — intent, stories US-001/002,
use case, flows, interactive prototypes, journey storyboards covering happy
and failure paths. Evidence from a real pipeline run: `docs/examples/`.

## Validation

```bash
npm test                 # unit tests (validators, config, timeline, stages)
npm run test:integration # real Chromium recording + ffmpeg composition + QA
npm run validate         # skill structure + demo-app traceability
bash tests/integration/test_synth.sh   # real Silero synthesis (needs venv)
```

## Troubleshooting

- **`.venv-tts not found`** — run `bash tools/audio/setup-venv.sh` (requires uv).
- **`speaker 'X' not available`** — the synth refuses to substitute voices;
  set `tts.speaker` in `ux.config.json` to one of aidar/baya/kseniya/xenia/eugene.
- **`ERR_CONNECTION_REFUSED` in journeys** — the app isn't served at the
  storyboard's `baseUrl`; start it first.
- **No webm produced** — the recording context must close cleanly; check for
  a crashed step in `events.json` (the runner reports the failing scene/action).
- **QA fails `no-unexplained-silence`** — see the fix-loop table in
  `skills/ux-video-qa/SKILL.md` (bridge narration / caption / intentionalSilence).
- **Silero license** — model weights are CC-BY-NC per the silero-models README;
  clear commercial narration use with Silero's terms.

## Architecture

See `docs/architecture/overview.md`, `docs/architecture/artifact-model.md`
(ID graph and gates) and `docs/research/source-analysis.md` (what was adopted
from prior art and why).

## License

MIT. Ideas adapted (with attribution, no code copied) from
[super-ux](https://github.com/ssheleg/super-ux) (MIT),
[ux-skills](https://github.com/Tranz007/ux-skills) (MIT),
[pm-skills](https://github.com/product-on-purpose/pm-skills) (Apache 2.0),
[ux-ui-agent-skills](https://github.com/plugin87/ux-ui-agent-skills) (MIT).
