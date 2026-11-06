import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadConfig, DEFAULTS } from '../../tools/lib/config.mjs';

test('returns defaults when no config file exists', () => {
  const dir = mkdtempSync(join(tmpdir(), 'uxcfg-'));
  const cfg = loadConfig(dir);
  assert.deepEqual(cfg, DEFAULTS);
  assert.equal(cfg.tts.speaker, 'baya');
  assert.equal(cfg.tts.sampleRate, 48000);
});

test('deep-merges overrides over defaults', () => {
  const dir = mkdtempSync(join(tmpdir(), 'uxcfg-'));
  writeFileSync(join(dir, 'ux.config.json'), JSON.stringify({ tts: { speaker: 'xenia' }, video: { fps: 60 } }));
  const cfg = loadConfig(dir);
  assert.equal(cfg.tts.speaker, 'xenia');
  assert.equal(cfg.tts.sampleRate, 48000);
  assert.equal(cfg.video.fps, 60);
  assert.equal(cfg.video.width, 1280);
});

test('throws actionable error on invalid JSON', () => {
  const dir = mkdtempSync(join(tmpdir(), 'uxcfg-'));
  writeFileSync(join(dir, 'ux.config.json'), '{broken');
  assert.throws(() => loadConfig(dir), /not valid JSON/);
});
