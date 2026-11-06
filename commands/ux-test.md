---
description: Execute and evaluate user journeys for one story or all approved stories — Playwright runs, accessibility scans, per-scenario verdicts against acceptance criteria.
argument-hint: "[US-### | all]"
---

Test the journeys for: $ARGUMENTS (default: all stories with tests).

Dispatch the `ux-browser-tester` agent with the story ID(s). It will start the
app, run each storyboard via `tools/browser/record-journey.mjs`, run
`tools/browser/axe-scan.mjs` on the covered screens (including error/dialog
states), and map observed events to acceptance scenarios.

Relay its report verbatim where it matters: per-scenario PASS/FAIL, failing
actions with errors, axe blocking violations, slow steps. A non-zero journey
exit is a finding to report, never to retry into silence.
