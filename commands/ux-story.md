---
description: Create a complete, traceable user story — story map placement, US/UC files, flows, interactive prototypes and acceptance criteria — ready for the build gate.
argument-hint: "[feature description]"
---

Create the full artifact chain for: $ARGUMENTS

Preconditions: `docs/ux/product-intent.md` exists (else run /ux-init first).

1. Invoke `user-story-architect`: place the story on the map, write
   `US-###.md` with motivation, scenarios (main/alternative/failure via the
   edge-case sweep) and Gherkin acceptance criteria; add `UC-###` if the story
   spans roles or sessions.
2. Invoke `ux-flow-design`: `FLOW-###.md` with mermaid, step costs, recovery
   paths; update `docs/ux/ia.md` if navigation changes.
3. Invoke `ux-prototyping`: interactive `SCR-###.html` for every screen in the
   flow, all five states, `data-testid` on interactive elements.
4. Dispatch the `ux-critic` agent on the new artifacts; apply or explicitly
   defer its findings (deferrals recorded in the story's Open questions).
5. Run `node tools/validation/validate-traceability.mjs docs/ux` — must pass.
6. Set story `status: approved` only after the user confirms the prototype.

Deliver: story ID, artifact paths, critique verdict, and the gate status.
