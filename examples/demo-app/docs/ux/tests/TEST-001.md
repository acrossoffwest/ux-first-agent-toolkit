---
id: TEST-001
stories: [US-001]
storyboard: ../../journeys/US-001.storyboard.json
---

# TEST-001 — Create project journey

Covers US-001 acceptance scenarios: first-project creation via the empty-state
CTA (happy path) and empty-name rejection (F1).

Run: `node tools/browser/record-journey.mjs --storyboard examples/demo-app/journeys/US-001.storyboard.json --out <dir> --no-video`
(the app must be served: `npm run demo`).
