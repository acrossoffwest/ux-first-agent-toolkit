# Workflow: new feature in an existing product

1. Check intent: does `product-intent.md` cover this feature's job? If not,
   update it first (product-discovery, focused session) — a feature without a
   job goes to Non-goals.
2. `/ux-story` for the feature. The flow design must show the *entry point in
   the existing navigation*, not just the new screens.
3. Consistency pass: the critique must explicitly compare new patterns with
   existing ones (same dialog style? same confirmation? same terminology?).
4. `/ux-build US-###`.
5. `/ux-test US-###` plus re-run journeys of adjacent stories the feature
   could have broken (shared screens — check the traceability report).
6. `/ux-video US-###` when the feature is user-facing enough to demo.

Maintenance exception: typos, copy tweaks, non-behavioral fixes →
`/ux-build US-### --maintenance` (recorded in the story changelog; journey
re-run still required).
