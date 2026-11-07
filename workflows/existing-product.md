# Workflow: adopting the toolkit on an existing product

The product ships, the code is the truth, the docs lag. Build the UX layer
from what exists before planning anything new.

1. `/ux-discover` — sweep the codebase, confirm the clustered inventory,
   write `FEAT-###.md` (`status: shipped`, `evidence:` paths) and the
   reality diff in `feature-map.md`.
2. If `docs/ux/product-intent.md` does not exist, write it NOW from the
   discovered map (product-discovery, short session): the jobs are visible
   in what the product already does; disagreements between intent and code
   go to Open questions.
3. Pick from the reality diff:
   - **Found, not documented** → `/ux-video` explainer per feature (the
     full-loop rule applies — show where objects come from and where
     results go).
   - **Promised, not found** → human decides: build it (`/ux-story` →
     `/ux-build`) or delete the promise.
   - **Gaps in Decomposition tables** → `/ux-story` backlog in priority
     order.
4. From here the product behaves like any mapped product: new work follows
   `workflows/new-feature.md`.
