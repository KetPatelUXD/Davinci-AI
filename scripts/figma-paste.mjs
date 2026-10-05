#!/usr/bin/env node
/**
 * Prints ready-to-paste spec objects for the use_figma builder call:
 *   node scripts/figma-paste.mjs Checkbox Switch …   (after figma-extract + figma-compact)
 * Each object: { name, cols, ENC, links, props, light, description, setDescription }
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(fileURLToPath(import.meta.url), '..', '..');
const manifest = JSON.parse(readFileSync(join(root, 'packages/davinci-ai/dist/components.json'), 'utf8'));
const comps = manifest.components ?? manifest;
const get = (n) => (Array.isArray(comps) ? comps.find((c) => c.name === n) : comps[n]);
const out = [];
for (const name of process.argv.slice(2)) {
  const d = JSON.parse(readFileSync(join(root, `dist/figma/build/${name}.f.json`), 'utf8'));
  const m = get(name); const enc = d.enc;
  const defaults = Object.fromEntries(enc.axes.map((a, i) => [a, a === 'state' ? 'default' : (m?.figma?.properties?.[a]?.default && enc.values[i].includes(m.figma.properties[a].default) ? m.figma.properties[a].default : enc.values[i].includes('md') ? 'md' : enc.values[i][0])]));
  const nm = (o) => enc.axes.map((a) => `${a}=${o[a]}`).join(', ');
  const light = [nm(defaults)];
  const si = enc.axes.indexOf('state'); const alt = ['selected', 'invalid', 'disabled'].find((s) => enc.values[si].includes(s));
  if (alt) light.push(nm({ ...defaults, state: alt }));
  const props = Object.fromEntries(Object.entries(m?.figma?.properties ?? {}).filter(([, v]) => v.type === 'BOOLEAN').map(([k, v]) => [k, { default: !!v.default }]));
  const cols = Math.min(6, enc.values[enc.values.length - 1].length);
  out.push(`{ name: '${name}', cols: ${cols}, ENC: ${JSON.stringify(enc)}, links: ${JSON.stringify(d.links)}, props: ${JSON.stringify(props)}, light: ${JSON.stringify(light)}, description: ${JSON.stringify(d.description)}, setDescription: ${JSON.stringify(`React: <${name}> – ${enc.axes.join(' × ')}.`)} },`);
}
console.log(out.join('\n'));
