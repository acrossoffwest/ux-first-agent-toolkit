# Silent-gap strategies (A–F) and when to use each

The recorder already prevents most gaps by holding each scene for its
narration. These strategies cover the rest — transitions, loading, pacing.

- **A. Contextual bridge narration** — default for scene changes. End the
  previous scene's narration with why the next one matters: «Проект создан.
  Теперь посмотрим, как пригласить в него коллегу.» Put the bridge in the
  *earlier* scene's text so it plays over the transition.
- **B. Short caption** — when speech would be excessive (quick step in a
  sequence). Add a subtitle-only scene: narration empty,
  `intentionalSilence: true`, and put the caption text in the scene `title`;
  the subtitle track carries it. Use sparingly.
- **C. Scene continuation** — result deserves a beat of attention: raise
  `minHoldSec` so the result stays visible after narration ends (≤ the QA
  silence threshold, or mark intentional).
- **D. Timeline compression** — long waits (seeding, slow network) are cut by
  splitting into two scenes around the wait; the recorder's pacing skips dead
  time between actions. Never compress a wait the video is meant to evaluate —
  if latency is the finding, show it and narrate it.
- **E. Background audio** — off by default (`backgroundAudio.enabled: false`).
  Only royalty-free/licensed tracks, only when the user asks.
- **F. Deliberate pause** — comprehension beat after dense narration:
  `intentionalSilence: true` scene with a short hold. QA accepts silence
  covered by intentional scenes and flags everything else over the threshold
  (`qa.maxTransitionSilenceSec`, default 1.5s).

Filler ban: never narrate mechanics («а теперь нажмём сюда»). Narrate intent
and response: «После сохранения интерфейс сразу предлагает следующий шаг —
пригласить участников.»
