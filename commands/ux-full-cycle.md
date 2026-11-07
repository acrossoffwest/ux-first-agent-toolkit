---
description: Execute the complete UX-first lifecycle for a feature — intent check, story, flows, prototypes, critique gate, implementation, journey tests, narrated video, final audit — with quality gates between phases.
argument-hint: "[feature description]"
disable-model-invocation: true
---

Run the full cycle for: $ARGUMENTS

Phases, each gated — do not start the next while the previous gate fails:

1. **Context** — /ux-init behavior: intent exists and is current.
2. **Features** — /ux-features behavior when the feature map is missing or
   stale, or the request spans more than one feature: FEAT artifacts +
   intersection matrix pass traceability. Skip only for a single story
   inside an already-mapped feature.
3. **Story** — /ux-story behavior: artifacts + critique + traceability pass.
   PAUSE for user approval of the prototype before proceeding.
4. **Build** — /ux-build behavior: gate, implementation, journey tests green.
5. **Test** — /ux-test behavior: all scenarios PASS, axe clean on covered screens.
6. **Video** — /ux-video behavior: final.mp4 with qa-report ok:true.
7. **Audit** — /ux-audit behavior: independent verdict.

Stop conditions: a failed gate stops the cycle with the exact failing check;
user rejection at phase 3 returns to story work, not forward.

Deliver at the end: one summary — story IDs, implementation scope, test
coverage, video paths with QA status, audit verdict, and anything waived.
