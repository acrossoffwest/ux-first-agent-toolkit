import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { planTimeline, timelineToSrt } from '../../tools/video/plan-timeline.mjs';
import { compose } from '../../tools/video/compose.mjs';
import { qaVideo } from '../../tools/video/qa-video.mjs';
import { DEFAULTS } from '../../tools/lib/config.mjs';

let work;

function makeWav(path, durSec) {
  execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', `sine=frequency=440:duration=${durSec}`, '-ar', '48000', path], {
    stdio: 'ignore',
  });
}

before(() => {
  work = mkdtempSync(join(tmpdir(), 'compose-'));
  execFileSync(
    'ffmpeg',
    ['-y', '-f', 'lavfi', '-i', 'testsrc=duration=6:size=640x480:rate=25', join(work, 'video.webm')],
    { stdio: 'ignore' }
  );
  makeWav(join(work, 'scene-SC-01.wav'), 2.0);
  makeWav(join(work, 'scene-SC-02.wav'), 2.0);
});

const storyboard = {
  storyId: 'US-000',
  baseUrl: 'http://x',
  scenes: [
    { id: 'SC-01', narration: 'Первая сцена.', actions: [] },
    { id: 'SC-02', narration: 'Вторая сцена.', actions: [] },
  ],
};

const events = {
  storyId: 'US-000',
  ok: true,
  scenes: [
    { id: 'SC-01', tStartSec: 0, tEndSec: 3, ok: true },
    { id: 'SC-02', tStartSec: 3, tEndSec: 6, ok: true },
  ],
};

test('planTimeline places audio inside scenes and computes no freeze when scenes are long enough', () => {
  const timeline = planTimeline({
    events,
    durations: { 'SC-01': 2.0, 'SC-02': 2.0 },
    storyboard,
    videoMeta: { width: 640, height: 480, fps: 25 },
  });
  assert.equal(timeline.scenes.length, 2);
  assert.equal(timeline.scenes[0].freezeExtendSec, 0);
  assert.ok(timeline.scenes[1].audio.outStartSec >= 3);
  const srt = timelineToSrt(timeline);
  assert.match(srt, /Первая сцена/);
  assert.match(srt, /00:00:03/);
});

test('planTimeline adds freeze when narration outlasts the scene', () => {
  const timeline = planTimeline({
    events,
    durations: { 'SC-01': 5.0, 'SC-02': 2.0 },
    storyboard,
    videoMeta: { width: 640, height: 480, fps: 25 },
  });
  assert.ok(timeline.scenes[0].freezeExtendSec > 2, `freeze was ${timeline.scenes[0].freezeExtendSec}`);
  assert.ok(timeline.scenes[1].outStartSec > 3, 'second scene shifted by the freeze');
});

test('compose produces a valid mp4 and qa passes on it', () => {
  const timeline = planTimeline({
    events,
    durations: { 'SC-01': 2.0, 'SC-02': 2.0 },
    storyboard,
    videoMeta: { width: 640, height: 480, fps: 25 },
  });
  const outFile = join(work, 'final.mp4');
  compose({ timeline, videoFile: join(work, 'video.webm'), audioDir: work, outFile });
  assert.ok(existsSync(outFile));
  const report = qaVideo({ videoFile: outFile, timeline, qa: DEFAULTS.qa });
  assert.equal(report.ok, true, JSON.stringify(report.checks, null, 2));
});

test('compose with freeze extends the video and qa still passes', () => {
  const timeline = planTimeline({
    events,
    durations: { 'SC-01': 5.0, 'SC-02': 2.0 },
    storyboard,
    videoMeta: { width: 640, height: 480, fps: 25 },
  });
  makeWav(join(work, 'scene-SC-01.wav'), 5.0);
  const outFile = join(work, 'final-freeze.mp4');
  compose({ timeline, videoFile: join(work, 'video.webm'), audioDir: work, outFile });
  const report = qaVideo({ videoFile: outFile, timeline, qa: DEFAULTS.qa });
  assert.equal(report.ok, true, JSON.stringify(report.checks, null, 2));
  makeWav(join(work, 'scene-SC-01.wav'), 2.0);
});

test('qa flags an unexplained silent gap and accepts an intentional one', () => {
  const silentEvents = {
    storyId: 'US-000',
    ok: true,
    scenes: [
      { id: 'SC-01', tStartSec: 0, tEndSec: 2.5, ok: true },
      { id: 'SC-02', tStartSec: 2.5, tEndSec: 6, ok: true },
    ],
  };
  const silentStoryboard = {
    ...storyboard,
    scenes: [
      { id: 'SC-01', narration: 'Первая сцена.', actions: [] },
      { id: 'SC-02', narration: '', intentionalSilence: false, actions: [] },
    ],
  };
  const timeline = planTimeline({
    events: silentEvents,
    durations: { 'SC-01': 2.0 },
    storyboard: silentStoryboard,
    videoMeta: { width: 640, height: 480, fps: 25 },
  });
  const outFile = join(work, 'final-gap.mp4');
  compose({ timeline, videoFile: join(work, 'video.webm'), audioDir: work, outFile });

  const badReport = qaVideo({ videoFile: outFile, timeline, qa: { ...DEFAULTS.qa, maxTransitionSilenceSec: 1.0 } });
  assert.equal(badReport.ok, false, 'long tail silence must be flagged');
  assert.equal(badReport.checks.find((c) => c.id === 'no-unexplained-silence').ok, false);

  timeline.scenes[1].intentionalSilence = true;
  const okReport = qaVideo({ videoFile: outFile, timeline, qa: { ...DEFAULTS.qa, maxTransitionSilenceSec: 1.0 } });
  assert.equal(okReport.checks.find((c) => c.id === 'no-unexplained-silence').ok, true, 'intentional silence accepted');
});
