# Workflow: story to narrated video

The detailed path behind `/ux-video`, for manual control or debugging.

```
US-###.md (acceptance criteria)
  │  ux-video-director: scenes = story beats; actions from prototype testids
  ▼
storyboard.json ──► narration.md (ux-narration: grounded Russian script)
  │
  ▼  node tools/video/run-pipeline.mjs storyboard.json --out artifacts/videos/US-###/
  1. narrate  — Silero v5_6_ru/baya/48k → voice/*.wav + durations.json
  2. record   — Playwright paced by durations → raw/video.webm + events.json
  3. plan     — timeline.json (+freeze where narration outlasts scene) + subtitles.srt
  4. compose  — ffmpeg (adelay+amix, tpad freezes) → final.mp4
  5. audit    — qa-video (ffprobe + silencedetect) → qa-report.json
```

Iteration shortcuts:
- Narration text changed → `--only narrate` (re-records too: pacing depends on durations).
- App changed, narration same → `--only record`.
- Thresholds/subtitles only → `--only plan` or `--only compose`.
- `--headed` on the pipeline to watch the recording live.

Done = qa-report `ok: true` + the listen check from `ux-video-qa`.
