import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const DEFAULTS = {
  artifactsDir: 'artifacts',
  uxDocsDir: 'docs/ux',
  tts: {
    modelId: 'v5_6_ru',
    modelUrl: 'https://models.silero.ai/models/tts/ru/v5_6_ru.pt',
    speaker: 'baya',
    sampleRate: 48000,
  },
  video: { width: 1280, height: 720, fps: 30, subtitles: 'sidecar', polish: { enabled: false } },
  qa: {
    microPauseMinSec: 0.2,
    microPauseMaxSec: 0.6,
    maxTransitionSilenceSec: 1.5,
    silenceNoiseDb: -40,
  },
  backgroundAudio: { enabled: false },
};

function merge(base, override) {
  const out = { ...base };
  for (const [key, value] of Object.entries(override ?? {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && typeof base[key] === 'object') {
      out[key] = merge(base[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function loadConfig(rootDir = process.cwd()) {
  const path = join(rootDir, 'ux.config.json');
  if (!existsSync(path)) return structuredClone(DEFAULTS);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    throw new Error(`ux.config.json at ${path} is not valid JSON: ${err.message}`);
  }
  return merge(structuredClone(DEFAULTS), parsed);
}
