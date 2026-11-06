import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateSkillsDir } from '../../tools/validation/validate-skills.mjs';

function makeSkill(root, name, { frontmatter = true, description = 'Does X. Use when Y.', lines = 50 } = {}) {
  const dir = join(root, 'skills', name);
  mkdirSync(dir, { recursive: true });
  const fm = frontmatter ? `---\nname: ${name}\ndescription: ${description}\n---\n` : '';
  writeFileSync(join(dir, 'SKILL.md'), fm + Array.from({ length: lines }, (_, i) => `line ${i}`).join('\n'));
  return dir;
}

test('accepts a well-formed skill', () => {
  const root = mkdtempSync(join(tmpdir(), 'vsk-'));
  makeSkill(root, 'good-skill');
  const problems = validateSkillsDir(join(root, 'skills'));
  assert.deepEqual(problems, []);
});

test('rejects missing description and missing frontmatter', () => {
  const root = mkdtempSync(join(tmpdir(), 'vsk-'));
  makeSkill(root, 'no-desc', { description: '' });
  makeSkill(root, 'no-fm', { frontmatter: false });
  const problems = validateSkillsDir(join(root, 'skills'));
  assert.equal(problems.length, 2);
  assert.match(problems.find((p) => p.includes('no-desc')), /description/);
  assert.match(problems.find((p) => p.includes('no-fm')), /frontmatter/);
});

test('rejects body over 500 lines and name mismatching directory', () => {
  const root = mkdtempSync(join(tmpdir(), 'vsk-'));
  makeSkill(root, 'too-long', { lines: 550 });
  const dir = join(root, 'skills', 'real-name');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'SKILL.md'), '---\nname: other-name\ndescription: x\n---\nbody');
  const problems = validateSkillsDir(join(root, 'skills'));
  assert.match(problems.find((p) => p.includes('too-long')), /500/);
  assert.match(problems.find((p) => p.includes('real-name')), /name/);
});
