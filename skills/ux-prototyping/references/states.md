# Screen states — what each must answer

| State | Must answer | Common failure |
|-------|-------------|----------------|
| default | What can I do here? What is the primary action? | Five equal buttons, no hierarchy |
| loading | Is it working? How long roughly? | Spinner with no context; layout jump after load |
| empty | What is this for and what is my first step? | "No data" with no CTA |
| error | What went wrong, in my words? What do I do now? | Error code; input discarded; no retry |
| success | What happened? What is the next useful action? | Silent success; toast that disappears before reading |

## Accessibility floor for prototypes

- One `<h1>`; headings nest without gaps.
- Every input has a `<label>` (not placeholder-as-label).
- Focus visible and in reading order; dialog traps focus and returns it on close.
- Text contrast ≥ 4.5:1; interactive targets ≥ 24×24 px.
- Error messages are tied to fields (`aria-describedby`) and announced
  (`role="alert"` on dynamic errors).
- Destructive actions require confirmation that names the object
  ("Delete project Alpha?"), never a bare "Are you sure?".
