# Gherkin that stays testable

## Rules

- `Given` is state the user can see or verify, not database rows.
  Good: "Given I am on the project page and I am its owner".
- `When` is one user action. Two actions = two scenarios or an `And`.
- `Then` is observable: text, element, navigation, focus. If a journey test
  cannot assert it with a selector, rewrite it.
- Name scenarios by outcome ("Duplicate invite is rejected with explanation"),
  not by mechanics ("POST returns 409").

## From failure scenario to criteria

Failure scenario F1 "invalid email" becomes:

```gherkin
Scenario: Invalid email is rejected with guidance
  Given I opened the invite dialog for project "Alpha"
  When I submit "not-an-email" as the invitee address
  Then I see the error "Введите корректный e-mail" next to the field
  And the dialog stays open with my input preserved
```

The last `And` is the recovery path — without it the scenario passes even if
the dialog closes and discards input, which is the actual UX failure.

## Anti-patterns

- `Then the invitation is created` — invisible. What does the *user* see?
- `When the system validates the email` — the system is not an actor.
- A single scenario with 12 steps — slice it.
