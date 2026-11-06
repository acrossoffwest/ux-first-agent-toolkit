---
description: Initialize or inspect the product's UX context — creates docs/ux structure and product-intent.md, or reports current artifact status for an existing project.
argument-hint: "[path]"
---

Initialize UX-first context for this project (or the path in $ARGUMENTS).

1. If `docs/ux/product-intent.md` exists: run
   `node tools/validation/validate-traceability.mjs docs/ux`, then summarize
   current state — intent freshness, stories by status, coverage gaps. Stop.
2. Otherwise create the structure `docs/ux/{stories,use-cases,flows,prototypes,tests,reviews}/`
   and copy `ux.config.example.json` to `ux.config.json` if absent.
3. Invoke the `product-discovery` skill to produce `product-intent.md`.
   For an existing codebase, explore it first per that skill's rules.

Report what exists, what was created, and the next step (usually /ux-story).
