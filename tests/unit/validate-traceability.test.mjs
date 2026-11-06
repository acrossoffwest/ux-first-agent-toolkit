import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateTraceability } from '../../tools/validation/validate-traceability.mjs';

function makeUxDocs(root, { danglingFlow = false, orphanScreen = false, approvedWithoutTests = false } = {}) {
  const ux = join(root, 'docs', 'ux');
  for (const d of ['stories', 'use-cases', 'flows', 'prototypes', 'tests']) {
    mkdirSync(join(ux, d), { recursive: true });
  }
  const flows = danglingFlow ? '[FLOW-001, FLOW-099]' : '[FLOW-001]';
  const status = approvedWithoutTests ? 'approved' : 'draft';
  const tests = approvedWithoutTests ? '[]' : '[TEST-001]';
  writeFileSync(
    join(ux, 'stories', 'US-001.md'),
    `---\nid: US-001\ntitle: t\nstatus: ${status}\nuseCases: [UC-001]\nflows: ${flows}\nscreens: [SCR-001]\ntests: ${tests}\n---\nbody`
  );
  writeFileSync(join(ux, 'use-cases', 'UC-001.md'), '---\nid: UC-001\nstories: [US-001]\n---\nbody');
  writeFileSync(join(ux, 'flows', 'FLOW-001.md'), '---\nid: FLOW-001\n---\nbody');
  writeFileSync(join(ux, 'prototypes', 'SCR-001.html'), '<!DOCTYPE html><html lang="ru"></html>');
  if (!approvedWithoutTests) writeFileSync(join(ux, 'tests', 'TEST-001.md'), '---\nid: TEST-001\n---\nbody');
  if (orphanScreen) writeFileSync(join(ux, 'prototypes', 'SCR-777.html'), '<!DOCTYPE html><html lang="ru"></html>');
  return ux;
}

test('clean artifact set passes', () => {
  const ux = makeUxDocs(mkdtempSync(join(tmpdir(), 'vtr-')));
  const report = validateTraceability(ux);
  assert.equal(report.ok, true);
  assert.deepEqual(report.problems, []);
  assert.equal(report.stories['US-001'].flows[0], 'FLOW-001');
});

test('dangling reference fails naming the exact id', () => {
  const ux = makeUxDocs(mkdtempSync(join(tmpdir(), 'vtr-')), { danglingFlow: true });
  const report = validateTraceability(ux);
  assert.equal(report.ok, false);
  assert.match(report.problems.join('\n'), /FLOW-099/);
});

test('orphan screen fails naming the exact id', () => {
  const ux = makeUxDocs(mkdtempSync(join(tmpdir(), 'vtr-')), { orphanScreen: true });
  const report = validateTraceability(ux);
  assert.equal(report.ok, false);
  assert.match(report.problems.join('\n'), /SCR-777/);
});

function addFeatures(ux, { undeclaredShare = false, approvedNoStories = false, oneSided = false } = {}) {
  mkdirSync(join(ux, 'features'), { recursive: true });
  writeFileSync(join(ux, 'prototypes', 'SCR-002.html'), '<!DOCTYPE html><html lang="ru"></html>');
  writeFileSync(
    join(ux, 'stories', 'US-002.md'),
    '---\nid: US-002\ntitle: t\nstatus: draft\nuseCases: []\nflows: [FLOW-001]\nscreens: [SCR-002]\ntests: [TEST-001]\n---\nbody'
  );
  const f1Intersects = undeclaredShare ? '[]' : '[FEAT-002]';
  const f2Intersects = undeclaredShare || oneSided ? '[]' : '[FEAT-001]';
  const f1Stories = approvedNoStories ? '[]' : '[US-001]';
  const f1Status = approvedNoStories ? 'approved' : 'proposed';
  writeFileSync(
    join(ux, 'features', 'FEAT-001.md'),
    `---\nid: FEAT-001\nstatus: ${f1Status}\nstories: ${f1Stories}\nscreens: [SCR-001]\nintersects: ${f1Intersects}\n---\nbody`
  );
  writeFileSync(
    join(ux, 'features', 'FEAT-002.md'),
    `---\nid: FEAT-002\nstatus: proposed\nstories: [US-002]\nscreens: [SCR-001, SCR-002]\nintersects: ${f2Intersects}\n---\nbody`
  );
}

test('features: clean set with mutual intersection passes', () => {
  const ux = makeUxDocs(mkdtempSync(join(tmpdir(), 'vtr-')));
  addFeatures(ux);
  const report = validateTraceability(ux);
  assert.equal(report.ok, true, report.problems.join('\n'));
  assert.deepEqual(report.features['FEAT-001'].intersects, ['FEAT-002']);
});

test('features: shared screen without declared intersection fails', () => {
  const ux = makeUxDocs(mkdtempSync(join(tmpdir(), 'vtr-')));
  addFeatures(ux, { undeclaredShare: true });
  const report = validateTraceability(ux);
  assert.equal(report.ok, false);
  assert.match(report.problems.join('\n'), /FEAT-001\/FEAT-002: share SCR-001/);
});

test('features: one-sided intersects fails as not mutual', () => {
  const ux = makeUxDocs(mkdtempSync(join(tmpdir(), 'vtr-')));
  addFeatures(ux, { oneSided: true });
  const report = validateTraceability(ux);
  assert.equal(report.ok, false);
  assert.match(report.problems.join('\n'), /not mutual/);
});

test('features: approved without stories fails decomposition gate', () => {
  const ux = makeUxDocs(mkdtempSync(join(tmpdir(), 'vtr-')));
  addFeatures(ux, { approvedNoStories: true });
  const report = validateTraceability(ux);
  assert.equal(report.ok, false);
  assert.match(report.problems.join('\n'), /FEAT-001: status "approved" but no stories/);
});

test('approved story with empty tests fails', () => {
  const ux = makeUxDocs(mkdtempSync(join(tmpdir(), 'vtr-')), { approvedWithoutTests: true });
  const report = validateTraceability(ux);
  assert.equal(report.ok, false);
  assert.match(report.problems.join('\n'), /US-001.*tests/);
});
