---
name: product-discovery
description: Establish product intent before any design or implementation work. Use when starting a new product or feature, when the goal is vague ("build an app for X"), or when docs/ux/product-intent.md is missing or stale. Produces product-intent.md with users, jobs-to-be-done, measurable outcomes and MVP scope.
---

# Product discovery

Turn a product idea into a testable statement of intent. Nothing downstream
(stories, flows, screens) may be created until `docs/ux/product-intent.md` exists.

## Process

1. **Explore before asking.** If an existing product, codebase, or docs exist,
   inspect them first. Never ask the user something the repo already answers.
2. **Interview.** Ask one question at a time. Cover: who the users are, what
   job they are hiring the product for, what they do today instead, what
   failure looks like, what must NOT be built.
3. **Label every claim.** Mark each statement as one of:
   `verified` (evidence exists — link it), `inferred` (from the code/data),
   `assumed` (needs validation), `unknown`, `conflicted` (sources disagree).
   Never present an assumed persona as research.
4. **Apply Jobs To Be Done.** For each user type, one sentence:
   "When <situation>, I want <motivation>, so I can <expected outcome>."
   See `references/jtbd.md` for interview prompts and common traps.
5. **Challenge scope.** For every proposed capability ask: which job does it
   serve, what evidence says users need it, what happens if we ship without
   it. Cut anything with three weak answers. Record cuts under Non-goals.
6. **Define measurable outcomes.** Each goal gets an observable signal
   (activation, completed task, time-to-outcome) — not "users are happy".

## Output

Write `docs/ux/product-intent.md` with exactly these sections:

```markdown
# Product intent — <name>
## Outcome          <!-- the change in the user's life, one paragraph -->
## Users and jobs   <!-- personas with JTBD lines, each claim labeled -->
## Problems worth solving  <!-- ranked, with evidence labels -->
## Measurable outcomes     <!-- signal + target per goal -->
## MVP scope        <!-- the smallest slice that delivers the outcome -->
## Non-goals        <!-- explicit cuts with reasons -->
## Assumptions and risks   <!-- every `assumed` item, with a validation plan -->
```

## Rules

- A feature request with no linked job is parked in Non-goals, not silently built.
- Update this file when intent changes; downstream artifacts referencing a
  changed section must be revisited (the traceability validator will not catch
  intent drift — say it out loud).
- Confidence target: do not stop interviewing while the MVP scope would
  surprise the user.
