#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { basename } from 'node:path';
import { parseArgs } from 'node:util';
import { execFileSync } from 'node:child_process';
import { detectSilences } from '../audio/detect-gaps.mjs';

const DURATION_TOLERANCE_SEC = 0.75;
const TRAILING_GRACE_SEC = 1.0;

function probe(file) {
  const out = execFileSync(
    'ffprobe',
    ['-v', 'error', '-of', 'json', '-show_entries', 'format=duration:stream=codec_type,codec_name,sample_rate', file],
    { encoding: 'utf8' }
  );
  return JSON.parse(out);
}

export function qaVideo({ videoFile, timeline, qa }) {
  const checks = [];
  const add = (id, ok, detail) => checks.push({ id, ok, detail });

  if (!existsSync(videoFile)) {
    add('file-exists', false, `${videoFile} does not exist`);
    return { ok: false, checks, silences: [] };
  }
  add('file-exists', true, videoFile);

  const info = probe(videoFile);
  const streams = info.streams ?? [];
  add('has-video-stream', streams.some((s) => s.codec_type === 'video'), streams.map((s) => s.codec_name).join(','));
  add('has-audio-stream', streams.some((s) => s.codec_type === 'audio'), streams.map((s) => s.codec_name).join(','));

  const actualDur = +(info.format?.duration ?? 0);
  const audioEnds = timeline.scenes.filter((s) => s.audio).map((s) => s.audio.outStartSec + s.audio.durSec);
  const expectedDur = Math.max(timeline.scenes.at(-1)?.outEndSec ?? 0, ...(audioEnds.length ? audioEnds : [0]));
  add(
    'duration-matches-timeline',
    Math.abs(actualDur - expectedDur) <= DURATION_TOLERANCE_SEC,
    `actual ${actualDur.toFixed(2)}s vs planned ${expectedDur.toFixed(2)}s`
  );

  for (const scene of timeline.scenes.filter((s) => s.audio)) {
    const audioEnd = scene.audio.outStartSec + scene.audio.durSec;
    if (audioEnd > scene.outEndSec + 0.05) {
      add('narration-within-scene', false, `${scene.id}: narration ends ${audioEnd.toFixed(2)}s, scene ends ${scene.outEndSec.toFixed(2)}s`);
    }
  }
  if (!checks.some((c) => c.id === 'narration-within-scene')) add('narration-within-scene', true, 'all narration fits its scene');

  const silences = detectSilences(videoFile, {
    noiseDb: qa.silenceNoiseDb,
    minDurationSec: qa.microPauseMaxSec,
  });
  const intentionalWindows = timeline.scenes
    .filter((s) => s.intentionalSilence)
    .map((s) => [s.outStartSec - 0.1, s.outEndSec + 0.1]);
  const offending = [];
  for (const silence of silences) {
    const end = silence.endSec ?? actualDur;
    if (silence.durSec !== null && silence.durSec <= qa.maxTransitionSilenceSec) continue;
    if (actualDur - silence.startSec <= TRAILING_GRACE_SEC + qa.maxTransitionSilenceSec && end >= actualDur - 0.05) continue;
    let uncovered = end - silence.startSec;
    for (const [winStart, winEnd] of intentionalWindows) {
      uncovered -= Math.max(0, Math.min(end, winEnd) - Math.max(silence.startSec, winStart));
    }
    if (uncovered > qa.maxTransitionSilenceSec) offending.push(silence);
  }
  add(
    'no-unexplained-silence',
    offending.length === 0,
    offending.length
      ? offending.map((s) => `${s.startSec.toFixed(2)}s-${(s.endSec ?? actualDur).toFixed(2)}s`).join(', ')
      : `max allowed ${qa.maxTransitionSilenceSec}s`
  );

  return { ok: checks.every((c) => c.ok), checks, silences };
}

if (process.argv[1] && basename(process.argv[1]) === 'qa-video.mjs') {
  const { values } = parseArgs({
    options: { video: { type: 'string' }, timeline: { type: 'string' }, out: { type: 'string' } },
  });
  if (!values.video || !values.timeline) {
    console.error('usage: qa-video.mjs --video final.mp4 --timeline timeline.json [--out qa-report.json]');
    process.exit(2);
  }
  const { loadConfig } = await import('../lib/config.mjs');
  const report = qaVideo({
    videoFile: values.video,
    timeline: JSON.parse(readFileSync(values.timeline, 'utf8')),
    qa: loadConfig().qa,
  });
  if (values.out) writeFileSync(values.out, JSON.stringify(report, null, 2));
  for (const check of report.checks) console.log(`${check.ok ? 'ok  ' : 'FAIL'} ${check.id}: ${check.detail}`);
  process.exit(report.ok ? 0 : 1);
}
