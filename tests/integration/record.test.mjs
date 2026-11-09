import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runJourney } from '../../tools/lib/journey-runner.mjs';

const fixtureUrl = pathToFileURL(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'mini-app', 'index.html')
).href;

const storyboard = (lastScene) => ({
  storyId: 'US-000',
  baseUrl: fixtureUrl,
  scenes: [
    {
      id: 'SC-01',
      narration: 'x',
      minHoldSec: 0.5,
      actions: [
        { type: 'goto', url: fixtureUrl },
        { type: 'click', selector: 'testid=open-form' },
        { type: 'expect-visible', selector: 'testid=form' },
      ],
    },
    lastScene,
  ],
});

const happyScene = {
  id: 'SC-02',
  narration: 'x',
  minHoldSec: 0.5,
  actions: [
    { type: 'fill', selector: 'testid=name-input', value: 'Анна' },
    { type: 'click', selector: 'testid=save' },
    { type: 'expect-text', selector: 'testid=result', text: 'Сохранено: Анна' },
  ],
};

test('records a passing journey with video and scene timestamps', async () => {
  const out = mkdtempSync(join(tmpdir(), 'rec-'));
  const events = await runJourney(storyboard(happyScene), {
    outDir: out,
    durations: { 'SC-01': 1.0, 'SC-02': 1.0 },
    video: { width: 640, height: 480, fps: 25 },
  });
  assert.equal(events.ok, true);
  assert.equal(events.scenes.length, 2);
  for (const scene of events.scenes) {
    assert.ok(scene.tEndSec > scene.tStartSec, `${scene.id} has a positive duration`);
    assert.ok(scene.tEndSec - scene.tStartSec >= 1.0, `${scene.id} held for audio duration`);
  }
  assert.ok(existsSync(events.videoFile), 'video.webm exists');
  assert.ok(statSync(events.videoFile).size > 1000, 'video.webm is not empty');
});

test('storyboard colorScheme sets prefers-color-scheme for the page', async () => {
  const out = mkdtempSync(join(tmpdir(), 'rec-'));
  const darkCheck = {
    id: 'SC-02',
    narration: 'x',
    minHoldSec: 0,
    actions: [
      {
        type: 'evaluate',
        script: "if (!matchMedia('(prefers-color-scheme: dark)').matches) throw new Error('not dark');",
      },
    ],
  };
  const events = await runJourney({ ...storyboard(darkCheck), colorScheme: 'dark' }, { outDir: out, video: null });
  assert.equal(events.ok, true, events.error);
});

test('failing step marks events not ok and names the scene and action', async () => {
  const out = mkdtempSync(join(tmpdir(), 'rec-'));
  const broken = {
    id: 'SC-02',
    narration: 'x',
    actions: [{ type: 'click', selector: 'testid=does-not-exist', timeoutMs: 800 }],
  };
  const events = await runJourney(storyboard(broken), { outDir: out, video: null });
  assert.equal(events.ok, false);
  assert.match(events.error, /SC-02/);
  assert.match(events.error, /click/);
  const failed = events.scenes.find((s) => s.id === 'SC-02');
  assert.equal(failed.ok, false);
});
