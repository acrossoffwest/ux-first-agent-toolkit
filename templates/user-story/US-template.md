---
id: US-000
title: <short imperative title>
persona: <persona id or name>
goal: <the user goal this story serves — link to product-intent>
status: draft # draft | approved | implemented | verified
useCases: [UC-000]
flows: [FLOW-000]
screens: [SCR-000]
tests: [TEST-000]
---

# US-000 — <title>

**Story.** As a <persona>, I want <capability> so that <outcome>.

**Motivation.** Why the user needs this now; the job it gets done. Evidence vs assumption marked explicitly:
- Verified: …
- Assumed: …

## Preconditions

- …

## Main success scenario

1. …
2. …

## Alternative scenarios

- **A1 — <name>:** trigger → behavior → outcome.

## Failure scenarios

- **F1 — <name>:** trigger → what the user sees → recovery path.

## Acceptance criteria

```gherkin
Scenario: <name>
  Given …
  When …
  Then …
```

## Open questions

- …
