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
import { PRESETS, propose, RADIUS, DENSITY, brandTokens as brandTokensCore, compileTheme, validateTheme, sampleTheme } from './lib/theme-core.mjs';
import { importFigma } from './lib/figma-import.mjs';

export { PRESETS, propose, RADIUS, DENSITY };

const here = dirname(fileURLToPath(import.meta.url));
const find = (...paths) => paths.map((p) => join(here, p)).find(existsSync);
const resolvedTokens = find('../dist/tokens.resolved.json', '../src/generated/tokens.resolved.json');
const libraryVariables = find('../dist/figma/variables.json', '../../../dist/figma/variables.json');
const loadResolved = () => {
  if (!resolvedTokens) throw new Error('tokens.resolved.json not found – run `pnpm build` first');
  return JSON.parse(readFileSync(resolvedTokens, 'utf8'));
};

/** Builds the brand tokens for a base colour, enforcing the design system's contrast rules in both modes. */
export function brandTokens(hex) { return brandTokensCore(hex, loadResolved()); }

/** Legacy entry point (`{ primary, density, radius, mode }` → CSS/JSON/TS). Throws on invalid input or failed contrast. */
export function buildTheme({ primary = 'violet', density = 'medium', radius = 'balanced', mode = 'dark' }) {
  const r = compileTheme({ brand: primary, density, radius, mode }, loadResolved());
  if (!r.ok) throw new Error(r.errors.join('\n'));
  return { css: r.css, json: r.json, ts: r.ts, report: r.report };
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2); const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; out[k] = v; } else out._.push(a);
  }
  return out;
}

const HELP = `davinci theme – build a project theme

  Write a theme file, then compile it:
    davinci theme --init [--primary teal] [--out dir]      create davinci.theme.json to edit
    davinci theme --file davinci.theme.json [--out dir]    compile it to davinci.theme.css (+ .ts)
    davinci theme --validate davinci.theme.json            check it (contrast, unknown roles); no files written

  Start from Figma:
    davinci theme --from-figma variables.json [--out dir]  import a Figma variables export into davinci.theme.json

  Quick start without a file:
    davinci theme [--primary violet|teal|…|#hex] [--density small|medium|large] [--radius sharp|balanced|soft]
                  [--mode dark|light|system] [--describe "calm teal fintech, rounded"] [--out dir] [--yes]`;

const readJson = (file) => {
  try { return JSON.parse(readFileSync(resolve(file), 'utf8')); }
  catch (e) { console.error(`✗ Cannot read ${file}: ${e.message}`); process.exit(1); }
};
const show = (r) => {
  for (const w of r.warnings ?? []) console.warn(`! ${w}`);
  for (const e of r.errors ?? []) console.error(`✗ ${e}`);
};
const writeOut = (out, name, text) => { mkdirSync(out, { recursive: true }); writeFileSync(join(out, name), text); };

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  if (!cmd || cmd === 'help' || args.help) { console.log(HELP); return; }
  if (cmd !== 'theme') { console.error(`Unknown command "${cmd}". Try: davinci theme --help`); process.exit(1); }
  const out = resolve(typeof args.out === 'string' ? args.out : '.');

  if (args.init) {
    const brand = typeof args.primary === 'string' ? (PRESETS[args.primary] ?? args.primary) : undefined;
    writeOut(out, 'davinci.theme.json', JSON.stringify(sampleTheme(brand), null, 2) + '\n');
    console.log(`✓ Wrote davinci.theme.json to ${out}\n\nNext: edit it, then run  davinci theme --file davinci.theme.json  (see Storybook → Guides → Theming).`);
    return;
  }

  if (typeof args.validate === 'string') {
    const r = validateTheme(readJson(args.validate), loadResolved());
    show(r);
    if (!r.ok) process.exit(1);
    console.log(`✓ ${args.validate} is valid${r.report ? `. Contrast: ${JSON.stringify(r.report)}` : ''}`);
    return;
  }

  if (typeof args['from-figma'] === 'string') {
    if (!libraryVariables) { console.error('✗ figma/variables.json not found – run `pnpm build` first.'); process.exit(1); }
    const { theme, report } = importFigma(readJson(args['from-figma']), loadResolved(), JSON.parse(readFileSync(libraryVariables, 'utf8')));
    const check = validateTheme(theme, loadResolved());
    writeOut(out, 'davinci.theme.json', JSON.stringify(theme, null, 2) + '\n');
    console.log(`✓ Matched ${report.matched} variables, ${report.changed} differ from the library defaults. Wrote davinci.theme.json to ${out}`);
    for (const n of report.notes) console.log(`  note: ${n}`);
    if (report.unmatched.length) console.log(`  ${report.unmatched.length} variables did not match a DaVinci.AI role and were skipped:\n    ${report.unmatched.slice(0, 20).join('\n    ')}${report.unmatched.length > 20 ? '\n    …' : ''}`);
    show(check);
    if (!check.ok) { console.error('\nThe imported theme fails the contrast rules. Edit davinci.theme.json, or mark it unsafe, then run --validate.'); process.exit(1); }
    console.log('\nNext: davinci theme --file davinci.theme.json');
    return;
  }

  if (typeof args.file === 'string') {
    const r = compileTheme(readJson(args.file), loadResolved());
    show(r);
    if (!r.ok) process.exit(1);
    writeOut(out, 'davinci.theme.css', r.css);
    writeOut(out, 'davinci.theme.ts', r.ts);
    console.log(`✓ Wrote davinci.theme.css / .ts to ${out}${r.report ? `\n  Contrast: ${JSON.stringify(r.report)}` : ''}\n\nUse it:\n  import '@davinci-ai/react/styles.css';\n  import './davinci.theme.css';\n\nOr at runtime: <ThemeProvider themeConfig={theme}> with the JSON file.`);
    return;
  }

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
  const source = { ...sampleTheme(PRESETS[choice.primary] ?? choice.primary), radius: { $value: choice.radius }, density: { $value: choice.density }, mode: { $value: choice.mode } };
  writeOut(out, 'davinci.theme.css', theme.css);
  writeOut(out, 'davinci.theme.json', JSON.stringify(source, null, 2) + '\n');
  writeOut(out, 'davinci.theme.ts', theme.ts);
  console.log(`✓ Wrote davinci.theme.css / .json / .ts to ${out}\n  Contrast: ${JSON.stringify(theme.report)}\n\nUse it:\n  import '@davinci-ai/react/styles.css';\n  import './davinci.theme.css';\n\nThe .json is your editable theme file: change it and run  davinci theme --file davinci.theme.json.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
