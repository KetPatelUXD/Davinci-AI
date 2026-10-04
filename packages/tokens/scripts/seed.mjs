/**
 * One-off authoring helper that (re)writes `tokens.json`.
 *
 * `tokens.json` (DTCG) is the single source of truth and is committed. This script exists so the
 * ~600 entries (full Tailwind palette, alpha ramp, Figma extensions) stay consistent and are not
 * hand-typed. Edit the tables below, run `pnpm --filter @davinci-ai/tokens seed`, commit the diff.
 *
 * Conventions
 *  - `$value` is the DARK-mode (default) value; `$extensions["com.davinci"].modes.light` is light.
 *  - Semantic colours alias primitives (`{primitive.color.violet.400}`) so Figma keeps the alias chain.
 *  - `$extensions["com.davinci"].css` is the CSS custom property name (without `--dv-`).
 *  - Values Figma variables cannot hold carry `figmaType`: paintStyle | effectStyle | textStyle.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const palette = JSON.parse(readFileSync(join(here, 'tailwind-palette.json'), 'utf8'));

const out = { $description: 'DaVinci.AI design tokens (DTCG). Graphite style. Dark is default; light via modes.light.', primitive: {}, semantic: {}, component: {} };

const FIGMA_SCOPES = {
  frameFill: ['FRAME_FILL', 'SHAPE_FILL'],
  allFills: ['ALL_FILLS'],
  text: ['TEXT_FILL'],
  stroke: ['STROKE_COLOR'],
  textAndIcon: ['TEXT_FILL', 'SHAPE_FILL'],
  radius: ['CORNER_RADIUS'],
  size: ['WIDTH_HEIGHT'],
  gap: ['GAP'],
  fontSize: ['FONT_SIZE'],
  fontWeight: ['FONT_WEIGHT'],
  lineHeight: ['LINE_HEIGHT'],
  letterSpacing: ['LETTER_SPACING'],
  opacity: ['OPACITY'],
  effect: ['EFFECT_FLOAT', 'EFFECT_COLOR'],
};

function setDeep(root, path, value) {
  let o = root;
  path.forEach((k, i) => {
    if (i === path.length - 1) o[k] = value;
    else o = o[k] ??= {};
  });
}

const cssJoin = (...p) => p.join('-').replace(/\./g, '_');

/** Add a primitive token. */
function prim(path, type, value, scopes, desc) {
  const css = cssJoin('p', ...path);
  setDeep(out.primitive, path, {
    $type: type,
    $value: value,
    ...(desc ? { $description: desc } : {}),
    $extensions: {
      'com.davinci': { css },
      'com.figma': { collection: 'Primitives', scopes, codeSyntax: { WEB: `var(--dv-${css})` } },
    },
  });
}

// ---------------------------------------------------------------- primitives: colour
for (const [hue, steps] of Object.entries(palette)) {
  for (const [step, hex] of Object.entries(steps)) {
    prim(['color', hue, step], 'color', hex.toLowerCase(), FIGMA_SCOPES.allFills);
  }
}
// brand = violet
for (const [step, hex] of Object.entries(palette.violet)) {
  prim(['color', 'brand', step], 'color', hex.toLowerCase(), FIGMA_SCOPES.allFills, 'Brand ramp (violet)');
}
prim(['color', 'white'], 'color', '#ffffff', FIGMA_SCOPES.allFills);
prim(['color', 'black'], 'color', '#000000', FIGMA_SCOPES.allFills);

// Graphite: the custom DaVinci neutral ramp (pure neutral greys, no tint). Key = stop (0 white … 950 near-black).
const graphite = {
  0: '#FFFFFF', 25: '#FBFBFC', 50: '#FAFAFB', 75: '#F7F7F8', 100: '#F6F6F8', 150: '#F5F5F6', 175: '#F4F4F6',
  200: '#F2F2F4', 250: '#F1F1F3', 300: '#F0F0F2', 350: '#ECECEE', 400: '#EBEBEE', 500: '#D4D4D8',
  600: '#ABABB3', 650: '#94949C', 700: '#8A8A94', 750: '#686871', 760: '#75757D', 775: '#5A5A62', 800: '#3A3A40',
  850: '#222226', 875: '#1A1A1D', 900: '#131315', 920: '#0E0E10', 940: '#0B0B0D', 950: '#060607',
};
for (const [k, v] of Object.entries(graphite)) prim(['color', 'graphite', k], 'color', v.toLowerCase(), FIGMA_SCOPES.allFills, 'DaVinci neutral ramp');

// Signal fills that are not on the Tailwind ramp
prim(['color', 'signal', 'positive-fill'], 'color', '#05875f', FIGMA_SCOPES.allFills, 'White labels ≥4.5:1');
prim(['color', 'signal', 'positive-fill-glow'], 'color', 'rgba(5,135,95,.9)', FIGMA_SCOPES.allFills);
prim(['color', 'signal', 'negative-fill-glow'], 'color', 'rgba(219,39,119,.9)', FIGMA_SCOPES.allFills);

// Alpha ramp – key is per-mille (60 = .06). Translucency is allowed only for sheens, edges, washes, glow.
const alphaSets = {
  white: { rgb: '255,255,255', keys: [14, 20, 25, 30, 45, 50, 55, 60, 70, 75, 90, 120, 180, 250, 420, 700, 900, 950] },
  ink: { rgb: '24,24,27', keys: [20, 25, 50, 60, 70, 80, 100, 250, 400] },
  black: { rgb: '0,0,0', keys: [600, 900] },
  glass: { rgb: '18,18,20', keys: [840, 940] },
  violet400: { rgb: '167,139,250', keys: [120, 250] },
  violet600: { rgb: '124,58,237', keys: [100, 200, 80] },
  emerald400: { rgb: '52,211,153', keys: [120] },
  emerald600: { rgb: '5,150,105', keys: [100, 80] },
  rose400: { rgb: '251,113,133', keys: [120] },
  pink600: { rgb: '219,39,119', keys: [90, 80] },
  amber400: { rgb: '251,191,36', keys: [120] },
  amber600: { rgb: '217,119,6', keys: [100, 80] },
  sky400: { rgb: '56,189,248', keys: [120] },
  sky600: { rgb: '2,132,199', keys: [100, 80] },
};
for (const [name, { rgb, keys }] of Object.entries(alphaSets)) {
  for (const k of keys) prim(['color', 'alpha', name, String(k)], 'color', `rgba(${rgb},${+(k / 1000).toFixed(3)})`, FIGMA_SCOPES.allFills);
}

// ---------------------------------------------------------------- primitives: spacing / radius / type / motion
const spacing = [0, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7, 7.5, 8, 9, 9.5, 10, 11, 12, 13, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96];
for (const s of spacing) prim(['space', String(s).replace('.', '_')], 'dimension', `${s * 4}px`, [...FIGMA_SCOPES.gap, ...FIGMA_SCOPES.size]);
const radii = { none: 0, sm: 4, md: 6, lg: 8, xl: 12, '2xl': 16, '3xl': 24, full: 9999 };
for (const [k, v] of Object.entries(radii)) prim(['radius', k], 'dimension', `${v}px`, FIGMA_SCOPES.radius);
for (const s of [11, 12, 12.5, 13, 14, 15, 16, 18, 20, 24, 32, 42, 48, 64]) prim(['font-size', String(s).replace('.', '_')], 'dimension', `${s}px`, FIGMA_SCOPES.fontSize);
for (const [k, v] of Object.entries({ light: 300, regular: 400, medium: 500, semibold: 600 })) prim(['font-weight', k], 'number', v, FIGMA_SCOPES.fontWeight);
for (const [k, v] of Object.entries({ fast: 120, base: 160, slow: 200, thumb: 300, enter: 700, draw: 1600, count: 1200 })) prim(['duration', k], 'duration', `${v}ms`, ['ALL_SCOPES']);
prim(['easing', 'standard'], 'cubicBezier', [0.3, 0.7, 0.4, 1], ['ALL_SCOPES']);
prim(['easing', 'enter'], 'cubicBezier', [0.2, 0.7, 0.2, 1], ['ALL_SCOPES']);
for (const [k, v] of Object.entries({ sm: 8, md: 12, lg: 24, xl: 40 })) prim(['blur', k], 'dimension', `${v}px`, FIGMA_SCOPES.effect);

// ---------------------------------------------------------------- semantic
const g = (n) => `{primitive.color.graphite.${n}}`;
const z = (n) => `{primitive.color.zinc.${n}}`;
const c = (hue, n) => `{primitive.color.${hue}.${n}}`;
const WHITE = '{primitive.color.white}';
const al = (name, k) => `{primitive.color.alpha.${name}.${k}}`;

/** Semantic colour: figma name 'text/muted', css name 'text-muted'. */
function sem(figmaName, css, dark, light, scopes, desc, extra = {}) {
  const path = figmaName.split('/');
  const modes = light !== undefined && light !== dark ? { light } : undefined;
  setDeep(out.semantic, path, {
    $type: extra.type ?? 'color',
    $value: dark,
    $description: desc,
    $extensions: {
      'com.davinci': { css, ...(modes ? { modes } : {}) },
      'com.figma': { collection: 'Semantic', scopes, codeSyntax: { WEB: `var(--dv-${css})` } },
      ...(extra.figmaType ? { figmaType: extra.figmaType } : {}),
    },
  });
}
const F = FIGMA_SCOPES;
// canvas & surfaces
sem('bg/default', 'bg', g(950), g(350), F.frameFill, 'App canvas');
sem('bg/elevated', 'bg-elevated', g(940), g(200), F.frameFill, 'Alternate canvas');
sem('surface/default', 'surface', g(900), g(50), F.frameFill, 'Solid fallback for cards');
sem('surface/raised', 'raised', g(875), g(0), F.frameFill, 'Popovers and solid overlays');
sem('surface/well', 'well', g(920), g(250), F.frameFill, 'Sunken wells');
sem('surface/hover', 'hover', g(850), g(400), F.frameFill, 'Hover fill for quiet controls');
sem('fill/field', 'field', al('white', 45), g(300), F.frameFill, 'Input and chip fill');
sem('fill/row-hover', 'row-hover', al('white', 25), al('ink', 25), F.frameFill, 'Table row hover wash');
sem('fill/glass', 'glass', al('glass', 940), al('white', 950), F.frameFill, 'Floating glass fill (composer, toasts)');
sem('fill/glass-solid', 'glass-solid', g(875), g(0), F.frameFill, 'Glass replacement under prefers-reduced-transparency');
sem('fill/scrim', 'scrim', al('black', 600), al('ink', 400), F.frameFill, 'Modal / drawer backdrop');
sem('fill/disabled', 'fill-disabled', g(875), z(100), F.frameFill, 'Disabled control fill (solid, never faded)');
// composite sheens (paint styles in Figma)
sem('sheen/card', 'card',
  `linear-gradient(158deg, ${al('white', 75)} 0%, ${al('white', 30)} 34%, ${al('white', 14)} 100%)`,
  'linear-gradient(158deg, #FFFFFF 0%, #FBFBFC 50%, #F7F7F8 100%)',
  F.frameFill, 'Card fill gradient (lit top-left)', { type: 'gradient', figmaType: 'paintStyle' });
sem('sheen/panel', 'panel',
  `linear-gradient(170deg, ${al('white', 50)}, ${al('white', 20)})`,
  'linear-gradient(170deg, #F6F6F8, #F2F2F4)',
  F.frameFill, 'Nested panel, pill bar and table header fill', { type: 'gradient', figmaType: 'paintStyle' });
sem('sheen/avatar', 'avatar', 'linear-gradient(135deg, #E9E9EC, #9C9CA6)', 'linear-gradient(135deg, #E9E9EC, #9C9CA6)', F.frameFill, 'Initials avatar fill', { type: 'gradient', figmaType: 'paintStyle' });
sem('text/on-avatar', 'on-avatar', g(920), g(920), F.textAndIcon, 'Initials on avatar');
// borders
sem('border/line', 'line', al('white', 60), al('ink', 70), F.stroke, 'Decorative divider / inset edge (not for controls)');
sem('border/line-strong', 'line-strong', al('white', 90), al('ink', 100), F.stroke, 'Stronger decorative edge');
sem('border/strong', 'border-strong', g(760), g(700), F.stroke, 'Control border, ≥3:1 against the card');
sem('border/disabled', 'border-disabled', g(800), z(200), F.stroke, 'Disabled control border (solid)');
// selection / neutral primary
sem('action/on', 'on', g(175), z(900), F.allFills, 'Selected pill and neutral primary fill');
sem('action/on-text', 'on-text', g(920), WHITE, F.textAndIcon, 'Label on `on`');
// text
sem('text/default', 'text', g(150), z(900), F.text, 'Primary text');
sem('text/secondary', 'text-secondary', g(600), z(600), F.text, 'Secondary text');
sem('text/muted', 'text-muted', g(650), g(750), F.text, 'Muted text; ≥4.5:1 on the brightest lit card corner');
sem('text/disabled', 'text-disabled', g(775), z(400), F.text, 'Disabled text (exempt from contrast, solid)');
sem('text/on-fill', 'on-fill', WHITE, WHITE, F.textAndIcon, 'Label on any *-fill colour');
// focus
sem('focus/ring', 'focus', c('violet', 400), c('violet', 600), F.stroke, 'Focus ring (2px + 2px offset)');
sem('focus/halo', 'focus-halo', al('violet400', 250), al('violet600', 200), F.stroke, 'Soft halo on focused fields');
// brand
sem('brand/default', 'brand', c('violet', 400), c('violet', 700), F.textAndIcon, 'Brand accent: focus, LEO, links');
sem('brand/fill', 'brand-fill', c('violet', 600), c('violet', 600), F.allFills, 'Brand button fill');
sem('brand/wash', 'wash-brand', al('violet400', 120), al('violet600', 80), F.frameFill, 'Brand wash');
// status sets: text / fill / wash
sem('positive/default', 'positive', c('emerald', 400), c('emerald', 800), F.textAndIcon, 'Long / up / success text and icon');
sem('positive/fill', 'positive-fill', '{primitive.color.signal.positive-fill}', '{primitive.color.signal.positive-fill}', F.allFills, 'Buy / long button fill');
sem('positive/wash', 'wash-positive', al('emerald400', 120), al('emerald600', 80), F.frameFill, 'Positive wash (price flash, delta pill)');
sem('negative/default', 'negative', c('rose', 400), c('pink', 700), F.textAndIcon, 'Short / down / error text and icon');
sem('negative/fill', 'negative-fill', c('pink', 600), c('pink', 600), F.allFills, 'Sell / short / destructive fill');
sem('negative/wash', 'wash-negative', al('rose400', 120), al('pink600', 80), F.frameFill, 'Negative wash');
sem('warning/default', 'warning', c('amber', 400), c('amber', 800), F.textAndIcon, 'Warning text and icon');
sem('warning/fill', 'warning-fill', c('amber', 700), c('amber', 700), F.allFills, 'Warning fill');
sem('warning/wash', 'wash-warning', al('amber400', 120), al('amber600', 80), F.frameFill, 'Warning wash');
sem('info/default', 'info', c('sky', 400), c('sky', 700), F.textAndIcon, 'Info text and icon');
sem('info/fill', 'info-fill', c('sky', 700), c('sky', 700), F.allFills, 'Info fill');
sem('info/wash', 'wash-info', al('sky400', 120), al('sky600', 80), F.frameFill, 'Info wash');
// colour-blind-safe variants (blue/orange). Inverted (red-up) is derived by swapping positive/negative.
const cvd = {
  positive: [c('sky', 400), c('sky', 700)], 'positive-fill': [c('sky', 700), c('sky', 700)], 'wash-positive': [al('sky400', 120), al('sky600', 80)],
  negative: [c('orange', 400), c('orange', 800)], 'negative-fill': [c('orange', 700), c('orange', 700)], 'wash-negative': [al('amber400', 120), al('amber600', 80)],
};
for (const [css, [d, l]] of Object.entries(cvd)) {
  const t = Object.values(out.semantic).flatMap((g) => Object.values(g)).find((x) => x.$extensions?.['com.davinci']?.css === css);
  t.$extensions['com.davinci'].variants = { cvd: { dark: d, light: l } };
}
// data viz
sem('data/1', 'data-1', '#22a3b8', '#0e7c8e', F.allFills, 'Categorical 1 (teal)');
sem('data/2', 'data-2', '#f5873a', '#d2610f', F.allFills, 'Categorical 2 (orange)');
sem('data/3', 'data-3', g(800), z(300), F.allFills, 'Categorical 3 / track (grey)');
sem('data/4', 'data-4', c('violet', 400), c('violet', 600), F.allFills, 'Categorical 4');
sem('data/5', 'data-5', c('amber', 300), c('amber', 700), F.allFills, 'Categorical 5');
sem('data/6', 'data-6', g(650), z(500), F.allFills, 'Categorical 6');
sem('chart/line', 'chart-line', WHITE, z(900), F.allFills, 'Monochrome chart line and markers');
sem('chart/band', 'chart-band', al('white', 70), al('ink', 50), F.frameFill, 'Highlight band');
sem('chart/grid', 'chart-grid', al('white', 50), al('ink', 60), F.stroke, 'Dashed grid');
sem('chart/dots', 'chart-dots', al('white', 70), al('ink', 80), F.frameFill, 'Dot-grid canvas');
// ambient & spotlight
sem('ambient/glow', 'ambient-glow', al('white', 70), al('white', 900), F.frameFill, 'Top-left ambient glow');
sem('ambient/beam', 'ambient-beam', al('white', 55), al('white', 700), F.frameFill, 'Diagonal ambient beam');
sem('spotlight/edge', 'spotlight-edge', al('white', 420), al('ink', 250), F.stroke, 'Cursor-lit card edge');
sem('spotlight/fill', 'spotlight-fill', al('white', 30), al('ink', 20), F.frameFill, 'Cursor-lit inner glow');
// shadows (effect styles)
const shadow = (name, css, dark, light, desc) => sem(`shadow/${name}`, css, dark, light, F.effect, desc, { type: 'shadow', figmaType: 'effectStyle' });
shadow('card', 'shadow-card', `0 40px 80px -30px rgba(0,0,0,.9), inset 0 1px 0 ${al('white', 60)}`, '0 30px 60px -30px rgba(24,24,27,.25), inset 0 1px 0 #FFFFFF', 'Card elevation');
shadow('glass', 'shadow-glass', '0 30px 60px -20px rgba(0,0,0,.9)', '0 30px 60px -24px rgba(24,24,27,.35)', 'Floating glass elevation');
shadow('pop', 'shadow-pop', '0 24px 48px -16px rgba(0,0,0,.8)', '0 24px 48px -16px rgba(24,24,27,.3)', 'Popover / menu elevation');
shadow('tip', 'shadow-tip', '0 12px 30px -10px rgba(0,0,0,.6)', '0 12px 30px -10px rgba(24,24,27,.4)', 'Tooltip elevation');
shadow('on', 'shadow-on', '0 10px 30px -10px rgba(255,255,255,.25)', '0 10px 24px -10px rgba(0,0,0,.4)', 'Primary neutral pill glow');
shadow('thumb', 'shadow-thumb', '0 6px 20px -6px rgba(0,0,0,.6)', '0 6px 20px -6px rgba(24,24,27,.4)', 'Selected nav pill lift');
shadow('positive-glow', 'shadow-positive', `inset 0 1px 0 ${al('white', 180)}, 0 14px 34px -14px {primitive.color.signal.positive-fill-glow}`, `inset 0 1px 0 ${al('white', 180)}, 0 14px 34px -14px {primitive.color.signal.positive-fill-glow}`, 'Buy button glow');
shadow('negative-glow', 'shadow-negative', `inset 0 1px 0 ${al('white', 180)}, 0 14px 34px -14px {primitive.color.signal.negative-fill-glow}`, `inset 0 1px 0 ${al('white', 180)}, 0 14px 34px -14px {primitive.color.signal.negative-fill-glow}`, 'Sell button glow');
shadow('inset-line', 'inset-line', `inset 0 0 0 1px ${al('white', 60)}`, `inset 0 0 0 1px ${al('ink', 70)}`, 'Hairline inset edge');
shadow('inset-line-strong', 'inset-line-strong', `inset 0 0 0 1px ${al('white', 90)}`, `inset 0 0 0 1px ${al('ink', 100)}`, 'Strong hairline inset edge');

// radius / blur semantic (aliases to primitives where an exact step exists, else raw)
function semNum(figmaName, css, value, scopes, desc, type = 'dimension') {
  setDeep(out.semantic, figmaName.split('/'), {
    $type: type, $value: value, $description: desc,
    $extensions: { 'com.davinci': { css }, 'com.figma': { collection: 'Semantic', scopes, codeSyntax: { WEB: `var(--dv-${css})` } } },
  });
}
semNum('radius/pill', 'radius-pill', '{primitive.radius.full}', F.radius, 'Buttons, tabs, chips, switches, avatars');
semNum('radius/card', 'radius-card', '26px', F.radius, 'Cards, dialogs');
semNum('radius/composer', 'radius-composer', '26px', F.radius, 'Ask LEO composer');
semNum('radius/panel', 'radius-panel', '20px', F.radius, 'Nested panels');
semNum('radius/tile', 'radius-tile', '{primitive.radius.2xl}', F.radius, 'Accent tiles');
semNum('radius/control', 'radius-control', '14px', F.radius, 'Inputs and selects');
semNum('radius/menu', 'radius-menu', '{primitive.radius.2xl}', F.radius, 'Menus and popovers');
semNum('radius/tooltip', 'radius-tooltip', '{primitive.radius.xl}', F.radius, 'Tooltips');
semNum('radius/code', 'radius-code', '7px', F.radius, 'Inline code chips');
semNum('blur/glass', 'blur-glass', '24px', F.effect, 'Glass backdrop blur', 'dimension');
semNum('motion/fast', 'dur-fast', '{primitive.duration.fast}', ['ALL_SCOPES'], 'Press / hover', 'duration');
semNum('motion/base', 'dur-base', '{primitive.duration.base}', ['ALL_SCOPES'], 'Popover, menu', 'duration');
semNum('motion/slow', 'dur-slow', '{primitive.duration.slow}', ['ALL_SCOPES'], 'Drawer, dialog', 'duration');
semNum('motion/thumb', 'dur-thumb', '{primitive.duration.thumb}', ['ALL_SCOPES'], 'Segmented thumb', 'duration');
semNum('motion/easing', 'ease', '{primitive.easing.standard}', ['ALL_SCOPES'], 'Standard easing', 'cubicBezier');

// ---------------------------------------------------------------- component tokens
function comp(name, css, comfortable, compact, scopes, desc, type = 'dimension') {
  setDeep(out.component, name.split('/'), {
    $type: type, $value: comfortable, $description: desc,
    $extensions: {
      'com.davinci': { css, ...(compact !== undefined && compact !== comfortable ? { density: { compact } } : {}) },
      'com.figma': { collection: 'Component', scopes, codeSyntax: { WEB: `var(--dv-${css})` } },
    },
  });
}
const sizes = ['sm', 'md', 'lg', 'xl'];
const H = { comfortable: [30, 38, 44, 48], compact: [24, 32, 40, 44] };
const PX = { comfortable: [12, 16, 18, 24], compact: [8, 12, 16, 20] };
const FS = [12, 12.5, 14, 14];
const IC = [14, 16, 16, 18];
const GP = [6, 8, 8, 8];
const ICB = { comfortable: [30, 38, 42, 42], compact: [24, 32, 36, 36] };
const IH = { comfortable: [36, 44, 48, 48], compact: [30, 36, 40, 40] };
sizes.forEach((s, i) => {
  comp(`button/height-${s}`, `button-height-${s}`, `${H.comfortable[i]}px`, `${H.compact[i]}px`, F.size, `Button / select / segmented height ${s}`);
  comp(`button/padding-x-${s}`, `button-px-${s}`, `${PX.comfortable[i]}px`, `${PX.compact[i]}px`, F.gap, `Button horizontal padding ${s}`);
  comp(`button/font-size-${s}`, `button-font-${s}`, `${FS[i]}px`, undefined, F.fontSize, `Button font size ${s}`);
  comp(`button/icon-size-${s}`, `button-icon-${s}`, `${IC[i]}px`, undefined, F.size, `Button icon size ${s}`);
  comp(`button/icon-gap-${s}`, `button-gap-${s}`, `${GP[i]}px`, undefined, F.gap, `Button icon gap ${s}`);
  comp(`icon-button/size-${s}`, `icon-button-${s}`, `${ICB.comfortable[i]}px`, `${ICB.compact[i]}px`, F.size, `Circle icon button ${s}`);
  comp(`input/height-${s}`, `input-height-${s}`, `${IH.comfortable[i]}px`, `${IH.compact[i]}px`, F.size, `Text input height ${s}`);
});
comp('input/padding-x', 'input-px', '16px', '12px', F.gap, 'Input horizontal padding');
comp('input/font-size', 'input-font', '14px', '13px', F.fontSize, 'Input font size');
comp('switch/width', 'switch-width', '46px', undefined, F.size, 'Switch track width');
comp('switch/height', 'switch-height', '26px', undefined, F.size, 'Switch track height');
comp('switch/thumb', 'switch-thumb', '20px', undefined, F.size, 'Switch thumb');
comp('card/padding-x', 'card-px', '24px', '16px', F.gap, 'Card padding X');
comp('card/padding-y', 'card-py', '22px', '14px', F.gap, 'Card padding Y');
comp('panel/padding', 'panel-p', '16px', '12px', F.gap, 'Panel padding');
comp('table/row-height', 'table-row-height', '64px', '40px', F.size, 'Table body row height');
comp('grid/header-bg', 'grid-header-bg', '{semantic.sheen.panel}', undefined, F.frameFill, 'Grid header fill (aliases panel)', 'gradient');
comp('grid/row-hover', 'grid-row-hover', '{semantic.fill.row-hover}', undefined, F.frameFill, 'Grid row hover', 'color');
comp('grid/border', 'grid-border', '{semantic.border.line}', undefined, F.stroke, 'Grid row divider', 'color');
comp('grid/cell-padding-x', 'grid-cell-padding-x', '14px', '10px', F.gap, 'Grid cell padding X');
comp('grid/cell-padding-y', 'grid-cell-padding-y', '14px', '6px', F.gap, 'Grid cell padding Y');
comp('grid/font-size', 'grid-font-size', '13px', '12px', F.fontSize, 'Grid font size');
comp('tooltip/padding-x', 'tooltip-px', '12px', undefined, F.gap, 'Tooltip padding X');
comp('tooltip/padding-y', 'tooltip-py', '8px', undefined, F.gap, 'Tooltip padding Y');
comp('composer/max-width', 'composer-max-width', '720px', undefined, F.size, 'Composer max width');
comp('chat/column-width', 'chat-column', '720px', undefined, F.size, 'Readable chat column');
comp('tile/accent-width', 'tile-accent', '3px', undefined, F.size, 'AccentTile bar width');
comp('target/min', 'target-min', '24px', undefined, F.size, 'WCAG 2.5.8 minimum target');
// density-independent icon sizes used by the Figma `Icon` component
for (const n of [12, 14, 16, 18]) comp(`icon/size-${n}`, `icon-${n}`, `${n}px`, undefined, F.size, `Icon ${n}`);

// ---------------------------------------------------------------- typography (text styles)
const type = (name, size, lh, weight, ls, desc, fam = 'Inter') => {
  setDeep(out.semantic, ['type', ...name.split('/')], {
    $type: 'typography',
    $value: { fontFamily: fam, fontSize: `${size}px`, lineHeight: `${lh}px`, fontWeight: weight, letterSpacing: ls },
    $description: desc,
    $extensions: {
      'com.davinci': { css: `type-${name.replace('/', '-')}` },
      'com.figma': { collection: 'Semantic', scopes: F.fontSize, codeSyntax: { WEB: `var(--dv-type-${name.replace('/', '-')}-size)` } },
      figmaType: 'textStyle',
    },
  });
};
type('overline', 11, 16, 500, '0.04em', 'Overline');
type('small', 12, 16, 400, '0', 'Small / captions / table headers');
type('small-medium', 12, 16, 500, '0', 'Small medium');
type('base', 13, 19, 400, '0', 'Dense base');
type('base-medium', 13, 19, 500, '0', 'Dense base medium');
type('comfortable', 14, 20, 400, '0', 'Comfortable / sparse forms');
type('comfortable-medium', 14, 20, 500, '0', 'Comfortable medium');
type('card-title', 16, 23, 400, '-0.005em', 'Quiet card title');
type('body-lg', 16, 24, 400, '0', 'Large body');
type('section', 15, 22, 600, '0', 'Section heading');
type('title', 20, 29, 600, '-0.01em', 'Page title');
type('heading-24', 24, 32, 600, '-0.01em', 'Heading 24');
type('heading-32', 32, 40, 600, '-0.02em', 'Heading 32');
type('display-42', 42, 42, 300, '-0.035em', 'Display numerals (KPI)');
type('display-48', 48, 48, 300, '-0.035em', 'Display numerals (donut centre)');
type('display-64', 64, 64, 300, '-0.035em', 'Display numerals (hero price)');
type('mono', 13, 19, 500, '0', 'Tabular figures', 'Inter');

writeFileSync(join(here, '..', 'tokens.json'), JSON.stringify(out, null, 2) + '\n');
console.log('tokens.json written');
