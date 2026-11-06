import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planStages, STAGES } from '../../tools/video/run-pipeline.mjs';

test('fresh run executes all stages', () => {
  assert.deepEqual(planStages({ outputsExist: {} }), STAGES);
});

test('resumes from the first missing output', () => {
  const stages = planStages({ outputsExist: { narrate: true, record: true, plan: false } });
  assert.deepEqual(stages, ['plan', 'compose', 'audit']);
});

test('everything present re-runs only the audit', () => {
  const stages = planStages({
    outputsExist: { narrate: true, record: true, plan: true, compose: true },
  });
  assert.deepEqual(stages, ['audit']);
});

test('--only re-runs the stage and everything downstream', () => {
  assert.deepEqual(planStages({ only: 'plan' }), ['plan', 'compose', 'audit']);
  assert.deepEqual(planStages({ only: 'audit' }), ['audit']);
});

test('unknown stage throws with the stage list', () => {
  assert.throws(() => planStages({ only: 'render' }), /narrate, record, plan, compose, audit/);
});
