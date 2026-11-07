#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { runJourney } from '../lib/journey-runner.mjs';
import { loadConfig } from '../lib/config.mjs';

const { values } = parseArgs({
  options: {
    storyboard: { type: 'string' },
    durations: { type: 'string' },
    out: { type: 'string' },
    'no-video': { type: 'boolean', default: false },
    headed: { type: 'boolean', default: false },
  },
});

if (!values.storyboard || !values.out) {
  console.error('usage: record-journey.mjs --storyboard <file> --out <dir> [--durations <file>] [--no-video] [--headed]');
  process.exit(2);
}

const storyboard = JSON.parse(readFileSync(values.storyboard, 'utf8'));
const durations = values.durations && existsSync(values.durations)
  ? JSON.parse(readFileSync(values.durations, 'utf8'))
  : {};
const config = loadConfig();

const events = await runJourney(storyboard, {
  outDir: values.out,
  durations,
  video: values['no-video'] ? null : config.video,
  headless: !values.headed,
  initScript: storyboard.initScript
    ? resolve(dirname(resolve(values.storyboard)), storyboard.initScript)
    : null,
});

mkdirSync(values.out, { recursive: true });
writeFileSync(join(values.out, 'events.json'), JSON.stringify(events, null, 2));

if (!events.ok) {
  console.error(`journey FAILED: ${events.error}`);
  process.exit(1);
}
console.log(`journey OK: ${events.scenes.length} scenes${events.videoFile ? `, video at ${events.videoFile}` : ''}`);
