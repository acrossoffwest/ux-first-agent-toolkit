---
name: ux-video-director
description: Turn an approved user story into a narrated UX walkthrough video — storyboard with scenes, recording via Playwright, Russian narration via Silero, ffmpeg composition and QA. Use for /ux-video, "record a demo of US-###", or when a story needs video evidence. Orchestrates the full pipeline in tools/.
---

# UX video director

Produce a narrated MP4 demonstrating a user story as a real browser journey.
The pipeline is **audio-first**: narration is synthesized before recording, and
each scene is held on screen at least as long as its narration — silent gaps
are prevented at recording time, not patched in post.

## Pipeline (one story)

```
storyboard.json ──► synth (Silero) ──► durations.json
        │                                   │
        └──► record (Playwright, paced by durations) ──► video.webm + events.json
                                            │
                     plan-timeline ──► timeline.json + subtitles.srt
                                            │
                     compose (ffmpeg) ──► final.mp4
                                            │
                     qa-video ──► qa-report.json  (gate)
```

Run it: `node tools/video/run-pipeline.mjs <storyboard.json> --out artifacts/videos/US-###/`
Re-run one stage after edits: `--only narrate|record|plan|compose|audit`.

## Creating the storyboard

From the story's acceptance criteria, write `storyboard.json` (schema:
`templates/storyboard/storyboard.schema.json`):

1. One scene per meaningful beat: what the user wants → the action → the
   visible response. Follow the story's main scenario, then one failure
   scenario — failure handling on video is the point, not an outtake.
2. Scene actions are the executable steps (`goto/click/fill/expect-*`),
   reusing the prototype's `data-testid` selectors. Every scene ends with an
   `expect-*` — narrate only what is observably true.
3. Write narration per scene using the `ux-narration` skill. Bridge
   transitions in the narration text (strategy A) — the recorder holds the
   scene until the narration finishes.
4. `minHoldSec` for beats that need reading time; `intentionalSilence: true`
   with empty narration for deliberate pauses (strategy F).
5. Typing on camera: use `fill` with `delayMs: 40-80` so input is visible.

Gap strategies A–F and when to use each: `references/gap-strategies.md`.

## Gate

A video exists only when `qa-report.json` says `ok: true`. On QA failure:
fix the storyboard (narration too long → split the scene; unexplained
silence → add bridge narration or mark intentional), re-run the affected
stage, re-audit. Never hand over a final.mp4 with a failed or missing QA report.

Voice config lives in `ux.config.json` (`tts.speaker`, default `baya`,
48000 Hz). The synth tool refuses to substitute an unavailable speaker —
surface that error, do not work around it.
