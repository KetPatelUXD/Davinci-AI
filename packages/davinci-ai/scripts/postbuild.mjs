/** Finishes the package: stable CSS filenames, opt-in base/fonts CSS, tokens + Tailwind theme, theme CLI assets. */
import { copyFileSync, existsSync, renameSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const gen = join(root, 'src', 'generated');

if (existsSync(join(dist, 'style.css'))) renameSync(join(dist, 'style.css'), join(dist, 'styles.css'));
copyFileSync(join(root, 'src/styles/base.css'), join(dist, 'base.css'));
copyFileSync(join(root, 'src/styles/fonts.css'), join(dist, 'fonts.css'));
copyFileSync(join(gen, 'tokens.css'), join(dist, 'tokens.css'));
copyFileSync(join(gen, 'tailwind-theme.css'), join(dist, 'tailwind-theme.css'));
copyFileSync(join(gen, 'tokens.json'), join(dist, 'tokens.json'));
copyFileSync(join(gen, 'tokens.resolved.json'), join(dist, 'tokens.resolved.json'));
mkdirSync(join(dist, 'figma'), { recursive: true });
const figma = join(root, '..', '..', 'dist', 'figma');
for (const f of ['variables.json', 'styles.json']) if (existsSync(join(figma, f))) copyFileSync(join(figma, f), join(dist, 'figma', f));

// theme file schema (colour roles come from the resolved tokens, so it cannot drift)
const { themeSchema } = await import('../bin/lib/theme-core.mjs');
writeFileSync(join(dist, 'theme.schema.json'), JSON.stringify(themeSchema(JSON.parse(readFileSync(join(gen, 'tokens.resolved.json'), 'utf8'))), null, 2) + '\n');

// make `./tokens` types self-contained for consumers
writeFileSync(join(dist, 'tokens.d.ts'), `export * from './generated/tokens';\n`);

const js = readFileSync(join(dist, 'index.js'), 'utf8');
if (!/^["']use client["']/.test(js)) throw new Error("dist/index.js must start with 'use client' (Next.js App Router)");
console.log('postbuild: dist ready');
