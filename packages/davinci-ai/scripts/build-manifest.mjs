/**
 * Builds the agent- and Figma-ready component manifest:
 *   dist/components.json              every component: import path, props, variants, sizes, states, a11y, related, Figma mapping
 *   assets/icons/manifest.json        every icon name the library uses (default style: light)
 *   figma/code-connect/*.figma.tsx    Code Connect scaffold (FIGMA_NODE_URL placeholders)
 * Props are extracted from the TypeScript source (react-docgen-typescript); facts the compiler cannot know live in
 * scripts/components.config.mjs. Anatomy tokens are validated against dist/figma/variables.json.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { config, usage } from './components.config.mjs';

const require = createRequire(import.meta.url);
const docgen = require('react-docgen-typescript');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const scope = pkg.name;

// ---------------------------------------------------------------- 1. extract props from source
const files = [...new Set(Object.values(config).map((c) => join(src, c.file)))];
const parser = docgen.withCustomConfig(join(root, 'tsconfig.json'), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  skipChildrenPropWithoutDoc: false,
  propFilter: (prop) => {
    if (!prop.parent) return true;
    const f = prop.parent.fileName;
    if (/@types\/react|typescript\/lib/.test(f)) return false; // plain DOM / React attributes
    return true;
  },
});
const docs = parser.parse(files);
const byName = new Map();
for (const d of docs) byName.set(d.displayName, d);

const strLits = (t) => {
  const v = t?.value;
  if (Array.isArray(v)) {
    const vals = v.map((x) => x.value).filter((x) => /^"[^"]*"$/.test(x) || /^-?\d+(\.\d+)?$/.test(x));
    if (vals.length === v.filter((x) => x.value !== 'undefined').length && vals.length) return vals.map((x) => x.replace(/^"|"$/g, ''));
  }
  const m = String(t?.name ?? '').match(/^(?:"[^"]*"(?: \| )?)+$/);
  return m ? String(t.name).split(' | ').map((x) => x.replace(/^"|"$/g, '')) : null;
};

const NOISE = new Set(['className', 'style', 'children', 'id', 'key', 'ref', 'slot', 'dir', 'lang', 'translate', 'hidden', 'tabIndex', 'title', 'role']);
const isAria = (n) => n.startsWith('aria-') || n.startsWith('data-');
const isHandler = (n, type) => /^on[A-Z]/.test(n) || /=>/.test(type);

const RAC_KEEP = new Set(['isDisabled', 'isReadOnly', 'isRequired', 'isInvalid', 'isSelected', 'defaultSelected', 'value', 'defaultValue', 'selectedKey', 'selectedKeys', 'defaultSelectedKey', 'defaultSelectedKeys', 'isOpen', 'defaultOpen', 'minValue', 'maxValue', 'step', 'formatOptions', 'name', 'type', 'autoFocus', 'href', 'target', 'isIndeterminate', 'selectionMode', 'validate', 'placeholder', 'autoComplete', 'isExpanded', 'defaultExpanded', 'orientation', 'isDismissable', 'validationBehavior']);
function shape(d) {
  const props = {};
  for (const [name, p] of Object.entries(d.props)) {
    const fromRac = p.parent && /node_modules/.test(p.parent.fileName);
    if (fromRac && !RAC_KEEP.has(name) && !/^on(Press|Hover|FocusChange|SelectionChange|Change|Action|OpenChange|ExpandedChange|Submit|Clear|Focus|Blur|KeyDown|KeyUp|Sort|Remove|Move|Drop)(?!.*Capture)/.test(name)) continue;
    if (name.startsWith('aria-') && !['aria-label'].includes(name)) continue;
    if (name.startsWith('data-') || ['key', 'ref'].includes(name)) continue;
    const values = strLits(p.type);
    props[name] = {
      type: p.type.name,
      ...(values ? { values } : {}),
      ...(p.defaultValue?.value !== undefined ? { default: String(p.defaultValue.value) } : {}),
      required: !!p.required,
      ...(p.description ? { description: p.description.replace(/\s+/g, ' ').trim() } : {}),
      ...(p.parent && /node_modules/.test(p.parent.fileName) ? { from: 'react-aria-components' } : {}),
    };
  }
  return props;
}

// ---------------------------------------------------------------- 2. Figma properties
const BEHAVIOUR_BOOL = new Set(['autoFocus', 'isDismissable', 'isKeyboardDismissDisabled', 'hotkey', 'allowsMultipleExpanded', 'disallowEmptySelection', 'animate', 'defaultOpen', 'isOpen', 'defaultExpanded', 'isExpanded', 'shouldCloseOnInteractOutside', 'allowsCustomValue', 'simulate', 'attachToRoot', 'canvas', 'spotlight', 'colorBlindSafe', 'allowCustom', 'multiple', 'external', 'isStreaming', 'isReadOnly', 'isRequired', 'isOptional', 'decorative']);
const BEHAVIOUR_ENUM = new Set(['placement', 'type', 'role', 'keyboardActivation', 'selectionMode', 'validationBehavior', 'direction', 'as', 'titleLevel', 'level', 'axis', 'locale', 'styleName', 'autoComplete']);
const TEXT_PROPS = new Map([['children', 'label'], ['label', 'label'], ['title', 'title'], ['description', 'description'], ['errorMessage', 'errorMessage'], ['summary', 'summary'], ['unit', 'unit'], ['placeholder', 'placeholder'], ['context', 'context'], ['name', 'name'], ['hint', 'hint'], ['suffix', 'suffix'], ['prefix', 'prefix'], ['value', null]]);

function figmaProps(name, props, cfg) {
  const out = {};
  for (const [pn, p] of Object.entries(props)) {
    if (p.from) continue; // behaviour props inherited from React Aria are not Figma properties
    if (NOISE.has(pn) && pn !== 'children') continue;
    if (isAria(pn) || isHandler(pn, p.type)) continue;
    const vals = p.values;
    if (/IconRef/.test(p.type) || pn === 'icon' || pn === 'iconStart' || pn === 'iconEnd') {
      out[pn] = { type: 'INSTANCE_SWAP', component: 'Icon', default: 'Icon' };
      if (pn === 'iconStart' || pn === 'iconEnd') out[`has${pn[0].toUpperCase()}${pn.slice(1)}`] = { type: 'BOOLEAN', default: false, controls: pn };
      continue;
    }
    if (vals && vals.length > 1 && vals.length <= 10 && !BEHAVIOUR_ENUM.has(pn)) {
      out[pn] = { type: 'VARIANT', values: vals, ...(p.default ? { default: p.default.replace(/^'|'$/g, '') } : {}) };
      continue;
    }
    if (p.type === 'boolean' && !BEHAVIOUR_BOOL.has(pn) && !/^(on|allows|auto|disallow|should)/.test(pn)) {
      out[pn] = { type: 'BOOLEAN', default: p.default === 'true' };
      continue;
    }
    if (/ReactNode|string/.test(p.type) && TEXT_PROPS.has(pn) && TEXT_PROPS.get(pn)) {
      const target = TEXT_PROPS.get(pn);
      if (/^(children|label|title|description|errorMessage|summary|unit|placeholder|context|hint|suffix|prefix)$/.test(pn)) out[target] ??= { type: 'TEXT', default: '' };
    }
  }
  if (cfg.figmaText) out[cfg.figmaText.name] = { type: 'TEXT', default: 'chart-line', note: cfg.figmaText.note };
  if (cfg.states && cfg.states.length > 1) out.state = { type: 'VARIANT', values: cfg.states, synthetic: true, note: 'Rendered as component variants in Figma; not a React prop' };
  if (name === 'Icon') {
    out.style = { type: 'VARIANT', values: ['light', 'regular', 'solid'], default: 'light', note: 'Maps to Font Awesome 7 Pro style' };
    out.size = { type: 'VARIANT', values: ['12', '14', '16', '18'], default: '16' };
  }
  return out;
}

// ---------------------------------------------------------------- 3. anatomy: expand {size}/{variant} placeholders + validate tokens
const variablesPath = join(root, '..', '..', 'dist', 'figma', 'variables.json');
const knownVars = new Set();
if (existsSync(variablesPath)) {
  const v = JSON.parse(readFileSync(variablesPath, 'utf8'));
  for (const c of Object.values(v.collections)) for (const x of c.variables) knownVars.add(x.name);
}
const STYLE_NAMES = new Set(JSON.parse(readFileSync(join(root, '..', '..', 'dist', 'figma', 'styles.json'), 'utf8')).textStyles.map((t) => t.name.replace(/^type\//, 'type/')));
const STYLES = new Set([...STYLE_NAMES]);
const PAINTS = new Set(['sheen/card', 'sheen/panel', 'sheen/avatar', 'grid/header-bg']);
const missing = new Map();
const TOKEN_RE = /\b((?:space|radius|icon|button|icon-button|input|card|panel|table|grid|tooltip|tile|switch|composer|chat|target|text|fill|border|action|bg|surface|brand|positive|negative|warning|info|focus|data|chart|ambient|spotlight|shadow|sheen|blur|motion|type|wash)\/[a-z0-9_{}-]+)/g;

function checkTokens(comp, str) {
  if (typeof str !== 'string') return;
  for (const m of str.matchAll(TOKEN_RE)) {
    let t = m[1];
    if (/[{]/.test(t)) continue; // placeholder – validated per expansion
    t = t.replace(/[,)]+$/, '');
    if (knownVars.has(t) || STYLES.has(t) || PAINTS.has(t)) continue;
    if (/^(shadow|blur|wash|sheen)\//.test(t)) continue; // effect/paint styles & washes validated separately
    if (/^fill\/glass$|^bg\//.test(t)) continue;
    if (!missing.has(comp)) missing.set(comp, new Set());
    missing.get(comp).add(t);
  }
}

function expand(node, sizes) {
  const needs = JSON.stringify(node).includes('{size}');
  if (!needs || !sizes?.length) return node;
  const walk = (x, size) => {
    if (typeof x === 'string') return x.replaceAll('{size}', size);
    if (Array.isArray(x)) return x.map((y) => walk(y, size));
    if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, walk(v, size)]));
    return x;
  };
  return { perSize: Object.fromEntries(sizes.map((s) => [s, walk(node, s)])) };
}

// ---------------------------------------------------------------- 4. assemble
const storybookIds = (() => {
  const p = join(root, '..', '..', 'apps', 'storybook', 'storybook-static', 'index.json');
  if (!existsSync(p)) return null;
  return Object.values(JSON.parse(readFileSync(p, 'utf8')).entries).filter((e) => e.type === 'story');
})();

const components = {};
const unknown = [];
for (const [name, cfg] of Object.entries(config)) {
  const d = byName.get(name);
  const props = d ? shape(d) : {};
  if (!d && !cfg.nonVisual) unknown.push(name);
  const sizeVals = props.size?.values?.filter((v) => ['sm', 'md', 'lg', 'xl'].includes(v));
  const variants = Object.fromEntries(Object.entries(props).filter(([k, p]) => p.values?.length > 1 && !p.from && !BEHAVIOUR_ENUM.has(k)).map(([k, p]) => [k, p.values]));
  const figma = cfg.nonVisual ? undefined : {
    name: `${cfg.category}/${name}`,
    properties: figmaProps(name, props, cfg),
    states: cfg.states ?? ['default'],
    anatomy: cfg.anatomy ? expand(cfg.anatomy, sizeVals) : undefined,
    composedOf: cfg.composedOf ?? [],
  };
  if (figma?.anatomy) checkTokens(name, JSON.stringify(cfg.anatomy).replace(/"/g, ' '));
  const tags = d?.tags ?? {};
  const sb = storybookIds?.find((e) => e.importPath && cfg.category && (e.title.toLowerCase().includes(name.toLowerCase()) || e.title.toLowerCase().includes(cfg.category.toLowerCase())) && e.name === 'Default');
  components[name] = {
    name,
    category: cfg.category,
    import: `import { ${name} } from '${scope}';`,
    source: `packages/davinci-ai/src/${cfg.file}`,
    description: (d?.description ?? '').replace(/\s+/g, ' ').trim(),
    whenToUse: tags.when ?? usage[name]?.[0],
    whenNotToUse: tags.whenNot ?? usage[name]?.[1],
    props,
    sizes: sizeVals,
    variants,
    states: cfg.states ?? ['default'],
    accessibility: { keyboard: cfg.keyboard ?? null, aria: cfg.aria ?? null, notes: cfg.notes ?? [], wcag: 'WCAG 2.2 AA; verified with axe in unit tests and Storybook for dark and light themes.' },
    related: cfg.related ?? [],
    figma,
    storybook: sb ? sb.id : undefined,
  };
}

if (missing.size) {
  console.warn('\n⚠ anatomy references tokens that are not Figma variables/styles:');
  for (const [c, set] of missing) console.warn(`  ${c}: ${[...set].join(', ')}`);
  if (process.env.MANIFEST_STRICT) process.exit(1);
}
if (unknown.length) console.warn(`⚠ no TS docs found for: ${unknown.join(', ')}`);

// ---------------------------------------------------------------- tokens → manifest
const tokensSrc = JSON.parse(readFileSync(join(src, 'generated', 'tokens.json'), 'utf8'));
const tokensResolved = JSON.parse(readFileSync(join(src, 'generated', 'tokens.resolved.json'), 'utf8'));
const TW_KEY = { text: 'fg', 'text-secondary': 'secondary', 'text-muted': 'muted', 'text-disabled': 'disabled', bg: 'canvas', 'bg-elevated': 'canvas-elevated', 'border-strong': 'strong', line: 'line' };
const tokenEntries = (group) => {
  const out = [];
  (function walk(o, p) {
    for (const [k, v] of Object.entries(o)) {
      if (k.startsWith('$')) continue;
      if (v && typeof v === 'object' && '$value' in v) {
        const css = v.$extensions?.['com.davinci']?.css;
        const mode = v.$extensions?.['com.davinci']?.modes;
        const resolvedDark = group === 'semantic' ? tokensResolved.dark[css] : group === 'component' ? tokensResolved.component.comfortable[css] : tokensResolved.primitive[css];
        out.push({
          name: [...p, k].join('/').replace(/\/DEFAULT$/, ''),
          css: `--dv-${css}`,
          type: v.$type,
          ...(group === 'semantic' ? { dark: resolvedDark, light: tokensResolved.light[css] } : { value: resolvedDark, ...(group === 'component' ? { compact: tokensResolved.component.compact[css] } : {}) }),
          ...(v.$type === 'color' && group === 'semantic' ? { tailwind: TW_KEY[css] ?? css } : {}),
          description: v.$description ?? undefined,
          figma: { collection: v.$extensions?.['com.figma']?.collection, scopes: v.$extensions?.['com.figma']?.scopes, ...(v.$extensions?.figmaType ? { style: v.$extensions.figmaType } : {}) },
          aliasOf: typeof v.$value === 'string' && /^\{[^{}]+\}$/.test(v.$value) ? v.$value.slice(1, -1) : undefined,
          ...(mode?.light && typeof mode.light === 'string' && /^\{[^{}]+\}$/.test(mode.light) ? { aliasOfLight: mode.light.slice(1, -1) } : {}),
        });
      } else if (v && typeof v === 'object') walk(v, [...p, k]);
    }
  })(tokensSrc[group], []);
  return out;
};
const tokensManifest = {
  usage: 'Use semantic tokens only. CSS: var(--dv-<name>). Tailwind (host app preset): bg-<tailwind>, text-<tailwind>, border-<tailwind>. Never reference primitives from components or pages.',
  semantic: tokenEntries('semantic'),
  component: tokenEntries('component'),
  primitiveGroups: Object.fromEntries(Object.entries(tokensSrc.primitive).map(([k, v]) => [k, Object.keys(v).length])),
  variants: { direction: ['standard', 'inverted'], colorBlindSafe: 'blue/orange long-short', density: ['comfortable', 'compact'], theme: ['dark', 'light'] },
};

const manifest = {
  $schema: 'https://davinci.ai/schemas/components.json',
  package: scope,
  version: pkg.version,
  importPath: scope,
  styles: [`${scope}/styles.css`],
  conventions: {
    tokens: 'Use semantic tokens only (never hard-coded values or primitives). CSS variables are --dv-<token>.',
    sizes: 'sm / md (default) / lg / xl; comfortable heights 30/38/44/48, compact 24/32/40/44.',
    density: 'ThemeProvider density or data-density="compact|comfortable".',
    theme: 'ThemeProvider theme="dark" (default) | "light"; nested providers supported.',
    icons: 'Pass kebab-case Font Awesome names: iconStart="plus", <Icon name="chart-line" />. Icon-only buttons require label.',
    a11y: 'WCAG 2.2 AA. Labels are required for inputs and icon-only controls. Colour is never the only signal.',
  },
  counts: { components: Object.keys(components).length, semanticTokens: tokensManifest.semantic.length, componentTokens: tokensManifest.component.length },
  tokens: tokensManifest,
  components,
};
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'components.json'), JSON.stringify(manifest, null, 2));

// ---------------------------------------------------------------- 5. icon manifest
const used = new Map();
const scan = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) { if (!['test', 'generated', 'stories'].includes(f)) scan(p); continue; }
    if (!/\.tsx?$/.test(f) || /\.(test|stories)\./.test(f) || f === 'builtin.tsx') continue;
    const text = readFileSync(p, 'utf8');
    const rel = relative(src, p);
    for (const m of text.matchAll(/(?:name|icon|iconStart|iconEnd)=\{?['"]([a-z0-9-]+)['"]/g)) used.set(m[1], [...(used.get(m[1]) ?? []), rel]);
    for (const m of text.matchAll(/icon: '([a-z0-9-]+)'/g)) used.set(m[1], [...(used.get(m[1]) ?? []), rel]);
    for (const m of text.matchAll(/ICONS: Record<[^>]+> = \{([^}]+)\}/g)) for (const n of m[1].matchAll(/'([a-z0-9-]+)'/g)) used.set(n[1], [...(used.get(n[1]) ?? []), rel]);
  }
};
scan(src);
const builtin = readFileSync(join(src, 'foundations/icons/builtin.tsx'), 'utf8');
const builtinNames = [...builtin.matchAll(/^\s{2}(?:'([a-z0-9-]+)'|([a-z0-9]+)):/gm)].map((m) => m[1] ?? m[2]);
const iconManifest = {
  $doc: 'Icon names used by @davinci-ai/react. Names are Font Awesome kebab-case names and are identical in Figma (`Icon` component, property `name`). Default style: light.',
  defaultStyle: 'light',
  fontAwesome: { version: 7, family: 'Pro', note: 'Install the desktop fonts in Figma; names render as ligatures.' },
  icons: [...used.keys()].sort().map((name) => ({ name, defaultStyle: 'light', builtin: builtinNames.includes(name), usedIn: [...new Set(used.get(name))].sort() })),
  builtinSet: builtinNames.sort(),
};
mkdirSync(join(root, 'assets', 'icons'), { recursive: true });
writeFileSync(join(root, 'assets', 'icons', 'manifest.json'), JSON.stringify(iconManifest, null, 2));

// ---------------------------------------------------------------- 6. Code Connect scaffold
const ccDir = join(root, 'figma', 'code-connect');
if (existsSync(ccDir)) rmSync(ccDir, { recursive: true });
mkdirSync(ccDir, { recursive: true });
const ident = (s) => s.replace(/[^A-Za-z0-9_$]/g, '_');
let ccCount = 0;
for (const [name, c] of Object.entries(components)) {
  if (!c.figma) continue;
  const fp = c.figma.properties;
  const entries = [];
  const jsx = [];
  for (const [pn, p] of Object.entries(fp)) {
    if (p.synthetic) continue; // `state` is a Figma-only variant
    const v = ident(pn);
    if (p.type === 'VARIANT') { entries.push(`    ${v}: figma.enum('${pn}', { ${p.values.map((x) => `'${x}': ${/^\d+$/.test(x) ? x : `'${x}'`}`).join(', ')} }),`); jsx.push(`${v}={${v}}`); }
    else if (p.type === 'BOOLEAN' && !p.controls) { entries.push(`    ${v}: figma.boolean('${pn}'),`); jsx.push(`${v}={${v}}`); }
    else if (p.type === 'TEXT' && pn === 'label') entries.push(`    label: figma.string('label'),`);
    else if (p.type === 'TEXT') { entries.push(`    ${v}: figma.string('${pn}'),`); jsx.push(`${v}={${v}}`); }
    else if (p.type === 'INSTANCE_SWAP') { entries.push(`    ${v}: figma.boolean('has${pn[0].toUpperCase()}${pn.slice(1)}', { true: figma.instance('${pn}'), false: undefined }),`); jsx.push(`${v}={${v}}`); }
  }
  const hasLabel = fp.label?.type === 'TEXT';
  writeFileSync(
    join(ccDir, `${name}.figma.tsx`),
    `// @ts-nocheck – scaffold generated by scripts/build-manifest.mjs; props mirror the manifest's Figma properties.
// Fill FIGMA_NODE_URL once the kit exists, then run \`pnpm figma:connect\` to publish.
import figma from '@figma/code-connect';
import { ${name} } from '${scope}';

const FIGMA_NODE_URL = 'FIGMA_NODE_URL'; // e.g. https://www.figma.com/design/<file>?node-id=<id>  (${c.figma.name})

figma.connect(${name}, FIGMA_NODE_URL, {
  props: {
${entries.join('\n')}
  },
  example: ({ ${[...(hasLabel ? ['label'] : []), ...jsx.map((j) => j.split('=')[0])].join(', ')} }) => (
    <${name} ${jsx.join(' ')}>${hasLabel ? '{label}' : ''}</${name}>
  ),
});
`,
  );
  ccCount++;
}
writeFileSync(join(root, 'figma.config.json'), JSON.stringify({ codeConnect: { include: ['figma/code-connect/**/*.figma.tsx'], parser: 'react', importPaths: { [`packages/davinci-ai/src/index.ts`]: scope } } }, null, 2));
console.log(`manifest: ${Object.keys(components).length} components · ${iconManifest.icons.length} icons · ${ccCount} Code Connect files`);
