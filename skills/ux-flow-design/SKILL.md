---
name: ux-flow-design
description: Design information architecture, user journeys and navigation for approved user stories. Use after stories exist and before prototyping, or when navigation feels confusing, steps seem redundant, or recovery paths are missing. Produces FLOW artifacts with mermaid diagrams and a screen inventory.
---

# UX flow design

Turn each story's scenarios into an explicit path through screens, so that
cognitive load, dead ends and redundant steps become visible *before* anything
is built.

## Produce

For each story (or a cluster of related stories), create
`docs/ux/flows/FLOW-###.md`:

```markdown
---
id: FLOW-000
stories: [US-000]
---
# FLOW-000 — <name>

​```mermaid
flowchart LR
  SCR-001[Projects list] -->|"Invite" button| SCR-002[Invite dialog]
  SCR-002 -->|valid email| SCR-002s[Confirmation state]
  SCR-002 -->|invalid email| SCR-002e[Inline error]
  SCR-002e -->|corrected| SCR-002s
​```

## Steps and cost
| # | Screen | User does | Clicks from entry |
## Recovery paths
## Open questions
```

Every node is a `SCR-###` (screen) or a named state of one. Every edge is a
user action in quotes — if you cannot name the control, the flow has a gap.

## Checklist per flow

- **Entry**: where does the user start, and is the action discoverable from
  there without instructions (recognition over recall)?
- **Step count**: count clicks from entry to success. For each step ask what
  it costs to remove. Three steps that can be one is a finding, not a style choice.
- **Failure edges**: every failure scenario from the story has an edge back
  into the flow — no dead ends. An error with no exit is a blocker.
- **State visibility**: after the success edge, which screen shows the new
  state? If nothing changes visibly, the flow is incomplete.
- **Consistency**: same action = same pattern everywhere (one dialog style,
  one confirmation style). Name deviations explicitly and justify or fix.
- **Interruption**: what happens if the user leaves mid-flow and returns?

## Information architecture

When flows multiply, maintain `docs/ux/ia.md`: the navigation tree, what lives
where, and the naming rules (one term per concept — "participant" or "member",
never both). Terminology drift between screens is a critique-blocking finding.
