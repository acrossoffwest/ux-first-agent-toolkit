#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parseFrontmatter } from '../lib/frontmatter.mjs';

const REF_KINDS = [
  { key: 'useCases', dir: 'use-cases', ext: '.md', prefix: 'UC-' },
  { key: 'flows', dir: 'flows', ext: '.md', prefix: 'FLOW-' },
  { key: 'screens', dir: 'prototypes', ext: '.html', prefix: 'SCR-' },
  { key: 'tests', dir: 'tests', ext: '.md', prefix: 'TEST-' },
];
const GATED_STATUSES = new Set(['approved', 'implemented', 'verified']);

function listIds(dir, ext) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .map((f) => f.slice(0, -ext.length));
}

export function validateTraceability(uxDir) {
  const problems = [];
  const stories = {};
  const referenced = new Set();
  const storiesDir = join(uxDir, 'stories');
  const storyFiles = existsSync(storiesDir) ? readdirSync(storiesDir).filter((f) => f.endsWith('.md')) : [];

  for (const file of storyFiles) {
    const { fields } = parseFrontmatter(readFileSync(join(storiesDir, file), 'utf8'));
    const id = fields?.id;
    if (!id || !/^US-\d{3,}$/.test(id)) {
      problems.push(`${file}: missing or invalid story id`);
      continue;
    }
    if (stories[id]) problems.push(`${id}: duplicate story id`);
    const story = { status: fields.status ?? 'draft' };
    for (const { key, dir, ext, prefix } of REF_KINDS) {
      const refs = Array.isArray(fields[key]) ? fields[key] : [];
      story[key] = refs;
      for (const ref of refs) {
        if (!ref.startsWith(prefix)) {
          problems.push(`${id}: ${key} entry "${ref}" does not match ${prefix}###`);
          continue;
        }
        referenced.add(ref);
        if (!existsSync(join(uxDir, dir, ref + ext))) {
          problems.push(`${id}: dangling reference ${ref} (no ${dir}/${ref}${ext})`);
        }
      }
      if (GATED_STATUSES.has(story.status) && refs.length === 0 && key !== 'useCases') {
        problems.push(`${id}: status "${story.status}" but tests/flows/screens gate failed — empty ${key}`);
      }
    }
    stories[id] = story;
  }

  for (const { dir, ext } of REF_KINDS) {
    for (const id of listIds(join(uxDir, dir), ext)) {
      if (!referenced.has(id)) problems.push(`${id}: orphan — no user story references it`);
    }
  }

  return { ok: problems.length === 0, problems, stories };
}

if (process.argv[1] && basename(process.argv[1]) === 'validate-traceability.mjs') {
  const uxDir = process.argv[2] ?? 'docs/ux';
  const report = validateTraceability(uxDir);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}
