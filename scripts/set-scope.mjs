#!/usr/bin/env node
/**
 * Moves the whole repo to another npm scope / org in one step.
 *   1. edit `davinci.config.json` ("scope": "@acme")
 *   2. node scripts/set-scope.mjs [--dry]
 *   3. pnpm install
 * Rewrites package names, workspace dependencies, imports, aliases and docs. Nothing is hard-coded elsewhere.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const config = JSON.parse(readFileSync(join(root, 'davinci.config.json'), 'utf8'));
const next = config.scope;
if (!/^@[a-z0-9][a-z0-9-_.]*$/.test(next)) { console.error(`Invalid scope "${next}" in davinci.config.json`); process.exit(1); }
const current = JSON.parse(readFileSync(join(root, 'packages/davinci-ai/package.json'), 'utf8')).name.split('/')[0];
if (current === next) { console.log(`Scope is already ${next}`); process.exit(0); }
const dry = process.argv.includes('--dry');
const SKIP = new Set(['node_modules', 'dist', 'storybook-static', '.git', 'pnpm-lock.yaml', 'test-results', 'playwright-report']);
const TEXT = /\.(json|md|mdx|ts|tsx|js|mjs|cjs|css|yml|yaml|html|example|txt)$|\.npmrc/;
let changed = 0;
(function walk(d) {
  for (const f of readdirSync(d)) {
    if (SKIP.has(f)) continue;
    const p = join(d, f);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!TEXT.test(f) && f !== '.npmrc.example') continue;
    if (f === 'davinci.config.json') continue;
    const s = readFileSync(p, 'utf8');
    const out = s.replaceAll(`${current}/`, `${next}/`);
    if (out !== s) { changed++; console.log(`${dry ? '[dry] ' : ''}${relative(root, p)}`); if (!dry) writeFileSync(p, out); }
  }
})(root);
console.log(`${dry ? 'Would update' : 'Updated'} ${changed} files: ${current} → ${next}. ${dry ? '' : 'Now run `pnpm install`.'}`);
