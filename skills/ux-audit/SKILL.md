---
name: ux-audit
description: Final independent audit comparing the implemented product against approved UX artifacts — story coverage, scenario verdicts with evidence, accessibility scan, and journey/video artifact status. Use at the end of a development cycle, before release, or via /ux-audit. Produces a verdict report, not a redesign.
---

# UX audit

The audit answers one question with evidence: **does the implementation
deliver the approved experience?** It runs in a fresh context (`ux-auditor`
agent) and trusts only artifacts and executions, not prior conversation.

## Procedure

1. **Structural gates.** Run and record:
   - `node tools/validation/validate-skills.mjs` (toolkit integrity)
   - `node tools/validation/validate-traceability.mjs docs/ux`
2. **Scenario verdicts.** For every approved story, walk each acceptance
   scenario against the running app (via storyboard journey or manually with
   Playwright). Verdict per scenario:
   - `PASS` — observed, with selector/screenshot evidence
   - `PARTIAL` — works but deviates from criteria (name the deviation)
   - `FAIL` — not achievable as specified (file:line or screen evidence)
   - `BLOCKED` — could not test (name the blocker)
   No verdict without evidence. "Looks implemented" is BLOCKED, not PASS.
3. **Journey + a11y execution.** Run `record-journey` per story storyboard and
   `axe-scan` on each story's screens in their key states. Attach reports.
4. **Video QA status.** If walkthrough videos exist, include each
   `qa-report.json` verdict; a video whose QA failed is reported as failed —
   an existing final.mp4 is not success.
5. **Experience regression sweep.** The ux-critique hunt list applied to the
   realized product (terminology drift, dead ends, silent successes).

## Report

`docs/ux/reviews/YYYY-MM-DD-audit.md`:

```markdown
# UX audit — <date>
## Verdict: SHIP | SHIP WITH FIXES | DO NOT SHIP
## Coverage: X/Y stories verified, N scenarios PASS / P PARTIAL / F FAIL / B BLOCKED
## Blocking findings  <!-- each with evidence and the owning story -->
## Non-blocking findings
## Evidence index     <!-- paths to events.json, axe reports, qa-reports -->
```

A `DO NOT SHIP` verdict must name the exact scenarios that fail; a `SHIP`
verdict must be reproducible from the evidence index alone.
