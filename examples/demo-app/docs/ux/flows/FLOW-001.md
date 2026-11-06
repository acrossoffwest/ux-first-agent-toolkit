---
id: FLOW-001
stories: [US-001]
---

# FLOW-001 — Create a project

```mermaid
flowchart LR
  SCR001[SCR-001 Projects list] -->|"Новый проект" / empty-state CTA| SCR002[SCR-002 New project form]
  SCR002 -->|valid name| SCR003[SCR-003 Project page + created note]
  SCR002 -->|empty name| SCR002e[Inline error, form open]
  SCR002e -->|name entered| SCR003
  SCR002 -->|"← К проектам"| SCR001
```

## Steps and cost
| # | Screen | User does | Clicks from entry |
|---|--------|-----------|-------------------|
| 1 | SCR-001 | presses create | 1 |
| 2 | SCR-002 | types name, submits | 2 |
| 3 | SCR-003 | sees result + next action | 2 |

## Recovery paths
- Empty name → inline error, input kept (F1).
- Back link on the form abandons creation without side effects.
