---
id: FLOW-002
stories: [US-002]
---

# FLOW-002 — Invite a colleague

```mermaid
flowchart LR
  SCR003[SCR-003 Project page] -->|"Пригласить"| FORM[Invite form shown]
  FORM -->|valid new email| OK[Confirmation + member with status]
  FORM -->|invalid email| ERR1[Inline error: format + example]
  FORM -->|already member| ERR2[Inline error: already in project]
  ERR1 -->|corrected| OK
  ERR2 -->|different email| OK
  FORM -->|"Отмена"| SCR003
  OK --> SCR003
```

## Steps and cost
| # | Screen | User does | Clicks from entry |
|---|--------|-----------|-------------------|
| 1 | SCR-003 | opens invite form | 1 |
| 2 | SCR-003 | types email, submits | 2 |
| 3 | SCR-003 | sees confirmation and status in list | 2 |

## Recovery paths
- Both failure edges return to the open form with input preserved.
- Cancel closes the form with no side effects (A2).
- Invitation status stays visible in the members list after the flow.
