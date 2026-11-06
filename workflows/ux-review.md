# Workflow: UX review of an existing application

For products built without this toolkit, or inherited codebases.

1. `/ux-init` — product-discovery in "explore first" mode: reconstruct intent
   from the product itself; every reconstructed claim labeled `inferred`.
2. Reverse-map reality: `user-story-architect` writes stories for what the
   product *currently does* (status: `implemented`), `ux-flow-design` maps the
   actual navigation. Gaps and dead ends surface during mapping.
3. Dispatch `ux-critic` on the real app (running instance, not prototypes).
4. `axe-scan` on the main screens and their error/dialog states.
5. Optionally `/ux-video` on the worst journey — a narrated video of a broken
   flow is the most persuasive review artifact that exists.
6. Output: prioritized findings report + the story/flow map as the baseline
   for fixes (each fix then follows the new-feature workflow).
