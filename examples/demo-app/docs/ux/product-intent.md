# Product intent — TeamBoard (demo)

## Outcome
A small team lead sets up a shared project space and gets colleagues into it
within a minute, without instructions.

## Users and jobs
- **Team lead** (`verified`: the toolkit's own demo requirement) — "When I start
  a new piece of work, I want a shared space my colleagues can join, so I can
  stop coordinating over chat."
- **Invited colleague** (`assumed`) — "When I get an invitation, I want to see
  what I was invited to and my status, so I can decide and start."

## Problems worth solving
1. Creating a space is usually buried in admin UIs (`inferred` from common tools).
2. Invitation failures (typo in email, duplicate invite) are usually silent or
   cryptic (`verified`: the demo exists to exercise exactly these paths).

## Measurable outcomes
- A new user creates a project and sends one invite in under 60 seconds, no docs.
- Every failed invite shows a recovery path (observable in journey tests).

## MVP scope
Create project → see it → invite by email → see invitation status. Nothing else.

## Non-goals
Auth, persistence, real email delivery, roles/permissions — out of demo scope.

## Assumptions and risks
- Invitee flow is out of scope; status display stands in for it (`assumed`).
