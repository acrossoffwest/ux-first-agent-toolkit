---
name: user-story-architect
description: Produce user story maps, end-to-end use cases, alternative and failure scenarios, and Given/When/Then acceptance criteria. Use after product-intent.md exists, when creating or refining user stories, or when a story lacks failure scenarios or acceptance criteria. Creates US/UC artifacts with stable IDs and traceability frontmatter.
---

# User story architect

Convert product intent into traceable, testable stories. Every story links to
a goal from `docs/ux/product-intent.md` and will later link to flows, screens
and tests — the traceability validator enforces this at `status: approved`.

## Story map first

Before writing individual stories, lay out the map in `docs/ux/story-map.md`:

1. **Backbone** — user activities in narrative order (left to right).
2. **Walking skeleton** — the thinnest slice through every activity that
   delivers the MVP outcome. These become the first stories.
3. **Slices below** — later releases. Parked, not deleted.

## Writing a story

Copy `templates/user-story/US-template.md`. Rules:

- ID: next free `US-###`. Never renumber, never reuse.
- The story line names a persona from product-intent, not "the user".
- **Motivation** separates `Verified:` from `Assumed:` evidence.
- **Main success scenario** is numbered user-visible steps, no implementation.
- **Alternative scenarios** — different valid routes to success.
- **Failure scenarios** — every way it goes wrong *from the user's view*,
  each with what the user sees and the recovery path.

## The edge-case sweep

For any story involving another party, data entry, or state change, walk this
list and write a scenario (or consciously reject it) for each item:

- Where is the action discoverable from?
- How does the user identify the right object (project, item, person)?
- Invalid input — what exactly does the user see?
- Duplicate — the thing already exists / was already done?
- Insufficient permissions?
- What confirmation appears after success, and what next action does it offer?
- How is the action undone or canceled?
- If another person is involved: how do they accept, reject, see status?
- How does the interface show the current state afterward?

Completing CRUD is not evidence of usability; every scenario above is a place
users actually get stuck. See `references/gherkin.md` for turning scenarios
into acceptance criteria.

## Acceptance criteria

One Gherkin `Scenario` per observable behavior, in the story file. Every
`Then` names something visible on screen. Criteria must cover the main
scenario, each alternative, and each failure — the `ux-build` gate counts them.

## Use cases

When a story spans roles or sessions (inviter + invitee), add a `UC-###` from
`templates/use-case/UC-template.md` capturing the full end-to-end exchange,
and list it in the story's `useCases`.
