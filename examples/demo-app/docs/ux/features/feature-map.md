# TeamBoard — feature map

What exists, how features meet, what was parked. Source of truth for the
intersection matrix; per-feature journeys live in `FEAT-###.md`.

![map](../visuals/feature-map.jpg)

## Features

| ID | Feature | Class | Status | Stories |
|----|---------|-------|--------|---------|
| FEAT-001 | Project spaces | core | approved | US-001 |
| FEAT-002 | Team invitations | core | approved | US-002 |

## Intersection matrix

|  | FEAT-001 | FEAT-002 |
|--|----------|----------|
| **FEAT-001** | — | SCR-003: page owned by 001, members block by 002; success note must not cover invite |
| **FEAT-002** | mirror | — |

```mermaid
flowchart LR
  START((Start)) --> F1[FEAT-001 Project spaces]
  F1 -->|SCR-003 shared| F2[FEAT-002 Team invitations]
```

## Parked candidates

| Candidate | Class | Why parked |
|-----------|-------|------------|
| Task board | core | next after people are in; needs US set of its own |
| Invite re-send / revoke | expected | no evidence of stuck invites yet (open question in FEAT-002) |
| Project archive | expected | meaningless before boards carry history |
| Onboarding tour | parked | both features are self-revealing via empty states |

## Priority order (approved by human)

1. FEAT-001 — nothing exists without a space.
2. FEAT-002 — a space without people is a notepad.
