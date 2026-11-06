#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { execFileSync } from 'node:child_process';

export function buildFfmpegArgs({ timeline, videoFile, audioDir, outFile, srtFile = null, burnSubtitles = false }) {
  const scenes = timeline.scenes;
  const audioScenes = scenes.filter((s) => s.audio);
  const args = ['-y', '-i', videoFile];
  for (const s of audioScenes) args.push('-i', join(audioDir, s.audio.file));

  const filters = [];
  const needSplit = scenes.some((s) => s.freezeExtendSec > 0);
  let videoLabel = '[0:v]';
  if (needSplit) {
    const segLabels = [];
    scenes.forEach((s, i) => {
      const freeze = s.freezeExtendSec > 0 ? `,tpad=stop_mode=clone:stop_duration=${s.freezeExtendSec}` : '';
      filters.push(`[0:v]trim=start=${s.srcStartSec}:end=${s.srcEndSec},setpts=PTS-STARTPTS${freeze}[v${i}]`);
      segLabels.push(`[v${i}]`);
    });
    filters.push(`${segLabels.join('')}concat=n=${scenes.length}:v=1:a=0[vout]`);
    videoLabel = '[vout]';
  }

  const totalDur = Math.max(
    scenes.at(-1)?.outEndSec ?? 0,
    ...audioScenes.map((s) => s.audio.outStartSec + s.audio.durSec)
  );

  if (audioScenes.length > 0) {
    const mixLabels = [];
    audioScenes.forEach((s, i) => {
      const delayMs = Math.round(s.audio.outStartSec * 1000);
      filters.push(`[${i + 1}:a]adelay=${delayMs}|${delayMs}[a${i}]`);
      mixLabels.push(`[a${i}]`);
    });
    filters.push(
      `${mixLabels.join('')}amix=inputs=${audioScenes.length}:normalize=0,apad=whole_dur=${totalDur}[aout]`
    );
  } else {
    filters.push(`anullsrc=channel_layout=mono:sample_rate=48000,atrim=duration=${totalDur}[aout]`);
  }

  if (burnSubtitles && srtFile) {
    filters.push(`${videoLabel}subtitles=${srtFile.replaceAll(':', '\\:')}[vsub]`);
    videoLabel = '[vsub]';
  }

  args.push('-filter_complex', filters.join(';'));
  args.push('-map', videoLabel === '[0:v]' ? '0:v' : videoLabel, '-map', '[aout]');
  args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p');
  args.push('-c:a', 'aac', '-ar', '48000', '-t', String(totalDur), outFile);
  return args;
}

export function compose(options) {
  const args = buildFfmpegArgs(options);
  execFileSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
  if (!existsSync(options.outFile)) throw new Error(`ffmpeg finished but ${options.outFile} does not exist`);
  return options.outFile;
}

if (process.argv[1] && basename(process.argv[1]) === 'compose.mjs') {
  const { values } = parseArgs({
    options: {
      timeline: { type: 'string' },
      video: { type: 'string' },
      audio: { type: 'string' },
      out: { type: 'string' },
      srt: { type: 'string' },
      burn: { type: 'boolean', default: false },
    },
  });
  if (!values.timeline || !values.video || !values.audio || !values.out) {
    console.error('usage: compose.mjs --timeline t.json --video video.webm --audio <dir> --out final.mp4 [--srt subs.srt --burn]');
    process.exit(2);
  }
  const timeline = JSON.parse(readFileSync(values.timeline, 'utf8'));
  compose({
    timeline,
    videoFile: resolve(values.video),
    audioDir: resolve(values.audio),
    outFile: resolve(values.out),
    srtFile: values.srt ? resolve(values.srt) : null,
    burnSubtitles: values.burn,
  });
  console.log(`composed: ${values.out}`);
}
