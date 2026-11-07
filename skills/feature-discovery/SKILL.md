---
name: feature-discovery
description: Reverse-engineer the feature map of an EXISTING codebase — sweep every surface (routes, windows, CLI, API, MCP tools, jobs, flags) for entry points, cluster them into features with code evidence, write shipped FEAT-###.md files with the А→Я data loop, and diff code reality against README promises. Use when adopting the toolkit on an existing project, before recording explainer videos, or when nobody can list what the product actually does.
---

# Feature discovery

`feature-mapping` invents features for a product that does not exist yet.
This skill does the reverse: **the product exists, the code is the truth,
and the job is to extract what features it actually has.** Output lands in
the same `docs/ux/features/` format, so videos (`/ux-video`), stories
(`/ux-story`) and the validator work on discovered features unchanged.

## Ground rule — evidence or it doesn't exist

Every discovered feature cites at least one code path (`evidence:` in
frontmatter). README, landing pages and comments PROMISE features; only
code PROVES them. A promise with no code behind it is not a FEAT — it goes
to the discrepancy report (Stage 4). The reverse smell too: never present
a guess as a finding. Can't trace the entry point to working code → mark
`confidence: low` and say why.

## Stage 1 — Surface sweep (parallel, read-only)

Enumerate every way anything ENTERS the product. Sweep each surface that
exists in the stack; a surface not swept is named in the report as a gap,
not silently skipped:

| Surface | Where to look |
|---------|---------------|
| UI pages/screens | router config, pages/views dirs, nav menus, modals |
| Desktop windows | Tauri/Electron window registry, tray, deep links |
| CLI | subcommand tree (clap/commander/argparse), man pages |
| HTTP API | route tables, controllers, OpenAPI specs |
| Agent/MCP tools | MCP server tool lists, plugin manifests |
| Background | cron/queue workers, schedulers, webhooks consumed |
| Hidden | feature flags, dev-only pages, keyboard shortcut maps, env-gated code |

Large repo → fan out read-only Explore subagents, **one per surface, in
parallel**. Each returns inventory rows (`surface | entry point | what it
does | file:line`), never file dumps. Merge in the main context.

## Stage 2 — Cluster into features (human gate)

Group entry points by the OBJECT they manage and the JOB they serve — not
by directory. One feature usually spans surfaces (UI screen + CLI command
+ MCP tool working the same object = one feature, and that span IS its
data loop). Produce `docs/ux/features/feature-map.md` inventory table:

`FEAT-### | name | class | surfaces | evidence | confidence`

- Class: `core` (the product is this), `supporting` (settings, auth,
  onboarding, export), `integration` (webhooks, bots, API-for-others),
  `hidden` (flags, dev pages, easter eggs — list them, they are features
  someone shipped on purpose).
- Continue existing numbering — check `docs/ux/features/` first; never
  renumber planned FEATs.

Present the inventory to the human: confirm clusters, name features in
product language (code names lie), pick which get Stage 3 deep dives.

## Stage 3 — Deep dive per confirmed feature

Write `docs/ux/features/FEAT-###.md` from `templates/feature/FEAT-template.md`
with `status: shipped` and `evidence:` filled. Same sections as planned
features, but sourced from code, not imagination:

- **Discovery / first-use:** walk the REAL UI order — what the router
  mounts first, what the nav shows, what an empty state offers. If you can
  run the app, verify the journey live; if not, mark steps `unverified`.
- **Data loop (А→Я) is mandatory:** where objects come from (which
  command/endpoint/event creates them — cite it) and where results go
  (which session/notification/table receives them — cite it). The Stage 1
  multi-surface span answers this; a loop end you cannot find is an Open
  question, not a blank.
- **Decomposition** holds gaps found while reading: missing undo, dead
  settings, TODO-marked paths — these become story candidates.

## Stage 4 — Reality diff + gate

In `feature-map.md`:

- **Promised, not found:** README/docs/landing claims with no code behind
  them.
- **Found, not documented:** shipped features no doc mentions — prime
  candidates for explainer videos.
- Intersection matrix + mutual `intersects` for shared screens, exactly as
  in `feature-mapping` Stage 3 (validator-enforced).
- Gate: `node tools/validation/validate-traceability.mjs docs/ux` passes.
  `shipped` features may have empty `stories` — they exist regardless of
  our backlog.

## Handoff

- Features worth showing → `/ux-video` explainers (the full-loop rule in
  `ux-video-director` inherits each FEAT's data loop ends).
- Gaps from Decompositions → `/ux-story` backlog.
- Visuals: same policy as `feature-mapping` — mermaid is truth, imagegen
  strips on top when available, never blocking.

## Checklist before handoff

- [ ] Every swept surface listed; every skipped surface named as a gap.
- [ ] Every FEAT has `evidence:` with real paths; low-confidence marked.
- [ ] Data loop has both ends (or an Open question naming the missing end).
- [ ] Reality diff present (both directions), even if empty.
- [ ] Validator passes; human confirmed names and clusters.
