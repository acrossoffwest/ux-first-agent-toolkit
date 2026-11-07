---
description: Reverse-engineer the feature map of an existing codebase — sweep all surfaces for entry points, cluster into shipped FEAT files with code evidence, diff code reality vs README promises. Entry point for adopting the toolkit on a real project.
argument-hint: "[path to repo root, or empty for cwd] [focus area]"
---

Discover features in: $ARGUMENTS (empty → current repository, full sweep).

1. Invoke the `feature-discovery` skill and walk its stages: parallel
   surface sweep (UI, CLI, API, MCP, background, hidden) → clustered
   inventory table (human confirms names and picks deep dives) →
   `FEAT-###.md` per confirmed feature with `status: shipped` and
   `evidence:` paths → reality diff (promised-not-found /
   found-not-documented) in `docs/ux/features/feature-map.md`.
2. Gate: `node tools/validation/validate-traceability.mjs docs/ux` must
   pass — mutual `intersects`, no dangling refs.
3. Hand off: offer `/ux-video` for undocumented shipped features (explainer
   videos) and `/ux-story` for gaps collected in Decomposition tables.
