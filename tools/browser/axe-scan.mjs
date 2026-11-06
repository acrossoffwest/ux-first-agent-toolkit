#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const { values } = parseArgs({
  options: {
    url: { type: 'string' },
    out: { type: 'string' },
    'fail-on': { type: 'string', default: 'serious' },
  },
});

if (!values.url) {
  console.error('usage: axe-scan.mjs --url <url> [--out report.json] [--fail-on serious|critical|any]');
  process.exit(2);
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(values.url, { waitUntil: 'load' });

const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
  .analyze();
await browser.close();

if (values.out) writeFileSync(values.out, JSON.stringify(results, null, 2));

const gate = { critical: ['critical'], serious: ['critical', 'serious'], any: ['critical', 'serious', 'moderate', 'minor'] }[
  values['fail-on']
] ?? ['critical', 'serious'];
const blocking = results.violations.filter((v) => gate.includes(v.impact));

for (const v of results.violations) {
  const marker = gate.includes(v.impact) ? 'BLOCK' : 'note ';
  console.log(`${marker} [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`);
}
console.log(`axe: ${results.violations.length} violation type(s), ${blocking.length} blocking`);
process.exit(blocking.length ? 1 : 0);
