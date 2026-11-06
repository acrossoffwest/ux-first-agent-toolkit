# Source analysis — research behind the toolkit

Research date: 2026-11-06. Sources: Parallel Deep Research run (analyst report
with citations), direct Exa searches of primary docs (Playwright, Silero,
Agent Skills spec, axe-core), cross-provider Codex repo inspection.

## Comparison matrix — the four source repositories

| Source | Capability | Strengths | Weaknesses | Decision | Rationale | License |
|---|---|---|---|---|---|---|
| ssheleg/super-ux | 7 skills (vision, ux-foundation, ux-flows, ux-scenarios, ux-audit, brand-voice, copywriting); stable IDs (P/JTBD/JRN/ST/FLW/SCR/SCN); Python traceability linter; audit verdicts PASS/PARTIAL/FAIL/BLOCKED with file:line evidence | The scenario contract: implementation waits for approved UX; deterministic lint of broken traces, orphans, uncovered screens | Chain stops at documents — no join into executable tests, media, or timed evidence | **Adapt** | We extend its strongest idea (ID traceability + lint) into journeys and video; evidence-bearing audit verdicts adopted verbatim | MIT |
| Tranz007/ux-skills | 15 reasoning skills (frame, challenge, blindspots, state-sweep, critique, ripple, handoff…); persistent .ux/ context files; evidence labels known/inferred/assumed/unknown/conflicted | "Explore before asking"; uncertainty labeling; reuse the real design system; intent/context/reasoning separation | Deliberately light: no artifact schemas, no executable gates, no lifecycle enforcement | **Adapt** | Uncertainty labels and explore-first adopted into product-discovery; state-sweep became the 5-state prototype rule | MIT |
| product-on-purpose/pm-skills | 68 skills, 6 agents, 12 workflows, 11 commands; output contracts (TEMPLATE.md + EXAMPLE.md per skill); frontmatter linting; critic/orchestrator separation | Workflow handoffs; independent pm-critic; CI-enforced skill contracts | Catalog size would bury the active task in context; PM breadth beyond UX scope | **Adopt pattern, reject catalog** | Producer/critic agent separation and per-skill output contracts adopted; we expose 7 commands, not 68 skills | Apache 2.0 |
| plugin87/ux-ui-agent-skills | 26 skills + design-critic agent; 52 executable gates (34 browser-backed); DTCG tokens; MCP server | Fail-closed aggregate runner; negative gate fixtures; rendered checks over self-assessment; documented "exit 0 ≠ evaluated" trap | Huge knowledge library; README inventory counts drift; rendered pass ≠ product usefulness | **Adapt** | Fail-closed gates and planted-defect test fixtures adopted (our QA tests plant silent gaps and broken selectors); token doctrine rejected as out of scope | MIT (Thientan Soparat) |

No code was copied from these repositories; ideas were adapted with
attribution above. If verbatim material is ever imported, carry the upstream
license text alongside it (Apache 2.0 additionally requires NOTICE retention
and modification marking).

## Key technical findings

### Agent Skills / Claude Code plugin
- SKILL.md frontmatter: `name` (≤64, lowercase-hyphen, must match dir) and
  `description` (≤1024, what + when) required by the open spec; body ≤500
  lines recommended; progressive disclosure via references/.
- Claude Code extensions: `disable-model-invocation`, `user-invocable`,
  `allowed-tools`, `context: fork`, `agent`. Not portable to every host.
- Plugin layout: components at plugin root, `.claude-plugin/plugin.json`
  manifest; marketplace.json is a catalog, not a manifest.

### Playwright video
- `recordVideo` on `browser.newContext`: dir, size, `fps` (new; Chromium
  honors custom fps, Firefox/WebKit cap ~25); VP9 encoding; video saved only
  after `context.close()`. Viewport should match target size (else scaled
  into 800×800 box).
- Trace viewer complements video (DOM snapshots per action) but is a debug
  surface, not a demo surface.

### Silero TTS (verified by execution, not just docs)
- `v5_6_ru` exists: speakers aidar/baya/kseniya/xenia/eugene; 8000/24000/48000
  Hz; SSML; auto-stress, homographs, questions, emphasis.
- Load: download `https://models.silero.ai/models/tts/ru/v5_6_ru.pt` once,
  `torch.package.PackageImporter(...).load_pickle("tts_models", "model")`.
  Torch ≥2.0 CPU is sufficient; synthesis is faster than realtime on an M-class CPU.
- **License caveat:** repo code is MIT, but the README marks models as
  generally CC-BY-NC. This toolkit downloads weights at runtime and does not
  redistribute them; commercial use of generated narration should be cleared
  against Silero's terms by the user.

### axe-core / WCAG 2.2
- `@axe-core/playwright` with tags wcag2a/2aa/21a/21aa/wcag22aa. Of six new
  WCAG 2.2 A/AA criteria, axe has a direct rule only for 2.5.8 target-size.
  The toolkit therefore pairs the scan with a manual 2.2 checklist
  (skills/ux-critique/references/wcag-checklist.md) and never claims
  conformance from a clean scan.

### Narrated-demo prior art
- argo (@argo-video/cli), nebari nebi pipeline, showrunner, DemoDSL, narrec,
  demovid, NeuraScreen, playwright-demo-recorder, Scenora.
- Shared pattern adopted: per-scene TTS clips + scene timestamps from the
  recorder + ffmpeg adelay/amix + SRT sidecars.
- Shared weakness none of them solves (our differentiator): no traceability
  from user story → screen → test → video, no acceptance-criteria grounding of
  narration, and no automated silence/gap QA of the rendered soundtrack.
  Also: most align audio in post; we pace the recording by measured audio
  durations (audio-first), preventing gaps instead of patching them.

## Gaps none of the sources filled (what this toolkit adds)
1. One ID graph from product intent to rendered video, machine-validated.
2. Hard build gate: `/ux-build` refuses implementation without approved artifacts.
3. Audio-first recording pacing (gap prevention at capture time).
4. Rendered-soundtrack QA (ffprobe + silencedetect) with intentional-silence
   semantics and planted-defect tests of the QA itself.
5. Narration grounding rule: no claim without an `expect-*` assertion.
