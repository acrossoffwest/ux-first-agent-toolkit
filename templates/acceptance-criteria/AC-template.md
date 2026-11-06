---
story: US-000
---

# Acceptance criteria — US-000

One `Scenario` per observable behavior. Each scenario must be executable as a journey test; every `Then` names something visible on screen (not an internal state).

```gherkin
Feature: <feature name>

  Scenario: <happy path>
    Given <precondition visible to the user>
    When <user action>
    Then <observable result>

  Scenario: <failure path>
    Given …
    When <invalid input / denied permission>
    Then the user sees <exact error affordance> and can <recovery action>
```

Coverage checklist (delete lines that genuinely do not apply, do not leave blanks):

- [ ] Happy path
- [ ] Invalid input
- [ ] Duplicate / already-exists
- [ ] Insufficient permissions
- [ ] Empty state (first use)
- [ ] Loading state visible for slow responses
- [ ] Undo / cancel path
- [ ] Status visible after the action completes
