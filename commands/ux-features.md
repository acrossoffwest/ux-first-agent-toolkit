---
description: Map the product's feature set before stories — ideation from product intent, end-to-end journey per feature, machine-checked intersection matrix, colorful journey visuals. Runs between /ux-init and /ux-story.
argument-hint: "[focus area or empty for full product]"
---

Map features for: $ARGUMENTS (empty → the whole product).

Preconditions: `docs/ux/product-intent.md` exists (else run /ux-init first).

1. Invoke the `feature-mapping` skill and walk its four stages: ideation
   (10–20 candidates, human cuts the list) → `FEAT-###.md` per survivor →
   intersection matrix in `docs/ux/features/feature-map.md` → priority
   order + decomposition into planned `US-###` scopes.
2. Generate journey visuals per `references/visual-style.md` if an
   image-generation tool is available; otherwise mermaid only.
3. Gate: `node tools/validation/validate-traceability.mjs docs/ux` must
   pass — mutual `intersects`, no dangling FEAT→US/SCR refs, approved
   features have stories.
4. Hand off: for each feature in priority order, offer `/ux-story <scope>`
   per its Decomposition table.
