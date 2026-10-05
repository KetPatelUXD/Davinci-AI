#!/usr/bin/env node
/**
 * Compares the manifest anatomy (parts named in components.config.mjs) with the `dv-{block}__{part}` classes the code uses.
 *   undocumented: a part exists in code but not in the anatomy  → designers cannot see it in Figma
 *   phantom:      a part is in the anatomy but not in code      → Figma shows something that does not exist
 * Usage: node scripts/check-anatomy.mjs [--strict]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const pkg = join(root, 'packages/davinci-ai');
const { config } = await import(pathToFileURL(join(pkg, 'scripts/components.config.mjs')).href);
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();

const walk = (d, out = []) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p, out); else out.push(p); } return out; };
const sources = walk(join(pkg, 'src/components')).concat(walk(join(pkg, 'src/foundations')), walk(join(pkg, 'src/utils'))).filter((f) => /\.tsx$/.test(f) && !/\.(stories|test)\./.test(f));
const codeParts = {}; // block -> Set(part)
for (const f of sources) {
  for (const m of readFileSync(f, 'utf8').matchAll(/(?<![-\w])dv-([a-z0-9]+(?:-[a-z0-9]+)*)__([a-z0-9]+(?:-[a-z0-9]+)*)/g)) (codeParts[m[1]] ||= new Set()).add(m[2]);
}
/** Leaf layers (bare text, icons, nested component instances) do not need their own DOM class; composite parts do. */
const isLeaf = (c) => c.text || c.component === 'Icon' || (c.component && !c.children) || (!c.children && !c.layout);
const anatomyParts = (node, out = new Set(), leaves = new Set(), virt = new Set()) => {
  if (!node || typeof node !== 'object') return out;
  for (const c of node.children ?? []) { if (c.name) { if (c.virtual) virt.add(kebab(c.name)); (isLeaf(c) ? leaves : out).add(kebab(c.name)); } anatomyParts(c, out, leaves, virt); }
  out.leaves = leaves; out.virtual = virt;
  return out;
};

let undocumented = 0, phantom = 0;
const report = [];
for (const [name, c] of Object.entries(config)) {
  if (c.nonVisual) continue;
  const block = kebab(name);
  const code = new Set([...(codeParts[block] ?? [])]);
  const available = new Set(code); // own parts plus parts of shared blocks (shared parts need not be documented again)
  for (const b of c.shares ?? []) { for (const p of codeParts[b] ?? []) available.add(p); available.add(b); }
  const anat = anatomyParts(c.anatomy);
  const undoc = [...code].filter((p) => !anat.has(p) && !anat.leaves.has(p) && !(c.domParts ?? []).includes(p));
  const ph = [...anat].filter((p) => !available.has(p) && !anat.virtual.has(p));
  undocumented += undoc.length; phantom += ph.length;
  if (undoc.length || ph.length) report.push(`${name}: ${undoc.length ? 'undocumented [' + undoc.join(', ') + ']' : ''} ${ph.length ? 'phantom [' + ph.join(', ') + ']' : ''}`);
}
console.log(report.join('\n'));
console.log(`\n${report.length} component(s) differ · ${undocumented} undocumented part(s) · ${phantom} phantom part(s).`);
process.exit(process.argv.includes('--strict') && (undocumented || phantom) ? 1 : 0);
