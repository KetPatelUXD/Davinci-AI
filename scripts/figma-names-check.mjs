#!/usr/bin/env node
/**
 * Compares layer names in an extracted/compacted spec with the manifest anatomy (the naming contract).
 * Usage: node scripts/figma-names-check.mjs Button [Other…]  (fails on unnamed layers: Group/Frame/Rectangle/Text)
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decode } from './figma-factor.mjs';
const root = join(fileURLToPath(import.meta.url), '..', '..');
const manifest = JSON.parse(readFileSync(join(root, 'packages/davinci-ai/dist/components.json'), 'utf8'));
const comps = manifest.components ?? manifest;
const get = (n) => (Array.isArray(comps) ? comps.find((c) => c.name === n) : comps[n]);
const names = (t, out = new Set()) => { if (t.n) out.add(t.n); (t.ch ?? []).forEach((c) => names(c, out)); return out; };
const anat = (node, out = new Set()) => { for (const c of node?.children ?? []) { if (c.name && !c.virtual) out.add(c.name); anat(c, out); } return out; };
let bad = 0;
const cssParts = (m) => new Set((m?.css?.parts ?? []).map((p) => p.split('__')[1].split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('')));
for (const name of process.argv.slice(2)) {
  const spec = JSON.parse(readFileSync(join(root, `dist/figma/build/${name}.f.json`), 'utf8'));
  const got = new Set(); for (const v of decode(spec.enc)) names(v.tree, got);
  const m = get(name); const a = anat(m?.figma?.anatomy?.perSize ? Object.values(m.figma.anatomy.perSize)[0] : m?.figma?.anatomy); a.add(name);
  const extra = [...got].filter((n) => !a.has(n));
  const unnamed = [...got].filter((n) => /^(Group|Frame|Rectangle|Text)$/.test(n) && !a.has(n) && !cssParts(m).has(n));
  if (unnamed.length) { bad++; console.log(`${name}: UNNAMED layers [${unnamed.join(', ')}] – add a dv-{block}__{part} class in the component`); }
  else console.log(`${name}: ok · layers: ${[...got].join(', ')}${extra.length ? ' · beyond anatomy: ' + extra.join(', ') : ''}`);
}
process.exit(bad ? 1 : 0);
