---
name: ux-narration
description: Write grounded Russian narration for UX walkthrough videos — scene-by-scene text that describes what the user wants, does, and sees, synchronized with recorded interactions. Use when creating or revising storyboard narration, or when video QA flags narration problems.
---

# UX narration

Narration is a product demonstration by a thoughtful colleague — not a
robotic reading of acceptance criteria and not marketing voice-over.

## Grounding rule (absolute)

Narrate only what the scene's actions make observably true. Every claim maps
to an `expect-*` assertion or a visible element. If the storyboard does not
assert it, either add the assertion or cut the sentence. Never invent
on-screen events, speeds, or qualities («мгновенно», «удобно») the recording
does not show.

## Per scene, the narration answers (pick what the beat needs, not all six)

1. What is the user trying to accomplish right now?
2. What is visible / where are we?
3. Why does the next action matter?
4. What happens — and did it succeed?
5. For failure scenes: what went wrong in the user's words, and what is the way out?
6. At the end of the story: what has the user accomplished?

## Style — Russian

- Разговорный профессиональный тон, настоящее время: «Открываем проект…»,
  «Интерфейс сразу показывает…».
- Короткие предложения; одна мысль на предложение. TTS читает длинные
  конструкции хуже, чем человек.
- Латиница читается ОТДЕЛЬНЫМ английским голосом (v3_en, женский en_99 по
  умолчанию): синтезатор режет текст на кириллические и латинские сегменты и
  склеивает два голоса. Поэтому английские термины пишите латиницей как есть:
  "Codex", "Enter", "pull request" — их прочтёт английский голос правильно.
- Исключение — непроизносимые идентификаторы и аббревиатуры ("tmgr", "MCP",
  "k8s"): английский голос их тоже калечит. Пишите кириллицей по звучанию
  («ТимГР», «эм-си-пи») или перефразируйте. Правило: латиницей — только то,
  что англоговорящий прочтёт вслух как слова.
- Частые переключения голосов рвут ритм: не больше одного-двух латинских
  вкраплений на сцену; не начинайте сцену с латиницы.
- Для вопросительной интонации просто ставьте «?» — v5_6_ru её поддерживает.
- Паузы внутри сцены: запятые и точки дают естественные микропаузы; длинные
  паузы делайте отдельной intentionalSilence-сценой, не SSML-хаками.
- Запрещённые обороты: «а теперь нажмём», «как мы видим», «вот здесь»
  (указание на курсор), «данный функционал». Говорите о намерении и
  результате, не о курсоре.

## Живые связки (openers)

Сухая дикторская начитка усыпляет. Часть сцен открывайте разговорной
связкой — она склеивает сцены в рассказ:

- Пул: «Итак…», «Теперь…», «Дальше…», «Смотрите:», «А что если…?»,
  «Хорошо.», «Готово —», «И вот…», «Кстати…», «Но сначала —».
- Не больше ~половины сцен; никогда две одинаковые подряд; первая сцена
  обходится без связки (контекст задаёт первое предложение).
- Связка — только открывашка предложения; она не заменяет содержание и
  не отменяет grounding rule: после связки идёт проверяемое утверждение.
- Для ошибок/дубликатов хороши вопросительные связки («А что если…?») —
  v5_6_ru читает «?» с живой интонацией.
- Связка ≠ дейксис: «Смотрите: интерфейс подсказал формат» — можно;
  «смотрите вот сюда» — нельзя.

## Length discipline

Scene narration ≈ scene content. One action + one response ≈ 1–2 sentences
(4–8 seconds). If narration exceeds ~12 seconds, split the scene. The recorder
holds the frame for long narration (freeze if needed) — which looks exactly
like what it is, so cut words instead.

## Output

Narration lives in `storyboard.json` scene `narration` fields. Additionally
write `narration.md` next to it: the full script in reading order with scene
IDs, for human review before synthesis.
