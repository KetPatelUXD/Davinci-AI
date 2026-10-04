/**
 * Token build: tokens.json (DTCG) → dist/
 *   tokens.css            CSS custom properties (primitives, dark/light semantic, component, density)
 *   tailwind-theme.css    Tailwind v4 `@theme` mapping for consumers (and tailwind-theme.internal.css for the library)
 *   tokens.ts / .d.ts     typed exports
 *   tokens.resolved.json  fully resolved values per mode (used by contrast tests and manifest)
 *   figma/variables.json  Figma variable collections (alias chains, scopes, codeSyntax)   [--figma]
 *   figma/styles.json     paint / effect / text styles                                    [--figma]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const dist = join(root, 'dist');
const tokens = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8'));
mkdirSync(join(dist, 'figma'), { recursive: true });

// ------------------------------------------------------------------ flatten
/** @type {{path:string, group:'primitive'|'semantic'|'component', token:any, css:string}[]} */
const flat = [];
(function walk(node, path) {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && '$value' in v) {
      const css = v.$extensions?.['com.davinci']?.css;
      flat.push({ path: [...path, k].join('.'), group: path[0], token: v, css });
    } else if (v && typeof v === 'object') walk(v, [...path, k]);
  }
})(tokens, []);
const byPath = new Map(flat.map((t) => [t.path, t]));

const REF = /\{([^{}]+)\}/g;
const modeValue = (t, mode) => (mode === 'light' && t.token.$extensions?.['com.davinci']?.modes?.light) || t.token.$value;
const compactValue = (t) => t.token.$extensions?.['com.davinci']?.density?.compact;

/** Resolve all references to literal values for a mode. */
function resolve(value, mode, density) {
  if (typeof value !== 'string') return value;
  return value.replace(REF, (_, p) => {
    const t = byPath.get(p);
    if (!t) throw new Error(`Unknown token reference {${p}}`);
    let v = density === 'compact' && compactValue(t) ? compactValue(t) : modeValue(t, mode);
    v = resolve(v, mode, density);
    return typeof v === 'object' ? JSON.stringify(v) : v;
  }).replace(/^(\[.*\])$/, '$1');
}
/** Reference → var() for CSS output. */
function toCss(value) {
  if (Array.isArray(value)) return `cubic-bezier(${value.join(',')})`;
  if (typeof value === 'object') return '';
  const s = String(value);
  return s.replace(REF, (_, p) => {
    const t = byPath.get(p);
    if (!t) throw new Error(`Unknown token reference {${p}}`);
    return `var(--dv-${t.css})`;
  });
}
const cssVal = (t, v) => {
  if (t.token.$type === 'number') return String(v);
  if (t.token.$type === 'cubicBezier' && Array.isArray(v)) return `cubic-bezier(${v.join(',')})`;
  return toCss(v);
};

// ------------------------------------------------------------------ CSS
const prim = flat.filter((t) => t.group === 'primitive');
const sem = flat.filter((t) => t.group === 'semantic' && t.token.$type !== 'typography');
const type = flat.filter((t) => t.group === 'semantic' && t.token.$type === 'typography');
const comp = flat.filter((t) => t.group === 'component');

const decl = (t, v) => `  --dv-${t.css}: ${cssVal(t, v)};`;
const primitivesCss = prim.map((t) => decl(t, t.token.$value)).join('\n');
const darkCss = sem.map((t) => decl(t, t.token.$value)).join('\n');
const lightCss = sem.filter((t) => t.token.$extensions?.['com.davinci']?.modes?.light).map((t) => decl(t, modeValue(t, 'light'))).join('\n');
const typeCss = type
  .map((t) => {
    const v = t.token.$value;
    return [`size`, `lh`, `weight`, `ls`]
      .map((k, i) => `  --dv-${t.css}-${k}: ${[v.fontSize, v.lineHeight, v.fontWeight, v.letterSpacing][i]};`)
      .join('\n');
  })
  .join('\n');
const compCss = comp.map((t) => decl(t, t.token.$value)).join('\n');
const compactCss = comp.filter(compactValue).map((t) => decl(t, compactValue(t))).join('\n');

// ---- variants: inverted (red up) and colour-blind-safe (blue/orange) long/short
const SWAP = [['positive', 'negative'], ['positive-fill', 'negative-fill'], ['wash-positive', 'wash-negative']];
const semBy = (css) => sem.find((t) => t.css === css);
const variantBlock = (selector, entries) => `${selector} {\n${entries.map(([n, v]) => `  --dv-${n}: ${toCss(v)};`).join('\n')}\n}`;
const invertedEntries = (mode) => SWAP.flatMap(([a, b]) => [[a, modeValue(semBy(b), mode)], [b, modeValue(semBy(a), mode)]]);
const cvdEntries = (mode) => Object.keys(semBy('positive') ? { positive: 1, 'positive-fill': 1, 'wash-positive': 1, negative: 1, 'negative-fill': 1, 'wash-negative': 1 } : {}).map((n) => [n, semBy(n).token.$extensions['com.davinci'].variants.cvd[mode]]);
const variantCss = [
  '/* ---- Variants: inverted market direction (red up / green down) ---- */',
  variantBlock("[data-direction='inverted'][data-theme='dark']", invertedEntries('dark')),
  variantBlock("[data-direction='inverted'][data-theme='light']", invertedEntries('light')),
  '/* ---- Variants: colour-blind-safe long/short (blue / orange) ---- */',
  variantBlock("[data-cvd][data-theme='dark']", cvdEntries('dark')),
  variantBlock("[data-cvd][data-theme='light']", cvdEntries('light')),
].join('\n');
const tokensCss = `/* GENERATED by packages/tokens/scripts/build.mjs from tokens.json – do not edit. */
:root {
${primitivesCss}
  --dv-font-sans: 'Inter Variable', Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --dv-font-mono: ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, monospace;
${typeCss}
}

/* ---- Semantic · dark (default) ---- */
:root,
[data-theme='dark'] {
  color-scheme: dark;
${darkCss}
}

/* ---- Semantic · light ---- */
[data-theme='light'] {
  color-scheme: light;
${lightCss}
}

${variantCss}

/* ---- Component · comfortable (default) ---- */
:root,
[data-density='comfortable'] {
${compCss}
}

/* ---- Component · compact ---- */
[data-density='compact'] {
${compactCss}
}

/* ---- Accessibility adaptations ---- */
@media (prefers-contrast: more) {
  :root,
  [data-theme='dark'] {
    --dv-line: rgba(255, 255, 255, 0.28);
    --dv-line-strong: rgba(255, 255, 255, 0.45);
    --dv-text-muted: #c4c4cc;
    --dv-text-secondary: #d4d4da;
  }
  [data-theme='light'] {
    --dv-line: rgba(24, 24, 27, 0.35);
    --dv-line-strong: rgba(24, 24, 27, 0.55);
    --dv-text-muted: #3f3f46;
    --dv-text-secondary: #27272a;
  }
}
`;
writeFileSync(join(dist, 'tokens.css'), tokensCss);

// ------------------------------------------------------------------ Tailwind theme
const colorSem = sem.filter((t) => t.token.$type === 'color');
const TW_KEY = { text: 'fg', 'text-secondary': 'secondary', 'text-muted': 'muted', 'text-disabled': 'disabled', bg: 'canvas', 'bg-elevated': 'canvas-elevated', 'border-strong': 'strong' };
const twColor = (t) => `  --color-${TW_KEY[t.css] ?? t.css}: var(--dv-${t.css});` + (t.css === 'line' ? `\n  --color-subtle: var(--dv-line);` : '');
const twBody = `
  --font-sans: var(--dv-font-sans);
  --font-mono: var(--dv-font-mono);
  --radius-pill: var(--dv-radius-pill);
  --radius-card: var(--dv-radius-card);
  --radius-composer: var(--dv-radius-composer);
  --radius-panel: var(--dv-radius-panel);
  --radius-tile: var(--dv-radius-tile);
  --radius-control: var(--dv-radius-control);
  --radius-menu: var(--dv-radius-menu);
  --radius-tooltip: var(--dv-radius-tooltip);
  --radius-code: var(--dv-radius-code);
  --shadow-card: var(--dv-shadow-card);
  --shadow-glass: var(--dv-shadow-glass);
  --shadow-pop: var(--dv-shadow-pop);
  --shadow-raised: var(--dv-shadow-pop);
  --shadow-tip: var(--dv-shadow-tip);
  --shadow-on: var(--dv-shadow-on);
  --shadow-thumb: var(--dv-shadow-thumb);
  --text-overline: var(--dv-type-overline-size);
  --text-small: var(--dv-type-small-size);
  --text-base-dense: var(--dv-type-base-size);
  --text-comfortable: var(--dv-type-comfortable-size);
  --ease-standard: var(--dv-ease);
  --animate-rise: dv-rise 700ms cubic-bezier(.2,.7,.2,1) both;
`;
const colorLines = colorSem.filter((t) => t.token.$type === 'color').map(twColor).join('\n');
writeFileSync(join(dist, 'tailwind-theme.css'), `/* GENERATED – Tailwind v4 theme for consumers who use Tailwind. Import after tokens.css. */\n@theme {\n${colorLines}\n${twBody}}\n`);
// Internal (prefixed `dv:`) build: theme variables are prefixed by Tailwind, so radius/shadow/font would collide with the
// token variables of the same name. Colours go through @theme; the rest are explicit @utility rules.
const utils = [
  ...['pill', 'card', 'composer', 'panel', 'tile', 'control', 'menu', 'tooltip', 'code'].map((n) => `@utility rounded-${n} { border-radius: var(--dv-radius-${n}); }`),
  ...['card', 'glass', 'pop', 'tip', 'on', 'thumb'].map((n) => `@utility shadow-${n} { box-shadow: var(--dv-shadow-${n}); }`),
  '@utility font-sans { font-family: var(--dv-font-sans); }',
  '@utility font-mono { font-family: var(--dv-font-mono); }',
  '@utility text-overline { font-size: var(--dv-type-overline-size); line-height: var(--dv-type-overline-lh); }',
  '@utility text-small { font-size: var(--dv-type-small-size); line-height: var(--dv-type-small-lh); }',
  '@utility text-dense { font-size: var(--dv-type-base-size); line-height: var(--dv-type-base-lh); }',
  '@utility text-comfortable { font-size: var(--dv-type-comfortable-size); line-height: var(--dv-type-comfortable-lh); }',
].join('\n');
writeFileSync(join(dist, 'tailwind-theme.internal.css'), `/* GENERATED – used by @davinci-ai/react's own Tailwind build (prefix dv, resets default palette). */\n@theme {\n  --color-*: initial;\n  --color-transparent: transparent;\n  --color-current: currentColor;\n${colorLines}\n  --animate-rise: dv-rise 700ms cubic-bezier(.2,.7,.2,1) both;\n}\n`);
writeFileSync(join(dist, 'tailwind-utilities.internal.css'), `/* GENERATED – prefixed custom utilities (radius, shadow, type) for the library build. */\n${utils}\n`);

// ------------------------------------------------------------------ resolved + TS
const resolved = { dark: {}, light: {}, component: { comfortable: {}, compact: {} }, primitive: {}, typography: {} };
for (const t of prim) resolved.primitive[t.css] = resolve(t.token.$value, 'dark');
for (const t of sem) {
  resolved.dark[t.css] = resolve(t.token.$value, 'dark');
  resolved.light[t.css] = resolve(modeValue(t, 'light'), 'light');
}
for (const t of comp) {
  resolved.component.comfortable[t.css] = resolve(t.token.$value, 'dark');
  resolved.component.compact[t.css] = resolve(compactValue(t) ?? t.token.$value, 'dark', 'compact');
}
for (const t of type) resolved.typography[t.css] = t.token.$value;
resolved.variants = { inverted: { dark: {}, light: {} }, cvd: { dark: {}, light: {} } };
for (const mode of ['dark', 'light']) {
  for (const [n, v] of invertedEntries(mode)) resolved.variants.inverted[mode][n] = resolve(v, mode);
  for (const [n, v] of cvdEntries(mode)) resolved.variants.cvd[mode][n] = resolve(v, mode);
}
writeFileSync(join(dist, 'tokens.resolved.json'), JSON.stringify(resolved, null, 2));

const colorNames = colorSem.map((t) => t.css);
const ts = `// GENERATED – do not edit.
export const tokens = ${JSON.stringify(resolved, null, 2)} as const;
export type ThemeMode = 'dark' | 'light';
export type SemanticToken = ${sem.map((t) => `'${t.css}'`).join(' | ')};
export type ColorToken = ${colorNames.map((n) => `'${n}'`).join(' | ')};
export type ComponentToken = ${comp.map((t) => `'${t.css}'`).join(' | ')};
/** Returns the CSS variable reference for a token, e.g. cssVar('text-muted') → 'var(--dv-text-muted)'. */
export const cssVar = (name: SemanticToken | ComponentToken): string => \`var(--dv-\${name})\`;
`;
writeFileSync(join(dist, 'tokens.ts'), ts);
writeFileSync(join(dist, 'tokens.json'), JSON.stringify(tokens, null, 2));

console.log(`tokens: ${prim.length} primitive, ${sem.length} semantic, ${type.length} type, ${comp.length} component`);

// ------------------------------------------------------------------ Figma
if (process.argv.includes('--figma')) {
  const FIGMA_TYPE = { color: 'COLOR', dimension: 'FLOAT', number: 'FLOAT', duration: 'FLOAT' };
  const toFloat = (s) => (typeof s === 'number' ? s : parseFloat(String(s)));
  const figmaName = (t) => t.path.replace(/^(primitive|semantic|component)\./, '').split('.').join('/').replace(/\/DEFAULT$/, '');
  const collections = {
    Primitives: { modes: ['Default'], variables: [] },
    Semantic: { modes: ['Dark', 'Light'], variables: [] },
    Component: { modes: ['Comfortable', 'Compact'], variables: [] },
  };
  const aliasOf = (value) => {
    const m = typeof value === 'string' && /^\{([^{}]+)\}$/.exec(value);
    if (!m) return null;
    const target = byPath.get(m[1]);
    return `${target.token.$extensions['com.figma'].collection}/${figmaName(target)}`;
  };
  const value = (t, v, mode, density) => {
    const a = aliasOf(v);
    if (a) return { alias: a };
    const r = resolve(v, mode, density);
    return t.token.$type === 'color' ? r : toFloat(r);
  };
  for (const t of flat) {
    const ext = t.token.$extensions?.['com.figma'];
    const type = t.token.$type;
    if (!ext || !FIGMA_TYPE[type]) continue; // gradients, shadows, typography → styles.json
    const col = collections[ext.collection];
    const entry = { name: figmaName(t), type: FIGMA_TYPE[type], scopes: ext.scopes, codeSyntax: ext.codeSyntax, description: t.token.$description ?? '', values: {} };
    if (ext.collection === 'Primitives') entry.values.Default = value(t, t.token.$value, 'dark');
    else if (ext.collection === 'Semantic') {
      entry.values.Dark = value(t, t.token.$value, 'dark');
      entry.values.Light = value(t, modeValue(t, 'light'), 'light');
    } else {
      entry.values.Comfortable = value(t, t.token.$value, 'dark');
      entry.values.Compact = value(t, compactValue(t) ?? t.token.$value, 'dark', 'compact');
    }
    col.variables.push(entry);
  }
  writeFileSync(join(dist, 'figma', 'variables.json'), JSON.stringify({ $doc: 'collection → modes → variables[name,type,scopes,codeSyntax,description,values{mode: literal | {alias: "Collection/name"}}]', collections }, null, 2));

  // ---- styles
  const parseColor = (s) => {
    s = s.trim();
    let m = /^#([0-9a-f]{6})$/i.exec(s);
    if (m) return { r: parseInt(m[1].slice(0, 2), 16) / 255, g: parseInt(m[1].slice(2, 4), 16) / 255, b: parseInt(m[1].slice(4, 6), 16) / 255, a: 1 };
    m = /^#([0-9a-f]{3})$/i.exec(s);
    if (m) return { r: parseInt(m[1][0] + m[1][0], 16) / 255, g: parseInt(m[1][1] + m[1][1], 16) / 255, b: parseInt(m[1][2] + m[1][2], 16) / 255, a: 1 };
    m = /^rgba?\(([^)]+)\)$/.exec(s);
    if (m) {
      const [r, g, b, a = 1] = m[1].split(',').map(Number);
      return { r: r / 255, g: g / 255, b: b / 255, a };
    }
    throw new Error('color ' + s);
  };
  const splitTop = (s) => {
    const out = [];
    let depth = 0, cur = '';
    for (const ch of s) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
    }
    out.push(cur.trim());
    return out;
  };
  const parseGradient = (css) => {
    const inner = css.slice(css.indexOf('(') + 1, css.lastIndexOf(')'));
    const [first, ...rest] = splitTop(inner);
    const angle = /deg$/.test(first) ? parseFloat(first) : 180;
    const stopsRaw = /deg$/.test(first) ? rest : [first, ...rest];
    const stops = stopsRaw.map((s, i) => {
      const m = /^(.*?)(?:\s+([\d.]+)%)?$/.exec(s);
      return { color: parseColor(m[1]), position: m[2] !== undefined ? +m[2] / 100 : i / (stopsRaw.length - 1) };
    });
    return { type: 'GRADIENT_LINEAR', cssAngleDeg: angle, stops };
  };
  const parseShadow = (css) =>
    splitTop(css).map((layer) => {
      const inset = /\binset\b/.test(layer);
      const rest = layer.replace(/\binset\b/, '').trim();
      const colorMatch = /(rgba?\([^)]+\)|#[0-9a-f]{3,6})\s*$/i.exec(rest);
      const nums = rest.slice(0, colorMatch.index).trim().split(/\s+/).map(toFloat);
      return { type: inset ? 'INNER_SHADOW' : 'DROP_SHADOW', x: nums[0], y: nums[1], blur: nums[2] ?? 0, spread: nums[3] ?? 0, color: parseColor(colorMatch[1]) };
    });

  const styles = { $doc: 'paintStyles/effectStyles/textStyles; one paint/effect style per mode', paintStyles: [], effectStyles: [], textStyles: [] };
  for (const t of sem) {
    const ft = t.token.$extensions?.figmaType;
    if (!ft) continue;
    for (const mode of ['dark', 'light']) {
      const css = resolve(modeValue(t, mode), mode);
      const name = `${t.path.replace(/^semantic\./, '').split('.').join('/')}/${mode === 'dark' ? 'Dark' : 'Light'}`;
      if (ft === 'paintStyle') styles.paintStyles.push({ name, mode, codeSyntax: t.token.$extensions['com.figma'].codeSyntax, paint: parseGradient(css) });
      if (ft === 'effectStyle') styles.effectStyles.push({ name, mode, codeSyntax: t.token.$extensions['com.figma'].codeSyntax, layers: parseShadow(css) });
    }
  }
  styles.effectStyles.push({ name: 'blur/glass', mode: 'both', layers: [{ type: 'BACKGROUND_BLUR', radius: 24 }], note: 'saturate(140%) is code-only' });
  for (const t of type) {
    const v = t.token.$value;
    const styleName = { 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold' }[v.fontWeight];
    styles.textStyles.push({
      name: t.path.replace(/^semantic\./, '').split('.').join('/'),
      fontFamily: v.fontFamily,
      fontStyle: styleName,
      fontSize: toFloat(v.fontSize),
      lineHeight: toFloat(v.lineHeight),
      letterSpacingPercent: v.letterSpacing.endsWith('em') ? parseFloat(v.letterSpacing) * 100 : 0,
      boundVariables: { fontSize: `Primitives/font-size/${String(toFloat(v.fontSize)).replace('.', '_')}` },
      features: ['tnum'],
    });
  }
  writeFileSync(join(dist, 'figma', 'styles.json'), JSON.stringify(styles, null, 2));
  console.log(`figma: ${Object.values(collections).reduce((n, c) => n + c.variables.length, 0)} variables, ${styles.paintStyles.length} paint, ${styles.effectStyles.length} effect, ${styles.textStyles.length} text styles`);
}

// ------------------------------------------------------------------ sync into the library's generated folder
import { copyFileSync } from 'node:fs';
const libGen = join(root, '..', 'davinci-ai', 'src', 'generated');
mkdirSync(libGen, { recursive: true });
for (const f of ['tokens.css', 'tailwind-theme.css', 'tailwind-theme.internal.css', 'tailwind-utilities.internal.css', 'tokens.ts', 'tokens.json', 'tokens.resolved.json']) copyFileSync(join(dist, f), join(libGen, f));
if (process.argv.includes('--figma')) {
  mkdirSync(join(root, '..', '..', 'dist', 'figma'), { recursive: true });
  for (const f of ['variables.json', 'styles.json']) copyFileSync(join(dist, 'figma', f), join(root, '..', '..', 'dist', 'figma', f));
}
