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

test('approved story with empty tests fails', () => {
  const ux = makeUxDocs(mkdtempSync(join(tmpdir(), 'vtr-')), { approvedWithoutTests: true });
  const report = validateTraceability(ux);
  assert.equal(report.ok, false);
  assert.match(report.problems.join('\n'), /US-001.*tests/);
});
