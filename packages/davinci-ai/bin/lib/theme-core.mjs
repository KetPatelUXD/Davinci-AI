/**
 * Theme compiler shared by the `davinci` CLI (Node) and `ThemeProvider themeConfig` (browser).
 * Pure functions: a theme file (DTCG-flavoured JSON) goes in, CSS custom-property overrides come out.
 * The resolved library tokens (`tokens.resolved.json` / the typed `tokens` export) are passed in so this file has no I/O.
 */
import { parse, toHex, over, contrast, tune, rgba, toHsl, fromHsl } from './color.mjs';

export const PRESETS = {
  violet: '#7c3aed', indigo: '#4f46e5', blue: '#2563eb', sky: '#0284c7', teal: '#0f766e', emerald: '#047857', amber: '#b45309', orange: '#c2410c', rose: '#be123c', pink: '#be185d', slate: '#475569',
};
const KEYWORDS = {
  color: { purple: 'violet', violet: 'violet', lavender: 'violet', indigo: 'indigo', blue: 'blue', navy: 'indigo', sky: 'sky', cyan: 'sky', teal: 'teal', turquoise: 'teal', green: 'emerald', emerald: 'emerald', mint: 'emerald', amber: 'amber', gold: 'amber', yellow: 'amber', orange: 'orange', red: 'rose', rose: 'rose', crimson: 'rose', pink: 'pink', magenta: 'pink', grey: 'slate', gray: 'slate', slate: 'slate', neutral: 'slate' },
  density: { dense: 'small', compact: 'small', tight: 'small', small: 'small', spacious: 'large', airy: 'large', large: 'large', roomy: 'large', comfortable: 'medium', balanced: 'medium' },
  radius: { sharp: 'sharp', square: 'sharp', crisp: 'sharp', angular: 'sharp', rounded: 'soft', soft: 'soft', friendly: 'soft', pill: 'soft', round: 'soft' },
  mode: { dark: 'dark', night: 'dark', light: 'light', bright: 'light', day: 'light', system: 'system', auto: 'system' },
};

/** Deterministic keyword proposal for a free-text brand description (no network, no model). */
export function propose(text) {
  const words = String(text).toLowerCase().match(/[a-z]+/g) ?? [];
  const pick = (map) => { for (const w of words) if (map[w]) return map[w]; return undefined; };
  return { primary: pick(KEYWORDS.color) ?? 'violet', density: pick(KEYWORDS.density) ?? 'medium', radius: pick(KEYWORDS.radius) ?? 'balanced', mode: pick(KEYWORDS.mode) ?? 'dark' };
}

export const RADIUS = {
  sharp: { 'radius-card': '12px', 'radius-composer': '14px', 'radius-panel': '10px', 'radius-tile': '8px', 'radius-control': '8px', 'radius-menu': '8px', 'radius-tooltip': '6px', 'radius-code': '4px' },
  balanced: {},
  soft: { 'radius-card': '32px', 'radius-composer': '32px', 'radius-panel': '26px', 'radius-tile': '20px', 'radius-control': '18px', 'radius-menu': '20px', 'radius-tooltip': '14px', 'radius-code': '9px' },
};
export const DENSITY = {
  small: { defaultDensity: 'compact', css: {} },
  medium: { defaultDensity: 'comfortable', css: {} },
  large: { defaultDensity: 'comfortable', css: { 'button-height-sm': '34px', 'button-height-md': '42px', 'button-height-lg': '48px', 'button-height-xl': '52px', 'icon-button-sm': '34px', 'icon-button-md': '42px', 'icon-button-lg': '48px', 'icon-button-xl': '52px', 'input-height-sm': '34px', 'input-height-md': '42px', 'input-height-lg': '48px', 'input-height-xl': '52px' } },
};

const FONT_OK = /^[\w\s,'"\-.]+$/;
const isColour = (v) => { try { parse(v); return true; } catch { return false; } };
const val = (x) => (x && typeof x === 'object' && '$value' in x ? x.$value : x);

const DIM = /^-?\d+(\.\d+)?(px|rem|em)$/;
/** Normalises a dimension (`24`, `"24"`, `"24px"`, `"1.5rem"`) to a CSS length, or null. */
export function toLength(v) {
  const x = val(v);
  if (typeof x === 'number' && Number.isFinite(x)) return `${x}px`;
  if (typeof x === 'string' && /^-?\d+(\.\d+)?$/.test(x.trim())) return `${x.trim()}px`;
  if (typeof x === 'string' && DIM.test(x.trim())) return x.trim();
  return null;
}
/** Radius roles a theme file may override (`card`, `control`, `pill`, …): resolved `radius-*` tokens. */
export function radiusRoles(resolved) {
  return Object.keys(resolved.dark).filter((k) => k.startsWith('radius-')).map((k) => k.slice(7));
}
/** Component size roles (`button-height-md`, `card-px`, …): the dimension tokens of the comfortable density. */
export function sizeRoles(resolved) {
  const c = resolved.component?.comfortable ?? {};
  return Object.keys(c).filter((k) => DIM.test(String(c[k])));
}

/** Colour roles a theme file may override: every resolved semantic token that parses as a single colour. */
export function colourRoles(resolved) {
  return Object.keys(resolved.dark).filter((k) => isColour(resolved.dark[k]));
}

/** Builds the brand tokens for a base colour, enforcing the design system's contrast rules in both modes. */
export function brandTokens(hex, resolved) {
  const base = parse(hex);
  const white = parse('#ffffff');
  const surfaces = (mode) => {
    const m = resolved[mode], bg = parse(m.bg);
    const out = ['bg', 'bg-elevated', 'surface', 'raised', 'hover', 'well'].map((n) => over(parse(m[n]), bg));
    const stops = (m.card.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}/gi) ?? []).map(parse);
    const spot = parse(m['spotlight-fill']);
    for (const s of stops) { const c = over(s, bg); out.push(c, over(spot, c)); }
    return out;
  };
  const dark = surfaces('dark'), light = surfaces('light');
  // fill: white label ≥ 4.5:1 → darken until it passes
  const fill = tune(base, -1, (c) => contrast(white, c) >= 4.5);
  // dark mode text/icon: lighten until ≥ 4.5:1 on the brightest surfaces, also against its own wash
  const darkText = tune(base.a ? fromHsl({ ...toHsl(base), l: Math.max(toHsl(base).l, 0.6) }) : base, +1, (c) => dark.every((s) => contrast(c, s) >= 4.5 && contrast(c, over({ ...c, a: 0.12 }, s)) >= 4.5));
  // light mode text/icon: darken until ≥ 4.5:1 on every light surface incl. an 8% wash of itself
  const lightText = tune(base, -1, (c) => light.every((s) => contrast(c, s) >= 4.5 && contrast(c, over({ ...c, a: 0.08 }, s)) >= 4.5));
  // focus ring ≥ 3:1 on every surface
  const darkFocus = tune(darkText, +1, (c) => dark.every((s) => contrast(c, s) >= 3));
  const lightFocus = tune(lightText, -1, (c) => light.every((s) => contrast(c, s) >= 3));
  const report = {
    fillWhite: +contrast(white, fill).toFixed(2),
    darkText: +Math.min(...dark.map((s) => contrast(darkText, s))).toFixed(2),
    lightText: +Math.min(...light.map((s) => contrast(lightText, s))).toFixed(2),
    darkFocus: +Math.min(...dark.map((s) => contrast(darkFocus, s))).toFixed(2),
    lightFocus: +Math.min(...light.map((s) => contrast(lightFocus, s))).toFixed(2),
  };
  return {
    dark: { brand: toHex(darkText), 'brand-fill': toHex(fill), 'wash-brand': rgba(darkText, 0.12), focus: toHex(darkFocus), 'focus-halo': rgba(darkFocus, 0.25) },
    light: { brand: toHex(lightText), 'brand-fill': toHex(fill), 'wash-brand': rgba(lightText, 0.08), focus: toHex(lightFocus), 'focus-halo': rgba(lightFocus, 0.2) },
    report,
  };
}

/** Reads a theme file (DTCG `$value` wrappers or plain values, or the legacy `{ primary, density, radius, mode }`) into one shape. */
export function normalizeTheme(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Theme must be an object.');
  const warnings = [];
  const known = new Set(['$schema', '$description', '$extensions', 'brand', 'primary', 'radius', 'density', 'mode', 'font', 'color', 'size']);
  for (const k of Object.keys(input)) if (!known.has(k)) warnings.push(`Unknown top-level key "${k}" was ignored.`);
  const brand = val(input.brand) ?? val(input.primary);
  const rIn = input.radius;
  const radius = (rIn && typeof rIn === 'object' && !('$value' in rIn) ? undefined : val(rIn)) ?? 'balanced';
  const radiusRolesIn = {};
  if (rIn && typeof rIn === 'object') for (const [k, v] of Object.entries(rIn)) if (!k.startsWith('$')) radiusRolesIn[k] = v;
  const sizeIn = { comfortable: {}, compact: {} };
  for (const m of ['comfortable', 'compact']) for (const [k, v] of Object.entries(input.size?.[m] ?? {})) sizeIn[m][k] = v;
  const density = val(input.density) ?? 'medium';
  const mode = val(input.mode) ?? 'dark';
  if (!RADIUS[radius]) throw new Error('radius must be sharp | balanced | soft');
  if (!DENSITY[density]) throw new Error('density must be small | medium | large');
  if (!['dark', 'light', 'system'].includes(mode)) throw new Error('mode must be dark | light | system');
  let hex;
  if (brand !== undefined) {
    hex = PRESETS[brand] ?? (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(brand) ? brand : null);
    if (!hex) throw new Error(`Unknown primary colour "${brand}". Use a preset (${Object.keys(PRESETS).join(', ')}) or a hex like #0f766e.`);
  }
  const font = {};
  for (const k of ['sans', 'mono']) {
    const f = val(input.font?.[k]);
    if (f === undefined) continue;
    if (typeof f !== 'string' || !FONT_OK.test(f)) throw new Error(`font.${k} may only contain letters, digits, spaces, commas, quotes, dots and dashes.`);
    font[k] = f;
  }
  const color = { dark: {}, light: {} };
  for (const m of ['dark', 'light']) {
    const src = input.color?.[m] ?? {};
    for (const [role, v] of Object.entries(src)) color[m][role] = val(v);
  }
  return { brand, hex, radius, radiusRolesIn, sizeIn, density, mode, font, color, unsafe: input.$extensions?.davinci?.unsafe === true, warnings };
}

const BODY = 4.5, GRAPHIC = 3;
/** Contrast gates for a merged token set: text and status roles ≥ 4.5:1, focus ≥ 3:1, white label on fills ≥ 4.5:1. */
export function checkContrast(merged) {
  const fails = [];
  for (const mode of ['dark', 'light']) {
    const m = merged[mode], bg = parse(m.bg);
    const S = ['bg', 'bg-elevated', 'surface', 'raised', 'hover', 'well'].map((n) => [n, over(parse(m[n]), bg)]);
    const pairs = [['text', BODY], ['text-secondary', BODY], ['text-muted', BODY], ['brand', BODY], ['positive', BODY], ['negative', BODY], ['warning', BODY], ['info', BODY], ['focus', GRAPHIC]];
    for (const [role, min] of pairs) {
      const fg = parse(m[role]);
      for (const [sn, s] of S) {
        const c = contrast(over(fg, s), s);
        if (c < min) fails.push(`${mode}: "${role}" on "${sn}" is ${c.toFixed(2)}:1 (needs ${min}:1)`);
      }
    }
    for (const fill of ['brand-fill', 'positive-fill', 'negative-fill', 'warning-fill', 'info-fill']) {
      const c = contrast(parse(m['on-fill']), over(parse(m[fill]), bg));
      if (c < BODY) fails.push(`${mode}: label "on-fill" on "${fill}" is ${c.toFixed(2)}:1 (needs ${BODY}:1)`);
    }
  }
  return fails;
}

const decl = (o) => Object.entries(o).map(([k, v]) => `  --dv-${k}: ${v};`).join('\n');
const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); };

/**
 * Compiles a theme file to CSS.
 * @param {object} input theme file contents
 * @param {object} resolved library tokens `{ dark, light }` (from tokens.resolved.json or the typed `tokens` export)
 * @param {{ scope?: string }} [opts] `scope` – a selector fragment such as `[data-dv-theme='abc']`; omit for a global stylesheet
 * @returns {{ ok: boolean, errors: string[], warnings: string[], css: string, json: object, ts: string, report: object, id: string }}
 */
export function compileTheme(input, resolved, opts = {}) {
  const n = normalizeTheme(input);
  const errors = [], warnings = [...n.warnings];
  const roles = new Set(colourRoles(resolved));
  const overrides = { dark: {}, light: {} };
  for (const m of ['dark', 'light']) {
    for (const [role, v] of Object.entries(n.color[m])) {
      if (!roles.has(role)) { errors.push(`color.${m}.${role}: unknown role. Valid roles: ${[...roles].join(', ')}.`); continue; }
      if (typeof v !== 'string' || !isColour(v)) { errors.push(`color.${m}.${role}: "${v}" is not a hex or rgb(a) colour.`); continue; }
      overrides[m][role] = v;
    }
  }
  const radiusOut = {};
  const rRoles = new Set(radiusRoles(resolved));
  for (const [role, v] of Object.entries(n.radiusRolesIn)) {
    if (!rRoles.has(role)) { errors.push(`radius.${role}: unknown radius. Valid: ${[...rRoles].join(', ')}.`); continue; }
    const len = toLength(v);
    if (!len) { errors.push(`radius.${role}: "${val(v)}" is not a length (use a number of px, "24px" or "1.5rem").`); continue; }
    radiusOut[`radius-${role}`] = len;
  }
  const sRoles = new Set(sizeRoles(resolved));
  const sizeOut = { comfortable: {}, compact: {} };
  for (const m of ['comfortable', 'compact']) {
    for (const [role, v] of Object.entries(n.sizeIn[m])) {
      if (!sRoles.has(role)) { errors.push(`size.${m}.${role}: unknown size token. See the schema for valid names.`); continue; }
      const len = toLength(v);
      if (!len) { errors.push(`size.${m}.${role}: "${val(v)}" is not a length (use a number of px, "40px" or "2.5rem").`); continue; }
      sizeOut[m][role] = len;
    }
  }
  const merged = { dark: { ...resolved.dark, ...overrides.dark }, light: { ...resolved.light, ...overrides.light } };
  let report;
  const brand = { dark: {}, light: {} };
  if (n.hex) {
    const b = brandTokens(n.hex, merged);
    report = b.report;
    for (const m of ['dark', 'light']) for (const [k, v] of Object.entries(b[m])) if (!(k in overrides[m])) brand[m][k] = v;
    for (const m of ['dark', 'light']) Object.assign(merged[m], brand[m]);
  }
  const fails = errors.length ? [] : checkContrast(merged);
  // Target size (WCAG 2.5.8): controls may not be smaller than the library's minimum target.
  const minTarget = parseFloat(resolved.component?.comfortable?.['target-min'] ?? '24');
  for (const m of ['comfortable', 'compact']) {
    for (const [role, v] of Object.entries({ ...(m === 'comfortable' ? DENSITY[n.density].css : {}), ...sizeOut[m] })) {
      if (/(^|-)height-|^icon-button-/.test(role) && /px$/.test(v) && parseFloat(v) < minTarget) fails.push(`${m}: "${role}" is ${v} (controls need at least ${minTarget}px for touch/pointer targets)`);
    }
  }
  if (fails.length) (n.unsafe ? warnings : errors).push(...fails.map((f) => `${f}${n.unsafe ? '' : ' – fix the value, or set $extensions.davinci.unsafe to accept the risk.'}`));

  const out = { dark: { ...brand.dark, ...overrides.dark }, light: { ...brand.light, ...overrides.light } };
  const S = opts.scope ?? '';
  const sel = {
    dark: S ? `${S}[data-theme='dark']` : `:root,\n[data-theme='dark']`,
    light: S ? `${S}[data-theme='light']` : `[data-theme='light']`,
    root: S || ':root',
    density: S ? `${S}[data-density='comfortable']` : `:root,\n[data-density='comfortable']`,
  };
  const fontDecl = Object.fromEntries(Object.entries(n.font).map(([k, v]) => [`font-${k}`, v]));
  const blocks = [];
  if (Object.keys(out.dark).length) blocks.push(`${sel.dark} {\n${decl(out.dark)}\n}`);
  if (Object.keys(out.light).length) blocks.push(`${sel.light} {\n${decl(out.light)}\n}`);
  const rootDecl = { ...RADIUS[n.radius], ...radiusOut, ...fontDecl };
  if (Object.keys(rootDecl).length) blocks.push(`${sel.root} {\n${decl(rootDecl)}\n}`);
  const comfortable = { ...DENSITY[n.density].css, ...sizeOut.comfortable };
  if (Object.keys(comfortable).length) blocks.push(`${sel.density} {\n${decl(comfortable)}\n}`);
  if (Object.keys(sizeOut.compact).length) blocks.push(`${S ? `${S}[data-density='compact']` : `[data-density='compact']`} {\n${decl(sizeOut.compact)}\n}`);
  const label = `Brand ${n.brand ?? 'default'} · density ${n.density} · radius ${n.radius} · default mode ${n.mode}`;
  const contrastLine = report ? `\n   Contrast verified: white on fill ${report.fillWhite}:1 · text dark ${report.darkText}:1 / light ${report.lightText}:1 · focus ≥ ${Math.min(report.darkFocus, report.lightFocus)}:1` : '';
  const css = `/* Generated by \`npx davinci theme\` – import AFTER @davinci-ai/react/styles.css.\n   ${label}${contrastLine} */\n${blocks.join('\n')}\n`;
  const json = { primary: n.brand, hex: n.hex, defaultTheme: n.mode, defaultDensity: DENSITY[n.density].defaultDensity, density: n.density, radius: n.radius, tokens: out, radii: { ...RADIUS[n.radius], ...radiusOut }, size: { comfortable, compact: sizeOut.compact }, contrast: report };
  const ts = `// Generated by \`npx davinci theme\`.\nexport const theme = { defaultTheme: '${n.mode}', density: '${DENSITY[n.density].defaultDensity}' } as const;\n// <ThemeProvider defaultTheme={theme.defaultTheme} density={theme.density}> … </ThemeProvider>\n`;
  return { ok: errors.length === 0, errors, warnings, css, json, ts, report, id: hash(css) };
}

/** Validates without keeping the output. */
export function validateTheme(input, resolved) {
  try { const r = compileTheme(input, resolved); return { ok: r.ok, errors: r.errors, warnings: r.warnings, report: r.report }; }
  catch (e) { return { ok: false, errors: [e.message], warnings: [], report: undefined }; }
}

/** Starter theme file written by `davinci theme --init`. */
export function sampleTheme(brand = '#7c3aed') {
  return {
    $schema: 'https://unpkg.com/@davinci-ai/react/dist/theme.schema.json',
    $description: 'DaVinci.AI theme. Change brand, radius, density or font; add colour overrides per mode only if you must.',
    brand: { $type: 'color', $value: brand },
    radius: { $value: 'balanced' },
    density: { $value: 'medium' },
    mode: { $value: 'dark' },
    font: { sans: { $value: "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif" } },
    color: { dark: {}, light: {} },
  };
}

/** JSON Schema for editor autocomplete, with the colour role list taken from the library tokens. */
export function themeSchema(resolved) {
  const roles = colourRoles(resolved);
  const colour = { type: 'object', properties: { $type: { const: 'color' }, $value: { type: 'string', description: 'Hex or rgb()/rgba() colour.' } }, required: ['$value'] };
  const modeProps = Object.fromEntries(roles.map((r) => [r, { ...colour, description: `Overrides --dv-${r}` }]));
  const len = { type: 'object', properties: { $type: { const: 'dimension' }, $value: { type: ['string', 'number'], description: 'A length: number of px, "24px" or "1.5rem".' } }, required: ['$value'] };
  const radiusProps = Object.fromEntries(radiusRoles(resolved).map((r) => [r, { ...len, description: `Overrides --dv-radius-${r}` }]));
  const sizeProps = Object.fromEntries(sizeRoles(resolved).map((r) => [r, { ...len, description: `Overrides --dv-${r}` }]));
  const str = (desc, values) => ({ type: 'object', properties: { $value: values ? { enum: values } : { type: 'string' } }, required: ['$value'], description: desc });
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'DaVinci.AI theme file',
    type: 'object',
    properties: {
      $schema: { type: 'string' },
      $description: { type: 'string' },
      $extensions: { type: 'object', properties: { davinci: { type: 'object', properties: { unsafe: { type: 'boolean', description: 'Accept contrast failures as warnings.' } } } } },
      brand: { ...colour, description: 'Brand colour. Dark/light text, fill, wash and focus are derived and contrast-checked.' },
      radius: { type: 'object', description: 'Corner feel preset, plus optional per-role radii.', properties: { $value: { enum: ['sharp', 'balanced', 'soft'] }, ...radiusProps }, additionalProperties: false },
      size: { type: 'object', description: 'Component sizes and paddings per density (button/input heights, card padding, table row height…).', properties: { comfortable: { type: 'object', properties: sizeProps, additionalProperties: false }, compact: { type: 'object', properties: sizeProps, additionalProperties: false } }, additionalProperties: false },
      density: str('Control size feel.', ['small', 'medium', 'large']),
      mode: str('Default mode for the project.', ['dark', 'light', 'system']),
      font: { type: 'object', properties: { sans: str('--dv-font-sans'), mono: str('--dv-font-mono') } },
      color: { type: 'object', properties: { dark: { type: 'object', properties: modeProps, additionalProperties: false }, light: { type: 'object', properties: modeProps, additionalProperties: false } } },
    },
    additionalProperties: false,
  };
}
