import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPolishedTimeline, shiftSrt } from '../../tools/video/polish.mjs';

const timeline = {
  scenes: [
    { id: 'SC-01', outStartSec: 0, outEndSec: 4, audio: { outStartSec: 0.15, durSec: 3 } },
    { id: 'SC-02', outStartSec: 4, outEndSec: 7, intentionalSilence: true },
  ],
};

test('polished timeline shifts scenes and audio by intro duration', () => {
  const out = buildPolishedTimeline({ timeline, introSec: 3, mainSec: 7, outroSec: 2, introDur: 2.4, outroDur: 1.5 });
  assert.equal(out.scenes[0].id, 'INTRO');
  assert.equal(out.scenes[0].intentionalSilence, false);
  assert.equal(out.scenes[0].audio.durSec, 2.4);
  assert.equal(out.scenes[1].outStartSec, 3);
  assert.equal(out.scenes[1].audio.outStartSec, 3.15);
  assert.equal(out.scenes.at(-1).id, 'OUTRO');
  assert.equal(out.scenes.at(-1).outStartSec, 10);
  assert.equal(out.scenes.at(-1).outEndSec, 12);
});

test('polished timeline marks narration-less intro as intentional silence', () => {
  const out = buildPolishedTimeline({ timeline, introSec: 2.5, mainSec: 7, outroSec: 2, introDur: null, outroDur: null });
  assert.equal(out.scenes[0].intentionalSilence, true);
  assert.equal(out.scenes[0].audio, undefined);
  assert.equal(out.scenes.at(-1).intentionalSilence, true);
});

test('shiftSrt offsets timestamps and prepends intro entry', () => {
  const srt = '1\n00:00:00,150 --> 00:00:03,000\nПервая реплика\n';
  const out = shiftSrt(srt, 3, 'Интро');
  assert.match(out, /^1\n00:00:00,150 --> 00:00:02,800\nИнтро/);
  assert.match(out, /2\n00:00:03,150 --> 00:00:06,000\nПервая реплика/);
});
