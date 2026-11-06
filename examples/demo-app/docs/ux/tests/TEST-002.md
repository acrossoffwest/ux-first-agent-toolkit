---
id: TEST-002
stories: [US-002]
storyboard: ../../journeys/US-002.storyboard.json
---

# TEST-002 — Invite colleague journey

Covers US-002 acceptance scenarios: successful invite, invalid-email rejection
(F1) and duplicate-member rejection (F2), including recovery between them.

Run: `node tools/browser/record-journey.mjs --storyboard examples/demo-app/journeys/US-002.storyboard.json --out <dir> --no-video`
(the app must be served: `npm run demo`).
