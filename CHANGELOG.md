# Changelog

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
