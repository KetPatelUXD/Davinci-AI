#!/usr/bin/env node
/**
 * Token lint (part of `pnpm lint`):
 *  1. Text, icon, control-border and focus tokens must be opaque (no translucent colours – use solid tokens).
 *  2. Component CSS / TSX must not hard-code colours (use tokens). `#000`/`#fff` inside mask definitions are allowed.
 *  3. Every token carries the Figma extension (collection, scopes, codeSyntax).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const errors = [];
const resolvedPath = join(root, 'packages/davinci-ai/src/generated/tokens.resolved.json');
const tokensPath = join(root, 'packages/tokens/tokens.json');

// ---- 1. opacity rules
const OPAQUE = ['text', 'text-secondary', 'text-muted', 'text-disabled', 'on-fill', 'on-text', 'on-avatar', 'border-strong', 'border-disabled', 'focus', 'brand', 'brand-fill',
  'positive', 'positive-fill', 'negative', 'negative-fill', 'warning', 'warning-fill', 'info', 'info-fill', 'fill-disabled', 'on', 'data-1', 'data-2', 'data-3', 'data-4', 'data-5', 'data-6', 'chart-line'];
if (existsSync(resolvedPath)) {
  const r = JSON.parse(readFileSync(resolvedPath, 'utf8'));
  const alphaOf = (v) => {
    const m = /rgba\(([^)]+)\)/.exec(v);
    if (m) return Number(m[1].split(',')[3] ?? 1);
    const h = /^#([0-9a-f]{8})$/i.exec(v);
    return h ? parseInt(h[1].slice(6), 16) / 255 : 1;
  };
  for (const mode of ['dark', 'light']) for (const n of OPAQUE) {
    const v = r[mode][n];
    if (v === undefined) errors.push(`token "${n}" missing in ${mode}`);
    else if (alphaOf(v) < 1) errors.push(`token "${n}" (${mode}) is translucent (${v}) – text, icons, control borders and focus must be solid`);
  }
} else errors.push('run `pnpm tokens` first (tokens.resolved.json missing)');

// ---- 3. figma extensions
if (existsSync(tokensPath)) {
  const t = JSON.parse(readFileSync(tokensPath, 'utf8'));
  (function walk(o, p) {
    for (const [k, v] of Object.entries(o)) {
      if (k.startsWith('$')) continue;
      if (v && typeof v === 'object' && '$value' in v) {
        const f = v.$extensions?.['com.figma'];
        if (!f?.collection || !f.scopes || !f.codeSyntax?.WEB) errors.push(`token ${[...p, k].join('.')} lacks com.figma {collection, scopes, codeSyntax.WEB}`);
      } else if (v && typeof v === 'object') walk(v, [...p, k]);
    }
  })(t, []);
}

// ---- 2. no hard-coded colours in component styles / tsx
const SRC = join(root, 'packages/davinci-ai/src');
const files = [];
(function scan(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) { if (f !== 'generated' && f !== 'test') scan(p); }
    else if (/\.(css|tsx)$/.test(f) && !/\.(stories|test)\./.test(f) && f !== 'base.css') files.push(p);
  }
})(SRC);
const RAW = /#[0-9a-fA-F]{3,8}\b|rgba?\(/;
for (const f of files) {
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    const l = line.replace(/linear-gradient\(#000 0 0\)/g, '');
    if (RAW.test(l) && !/DaVinciLogo|stopColor|\/\/ ?lint-ok/.test(line) && !f.endsWith('DaVinciLogo.tsx') && !f.endsWith('builtin.tsx')) errors.push(`${relative(root, f)}:${i + 1} hard-coded colour – use a token: ${line.trim().slice(0, 100)}`);
  });
}

if (errors.length) { console.error('Token lint failed:\n' + errors.map((e) => '  ✗ ' + e).join('\n')); process.exit(1); }
console.log('Token lint passed.');
