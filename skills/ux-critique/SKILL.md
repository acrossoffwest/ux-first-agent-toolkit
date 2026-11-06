---
name: ux-critique
description: Independently challenge a proposed experience — flows, prototypes, or implemented UI — against Nielsen heuristics and WCAG 2.2 AA, ranked by user impact. Use before implementation approval, after significant UX changes, or when invoked by the ux-critic agent. Produces a findings report in docs/ux/reviews/.
---

# UX critique

The critique's job is to find where a user gets stuck, lost, or misled —
not to restyle. It runs best in a fresh context (the `ux-critic` agent) so it
does not inherit the author's assumptions.

## Inputs

Read, in order: `product-intent.md`, the target story with acceptance
criteria, its flows, then the prototypes/screens. Walk the actual artifacts —
click through prototypes; do not critique from the story text alone.

## Hunt list

Work through `references/nielsen-heuristics.md` (the 10 heuristics with
UX-first interpretations), then these high-yield checks:

- **Friction**: steps whose removal costs nothing; data the user must retype;
  confirmation theater on non-destructive actions.
- **Dead ends**: any state without a forward or back path; errors without recovery.
- **Terminology drift**: the same concept named differently across screens.
- **Discoverability**: can the primary action be found without instructions,
  from where the user actually starts?
- **Status**: after each mutating action, where does the user see the result?
- **Destructive safety**: confirmation names the object; undo where feasible.
- **Accessibility**: `references/wcag-checklist.md` — the manual checks
  automation cannot do (focus order, target size in real layouts, auth flows).

## Findings format

Write `docs/ux/reviews/YYYY-MM-DD-<target>.md`. Each finding:

```markdown
## F-01 [blocker|major|minor] <one-line claim>
- Where: SCR-002, error state
- Evidence: <what you observed — quote copy, name the missing element>
- Heuristic/WCAG: <e.g. Nielsen 9 / WCAG 3.3.1>
- User impact: <who hits this, how often, what it costs them>
- Recommendation: <smallest change that fixes it>
- Story link: US-002
```

Rank by user impact, not by how easy the fix is. A `blocker` means: a story
scenario cannot be completed, or a user plausibly loses data/trust.

## Rules

- Every finding cites observable evidence. "Feels cluttered" is not a finding;
  "7 equally weighted actions, primary action indistinguishable (Nielsen 8)" is.
- Attack the design, not the effort. Offer the smallest fix, not a redesign.
- If the experience is good, say so and stop. Inventing findings to look
  thorough erodes the gate's meaning.
