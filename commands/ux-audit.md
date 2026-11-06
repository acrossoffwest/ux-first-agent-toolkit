---
description: Run an independent UX review of the implemented product against approved artifacts — scenario verdicts with evidence, accessibility, video QA status, and a SHIP / DO NOT SHIP verdict.
argument-hint: "[scope]"
---

Run the final UX audit (scope: $ARGUMENTS, default — the whole product).

Dispatch the `ux-auditor` agent. It follows the `ux-audit` skill: structural
gates, per-scenario PASS/PARTIAL/FAIL/BLOCKED verdicts with evidence, journey
and axe execution, video QA report status, experience regression sweep, and
writes the report to `docs/ux/reviews/`.

Relay: the verdict, coverage numbers, every blocking finding, and the report
path. Do not soften a DO NOT SHIP verdict; do not re-litigate findings the
auditor backed with evidence — fix them or record an explicit waiver.
