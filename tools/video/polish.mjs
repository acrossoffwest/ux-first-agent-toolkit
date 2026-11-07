#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { execFileSync } from 'node:child_process';
import { loadConfig } from '../lib/config.mjs';

const TOOLKIT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const REMOTION_DIR = join(TOOLKIT_ROOT, 'remotion');
const AUDIO_LEAD_SEC = 0.15;
const AUDIO_TAIL_SEC = 0.45;

function probeDuration(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-of', 'json', '-show_entries', 'format=duration', file], {
    encoding: 'utf8',
  });
  return +(JSON.parse(out).format?.duration ?? 0);
}

export function buildPolishedTimeline({ timeline, introSec, mainSec, outroSec, introDur, outroDur }) {
  const scenes = [];
  scenes.push({
    id: 'INTRO',
    outStartSec: 0,
    outEndSec: introSec,
    intentionalSilence: introDur == null,
    ...(introDur != null ? { audio: { outStartSec: AUDIO_LEAD_SEC, durSec: introDur } } : {}),
  });
  for (const s of timeline.scenes) {
    scenes.push({
      ...s,
      outStartSec: s.outStartSec + introSec,
      outEndSec: s.outEndSec + introSec,
      ...(s.audio ? { audio: { ...s.audio, outStartSec: s.audio.outStartSec + introSec } } : {}),
    });
  }
  const outroStart = introSec + mainSec;
  scenes.push({
    id: 'OUTRO',
    outStartSec: outroStart,
    outEndSec: outroStart + outroSec,
    intentionalSilence: outroDur == null,
    ...(outroDur != null ? { audio: { outStartSec: outroStart + AUDIO_LEAD_SEC, durSec: outroDur } } : {}),
  });
  return { ...timeline, scenes, polished: true };
}

export function shiftSrt(srt, offsetSec, introEntry) {
  const toMs = (h, m, s, ms) => ((+h * 60 + +m) * 60 + +s) * 1000 + +ms;
  const fmt = (ms) => {
    const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
    const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
    return `${h}:${m}:${s},${String(ms % 1000).padStart(3, '0')}`;
  };
  const shifted = srt.replace(
    /(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/g,
    (_, h1, m1, s1, ms1, h2, m2, s2, ms2) =>
      `${fmt(toMs(h1, m1, s1, ms1) + offsetSec * 1000)} --> ${fmt(toMs(h2, m2, s2, ms2) + offsetSec * 1000)}`
  );
  const blocks = shifted.trim().split(/\n\n+/);
  const all = introEntry
    ? [`${fmt(Math.round(AUDIO_LEAD_SEC * 1000))} --> ${fmt(Math.round((offsetSec - 0.2) * 1000))}\n${introEntry}`, ...blocks.map((b) => b.replace(/^\d+\n/, ''))]
    : blocks.map((b) => b.replace(/^\d+\n/, ''));
  return all.map((b, i) => `${i + 1}\n${b}`).join('\n\n') + '\n';
}

function synthPolishVoice({ outDir, intro, outro, config }) {
  const python = join(TOOLKIT_ROOT, '.venv-tts', 'bin', 'python');
  if (!existsSync(python)) throw new Error(`${python} not found — run tools/audio/setup-venv.sh first`);
  const scenes = [];
  if (intro) scenes.push({ id: 'INTRO', narration: intro, actions: [] });
  if (outro) scenes.push({ id: 'OUTRO', narration: outro, actions: [] });
  const sbPath = join(outDir, 'storyboard.json');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(sbPath, JSON.stringify({ storyId: 'POLISH', scenes }, null, 2));
  execFileSync(
    python,
    [
      join(TOOLKIT_ROOT, 'tools', 'audio', 'synth_narration.py'),
      '--storyboard', sbPath,
      '--out', outDir,
      '--model-url', config.tts.modelUrl,
      '--speaker', config.tts.speaker,
      '--en-model-url', config.tts.en.modelUrl,
      '--en-speaker', config.tts.en.speaker,
      '--sample-rate', String(config.tts.sampleRate),
    ],
    { stdio: 'inherit' }
  );
  return JSON.parse(readFileSync(join(outDir, 'durations.json'), 'utf8'));
}

if (basename(process.argv[1] ?? '') === 'polish.mjs') {
  const { values } = parseArgs({ options: { out: { type: 'string' } } });
  if (!values.out) {
    console.error('usage: polish.mjs --out <pipeline-out-dir>  (expects storyboard.json, timeline.json, final.mp4 inside)');
    process.exit(2);
  }
  const out = resolve(values.out);
  const storyboard = JSON.parse(readFileSync(join(out, 'storyboard.json'), 'utf8'));
  const timeline = JSON.parse(readFileSync(join(out, 'timeline.json'), 'utf8'));
  const finalVideo = join(out, 'final.mp4');
  if (!existsSync(finalVideo)) {
    console.error(`error: ${finalVideo} not found — run the compose stage first`);
    process.exit(1);
  }
  if (!existsSync(join(REMOTION_DIR, 'node_modules'))) {
    console.error('error: remotion/node_modules not found — run: npm install --prefix remotion');
    process.exit(1);
  }

  const config = loadConfig();
  const polish = storyboard.polish ?? {};
  const introText = polish.intro?.narration ?? null;
  const outroText = polish.outro?.narration ?? null;

  let introDur = null;
  let outroDur = null;
  const publicDir = join(REMOTION_DIR, 'public');
  mkdirSync(publicDir, { recursive: true });
  if (introText || outroText) {
    const durations = synthPolishVoice({ outDir: join(out, 'polish-voice'), intro: introText, outro: outroText, config });
    if (introText) {
      introDur = durations.INTRO;
      copyFileSync(join(out, 'polish-voice', 'scene-INTRO.wav'), join(publicDir, 'intro.wav'));
    }
    if (outroText) {
      outroDur = durations.OUTRO;
      copyFileSync(join(out, 'polish-voice', 'scene-OUTRO.wav'), join(publicDir, 'outro.wav'));
    }
  }

  const mainSec = probeDuration(finalVideo);
  const introSec = introDur != null ? Math.max(2.8, AUDIO_LEAD_SEC + introDur + AUDIO_TAIL_SEC) : 2.5;
  const outroSec = outroDur != null ? Math.max(2.2, AUDIO_LEAD_SEC + outroDur + AUDIO_TAIL_SEC) : 2.0;

  const sceneStarts = new Map(timeline.scenes.map((s) => [s.id, s.outStartSec]));
  const badges = (storyboard.scenes ?? [])
    .filter((s) => s.label && sceneStarts.has(s.id))
    .map((s) => ({ atSec: sceneStarts.get(s.id), label: s.label }));

  copyFileSync(finalVideo, join(publicDir, 'main.mp4'));

  const props = {
    fps: config.video.fps,
    width: config.video.width,
    height: config.video.height,
    introSec,
    mainSec,
    outroSec,
    title: polish.title ?? storyboard.storyId ?? 'Walkthrough',
    subtitle: polish.subtitle ?? '',
    outroText: polish.outro?.text ?? 'Готово',
    badges,
    hasIntroAudio: introDur != null,
    hasOutroAudio: outroDur != null,
  };
  const propsPath = join(out, 'polish-props.json');
  writeFileSync(propsPath, JSON.stringify(props, null, 2));

  const polished = join(out, 'polished.mp4');
  execFileSync('npx', ['remotion', 'render', 'src/index.ts', 'Polish', polished, `--props=${propsPath}`], {
    cwd: REMOTION_DIR,
    stdio: 'inherit',
  });

  const polishedTimeline = buildPolishedTimeline({ timeline, introSec, mainSec, outroSec, introDur, outroDur });
  writeFileSync(join(out, 'polished-timeline.json'), JSON.stringify(polishedTimeline, null, 2));

  const srtPath = join(out, 'subtitles.srt');
  if (existsSync(srtPath)) {
    writeFileSync(join(out, 'polished-subtitles.srt'), shiftSrt(readFileSync(srtPath, 'utf8'), introSec, introText));
  }
  console.log(`polish done: ${polished}`);
}
