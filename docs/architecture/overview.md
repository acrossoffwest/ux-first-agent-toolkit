# Architecture overview

## Design principles

1. **Artifacts over conversation.** Lifecycle state lives in files with stable
   IDs, validated by deterministic tools — a new agent session reconstructs
   everything from the repo.
2. **Narrow skills, progressive disclosure.** Nine skills, each < 500 lines,
   depth in references/. Commands are thin routers; no skill duplicates
   another's responsibility.
3. **Fail-closed gates.** A check that didn't run is a failure, not a pass
   (lesson from plugin87's missing-browser trap). The QA suite tests itself
   with planted defects.
4. **Audio-first video.** Narration is synthesized before recording; the
   recorder holds each scene for its measured audio duration. Gaps are
   prevented, then the rendered soundtrack is still measured.
5. **Independent judgment is a separate context.** Critic, auditor and
   browser-tester run as subagents that read artifacts, not the author's
   reasoning.

## Component map

```
skills/      reasoning (how to think about each lifecycle stage)
agents/      independent evaluators (critic, auditor, browser-tester)
commands/    user entry points, one per lifecycle verb
workflows/   playbooks combining commands for common situations
tools/       deterministic executables
  lib/         config, frontmatter, journey-runner
  validation/  validate-skills, validate-traceability
  browser/     record-journey, axe-scan
  audio/       synth_narration (Silero), detect-gaps, setup-venv
  video/       plan-timeline, compose, qa-video, run-pipeline
templates/   artifact formats + JSON schemas (storyboard, timeline)
remotion/    optional polish compositions (intro/outro, badges, progress)
examples/    TeamBoard demo app with a complete artifact chain
tests/       unit + integration (real Chromium, real ffmpeg, real Silero)
```

## Data flow (one story)

US-###.md (acceptance criteria)
→ storyboard.json (scenes: narration + executable actions, one schema)
→ voice/*.wav + durations.json (measured, never estimated)
→ raw/video.webm + events.json (scene timestamps, per-action verdicts)
→ timeline.json (+ freeze extensions) + subtitles.srt
→ final.mp4
→ qa-report.json — the only artifact that can declare the video valid.

## Trade-offs accepted

- Scenes are paced at recording time, so the raw video is already
  narration-shaped; we lose the ability to re-narrate without re-recording
  (acceptable: `--only narrate` re-runs both, and recording is cheap).
- The storyboard unifies test journey and video script; a purely functional
  test pays a small cost in schema fields it ignores (acceptable: one file,
  zero drift between what is tested and what is shown).
- Timeline composition is per-scene adelay+amix over one continuous recording,
  with tpad freezes only when narration outruns a scene — no scene reordering
  or trimming in v1 (deliberate: compression strategies beyond pacing are in
  gap-strategies.md as manual moves).
- The polish stage stages its inputs through `remotion/public/` (a single
  shared directory) and re-renders on every run: polished videos from two
  pipelines must not render concurrently, and polish adds ~1 min per run
  (acceptable: polish is opt-in and last).
