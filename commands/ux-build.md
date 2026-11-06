---
description: Implement an approved user story — enforces the UX gate (story, flow, mockup, acceptance criteria must exist and validate) before any feature code is written.
argument-hint: "US-### [--maintenance]"
---

Implement the story in $ARGUMENTS.

**Gate (hard, no exceptions without the flag):**
1. Run `node tools/validation/validate-traceability.mjs docs/ux`.
2. The target story must have `status: approved`, non-empty flows, screens,
   tests lists, and acceptance criteria covering main + failure scenarios.
3. If the gate fails: STOP and route to /ux-story to complete the artifacts.
   Do not write feature code past a failed gate.

`--maintenance` (small fixes where new UX artifacts add no value): skip
artifact creation, but record the change in the story's changelog section and
re-run the story's journey test afterward.

**Implementation rules:**
- The prototype is the behavioral spec: reuse its `data-testid` ids verbatim,
  its state handling (loading/empty/error/success) and its exact copy.
- Follow the project's own stack and conventions; this toolkit does not impose any.
- Every acceptance scenario gets a journey test (`docs/ux/tests/TEST-###.md`
  pointing to a storyboard JSON) runnable via
  `node tools/browser/record-journey.mjs --no-video`.
- After implementation: run the journey tests and `axe-scan` on changed
  screens; both must pass before claiming done.

Deliver: implemented scope, test results, deviations from the prototype (each
justified or fixed), updated story status (`implemented`).
