#!/usr/bin/env node
/**
 * Enforces docs/naming-convention.md on the React library.
 *   - every `dv-{block}` class block equals kebab-case(component name) from the manifest config (or is a listed shared utility)
 *   - parts are `dv-{block}__{part}` (kebab-case, no `--modifier` classes)
 *   - data-* attributes are on the allow-list; banned legacy ones fail
 *   - banned prop names in exported *Props interfaces
 * Usage: node scripts/check-naming.mjs [--json]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const pkg = join(root, 'packages/davinci-ai');
const { config } = await import(pathToFileURL(join(pkg, 'scripts/components.config.mjs')).href);

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
const COMPONENT_BLOCKS = new Set(Object.keys(config).map(kebab));
/** Shared, non-component building blocks that are allowed as their own block. */
const SHARED_BLOCKS = new Set(['glass', 'overlay', 'dot', 'popover', 'menu', 'listbox', 'field', 'input', 'dateinput', 'dateseg']);
/** Animation keyframes and one-off utilities (not components, never in Figma). */
const UTILITY_BLOCKS = new Set(['sr-only', 'spin', 'blink', 'pop', 'shimmer', 'indet', 'marquee', 'contents', 'num', 'truncate', 'beam', 'rise', 'fade', 'slide-r', 'slide-l', 'slide-b', 'field-surface', 'spacer']);
/** Attributes that are props are allowed automatically (data-{prop}); these are the rest. */
const ALLOWED_DATA = new Set([
  // theme (ThemeProvider)
  'theme', 'style', 'density', 'direction', 'card-border', 'cvd', 'canvas', 'animation', 'dv-theme', 'dv-theme-style',
  // React Aria states and interaction
  'disabled', 'selected', 'invalid', 'pressed', 'hovered', 'focus-visible', 'focus-within', 'focused', 'open', 'loading', 'readonly', 'indeterminate', 'placeholder', 'expanded', 'dragging', 'entering', 'exiting',
  'current', 'pending', 'unavailable', 'today', 'outside-month', 'selection-start', 'selection-end', 'drop-target', 'href', 'icon', 'type',
  // lifecycle and domain hooks
  'status', 'trend', 'role', 'pane', 'column', 'placement', 'side', 'position', 'axis', 'dock', 'docked', 'collapsed', 'active', 'rise', 'paused', 'more', 'match-width', 'flash', 'dot', 'heavy', 'has-action', 'empty', 'sorted', 'grow', 'ready', 'unread', 'streaming', 'zebra', 'sticky', 'sidebar', 'border', 'layout',
]);
const BANNED_DATA = { tone: 'intent', state: 'a React Aria state attribute or data-status', dir: 'data-trend (up/down) or data-orientation', kind: 'data-type' };
const BANNED_PROPS = { tone: 'intent', kind: 'type', dir: 'orientation or trend', direction: 'orientation' };

const walk = (d, out = []) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) { if (!['node_modules', 'dist', 'generated'].includes(f)) walk(p, out); } else out.push(p);
  }
  return out;
};
const src = join(pkg, 'src');
const tsx = walk(src).filter((f) => /\.tsx?$/.test(f) && !/\.(stories|test)\./.test(f) && !f.includes('/test/'));
const css = walk(join(src, 'styles')).filter((f) => f.endsWith('.css'));

const violations = [];
const add = (rule, file, msg) => violations.push({ rule, file: relative(root, file), msg });
const seenBlocks = new Map(); // block -> Set(files)

const scanClasses = (file, text) => {
  for (const m of text.matchAll(/(?<![-\w])dv-([a-z0-9]+(?:-[a-z0-9]+)*)(__([a-z0-9]+(?:-[a-z0-9]+)*))?(--[a-z0-9-]+)?/g)) {
    const [, block, , , mod] = m;
    if (mod) add('no-modifier-class', file, `.${m[0]} – use a data attribute instead of a --modifier class`);
    if (!seenBlocks.has(block)) seenBlocks.set(block, new Set());
    seenBlocks.get(block).add(relative(root, file));
  }
};
for (const f of [...tsx, ...css]) scanClasses(f, readFileSync(f, 'utf8'));
for (const [block, files] of seenBlocks) {
  if (COMPONENT_BLOCKS.has(block) || SHARED_BLOCKS.has(block) || UTILITY_BLOCKS.has(block)) continue;
  add('block-name', [...files][0], `block "dv-${block}" is not a component name (${[...files].length} file(s)). Rename to the kebab-case component name.`);
}

const PROP_ATTRS = new Set();
for (const f of tsx) for (const im of readFileSync(f, 'utf8').matchAll(/export\s+interface\s+\w+Props\b[^{]*\{([\s\S]*?)\n\}/g)) for (const pm of im[1].matchAll(/^\s{2}(\w+)\??\s*:/gm)) PROP_ATTRS.add(kebab(pm[1]));
for (const f of [...tsx, ...css]) {
  const text = readFileSync(f, 'utf8');
  for (const m of text.matchAll(/\bdata-([a-z][a-z0-9-]*)/g)) {
    const a = m[1];
    if (BANNED_DATA[a]) add('data-attr-banned', f, `data-${a} → use ${BANNED_DATA[a]}`);
    else if (!ALLOWED_DATA.has(a) && !PROP_ATTRS.has(a) && !/^react-aria|^rac/.test(a)) add('data-attr-unknown', f, `data-${a} is not on the allow-list`);
  }
}
for (const f of tsx) {
  const text = readFileSync(f, 'utf8');
  for (const im of text.matchAll(/export\s+interface\s+(\w+Props)\b[^{]*\{([\s\S]*?)\n\}/g)) {
    for (const pm of im[2].matchAll(/^\s{2}(\w+)\??\s*:/gm)) {
      if (BANNED_PROPS[pm[1]] && !(im[1] === 'ThemeProviderProps' && pm[1] === 'direction')) add('prop-banned', f, `${im[1]}.${pm[1]} → rename to ${BANNED_PROPS[pm[1]]}`);
    }
  }
}

const dedupe = [...new Map(violations.map((v) => [`${v.rule}|${v.file}|${v.msg}`, v])).values()];
if (process.argv.includes('--json')) { console.log(JSON.stringify(dedupe, null, 1)); process.exit(dedupe.length ? 1 : 0); }
const byRule = {};
for (const v of dedupe) (byRule[v.rule] ||= []).push(v);
for (const [rule, list] of Object.entries(byRule)) {
  console.log(`\n${rule} (${list.length})`);
  for (const v of list.slice(0, 200)) console.log(`  ${v.file}: ${v.msg}`);
}
console.log(`\n${dedupe.length} naming violation(s).`);
process.exit(dedupe.length ? 1 : 0);
