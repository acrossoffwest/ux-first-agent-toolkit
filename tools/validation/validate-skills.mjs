#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parseFrontmatter } from '../lib/frontmatter.mjs';

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_BODY_LINES = 500;

export function validateSkillsDir(skillsDir) {
  const problems = [];
  if (!existsSync(skillsDir)) return [`${skillsDir}: directory does not exist`];
  for (const entry of readdirSync(skillsDir)) {
    const dir = join(skillsDir, entry);
    if (!statSync(dir).isDirectory()) continue;
    const skillFile = join(dir, 'SKILL.md');
    if (!existsSync(skillFile)) {
      problems.push(`${entry}: missing SKILL.md`);
      continue;
    }
    const { fields, body } = parseFrontmatter(readFileSync(skillFile, 'utf8'));
    if (!fields) {
      problems.push(`${entry}/SKILL.md: missing or malformed YAML frontmatter (must start at line 1)`);
      continue;
    }
    const description = fields.description ?? '';
    if (!description) problems.push(`${entry}/SKILL.md: empty or missing description`);
    if (description.length > 1024) problems.push(`${entry}/SKILL.md: description over 1024 chars`);
    const name = fields.name;
    if (name !== undefined) {
      if (!NAME_RE.test(name) || name.length > 64) problems.push(`${entry}/SKILL.md: invalid name "${name}"`);
      else if (name !== entry) problems.push(`${entry}/SKILL.md: name "${name}" does not match directory`);
    }
    const lineCount = body.split('\n').length;
    if (lineCount > MAX_BODY_LINES) {
      problems.push(`${entry}/SKILL.md: body is ${lineCount} lines, limit ${MAX_BODY_LINES} — move detail to references/`);
    }
  }
  return problems;
}

export function validateMarkdownDir(dir, label) {
  const problems = [];
  if (!existsSync(dir)) return [];
  for (const entry of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const { fields } = parseFrontmatter(readFileSync(join(dir, entry), 'utf8'));
    if (!fields || !fields.description) problems.push(`${label}/${entry}: missing frontmatter description`);
  }
  return problems;
}

if (process.argv[1] && basename(process.argv[1]) === 'validate-skills.mjs') {
  const targets = process.argv.slice(2);
  if (targets.length === 0) targets.push('skills');
  let problems = [];
  for (const target of targets) {
    problems = problems.concat(
      target === 'skills' || target.endsWith('/skills')
        ? validateSkillsDir(target)
        : validateMarkdownDir(target, target)
    );
  }
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(`validate-skills: OK (${targets.join(', ')})`);
}
