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

  const features = validateFeatures(uxDir, stories, problems);

  return { ok: problems.length === 0, problems, stories, features };
}

function validateFeatures(uxDir, stories, problems) {
  const featuresDir = join(uxDir, 'features');
  if (!existsSync(featuresDir)) return {};
  const features = {};

  for (const file of readdirSync(featuresDir).filter((f) => /^FEAT-.*\.md$/.test(f))) {
    const { fields } = parseFrontmatter(readFileSync(join(featuresDir, file), 'utf8'));
    const id = fields?.id;
    if (!id || !/^FEAT-\d{3,}$/.test(id)) {
      problems.push(`${file}: missing or invalid feature id`);
      continue;
    }
    if (features[id]) problems.push(`${id}: duplicate feature id`);
    features[id] = {
      status: fields.status ?? 'proposed',
      stories: Array.isArray(fields.stories) ? fields.stories : [],
      screens: Array.isArray(fields.screens) ? fields.screens : [],
      intersects: Array.isArray(fields.intersects) ? fields.intersects : [],
    };
  }

  for (const [id, f] of Object.entries(features)) {
    for (const ref of f.stories) {
      if (!stories[ref]) problems.push(`${id}: dangling story reference ${ref}`);
    }
    for (const ref of f.screens) {
      if (!existsSync(join(uxDir, 'prototypes', ref + '.html'))) {
        problems.push(`${id}: dangling screen reference ${ref}`);
      }
    }
    for (const ref of f.intersects) {
      if (!features[ref]) problems.push(`${id}: dangling intersection reference ${ref}`);
      else if (!features[ref].intersects.includes(id)) {
        problems.push(`${id}: intersection with ${ref} not mutual — add ${id} to ${ref}.intersects`);
      }
    }
    if (f.status === 'approved' && f.stories.length === 0) {
      problems.push(`${id}: status "approved" but no stories — decomposition gate failed`);
    }
  }

  const entries = Object.entries(features);
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [aId, a] = entries[i];
      const [bId, b] = entries[j];
      const shared = a.screens.filter((s) => b.screens.includes(s));
      if (shared.length && !(a.intersects.includes(bId) && b.intersects.includes(aId))) {
        problems.push(`${aId}/${bId}: share ${shared.join(', ')} but intersection is not declared on both`);
      }
    }
  }

  return features;
}

if (process.argv[1] && basename(process.argv[1]) === 'validate-traceability.mjs') {
  const uxDir = process.argv[2] ?? 'docs/ux';
  const report = validateTraceability(uxDir);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}
