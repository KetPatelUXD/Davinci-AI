#!/usr/bin/env node
/**
 * davinci – CLI for @davinci-ai/react
 *   davinci theme [--primary <preset|#hex>] [--density small|medium|large] [--radius sharp|balanced|soft]
 *                 [--mode dark|light|system] [--describe "free text"] [--out <dir>] [--yes]
 * Writes a project theme (token overrides + CSS) that keeps every contrast rule of the design system.
 */
import { createInterface } from 'node:readline/promises';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, toHex, over, contrast, tune, rgba, toHsl, fromHsl } from './lib/color.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const resolvedTokens = ['../dist/tokens.resolved.json', '../src/generated/tokens.resolved.json'].map((p) => join(here, p)).find(existsSync);

export const PRESETS = {
  violet: '#7c3aed', indigo: '#4f46e5', blue: '#2563eb', sky: '#0284c7', teal: '#0f766e', emerald: '#047857', amber: '#b45309', orange: '#c2410c', rose: '#be123c', pink: '#be185d', slate: '#475569',
};
const KEYWORDS = {
  color: { purple: 'violet', violet: 'violet', lavender: 'violet', indigo: 'indigo', blue: 'blue', navy: 'indigo', sky: 'sky', cyan: 'sky', teal: 'teal', turquoise: 'teal', green: 'emerald', emerald: 'emerald', gold: 'amber', amber: 'amber', yellow: 'amber', orange: 'orange', red: 'rose', crimson: 'rose', rose: 'rose', pink: 'pink', magenta: 'pink', grey: 'slate', gray: 'slate', slate: 'slate', neutral: 'slate' },
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

const RADIUS = {
  sharp: { 'radius-card': '12px', 'radius-composer': '14px', 'radius-panel': '10px', 'radius-tile': '8px', 'radius-control': '8px', 'radius-menu': '8px', 'radius-tooltip': '6px', 'radius-code': '4px' },
  balanced: {},
  soft: { 'radius-card': '32px', 'radius-composer': '32px', 'radius-panel': '26px', 'radius-tile': '20px', 'radius-control': '18px', 'radius-menu': '20px', 'radius-tooltip': '14px', 'radius-code': '9px' },
};
const DENSITY = {
  small: { defaultDensity: 'compact', css: {} },
  medium: { defaultDensity: 'comfortable', css: {} },
  large: { defaultDensity: 'comfortable', css: { 'button-height-sm': '34px', 'button-height-md': '42px', 'button-height-lg': '48px', 'button-height-xl': '52px', 'icon-button-sm': '34px', 'icon-button-md': '42px', 'icon-button-lg': '46px', 'input-height-sm': '40px', 'input-height-md': '48px', 'input-height-lg': '52px', 'table-row-height': '72px', 'card-px': '28px', 'card-py': '26px' } },
};

/** Builds the brand tokens for a base colour, enforcing the design system's contrast rules in both modes. */
export function brandTokens(hex) {
  if (!resolvedTokens) throw new Error('tokens.resolved.json not found – run `pnpm build` first');
  const t = JSON.parse(readFileSync(resolvedTokens, 'utf8'));
  const base = parse(hex);
  const white = parse('#ffffff');
  const surfaces = (mode) => {
    const m = t[mode], bg = parse(m.bg);
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

export function buildTheme({ primary = 'violet', density = 'medium', radius = 'balanced', mode = 'dark' }) {
  const hex = PRESETS[primary] ?? (/^#[0-9a-f]{3,6}$/i.test(primary) ? primary : null);
  if (!hex) throw new Error(`Unknown primary colour "${primary}". Use a preset (${Object.keys(PRESETS).join(', ')}) or a hex like #0f766e.`);
  if (!DENSITY[density]) throw new Error(`density must be small | medium | large`);
  if (!RADIUS[radius]) throw new Error(`radius must be sharp | balanced | soft`);
  if (!['dark', 'light', 'system'].includes(mode)) throw new Error('mode must be dark | light | system');
  const b = brandTokens(hex);
  const decl = (o) => Object.entries(o).map(([k, v]) => `  --dv-${k}: ${v};`).join('\n');
  const css = `/* Generated by \`npx davinci theme\` – import AFTER @davinci-ai/react/styles.css.
   Primary ${primary} · density ${density} · radius ${radius} · default mode ${mode}
   Contrast verified: white on fill ${b.report.fillWhite}:1 · text dark ${b.report.darkText}:1 / light ${b.report.lightText}:1 · focus ≥ ${Math.min(b.report.darkFocus, b.report.lightFocus)}:1 */
:root,
[data-theme='dark'] {
${decl(b.dark)}
}
[data-theme='light'] {
${decl(b.light)}
}
${Object.keys(RADIUS[radius]).length ? `:root {\n${decl(RADIUS[radius])}\n}\n` : ''}${Object.keys(DENSITY[density].css).length ? `:root,\n[data-density='comfortable'] {\n${decl(DENSITY[density].css)}\n}\n` : ''}`;
  const json = { primary, hex, defaultTheme: mode, defaultDensity: DENSITY[density].defaultDensity, density, radius, tokens: { dark: b.dark, light: b.light }, contrast: b.report };
  const ts = `// Generated by \`npx davinci theme\`.
export const theme = { defaultTheme: '${mode}', density: '${DENSITY[density].defaultDensity}' } as const;
// <ThemeProvider defaultTheme={theme.defaultTheme} density={theme.density}> … </ThemeProvider>
`;
  return { css, json, ts, report: b.report };
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2); const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; out[k] = v; } else out._.push(a);
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  if (!cmd || cmd === 'help' || args.help) {
    console.log(`davinci theme [--primary violet|teal|…|#hex] [--density small|medium|large] [--radius sharp|balanced|soft] [--mode dark|light|system] [--describe "text"] [--out dir] [--yes]`);
    return;
  }
  if (cmd !== 'theme') { console.error(`Unknown command "${cmd}". Try: davinci theme`); process.exit(1); }

  let choice = { primary: args.primary, density: args.density, radius: args.radius, mode: args.mode };
  if (typeof args.describe === 'string') {
    const p = propose(args.describe);
    choice = { primary: choice.primary ?? p.primary, density: choice.density ?? p.density, radius: choice.radius ?? p.radius, mode: choice.mode ?? p.mode };
    console.log(`Proposal from "${args.describe}":\n  primary ${choice.primary} · density ${choice.density} · radius ${choice.radius} · mode ${choice.mode}`);
  }
  const interactive = process.stdin.isTTY && !args.yes && Object.values(choice).some((v) => v === undefined);
  if (interactive) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const ask = async (q, d) => (await rl.question(`${q} [${d}]: `)).trim() || d;
    console.log(`Presets: ${Object.keys(PRESETS).join(', ')} (or a custom hex)`);
    choice.primary ??= await ask('Primary colour', 'violet');
    choice.density ??= await ask('Density (small/medium/large)', 'medium');
    choice.radius ??= await ask('Radius feel (sharp/balanced/soft)', 'balanced');
    choice.mode ??= await ask('Default mode (dark/light/system)', 'dark');
    rl.close();
  }
  choice = { primary: choice.primary ?? 'violet', density: choice.density ?? 'medium', radius: choice.radius ?? 'balanced', mode: choice.mode ?? 'dark' };
  let theme;
  try { theme = buildTheme(choice); } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }
  const out = resolve(typeof args.out === 'string' ? args.out : '.');
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'davinci.theme.css'), theme.css);
  writeFileSync(join(out, 'davinci.theme.json'), JSON.stringify(theme.json, null, 2) + '\n');
  writeFileSync(join(out, 'davinci.theme.ts'), theme.ts);
  console.log(`✓ Wrote davinci.theme.css / .json / .ts to ${out}\n  Contrast: ${JSON.stringify(theme.report)}\n\nUse it:\n  import '@davinci-ai/react/styles.css';\n  import './davinci.theme.css';`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
