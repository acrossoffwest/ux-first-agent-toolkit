---
description: Record, narrate (Russian, Silero baya) and render a UX walkthrough video for a user story, with silence-gap QA. Produces artifacts/videos/US-###/final.mp4 + qa-report.json.
argument-hint: "US-### [--only narrate|record|plan|compose|audit]"
---

Produce the narrated walkthrough for the story in $ARGUMENTS.

1. Invoke `ux-video-director`. Build or reuse the storyboard from the story's
   acceptance criteria (narration per the `ux-narration` skill — grounded,
   no filler, bridges over transitions).
2. Run `node tools/video/run-pipeline.mjs <storyboard> --out artifacts/videos/US-###/`
   (pass `--only <stage>` from $ARGUMENTS when iterating).
3. Apply the `ux-video-qa` skill to the result: the video exists only when
   qa-report.json says ok:true. Drive the fix loop otherwise.

Prerequisites checked up front: `.venv-tts` (tools/audio/setup-venv.sh),
ffmpeg/ffprobe on PATH, Playwright chromium, the app or prototype reachable at
the storyboard's baseUrl. Name the exact missing piece instead of failing midway.

Deliver: final.mp4 path, QA verdict, scene/scenario coverage, narration script path.
