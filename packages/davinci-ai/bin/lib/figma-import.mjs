/**
 * Turns a Figma variables export into a DaVinci.AI theme file.
 * Understands three shapes: this library's own `figma/variables.json`, Figma's REST "local variables" response
 * (`{ meta: { variables, variableCollections } }`) and a DTCG token tree (Tokens Studio / Figma token exports).
 * Variables are matched to library tokens by their code syntax (`var(--dv-bg)`) first, then by name (`bg/default`).
 * Imported: semantic colours (Dark/Light), corner radii (`radius/*`) and component sizes and paddings (Comfortable/Compact).
 * Only values that differ from the library defaults are kept, so the theme file stays small.
 */
import { parse, toHex } from './color.mjs';
import { colourRoles, radiusRoles, sizeRoles, toLength } from './theme-core.mjs';

const num = (n) => Math.round(Math.min(1, Math.max(0, n)) * 255);
const fromRgba = ({ r, g, b, a = 1 }) => (a < 1 ? `rgba(${num(r)}, ${num(g)}, ${num(b)}, ${+a.toFixed(3)})` : toHex({ r, g, b }));
const MODES = ['dark', 'light', 'comfortable', 'compact'];
const modeOf = (name) => { const n = String(name).toLowerCase().replace(/\.tokens?(\.json)?$|\.json$/, ''); return MODES.includes(n) ? n : null; };

/** Canonical comparable form of a colour string; null if it is not a colour. */
function canon(c) {
  try { const p = parse(c); return p.a < 1 ? `${toHex(p)}/${p.a.toFixed(2)}` : toHex(p); } catch { return null; }
}

/** Colour or length in any supported notation → `{ colour }` / `{ length }` (px string), or null. */
function toValue(v) {
  if (typeof v === 'number') return { length: `${v}px` };
  if (typeof v === 'string') { if (canon(v)) return { colour: v }; const l = toLength(v); return l ? { length: l } : null; }
  if (v && typeof v === 'object') {
    if (Array.isArray(v.components)) { const [r, g, b] = v.components; return { colour: fromRgba({ r, g, b, a: v.alpha ?? 1 }) }; } // DTCG 2025 colour object
    if ('r' in v && 'g' in v && 'b' in v) return { colour: fromRgba(v) }; // Figma REST colour
    if (typeof v.hex === 'string') return { colour: v.hex };
    if (typeof v.value === 'number' && (v.unit === 'px' || v.unit === undefined)) return { length: `${v.value}px` }; // DTCG dimension object
  }
  return null;
}

/** name → library token lookup built from the library's own Figma variables (single source of truth). */
function lookup(library, resolved) {
  const colour = new Set(colourRoles(resolved)), radius = new Set(radiusRoles(resolved).map((r) => `radius-${r}`)), size = new Set(sizeRoles(resolved));
  const kind = (token) => (colour.has(token) ? 'colour' : radius.has(token) ? 'radius' : size.has(token) ? 'size' : null);
  const byName = new Map();
  for (const c of Object.values(library.collections)) {
    if (c.modes.length === 1) continue; // primitives
    for (const v of c.variables) {
      const m = /var\(--dv-([\w-]+)\)/.exec(v.codeSyntax?.WEB ?? '');
      if (m && kind(m[1])) byName.set(v.name.toLowerCase(), m[1]);
    }
  }
  return (name, codeSyntax) => {
    const m = /var\(--dv-([\w-]+)\)/.exec(codeSyntax ?? '');
    if (m && kind(m[1])) return { token: m[1], kind: kind(m[1]) };
    const n = String(name).replace(/[.\s]+/g, '/').replace(/^(semantic|component)\//i, '').toLowerCase();
    const token = byName.get(n) ?? (kind(n) ? n : null);
    return token ? { token, kind: kind(token) } : null;
  };
}

/** Collects `{ name, codeSyntax, values: { dark, light, comfortable, compact } }` entries from any supported export shape. */
function collect(json, notes) {
  const out = [];
  if (json?.collections && typeof json.collections === 'object') {
    const prim = new Map();
    for (const [cn, c] of Object.entries(json.collections)) if (c.modes.length === 1) for (const v of c.variables) prim.set(`${cn}/${v.name}`, v.values[c.modes[0]]);
    for (const c of Object.values(json.collections)) {
      const modes = c.modes.filter((m) => modeOf(m));
      if (!modes.length) continue;
      for (const v of c.variables) {
        const values = {};
        for (const m of modes) { const x = v.values[m]; values[modeOf(m)] = toValue(x?.alias ? prim.get(x.alias) : x); }
        out.push({ name: v.name, codeSyntax: v.codeSyntax?.WEB, values });
      }
    }
    return out;
  }
  if (json?.meta?.variables) {
    const vars = json.meta.variables, cols = json.meta.variableCollections ?? {};
    const resolve = (v, modeId, depth = 0) => {
      const x = v.valuesByMode?.[modeId] ?? Object.values(v.valuesByMode ?? {})[0];
      if (x && x.type === 'VARIABLE_ALIAS' && depth < 8) { const t = vars[x.id]; return t ? resolve(t, Object.keys(t.valuesByMode ?? {})[0], depth + 1) : null; }
      return toValue(x);
    };
    for (const v of Object.values(vars)) {
      if (v.resolvedType !== 'COLOR' && v.resolvedType !== 'FLOAT') continue;
      const modes = cols[v.variableCollectionId]?.modes ?? [];
      const values = {};
      for (const m of modes) if (modeOf(m.name)) values[modeOf(m.name)] = resolve(v, m.modeId);
      if (!Object.keys(values).length && modes[0]) { const x = resolve(v, modes[0].modeId); values.dark = values.light = values.comfortable = values.compact = x; }
      out.push({ name: v.name, codeSyntax: v.codeSyntax?.WEB, values });
    }
    return out;
  }
  // DTCG tree: top-level keys may be modes ("dark", "Light.tokens.json", "comfortable") or tokens may carry per-mode values in $extensions.
  const walk = (node, path, mode, sink) => {
    if (!node || typeof node !== 'object') return;
    if ('$value' in node) { sink.push({ path, mode, node }); return; }
    for (const [k, v] of Object.entries(node)) if (!k.startsWith('$')) walk(v, [...path, k], mode, sink);
  };
  const leaves = [];
  const topModes = Object.keys(json ?? {}).filter((k) => modeOf(k));
  if (topModes.length) for (const k of topModes) walk(json[k], [], modeOf(k), leaves);
  else walk(json, [], null, leaves);
  const byName = new Map();
  for (const { path, mode, node } of leaves) {
    const name = path.join('/');
    const e = byName.get(name) ?? { name, codeSyntax: node.$extensions?.['com.figma']?.codeSyntax?.WEB, values: {} };
    const ext = Object.values(node.$extensions ?? {}).find((x) => x && typeof x === 'object' && x.modes)?.modes;
    if (ext) for (const [mn, mv] of Object.entries(ext)) { if (modeOf(mn)) e.values[modeOf(mn)] = toValue(mv); }
    else if (mode) e.values[mode] = toValue(node.$value);
    else for (const m of MODES) e.values[m] = toValue(node.$value);
    byName.set(name, e);
  }
  if (!topModes.length && leaves.length) notes.push('No mode files or groups (dark, light, comfortable, compact) found in this DTCG file; each value was applied to every mode.');
  return [...byName.values()];
}

/**
 * @param {object} json Figma export (any supported shape)
 * @param {object} resolved library tokens `{ dark, light, component }`
 * @param {object} library the library's own `figma/variables.json`
 * @returns {{ theme: object, report: { matched: number, changed: number, unmatched: string[], notes: string[] } }}
 */
export function importFigma(json, resolved, library) {
  const notes = [];
  const find = lookup(library, resolved);
  const entries = collect(json, notes);
  const color = { dark: {}, light: {} };
  const radius = {};
  const size = { comfortable: {}, compact: {} };
  const unmatched = [];
  let matched = 0;
  const px = (v) => parseFloat(v);
  for (const e of entries) {
    const hit = find(e.name, e.codeSyntax);
    if (!hit) { unmatched.push(e.name); continue; }
    matched++;
    if (hit.kind === 'colour') {
      for (const m of ['dark', 'light']) { const v = e.values[m]?.colour; if (v && canon(v) !== canon(resolved[m][hit.token])) color[m][hit.token] = v; }
    } else if (hit.kind === 'radius') {
      const d = e.values.dark?.length, l = e.values.light?.length;
      if (d && l && d !== l) notes.push(`${e.name}: Dark (${d}) and Light (${l}) differ; radii are the same in both modes, Dark was used.`);
      const v = d ?? l;
      if (v && px(v) !== px(resolved.dark[hit.token])) radius[hit.token.slice(7)] = v;
    } else {
      for (const m of ['comfortable', 'compact']) { const v = e.values[m]?.length; if (v && px(v) !== px(resolved.component[m][hit.token])) size[m][hit.token] = v; }
    }
  }
  // A changed brand fill is the seed: the brand text/wash/focus roles are re-derived so contrast is guaranteed.
  let brand;
  const seed = color.dark['brand-fill'] ?? color.light['brand-fill'];
  if (seed) {
    brand = seed;
    for (const m of ['dark', 'light']) for (const r of ['brand', 'brand-fill', 'wash-brand', 'focus', 'focus-halo']) delete color[m][r];
    notes.push(`Brand seed ${brand} taken from brand/fill; brand text, wash and focus are derived (contrast-checked) instead of imported.`);
  }
  const wrap = (v, type = 'color') => ({ $type: type, $value: v });
  const theme = {
    $schema: 'https://unpkg.com/@davinci-ai/react/dist/theme.schema.json',
    $description: 'Imported from a Figma variables export.',
    ...(brand ? { brand: wrap(brand) } : {}),
    radius: { $value: 'balanced', ...Object.fromEntries(Object.entries(radius).map(([k, v]) => [k, wrap(v, 'dimension')])) },
    density: { $value: 'medium' },
    mode: { $value: 'dark' },
    ...(Object.keys(size.comfortable).length || Object.keys(size.compact).length
      ? { size: Object.fromEntries(['comfortable', 'compact'].filter((m) => Object.keys(size[m]).length).map((m) => [m, Object.fromEntries(Object.entries(size[m]).map(([k, v]) => [k, wrap(v, 'dimension')]))])) }
      : {}),
    color: { dark: Object.fromEntries(Object.entries(color.dark).map(([k, v]) => [k, wrap(v)])), light: Object.fromEntries(Object.entries(color.light).map(([k, v]) => [k, wrap(v)])) },
  };
  const changed = Object.keys(color.dark).length + Object.keys(color.light).length + Object.keys(radius).length + Object.keys(size.comfortable).length + Object.keys(size.compact).length + (brand ? 1 : 0);
  return { theme, report: { matched, changed, unmatched, notes } };
}
