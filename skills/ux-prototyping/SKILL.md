---
name: ux-prototyping
description: Create interactive HTML wireframes and clickable mockups for approved flows. Use after flows exist and before implementation, or when a screen lacks loading/empty/error/success states. Produces self-contained SCR-###.html prototypes that demonstrate navigation and primary interactions in a browser.
---

# UX prototyping

Prototypes are browser-executable HTML, not static images. A static image
cannot demonstrate navigation, states, or focus order — and cannot be driven
by a journey test later.

## Produce

One self-contained file per screen: `docs/ux/prototypes/SCR-###.html`,
starting from `templates/wireframe/wireframe-template.html`. Requirements:

- **Navigable.** Links/buttons between prototype screens work (`href` to the
  other SCR file). A reviewer can click through the whole flow offline.
- **All states.** Each screen includes `data-state` sections for `default`,
  `loading`, `empty`, `error`, `success` — reachable via the built-in state
  bar. Delete a state only if genuinely impossible, with an HTML comment
  naming why.
- **Real interactions.** The primary interaction of the screen works
  (form opens, validation message appears) with minimal inline JS. Secondary
  interactions may be stubs.
- **`data-testid` on every interactive element.** Implementation must reuse
  these exact ids — this is what links prototype, code, and journey test.
- **Traceable.** `<body data-screen="SCR-###" data-story="US-###">`.
- **Accessible by construction.** Semantic landmarks, labels on inputs,
  visible focus, 4.5:1 contrast, 24px+ targets. See `references/states.md`.

## Design system

If the project has a design system or component library, mirror its patterns
and tokens in the prototype — do not invent a parallel visual language. If
none exists, keep the wireframe aesthetic from the template (grayscale +
one accent); the prototype's job is behavior, not branding.

## Creative alternatives

When a flow step feels awkward, prototype one alternative and name the
trade-off in an HTML comment at the top. Two cheap prototypes beat a debate.
Creativity must not break familiarity: navigation position, dialog behavior
and error placement follow platform conventions unless a finding justifies
deviation.

## Done when

- Every `SCR-###` in the flow exists and cross-links correctly.
- The story's failure scenarios are reachable in the prototype (error states
  show the exact copy from acceptance criteria).
- `validate-traceability` passes with the new screens listed in the story.
