#!/usr/bin/env node
/** Prints a complete `use_figma` script for a page: node scripts/figma-call.mjs Display Badge Chip … > file */
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(fileURLToPath(import.meta.url), '..', '..');
const [page, ...names] = process.argv.slice(2);
const specs = execFileSync('node', [join(root, 'scripts/figma-paste.mjs'), ...names], { encoding: 'utf8' });
console.log(`await figma.setCurrentPageAsync(figma.root.children.find(p => p.name === '${page}'));
const L = await (async () => { const o = JSON.parse(figma.root.getSharedPluginData('dvlib', 'order')); const src = '(async (figma) => {\\n' + o.map(k => figma.root.getSharedPluginData('dvlib', 'lib:' + k)).join('\\n') + '\\n})'; return eval(src)(figma); })();
const root = await L.pageRoot('${page}');
const specs = [
${specs}];
const out = [];
for (const s of specs) {
  const b = await L.build(s.ENC, {});
  const r = await L.finish({ staging: b.staging, root: root.id, category: '${page}', name: s.name, cols: s.cols, description: s.description, setDescription: s.setDescription, links: s.links, props: s.props, light: s.light });
  out.push({ n: s.name, set: r.set, v: r.variants, props: r.props });
}
return { out };`);
