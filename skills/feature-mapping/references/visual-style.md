# Visual style for feature journey illustrations

One consistent style across a product's visuals — a feature map that looks
like five different artists drew it reads as noise.

## Model choice (in preference order)

1. Any `gpt-image-*` provider — excellent at flat design + legible text.
2. `recraft-ai/recraft-v3` (Replicate) — best non-OpenAI for design + text.
3. `ideogram-ai/ideogram-v2` (Replicate) — strong text rendering.
4. `black-forest-labs/flux-1.1-pro` / Stability `core` — rich illustration,
   weaker text: drop labels from the prompt entirely.

Pick the first available via `list_image_models`. Text inside images:
**English or none** — Cyrillic rendering is unreliable in all current
models; the markdown around the image carries the Russian.

## Prompt skeleton — journey strip (per feature)

```
Flat vector illustration, horizontal journey map with 4 stages left to
right connected by a smooth path: [stage 1 verb], [stage 2 verb],
[stage 3 verb], [stage 4 outcome]. One consistent character throughout.
Soft rounded shapes, friendly SaaS product illustration style.
Palette: indigo #4F46E5, sky #38BDF8, amber #F59E0B accents, off-white
background #FAFAF7. Minimal labels, large readable icons, no photoreal,
no UI chrome screenshots, clean margins.
```

Size: 1536×640 (strip). One stage per journey beat from the FEAT file's
first-use table — compress to 4 beats max.

## Prompt skeleton — feature map overview

```
Flat vector illustration, isometric map of a product as a small town:
[N] districts labeled [feature names in English], roads between districts
that share territory, one main entrance road labeled Start. Same palette
and style as above. Light, playful, readable at thumbnail size.
```

Districts = features; roads = declared intersections. Size: 1280×1024.

## Rules

- Same palette, same style phrase in every prompt of one product — copy
  the skeleton, change only the bracketed parts.
- Save to `docs/ux/visuals/FEAT-###-journey.jpg` and
  `docs/ux/visuals/feature-map.jpg`; webp allowed for size.
- An illustration decorates the document; the mermaid diagram defines the
  truth. On conflict, fix the image or delete it.
- Regenerate the strip when the first-use journey changes materially;
  don't regenerate for copy edits.
