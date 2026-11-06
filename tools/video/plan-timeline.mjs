#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { parseArgs } from 'node:util';

const AUDIO_LEAD_SEC = 0.15;
const AUDIO_TAIL_PAD_SEC = 0.3;

export function planTimeline({ events, durations, storyboard, videoMeta }) {
  const byId = Object.fromEntries(storyboard.scenes.map((s) => [s.id, s]));
  let shift = 0;
  const scenes = [];
  for (const ev of events.scenes) {
    const scene = byId[ev.id] ?? {};
    const srcStartSec = ev.tStartSec;
    const srcEndSec = ev.tEndSec;
    const srcDur = srcEndSec - srcStartSec;
    const audioDur = durations[ev.id] ?? 0;
    const needed = audioDur > 0 ? AUDIO_LEAD_SEC + audioDur + AUDIO_TAIL_PAD_SEC : 0;
    const freezeExtendSec = Math.max(0, +(needed - srcDur).toFixed(3));
    const outStartSec = +(srcStartSec + shift).toFixed(3);
    const outEndSec = +(srcEndSec + shift + freezeExtendSec).toFixed(3);
    shift += freezeExtendSec;
    const entry = {
      id: ev.id,
      srcStartSec,
      srcEndSec,
      outStartSec,
      outEndSec,
      freezeExtendSec,
      intentionalSilence: Boolean(scene.intentionalSilence),
    };
    if (audioDur > 0) {
      const audioStart = +(outStartSec + AUDIO_LEAD_SEC).toFixed(3);
      entry.audio = { file: `scene-${ev.id}.wav`, outStartSec: audioStart, durSec: audioDur };
      entry.subtitle = {
        text: (scene.narration ?? '').replace(/\s+/g, ' ').trim(),
        outStartSec: audioStart,
        outEndSec: +(audioStart + audioDur).toFixed(3),
      };
    }
    scenes.push(entry);
  }
  return { storyId: events.storyId, video: { sourceFile: events.videoFile, ...videoMeta }, scenes };
}

function formatSrtTime(sec) {
  const ms = Math.round(sec * 1000);
  const h = String(Math.floor(ms / 3_600_000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, '0');
  const s = String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0');
  const rest = String(ms % 1000).padStart(3, '0');
  return `${h}:${m}:${s},${rest}`;
}

export function timelineToSrt(timeline) {
  const cues = timeline.scenes.filter((s) => s.subtitle?.text);
  return cues
    .map(
      (s, i) =>
        `${i + 1}\n${formatSrtTime(s.subtitle.outStartSec)} --> ${formatSrtTime(s.subtitle.outEndSec)}\n${s.subtitle.text}\n`
    )
    .join('\n');
}

if (process.argv[1] && basename(process.argv[1]) === 'plan-timeline.mjs') {
  const { values } = parseArgs({
    options: {
      events: { type: 'string' },
      durations: { type: 'string' },
      storyboard: { type: 'string' },
      out: { type: 'string' },
      srt: { type: 'string' },
      width: { type: 'string' },
      height: { type: 'string' },
      fps: { type: 'string' },
    },
  });
  if (!values.events || !values.durations || !values.storyboard || !values.out) {
    console.error('usage: plan-timeline.mjs --events e.json --durations d.json --storyboard s.json --out timeline.json [--srt subtitles.srt]');
    process.exit(2);
  }
  const timeline = planTimeline({
    events: JSON.parse(readFileSync(values.events, 'utf8')),
    durations: JSON.parse(readFileSync(values.durations, 'utf8')),
    storyboard: JSON.parse(readFileSync(values.storyboard, 'utf8')),
    videoMeta: { width: +(values.width ?? 1280), height: +(values.height ?? 720), fps: +(values.fps ?? 30) },
  });
  writeFileSync(values.out, JSON.stringify(timeline, null, 2));
  if (values.srt) writeFileSync(values.srt, timelineToSrt(timeline));
  console.log(`timeline: ${timeline.scenes.length} scenes -> ${values.out}`);
}
