#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { execFileSync } from 'node:child_process';
import { loadConfig } from '../lib/config.mjs';

const TOOLKIT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const STAGES = ['narrate', 'record', 'plan', 'compose', 'audit'];

export function planStages({ only = null, outputsExist = {} }) {
  if (only) {
    if (!STAGES.includes(only)) throw new Error(`unknown stage "${only}"; stages: ${STAGES.join(', ')}`);
    return only === 'audit' ? ['audit'] : [only, ...STAGES.slice(STAGES.indexOf(only) + 1)];
  }
  const firstMissing = STAGES.findIndex((stage) => !outputsExist[stage]);
  return firstMissing === -1 ? ['audit'] : STAGES.slice(firstMissing);
}

function sh(cmd, args) {
  execFileSync(cmd, args, { stdio: 'inherit' });
}

if (basename(process.argv[1] ?? '') === 'run-pipeline.mjs') {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      out: { type: 'string' },
      only: { type: 'string' },
      headed: { type: 'boolean', default: false },
      polish: { type: 'boolean', default: false },
    },
  });
  const storyboardPath = positionals[0];
  if (!storyboardPath || !values.out) {
    console.error('usage: run-pipeline.mjs <storyboard.json> --out <dir> [--only narrate|record|plan|compose|audit]');
    process.exit(2);
  }
  const out = resolve(values.out);
  mkdirSync(out, { recursive: true });
  const storyboard = JSON.parse(readFileSync(storyboardPath, 'utf8'));
  const config = loadConfig();
  const paths = {
    storyboard: join(out, 'storyboard.json'),
    voiceDir: join(out, 'voice'),
    durations: join(out, 'voice', 'durations.json'),
    events: join(out, 'events.json'),
    rawVideo: join(out, 'raw', 'video.webm'),
    timeline: join(out, 'timeline.json'),
    srt: join(out, 'subtitles.srt'),
    final: join(out, 'final.mp4'),
    qa: join(out, 'qa-report.json'),
  };
  if (resolve(storyboardPath) !== paths.storyboard) {
    if (storyboard.initScript) {
      const absInit = resolve(dirname(resolve(storyboardPath)), storyboard.initScript);
      writeFileSync(paths.storyboard, JSON.stringify({ ...storyboard, initScript: absInit }, null, 2));
    } else {
      copyFileSync(storyboardPath, paths.storyboard);
    }
  }

  const stages = planStages({
    only: values.only ?? null,
    outputsExist: {
      narrate: existsSync(paths.durations),
      record: existsSync(paths.events) && existsSync(paths.rawVideo),
      plan: existsSync(paths.timeline),
      compose: existsSync(paths.final),
      audit: false,
    },
  });
  console.log(`stages to run: ${stages.join(' -> ')}`);

  for (const stage of stages) {
    console.log(`\n=== ${stage} ===`);
    switch (stage) {
      case 'narrate': {
        const python = join(TOOLKIT_ROOT, '.venv-tts', 'bin', 'python');
        if (!existsSync(python)) {
          console.error(`error: ${python} not found — run tools/audio/setup-venv.sh first`);
          process.exit(1);
        }
        sh(python, [
          join(TOOLKIT_ROOT, 'tools', 'audio', 'synth_narration.py'),
          '--storyboard', paths.storyboard,
          '--out', paths.voiceDir,
          '--model-url', config.tts.modelUrl,
          '--speaker', config.tts.speaker,
          '--sample-rate', String(config.tts.sampleRate),
        ]);
        break;
      }
      case 'record':
        sh('node', [
          join(TOOLKIT_ROOT, 'tools', 'browser', 'record-journey.mjs'),
          '--storyboard', paths.storyboard,
          '--durations', paths.durations,
          '--out', out,
          ...(values.headed ? ['--headed'] : []),
        ]);
        break;
      case 'plan':
        sh('node', [
          join(TOOLKIT_ROOT, 'tools', 'video', 'plan-timeline.mjs'),
          '--events', paths.events,
          '--durations', paths.durations,
          '--storyboard', paths.storyboard,
          '--out', paths.timeline,
          '--srt', paths.srt,
          '--width', String(config.video.width),
          '--height', String(config.video.height),
          '--fps', String(config.video.fps),
        ]);
        break;
      case 'compose':
        sh('node', [
          join(TOOLKIT_ROOT, 'tools', 'video', 'compose.mjs'),
          '--timeline', paths.timeline,
          '--video', paths.rawVideo,
          '--audio', paths.voiceDir,
          '--out', paths.final,
          '--srt', paths.srt,
          ...(config.video.subtitles === 'burn' ? ['--burn'] : []),
        ]);
        break;
      case 'audit':
        sh('node', [
          join(TOOLKIT_ROOT, 'tools', 'video', 'qa-video.mjs'),
          '--video', paths.final,
          '--timeline', paths.timeline,
          '--out', paths.qa,
        ]);
        break;
    }
  }
  if (values.polish || config.video.polish?.enabled) {
    console.log('\n=== polish (remotion) ===');
    sh('node', [join(TOOLKIT_ROOT, 'tools', 'video', 'polish.mjs'), '--out', out]);
    console.log('\n=== audit (polished) ===');
    sh('node', [
      join(TOOLKIT_ROOT, 'tools', 'video', 'qa-video.mjs'),
      '--video', join(out, 'polished.mp4'),
      '--timeline', join(out, 'polished-timeline.json'),
      '--out', join(out, 'qa-polished.json'),
    ]);
  }
  console.log(`\npipeline done: ${paths.final} (qa: ${paths.qa})`);
}
