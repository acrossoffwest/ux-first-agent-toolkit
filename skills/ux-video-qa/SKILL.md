---
name: ux-video-qa
description: Validate a rendered UX walkthrough video — stream integrity, duration vs timeline, narration/scene sync, unexplained silent gaps, subtitle timing. Use after composing a video, for /ux-video audits, or when a video "feels off". Interprets qa-report.json and drives the fix loop.
---

# UX video QA

A video is not done when final.mp4 exists; it is done when the QA gate passes
on the *rendered* file. The analyzer measures the actual soundtrack
(ffmpeg silencedetect), never just the planned timeline.

## Run

```
node tools/video/qa-video.mjs --video final.mp4 --timeline timeline.json --out qa-report.json
```

Checks: `file-exists`, `has-video-stream`, `has-audio-stream`,
`duration-matches-timeline` (±0.75s), `narration-within-scene`,
`no-unexplained-silence`. Thresholds come from `ux.config.json` →
`qa.maxTransitionSilenceSec` (default 1.5s), `qa.silenceNoiseDb` (-40dB).
Silence inside `intentionalSilence` scenes is accepted; everything else over
the threshold fails the gate.

## Fix loop by failure

| Failure | Likely cause | Fix |
|---|---|---|
| no-unexplained-silence | scene much longer than its narration | bridge narration (strategy A), caption scene (B), or `intentionalSilence` if genuinely deliberate (F) |
| | narration missing for a scene | write it; empty narration requires `intentionalSilence: true` |
| narration-within-scene | narration longer than recorded scene and freeze failed | split the scene or shorten the text; re-run from `narrate` |
| duration-matches-timeline | compose dropped/extended content | inspect timeline vs ffprobe; re-run `compose`; check freeze values |
| has-audio-stream | synth produced nothing / wrong paths | check durations.json and voice/ wav files |

After a fix, re-run only the affected stages
(`run-pipeline.mjs --only narrate` / `--only compose`), then re-audit.
Re-render until the report says `ok: true`.

## Listen check (final)

QA automation cannot hear awkwardness. Before declaring the video done, play
the first 20 seconds and one transition: narration starts after its visual
context appears, speech does not outlive its subject, no abrupt cuts. Subtitle
spot-check: one cue matches speech within ~0.3s.

## Reporting

Report the video as valid only with: path to final.mp4, qa-report.json with
`ok: true`, and scene/story coverage (which acceptance scenarios the video
demonstrates). A failed report is a finding to fix, never to suppress.
