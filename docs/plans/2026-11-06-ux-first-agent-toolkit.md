# UX-First Agent Toolkit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `ux-first-agent-toolkit` — a Claude Code plugin that enforces a UX-first development lifecycle (intent → stories → flows → mockups → critique → implementation → Playwright journeys → narrated Russian UX videos) with executable validation.

**Architecture:** Claude Code plugin (`.claude-plugin/plugin.json`) with 9 narrow skills, 3 independent subagents (critic, auditor, browser-tester), 7 user-facing commands, and deterministic Node/Python tools under `tools/` that the skills call. Artifacts are traceable by stable IDs (US/UC/FLOW/SCR/TEST) via machine-readable JSON + Markdown pairs. The video pipeline follows the audio-first pacing pattern (proven by argo/nebi prior art): synthesize narration per scene first, then let Playwright pace each scene to `max(minHold, audioDuration)`, so gaps are prevented at recording time rather than patched in post.

**Tech Stack:** Node ≥ 20 (ESM scripts, no framework), Playwright (Chromium, `recordVideo` + custom fps), @axe-core/playwright (wcag2a/2aa/21a/21aa/22aa tags), Python 3.12 via `uv` venv for Silero TTS (`v5_6_ru`, speaker `baya`, 48000 Hz, SSML), ffmpeg/ffprobe 9 (adelay+amix, silencedetect, subtitles, tpad freeze-frames).

**Spec:** The user mission brief (pasted 2026-11-06); research inputs in `docs/research/source-analysis.md`.

## Global Constraints

- Skills: SKILL.md < 500 lines, frontmatter `name` + `description` (what + when), references/ for depth, progressive disclosure.
- No giant monolithic skill; no duplicated capability across agents.
- TTS: Silero `v5_6_ru`, speaker `baya`, 48000 Hz default; no silent speaker substitution; speaker configurable via `ux.config.json`.
- Video QA thresholds configurable; defaults: micro-pause 0.2–0.6 s OK, > 1.5 s silence in transitions flagged unless marked intentional.
- Analyze rendered soundtrack (ffmpeg silencedetect on final.mp4), not only the planned timeline.
- Generated videos/temp artifacts gitignored; core workflow needs no cloud services.
- Implementation gate: no feature code until US + FLOW + mockup + acceptance criteria exist (exception: explicitly flagged maintenance tasks).
- All IDs stable: `US-###`, `UC-###`, `FLOW-###`, `SCR-###`, `TEST-###`; traceability machine-checkable.
- Licenses: preserve attribution from source repos where ideas adapted; check Silero model license before claiming redistribution rights.
- No comments restating code; error messages actionable.

## Review Focus

1. Narration clip longer than its scene's recorded duration → final video must extend the scene (freeze via tpad) rather than cut speech or overlap the next scene. Test pinned in Task 8.
2. Silero returns audio shorter/longer than estimate or fails on a sentence (numbers, latin tokens) → synth tool must report per-scene durations from the actual WAV (ffprobe), never from estimates. Test in Task 6.
3. Journey step fails mid-recording (selector not found) → events.json must record the failure, pipeline must stop with actionable error, qa-report must mark video invalid — no "final.mp4 exists therefore success". Test in Task 7/9.
4. Traceability validator with an orphan screen (SCR not referenced by any US) or dangling TEST→US link → must fail with the exact ID named. Test in Task 4.
5. Demo app error path (invalid email on invite) → journey test must assert the visible error message, and the UX video of the failure scenario must narrate it; story coverage report must show both happy and error path covered. Test in Task 10/12.

---

### Task 1: Repo skeleton + plugin manifest + config schema

**Files:**
- Create: `.claude-plugin/plugin.json`, `README.md`, `LICENSE` (MIT), `CHANGELOG.md`, `.gitignore`, `ux.config.example.json`, `package.json`
- Create: `tools/lib/config.mjs` (load `ux.config.json` with defaults)

**Interfaces:**
- Produces: `loadConfig(rootDir) -> {tts: {modelId, speaker, sampleRate}, video: {width, height, fps}, qa: {maxTransitionSilenceSec, microPauseSec}, artifactsDir}`

- [ ] Write `plugin.json` (name, description, version 0.1.0), package.json (`"type":"module"`, playwright + @axe-core/playwright deps), .gitignore (artifacts/, node_modules/, .venv/, *.wav, *.mp4, *.webm)
- [ ] Write config loader + `node --test` test for defaults/overrides; run; commit

### Task 2: Artifact templates + JSON schemas

**Files:**
- Create: `templates/user-story/US-template.md`, `templates/use-case/UC-template.md`, `templates/acceptance-criteria/AC-template.md`, `templates/storyboard/storyboard.schema.json`, `templates/video-timeline/timeline.schema.json`, `templates/journey/journey.schema.json`, `templates/wireframe/wireframe-template.html`
- Create: `docs/architecture/artifact-model.md` (ID scheme + traceability graph)

**Interfaces:**
- Produces: storyboard schema `{storyId, scenes:[{id, title, narration, minHoldSec?, intentionalPauseSec?, actions:[...]}]}`; journey schema (Playwright-executable steps: goto/click/fill/expect/mark); timeline schema `{scenes:[{id, videoStart, videoEnd, audioStart, audioDur, subtitle}]}`
- These schemas are consumed by Tasks 5–9.

- [ ] Write schemas + templates; validate schemas parse (ajv or JSON.parse + node --test); commit

### Task 3: Skills — strategy tier (product-discovery, user-story-architect, ux-flow-design)

**Files:**
- Create: `skills/product-discovery/SKILL.md` (+references/jtbd.md, references/intent-doc.md)
- Create: `skills/user-story-architect/SKILL.md` (+references/story-mapping.md, references/gherkin.md)
- Create: `skills/ux-flow-design/SKILL.md` (+references/ia-patterns.md)

**Interfaces:**
- Produces artifacts in `docs/ux/`: `product-intent.md`, `stories/US-###.md` (frontmatter: id, goal, persona, status), `flows/FLOW-###.md` (mermaid) — formats from Task 2 templates.

- [ ] Write each SKILL.md < 500 lines, description = what + when, adopt strongest techniques from source-analysis (JTBD interview Qs, story-map slicing, alt/failure scenario checklists, invite-flow style edge-case prompts)
- [ ] Run `node tools/validation/validate-skills.mjs` (built in Task 4) later; commit per skill

### Task 4: Validation tools — skill structure + traceability

**Files:**
- Create: `tools/validation/validate-skills.mjs`, `tools/validation/validate-traceability.mjs`
- Test: `tests/unit/validate-skills.test.mjs`, `tests/unit/validate-traceability.test.mjs`, `tests/fixtures/` (good + broken artifact sets)

**Interfaces:**
- `validate-skills.mjs [dir]` → exit 1 + list of violations (missing description, >500 lines, bad name)
- `validate-traceability.mjs <docs/ux dir>` → report JSON: orphans, dangling refs, coverage matrix US→UC→FLOW→SCR→TEST; exit 1 on orphan/dangling (Review Focus 4: failing fixture names exact ID)

- [ ] TDD both validators with fixtures (red → green); commit

### Task 5: Skills — design tier (ux-prototyping, ux-critique, ux-audit) + subagents

**Files:**
- Create: `skills/ux-prototyping/SKILL.md` (+references/html-prototype.md, references/states.md — loading/empty/success/error)
- Create: `skills/ux-critique/SKILL.md` (+references/nielsen-heuristics.md, references/wcag-checklist.md)
- Create: `skills/ux-audit/SKILL.md`
- Create: `agents/ux-critic.md`, `agents/ux-auditor.md`, `agents/ux-browser-tester.md`

**Interfaces:**
- Prototypes: self-contained HTML files `docs/ux/prototypes/SCR-###.html` (vanilla, clickable navigation between screens, data-testid hooks reused later by real implementation)
- Critique output: `docs/ux/reviews/` with findings ranked by user impact, each tied to heuristic/WCAG criterion + US id

- [ ] Write skills + subagent definitions (critic/auditor get fresh-context independence, browser-tester gets Bash+Playwright instructions); honesty note: axe-core covers WCAG 2.2 only partially (target-size) — manual checklist for 2.4.11/2.5.7/3.3.8 etc. in references
- [ ] validate-skills passes; commit

### Task 6: Audio pipeline — Silero synth tool

**Files:**
- Create: `tools/audio/setup-venv.sh` (uv venv, python 3.12, torch cpu), `tools/audio/synth_narration.py`, `tools/audio/requirements.txt`
- Test: `tests/integration/test_synth.sh` (synthesize 2 short RU phrases, assert WAVs exist, 48000 Hz via ffprobe, durations.json written)

**Interfaces:**
- `synth_narration.py --storyboard storyboard.json --out artifacts/videos/US-###/audio/` → `scene-<id>.wav` per scene + `durations.json {sceneId: seconds}` measured from actual WAV via soundfile/ffprobe (Review Focus 2)
- Model: direct download `https://models.silero.ai/models/tts/ru/v5_6_ru.pt` + torch.package loader (works offline after first fetch); speaker from config, default `baya`; SSML `<break>` for intentional pauses

- [ ] Write script; run integration test for real (red → green); commit

### Task 7: Browser pipeline — journey recorder + axe scan

**Files:**
- Create: `tools/browser/record-journey.mjs`, `tools/browser/axe-scan.mjs`, `tools/lib/journey-runner.mjs`
- Test: `tests/integration/record.test.mjs` (against demo app from Task 10 — stub fixture page until then)

**Interfaces:**
- `record-journey.mjs --journey journey.json --durations durations.json --out artifacts/videos/US-###/raw/` → `video.webm` + `events.json [{sceneId, tStartMs, tEndMs, action, ok, error?}]`
- Paces each scene: executes actions, then waits until elapsed ≥ max(minHoldSec, durations[sceneId]) before next scene (audio-first pacing)
- On step failure: writes events.json with `ok:false` + error, exits 1 (Review Focus 3)
- Video: Chromium `recordVideo` {size from config, fps 30}
- `axe-scan.mjs --url <u> --out report.json` → tags wcag2a/2aa/21a/21aa/22aa, fails on serious+critical

- [ ] TDD runner against fixture HTML page; commit

### Task 8: Video pipeline — timeline planner + composer + QA

**Files:**
- Create: `tools/video/plan-timeline.mjs`, `tools/video/compose.mjs`, `tools/video/qa-video.mjs`, `tools/audio/detect-gaps.mjs`
- Test: `tests/integration/compose.test.mjs` (fixture webm + wavs → final.mp4; ffprobe asserts: has audio+video, duration matches timeline; gap detector flags planted 2 s silence, passes intentional pause)

**Interfaces:**
- `plan-timeline.mjs --events events.json --durations durations.json --storyboard storyboard.json --out timeline.json` → scene windows; where audioDur > sceneDur: plan tpad freeze extension (Review Focus 1); emits subtitles.srt timings
- `compose.mjs --timeline timeline.json --video raw/video.webm --audio audio/ --out final.mp4` → ffmpeg: per-scene adelay + amix (or concat of per-scene segments), tpad freezes, soft-burn or sidecar SRT per config
- `qa-video.mjs --video final.mp4 --timeline timeline.json --out qa-report.json` → ffprobe stream checks + silencedetect on rendered audio; flags: silence > threshold not marked intentional, narration overlapping scene boundary, audio longer than video; exit 1 on critical
- `ux:video-audit` = qa-video + human-readable summary

- [ ] TDD with planted-defect fixtures (red → green); commit

### Task 9: Video skills + orchestration (ux-video-director, ux-narration, ux-video-qa)

**Files:**
- Create: `skills/ux-video-director/SKILL.md` (+references/storyboarding.md, references/gap-strategies.md — strategies A–F from spec)
- Create: `skills/ux-narration/SKILL.md` (+references/narration-style.md — grounded-in-events rule, no filler, RU style guide)
- Create: `skills/ux-video-qa/SKILL.md`
- Create: `tools/video/run-pipeline.mjs` (one entry: story → storyboard → synth → record → plan → compose → qa, resumable per stage, `--only <stage>` regeneration)

**Interfaces:**
- Consumes every tool from Tasks 6–8 by exact CLI contracts above
- `run-pipeline.mjs US-001 [--only narrate|record|render|audit]` — idempotent; stage outputs under `artifacts/videos/US-001/`

- [ ] Write skills; wire pipeline runner; unit-test stage skipping logic; commit

### Task 10: Commands + workflows

**Files:**
- Create: `commands/ux-init.md`, `commands/ux-story.md`, `commands/ux-build.md`, `commands/ux-test.md`, `commands/ux-video.md`, `commands/ux-audit.md`, `commands/ux-full-cycle.md`
- Create: `workflows/new-product.md`, `workflows/new-feature.md`, `workflows/ux-review.md`, `workflows/story-to-video.md`

**Interfaces:**
- Each command routes to exactly one skill/workflow (no overlap); ux-build enforces the gate: refuses implementation if validate-traceability shows missing US/FLOW/mockup/AC for the target story (maintenance exception via explicit `--maintenance` arg)

- [ ] Write commands + workflows; validate-skills passes; commit

### Task 11: Demo app

**Files:**
- Create: `examples/demo-app/` — static vanilla HTML/JS "TeamBoard": create project → invite member by email (happy path), invalid email + already-member error paths; `npx serve`-able, no build; data-testid on interactive elements
- Create: `examples/demo-app/docs/ux/` — full artifact set: US-001 (create project), US-002 (invite member) with UC/FLOW/SCR/AC/TEST ids, prototypes

**Interfaces:**
- Serves at :4173 via `npm run demo`; journey.json files for US-001/US-002 under `examples/demo-app/journeys/`

- [ ] Build app + artifacts; validate-traceability passes on the example; Playwright journey for both paths passes; commit

### Task 12: End-to-end demonstration (Phase 7)

**Files:**
- Create: `artifacts/videos/US-002/` (gitignored output; qa-report.json + summary committed to docs/examples/)
- Modify: `README.md` (verified quickstart)

- [ ] Run full pipeline on US-002 (invite flow incl. error scenario) with Silero baya for real; verify final.mp4 with ffprobe + qa-video; fix until qa passes
- [ ] Record story/scene coverage report; commit docs

### Task 13: Toolkit test suite + docs (Phases 8–9)

**Files:**
- Create: `tests/unit/*` consolidation, `package.json` scripts (`test`, `test:integration`, `validate`)
- Create: `docs/architecture/overview.md`, `docs/examples/`, troubleshooting in README (torch/uv/ffmpeg/playwright install, headless quirks)

- [ ] All tests green (`npm test`); document real dependency setup incl. exact versions verified; commit

### Task 14: Final audit (Phase 10)

- [ ] Independent review: dispatch ux-auditor subagent on the toolkit's own DX + `/codex:review --base main` (cross-provider gate per CLAUDE.md)
- [ ] Fix critical findings; update CHANGELOG to 0.1.0; final commit
