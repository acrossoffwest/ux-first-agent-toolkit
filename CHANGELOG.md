# Changelog

## 0.3.0 — 2026-11-08

- `feature-discovery` skill + `/ux-discover` command: reverse-engineer an
  existing codebase — parallel surface sweep (UI, CLI, API, MCP, background,
  hidden flags), clustered inventory with code `evidence:`, shipped
  `FEAT-###.md` files, and a reality diff (promised-not-found /
  found-not-documented); `workflows/existing-product.md` for toolkit adoption
- FEAT template: `status: shipped`, optional `evidence:`/`confidence:` for
  discovered features
- Dual-voice TTS: Latin runs in narration are synthesized by Silero `v3_en`
  (female `en_99`, config `tts.en`) and spliced into the Russian track
- `evaluate` storyboard action: run a JS expression in page context (trigger
  mocked backend events on camera)
- `ux-video-director`: «Полный цикл ОТ А ДО Я» gate for feature explainers —
  entry path, interaction and return path must be shown on screen
- storyboard `storyId` accepts uppercase slugs for feature explainers

## 0.2.0 — 2026-11-06

- `feature-mapping` skill + `/ux-features` command: feature ideation from
  product intent, end-to-end journey per feature (FEAT-### artifacts), and a
  machine-checked intersection matrix — shared screens must be declared
  mutually, approved features must decompose into stories
  (validate-traceability enforces both).
- Colorful journey visuals: imagegen-driven illustrations per feature and an
  isometric feature map, with a documented style guide and mermaid fallback.
- Livelier narration: conversational scene openers («Итак…», «А что если…?»)
  codified in ux-narration; demo storyboards updated.
- Remotion polish stage (`--polish` / `video.polish.enabled`): narrated
  intro/outro cards, animated scene badges, progress bar → `polished.mp4`
  with its own shifted-timeline QA (`qa-polished.json`).

## 0.1.0 — 2026-11-06

Initial release.

- Nine Agent Skills across the UX-first lifecycle: product-discovery,
  user-story-architect, ux-flow-design, ux-prototyping, ux-critique, ux-audit,
  ux-video-director, ux-narration, ux-video-qa.
- Three independent subagents: ux-critic, ux-auditor, ux-browser-tester.
- Seven commands: /ux-init, /ux-story, /ux-build (hard artifact gate),
  /ux-test, /ux-video, /ux-audit, /ux-full-cycle.
- Deterministic tools: skill/traceability validators, Playwright journey
  recorder with audio-first scene pacing, axe-core scan (WCAG 2.2 tags with
  documented limits), Silero v5_6_ru narration synthesis, ffmpeg timeline
  composer with freeze-frame extension, rendered-soundtrack QA with
  silence-gap gate.
- TeamBoard demo app with a complete traceable artifact chain and a verified
  narrated walkthrough (evidence in docs/examples/).
