---
name: feature-mapping
description: Generate and map a product's feature set before stories exist — broad ideation from product intent, an end-to-end user journey per feature (discovery → first use → repeat use), a machine-checked intersection matrix between features, and colorful journey visuals. Use after /ux-init when deciding WHAT to build, or when features collide on shared screens.
---

# Feature mapping

Stories answer "how exactly does this work". Feature mapping answers the
questions that come first: **what features exist, how a user reaches each
one from cold start, and where features collide.** Output lives in
`docs/ux/features/` and feeds `/ux-story`.

## Stage 1 — Ideation (go broad, then cut)

From `docs/ux/product-intent.md`, generate 10–20 candidate features. Each
candidate is one line: `<name> — serves <job> for <persona>`. Rules:

- Every candidate traces to a job in product-intent. No job → not a
  candidate (park it in `feature-map.md` → Parked).
- Include unglamorous candidates deliberately: onboarding, empty states,
  undo/recovery, settings, data export. Products die on these, and ideation
  that only lists hero features is incomplete.
- Mark each candidate: `core` (product dies without it), `expected`
  (users assume it), `differentiator` (reason to choose us), `parked`.

Present the cut list to the human; only survivors get Stage 2.

## Stage 2 — One journey per feature

For each survivor, create `docs/ux/features/FEAT-###.md` from
`templates/feature/FEAT-template.md`. The journey is **end to end**: it
starts at app entry (cold start), not at the feature's own screen.

- **Discovery:** which surface reveals the feature first, and what makes
  the user try it. "The user finds it in the menu" is a smell — name the
  moment the need arises and what the UI shows at that moment.
- **First-use journey:** numbered steps, each bound to a screen. Count
  clicks from entry. >5 steps → note a shortcut idea in Open questions.
- **Repeat use:** what the feature remembers, where it surfaces passively.
  A feature used daily and a feature used once a quarter need different
  entry points — say which this is.

## Stage 3 — Intersection matrix

Create/update `docs/ux/features/feature-map.md`:

- Table FEAT × FEAT. Each non-empty cell: what is shared (`SCR-###`, data
  entity, control, concept) and the resolution — who owns the space, how
  both features stay discoverable, what conflicts ("both want the primary
  button on SCR-002").
- Mirror every intersection into both features' frontmatter `intersects`
  and their Intersections sections.

**Machine rule (validator-enforced):** two features whose frontmatter
`screens` share a `SCR-###` must list each other in `intersects` — and
`intersects` must be mutual. An undeclared collision fails
`validate-traceability`.

## Stage 4 — Prioritize and decompose

Order approved features (core → expected → differentiator). For each, fill
the Decomposition table with planned `US-###` scopes, then hand off to
`user-story-architect` per story. A feature may reach `status: approved`
only with a non-empty `stories` list (validator-enforced) — approving a
feature *is* committing to its first story.

## Visuals — make the map readable at a glance

Mermaid stays (it is diffable truth); on top of it, generate colorful
illustrations when an image-generation tool (imagegen MCP or similar) is
available. Per feature: a journey strip `docs/ux/visuals/FEAT-###-journey.jpg`;
for the map: `docs/ux/visuals/feature-map.jpg`. Follow
`references/visual-style.md` for prompts, palette and model choice. Embed
images in the markdown **above** the mermaid block.

No image tool available → keep mermaid only and note "visuals pending" in
feature-map.md. Never block the pipeline on an illustration, and never let
an illustration contradict the mermaid — the diagram is the source of truth.

## Checklist before handoff to /ux-story

- [ ] Every FEAT file has discovery + first-use + repeat-use filled (no TBD).
- [ ] `validate-traceability` passes (mutual intersects, no dangling refs).
- [ ] feature-map.md lists parked candidates with one-line reasons.
- [ ] Human approved the priority order.
