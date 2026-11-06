# WCAG 2.2 AA — what automation covers and what it cannot

`tools/browser/axe-scan.mjs` runs axe-core with tags
`wcag2a wcag2aa wcag21a wcag21aa wcag22aa`. Honest limits: of the six new
WCAG 2.2 A/AA criteria, axe-core has a direct rule only for **2.5.8 Target
Size** (and it may return "needs review"). A clean axe run is *not* WCAG 2.2
AA conformance.

## Manual checklist (run on prototype AND implementation)

- **2.4.11 Focus Not Obscured** — tab through; sticky headers/footers must not
  hide the focused element.
- **2.5.7 Dragging Movements** — every drag interaction has a click/tap
  alternative.
- **2.5.8 Target Size** — icon buttons in dense layouts ≥ 24×24; verify in the
  real layout, not the component in isolation.
- **3.2.6 Consistent Help** — help entry point in the same place on every screen.
- **3.3.7 Redundant Entry** — the flow never asks for information it already has.
- **3.3.8 Accessible Authentication** — login never blocks paste, never
  requires puzzle-solving without an alternative.
- **Keyboard walk** — complete each story scenario with keyboard only: no
  traps, logical order, dialogs return focus.
- **Announcements** — form errors and async results are announced
  (`role="alert"` / live regions), not just painted.
- **Scan after interaction.** Run axe again with the dialog open, the error
  state shown, the menu expanded — the initial DOM hides most violations.
