#!/usr/bin/env node
/**
 * Compacts dist/figma/spec/{Component}.{theme}.json (from figma-extract) into the small build spec the Figma builder consumes:
 * dist/figma/build/{Component}.json = { component, axes, links, variants:[{name, props, state, tree}], … } with default values dropped.
 * `links` come from the manifest anatomy (TEXT / INSTANCE_SWAP / BOOLEAN property links per part).
 * Usage: node scripts/figma-compact.mjs Button [Other…]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { encode, decode } from './figma-factor.mjs';
import { deepStrictEqual } from 'node:assert';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const names = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const manifest = JSON.parse(readFileSync(join(root, 'packages/davinci-ai/dist/components.json'), 'utf8'));
const comps = manifest.components ?? manifest;
const get = (n) => (Array.isArray(comps) ? comps.find((c) => c.name === n) : comps[n]);
const r2 = (n) => Math.round(n * 100) / 100;
const col = (c) => (c ? [r2(c.r), r2(c.g), r2(c.b), r2(c.a)].map((x, i) => (i < 3 ? Math.round(x * 255) / 255 : x)) : null);

const side = (p) => (p.token ? p.token : p.px);
let RENAME = {};
const clean0 = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== 0 && v !== false));
const compactNode = (n) => {
  const o = { n: RENAME[n.name] ?? n.name };
  if (n.kind === 'inst') { return { n: RENAME[n.name ?? n.cmp] ?? n.name ?? n.cmp, k: 'x', cmp: n.cmp, ip: n.props, tc: n.text || undefined, ic: n.icon || undefined, tt: !n.text && n.texts && n.texts.length ? n.texts : undefined, ...(n.grow ? { gr: 1 } : {}) }; }
  if (n.kind === 'text' && n.own) { const w = n.own; return { n: RENAME[n.name] ?? n.name, k: 't', tc: n.text, gr: 1, ...(n.tw ? { tw: n.tw } : {}), tx: clean0({ c: w.colorToken, cc: w.colorToken ? undefined : col(w.color), s: w.size, st: w.sizeToken, w: w.weight, lh: w.lh, ls: w.ls }) }; }
  if (n.kind === 'text') { o.k = 't'; o.tc = n.text; if (n.tw) o.tw = n.tw; if (n.al && !/^(start|left)$/.test(n.al)) o.al = n.al; if (n.ul) o.ul = 1; return o; }
  if (n.kind === 'vector') { o.k = 'v'; o.w = n.w; o.h = n.h; o.svg = n.svg; o.vt = n.vt; if (n.abs) o.abs = n.abs; return o; }
  if (n.kind === 'icon') { o.k = 'i'; o.w = Math.round(n.w); if (n.icon) o.ic = n.icon; if (n.fill.token) o.ct = n.fill.token; else o.c = col(n.fill.computed); return o; }
  o.k = 'f';
  if (n.abs) o.abs = n.abs;
  if (n.grow) o.gr = 1;
  if (n.children.length === 0 && !n.abs) o.sz = [Math.round(n.w), Math.round(n.h)];
  const L = n.layout;
  const hasKids = n.children.length > 0;
  o.d = /flex|grid|table/.test(L.display) ? (L.direction.startsWith('column') ? 'V' : 'H') : hasKids && n.children.some((c) => c.kind !== 'text') ? 'V' : 'H';
  if (L.align && L.align !== 'normal' && L.align !== 'stretch') o.a = L.align === 'flex-start' ? 'start' : L.align === 'flex-end' ? 'end' : L.align;
  if (L.justify && L.justify !== 'normal' && L.justify !== 'flex-start') o.j = L.justify === 'flex-end' ? 'end' : L.justify === 'space-between' ? 'between' : L.justify;
  if (L.gap) { o.g = L.gap; if (L.gapToken) o.gt = L.gapToken; }
  if (!o.g) { const ms = n.children.filter((c, i) => i > 0 && !c.abs && c.layout).map((c) => (o.d === 'V' ? c.mt : c.ml)); if (ms.length && ms.every((v) => v > 0 && v === ms[0])) o.g = ms[0]; }
  const pad = ['top', 'right', 'bottom', 'left'].map((s) => side(n.padding[s]));
  if (pad.some((v) => v !== 0)) o.p = pad;
  const rs = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map((c) => n.radius[c]);
  if (rs.some((r) => r.px > 0)) o.r = rs.every((r) => r.pill) ? 'pill' : rs.map((r) => (r.token ?? r.px));
  const tok = n.fill.tokens ?? [];
  const sheen = tok.find((t) => t.startsWith('style:sheen/'));
  if (sheen) o.f = { s: sheen.slice(6) };
  else if (tok.length && !tok.some((t) => t.startsWith('style:'))) o.f = { t: tok[0] };
  else if (n.fill.computed && n.fill.computed.a > 0) o.f = { c: col(n.fill.computed) };
  const sh = n.shadow;
  if (sh.style) o.s = { style: sh.style.slice(6) };
  else if (sh.layers?.length) o.s = { layers: sh.layers.map((l) => ({ t: l.text, k: l.tokens })) };
  if (n.outline) o.o = { w: n.outline.width, off: n.outline.offset, t: n.outline.token };
  if (n.filter) o.fl = n.filter;
  if (n.border) o.bd = { w: n.border.w, ...(n.border.token ? { t: n.border.token } : { c: col(n.border.computed) }) };
  if (n.clip) o.cl = 1;
  if (n.fix) o.fx = n.fix;
  if (n.bb) o.bb = n.bb;
  if (n.fillW) o.fw = 1;
  if (n.gridWrap) o.wr = 1;
  if (n.gridW) { delete o.fw; delete o.gr; o.fx = [n.gridW, o.fx ? o.fx[1] : null]; }
  if (n.height.token) o.ht = n.height.token;
  if (n.width.token) o.wt = n.width.token;
  if (n.opacity !== 1) o.op = n.opacity;
  const t = n.text;
  const tx = clean0({ c: t.colorToken, cc: t.colorToken ? undefined : col(t.color), s: t.size, st: t.sizeToken, w: t.weight, lh: t.lh, ls: t.ls, up: t.transform === 'uppercase' || undefined });
  o.ch = n.children.filter((k) => !(k.layout && k.w === 0 && !(k.children?.length))).map(compactNode).map((c) => (c.k === 't' && !c.tx ? { ...c, tx: { ...tx, ...(c.al ? { al: c.al } : {}), ...(c.ul ? { ul: 1 } : {}) } } : c));
  if (o.ch.length === 1 && o.ch[0].k === 'i' && o.n && !o.abs && !o.f && !o.p && !o.r && !o.s && !o.o && !o.bd && !o.ht && !o.wt) return { ...o.ch[0], n: o.n };
  // a transparent, unpadded wrapper holding one text child collapses into the text layer
  if (o.ch.length === 1 && o.ch[0].k === 't' && !o.abs && !o.f && !o.p && !o.r && !o.s && !o.o && !o.ht && !o.wt) { const tcn = o.ch[0]; return { n: o.n ?? tcn.n, k: 't', tc: tcn.tc, tx: { ...tx, ...(tcn.al ? { al: tcn.al } : {}), ...(tcn.ul ? { ul: 1 } : {}) }, ...(tcn.tw ? { tw: tcn.tw } : {}) }; }
  return o;
};

/** Links from the manifest anatomy: part name -> { text: property, swap: property, vis: property } */
const flatten = (node, out = {}) => { for (const c of node?.children ?? []) { if (c.name) out[c.name] = { text: c.property, swap: c.swap, vis: c.visibleWhen }; flatten(c, out); } return out; };

/** Interns repeated sub-structures: replaces them with {"$":index} and returns the dictionary (expanded again by the Figma builder). */
const intern = (value) => {
  const counts = new Map();
  const count = (v) => { if (v && typeof v === 'object') { const k = JSON.stringify(v); if (k.length >= 30) counts.set(k, (counts.get(k) ?? 0) + 1); (Array.isArray(v) ? v : Object.values(v)).forEach(count); } };
  count(value);
  const dict = []; const ids = new Map();
  const walk = (v) => {
    if (!v || typeof v !== 'object') return v;
    const k = JSON.stringify(v);
    if (k.length >= 30 && counts.get(k) >= 2) { if (!ids.has(k)) { const body = Array.isArray(v) ? v.map(walk) : Object.fromEntries(Object.entries(v).map(([a, b]) => [a, walk(b)])); ids.set(k, dict.length); dict.push(body); } return { $: ids.get(k) }; }
    return Array.isArray(v) ? v.map(walk) : Object.fromEntries(Object.entries(v).map(([a, b]) => [a, walk(b)]));
  };
  return { data: walk(value), dict };
};

mkdirSync(join(root, 'dist/figma/build'), { recursive: true });
for (const name of names) {
  const spec = JSON.parse(readFileSync(join(root, `dist/figma/spec/${name}.dark.json`), 'utf8'));
  const m = get(name);
  RENAME = (await import(pathToFileURL(join(root, 'scripts/figma-extract.config.mjs')).href)).targets[name]?.rename ?? {};
  const anat = m?.figma?.anatomy;
  const cfgLinks = (await import(pathToFileURL(join(root, 'scripts/figma-extract.config.mjs')).href)).targets[name]?.links;
  const links = cfgLinks ?? flatten(anat?.perSize ? Object.values(anat.perSize)[0] : anat);
  const seen = new Map(); const variants = [];
  for (const v of spec.variants) {
    const tree = compactNode(v.tree); const key = JSON.stringify(tree);
    let id = seen.get(key); if (id === undefined) { id = seen.size; seen.set(key, id); }
    variants.push({ p: v.props, st: v.state, t: id });
  }
  const trees = [...seen.keys()].map((k) => JSON.parse(k));
  const axes = [...Object.keys(spec.variants[0].props), 'state'];
  const enc = encode(spec.variants.map((v) => ({ p: v.props, st: v.state, tree: compactNode(v.tree) })), axes);
  const back = decode(enc); const orig = spec.variants.map((v) => compactNode(v.tree));
  back.forEach((b, i) => deepStrictEqual(JSON.parse(JSON.stringify(b.tree)), JSON.parse(JSON.stringify(orig[i])), `round-trip mismatch ${name} #${i}`));
  writeFileSync(join(root, `dist/figma/build/${name}.f.json`), JSON.stringify({ component: name, links, props: m?.figma?.properties, description: [m?.description, m?.whenToUse && `Use: ${m.whenToUse}`, m?.whenNotToUse && `Don't: ${m.whenNotToUse}`].filter(Boolean).join('\n'), enc }));
  console.log(`${name}: factored ${(JSON.stringify(enc).length / 1024).toFixed(1)} KB, ${enc.tables.length} tables, round-trip OK`);
  const out = { component: name, links, props: m?.figma?.properties, description: [m?.description, m?.whenToUse && `Use: ${m.whenToUse}`, m?.whenNotToUse && `Don't: ${m.whenNotToUse}`].filter(Boolean).join('\n'), trees, variants };
  const { data, dict } = intern({ trees: out.trees, variants: out.variants });
  const json = JSON.stringify({ ...out, trees: data.trees, variants: data.variants, dict });
  writeFileSync(join(root, `dist/figma/build/${name}.json`), json);
  console.log(`${name}: ${spec.variants.length} variants → ${trees.length} unique trees, ${(json.length / 1024).toFixed(0)} KB`);
}

/** Splits a built spec into parts small enough to paste into one use_figma call (each part carries only the dictionary entries it uses). */
export function parts(build, maxKB = 34) {
  const refs = (v, acc) => { if (v && typeof v === 'object') { if (v.$ !== undefined) acc.add(v.$); else (Array.isArray(v) ? v : Object.values(v)).forEach((x) => refs(x, acc)); } return acc; };
  const closure = (seed) => { const used = new Set(seed); let grew = true; while (grew) { grew = false; for (const i of [...used]) for (const j of refs(build.dict[i], new Set())) if (!used.has(j)) { used.add(j); grew = true; } } return used; };
  const out = []; let cur = [];
  const make = (vs) => {
    const treeIds = [...new Set(vs.map((v) => v.t))];
    const seed = new Set(); const dd = (x) => refs(x, seed);
    treeIds.forEach((t) => dd(build.trees[t])); vs.forEach((v) => dd(v.p));
    const used = [...closure(seed)].sort((a, b) => a - b); const remap = new Map(used.map((o, n) => [o, n]));
    const re = (v) => (v && typeof v === 'object' ? (v.$ !== undefined ? { $: remap.get(v.$) } : Array.isArray(v) ? v.map(re) : Object.fromEntries(Object.entries(v).map(([a, b]) => [a, re(b)]))) : v);
    const tmap = new Map(treeIds.map((o, n) => [o, n]));
    return { trees: treeIds.map((t) => re(build.trees[t])), variants: vs.map((v) => ({ p: re(v.p), st: v.st, t: tmap.get(v.t) })), dict: used.map((i) => re(build.dict[i])) };
  };
  for (const v of build.variants) { cur.push(v); if (JSON.stringify(make(cur)).length > maxKB * 1024) { cur.pop(); out.push(make(cur)); cur = [v]; } }
  if (cur.length) out.push(make(cur));
  return out;
}
if (process.argv.includes('--parts')) {
  for (const name of names) {
    const b = JSON.parse(readFileSync(join(root, `dist/figma/build/${name}.json`), 'utf8'));
    parts(b).forEach((p, i) => { writeFileSync(join(root, `dist/figma/build/${name}.part${i}.json`), JSON.stringify(p)); console.log(`${name}.part${i}: ${p.variants.length} variants, ${(JSON.stringify(p).length / 1024).toFixed(1)} KB`); });
  }
}
