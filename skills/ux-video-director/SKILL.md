---
name: ux-video-director
description: Turn an approved user story into a narrated UX walkthrough video — storyboard with scenes, recording via Playwright, Russian narration via Silero, ffmpeg composition and QA. Use for /ux-video, "record a demo of US-###", or when a story needs video evidence. Orchestrates the full pipeline in tools/.
---

# UX video director

Produce a narrated MP4 demonstrating a user story as a real browser journey.
The pipeline is **audio-first**: narration is synthesized before recording, and
each scene is held on screen at least as long as its narration — silent gaps
are prevented at recording time, not patched in post.

## Pipeline (one story)

```
storyboard.json ──► synth (Silero) ──► durations.json
        │                                   │
        └──► record (Playwright, paced by durations) ──► video.webm + events.json
                                            │
                     plan-timeline ──► timeline.json + subtitles.srt
                                            │
                     compose (ffmpeg) ──► final.mp4
                                            │
                     qa-video ──► qa-report.json  (gate)
```

Run it: `node tools/video/run-pipeline.mjs <storyboard.json> --out artifacts/videos/US-###/`
Re-run one stage after edits: `--only narrate|record|plan|compose|audit`.

## Creating the storyboard

From the story's acceptance criteria, write `storyboard.json` (schema:
`templates/storyboard/storyboard.schema.json`):

1. One scene per meaningful beat: what the user wants → the action → the
   visible response. Follow the story's main scenario, then one failure
   scenario — failure handling on video is the point, not an outtake.
2. Scene actions are the executable steps (`goto/click/fill/expect-*`),
   reusing the prototype's `data-testid` selectors. Every scene ends with an
   `expect-*` — narrate only what is observably true.
3. Write narration per scene using the `ux-narration` skill. Bridge
   transitions in the narration text (strategy A) — the recorder holds the
   scene until the narration finishes.
4. `minHoldSec` for beats that need reading time; `intentionalSilence: true`
   with empty narration for deliberate pauses (strategy F).
5. Typing on camera: use `fill` with `delayMs: 40-80` so input is visible.

Gap strategies A–F and when to use each: `references/gap-strategies.md`.

## Полный цикл — ОТ А ДО Я (gate for feature explainers)

Видео «что это и зачем» обязано показать весь цикл данных, не только экран:

1. **Вход**: откуда объект ПОЯВЛЯЕТСЯ в фиче. Кто и чем его создал — команда
   агента, действие юзера в другом окне, вебхук. Покажите появление вживую:
   мок шлёт событие (`evaluate` → `window.__demo.pushCard()`), элемент
   возникает на глазах, диктор называет источник («агент вызвал команду…»).
2. **Взаимодействие**: что юзер делает внутри (это обычно уже есть).
3. **Выход**: куда уходит результат и что получает другая сторона. Покажите
   завершённое состояние (`expect-visible` на финальный бейдж/статус) и
   проговорите обратный путь («ответ уходит в сессию агента, он продолжает»).

Самопроверка перед записью: ответьте на «как это сюда попало?» и «что стало
после действия юзера?» кадрами, не словами. Если какой-то из концов цикла
не показан — сторибоард неполный, добавьте сцену. Типовой инструмент для
входа/выхода на моке: initScript регистрирует слушателей событий приложения
и ручки `window.__demo.*`, сцена дёргает их через action `evaluate`.

## Gate

A video exists only when `qa-report.json` says `ok: true`. On QA failure:
fix the storyboard (narration too long → split the scene; unexplained
silence → add bridge narration or mark intentional), re-run the affected
stage, re-audit. Never hand over a final.mp4 with a failed or missing QA report.

Voice config lives in `ux.config.json` (`tts.speaker`, default `baya`,
48000 Hz). The synth tool refuses to substitute an unavailable speaker —
surface that error, do not work around it.
