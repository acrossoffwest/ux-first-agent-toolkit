# Artifact model and traceability

## IDs

| Prefix | Artifact | Lives in |
|--------|----------|----------|
| `US-###` | User story | `docs/ux/stories/US-###.md` |
| `UC-###` | Use case | `docs/ux/use-cases/UC-###.md` |
| `FLOW-###` | User flow | `docs/ux/flows/FLOW-###.md` (mermaid) |
| `SCR-###` | Screen | `docs/ux/prototypes/SCR-###.html` |
| `TEST-###` | Journey test | `docs/ux/tests/TEST-###.md` → storyboard JSON |
| `SC-##` | Scene inside one storyboard | `storyboard.json` |

IDs are stable: never renumber, never reuse. New artifact = next free number.

## Traceability graph

```
product-intent.md
   └─ US-### ── useCases: [UC-###]
         ├─ flows:   [FLOW-###]
         ├─ screens: [SCR-###]
         └─ tests:   [TEST-###]
```

Edges are declared in US frontmatter (single source of truth). `tools/validation/validate-traceability.mjs` fails on:

- a US with an empty `flows`, `screens`, or `tests` list while `status: approved` or later;
- a referenced ID whose file does not exist (dangling reference);
- a SCR/FLOW/UC/TEST file no US references (orphan);
- duplicate IDs.

## Lifecycle gate

`/ux-build US-###` refuses to start implementation unless the story passes
traceability AND has `status: approved`. Maintenance exception: `--maintenance`
flag skips artifact creation but is recorded in the story's changelog section.

## Video artifacts

Per recorded story: `artifacts/videos/US-###/` → `storyboard.json`, `events.json`,
`narration.md`, `durations.json`, `timeline.json`, `voice/` (per-scene WAV),
`subtitles.srt`, `raw/` (webm), `final.mp4`, `qa-report.json`. All gitignored;
`qa-report.json` summaries may be copied to `docs/examples/` when cited.
