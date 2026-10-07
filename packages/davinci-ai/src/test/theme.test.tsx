import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { importFigma } from '../../bin/lib/figma-import.mjs';
import { compileTheme as compileCore, themeSchema, validateTheme as validateCore } from '../../bin/lib/theme-core.mjs';
import { Button, ThemeProvider, compileTheme, validateTheme, type ThemeConfig } from '../index';
import { tokens } from '../generated/tokens';

const root = join(__dirname, '..', '..');
const sample = (n: string) => JSON.parse(readFileSync(join(root, 'assets', 'themes', `${n}.theme.json`), 'utf8')) as ThemeConfig;
const library = JSON.parse(readFileSync(join(root, '..', '..', 'dist', 'figma', 'variables.json'), 'utf8'));
const resolved = tokens as never;
/* eslint-disable @typescript-eslint/no-explicit-any */
const imp = (json: unknown): { theme: any; report: any } => importFigma(json, resolved, library) as never;

describe('theme file', () => {
  it('ships valid sample themes', () => {
    for (const n of ['teal', 'sky', 'amber']) {
      const r = validateTheme(sample(n));
      expect(r.errors, n).toEqual([]);
      expect(r.ok, n).toBe(true);
    }
  });

  it('compiles deterministically and scopes selectors', () => {
    const a = compileTheme(sample('teal')), b = compileTheme(sample('teal'));
    expect(a.css).toBe(b.css);
    expect(a.id).toBe(b.id);
    expect(a.css).toContain("[data-theme='dark']");
    const scoped = compileTheme(sample('teal'), { scope: "[data-dv-theme='x']" });
    expect(scoped.css).toContain("[data-dv-theme='x'][data-theme='dark']");
    expect(scoped.css).not.toMatch(/^:root/m);
  });

  it('accepts plain values as well as $value wrappers', () => {
    const a = compileTheme({ brand: 'teal', radius: 'soft' } as ThemeConfig);
    const b = compileTheme({ brand: { $value: 'teal' }, radius: { $value: 'soft' } });
    expect(a.css).toBe(b.css);
  });

  it('rejects unknown roles, bad colours, bad fonts and unknown presets', () => {
    expect(compileTheme({ color: { dark: { nope: { $value: '#fff' } } } }).errors.join()).toMatch(/unknown role/);
    expect(compileTheme({ color: { dark: { bg: { $value: 'not-a-colour' } } } }).errors.join()).toMatch(/not a hex or rgb/);
    expect(() => compileTheme({ font: { sans: { $value: 'x; } body { display:none' } } })).toThrow(/font\.sans/);
    expect(() => compileTheme({ brand: 'chartreuse-ish' })).toThrow(/Unknown primary colour/);
  });

  it('blocks overrides that break contrast unless marked unsafe', () => {
    const bad: ThemeConfig = { color: { dark: { text: { $value: '#222222' } } } };
    const r = compileTheme(bad);
    expect(r.ok).toBe(false);
    expect(r.errors.join()).toMatch(/"text" on "bg"/);
    const allowed = compileTheme({ ...bad, $extensions: { davinci: { unsafe: true } } });
    expect(allowed.ok).toBe(true);
    expect(allowed.warnings.length).toBeGreaterThan(0);
  });

  it('overrides single radii and component sizes per density', () => {
    const r = compileTheme({ radius: { $value: 'soft', card: { $value: 24 } }, size: { comfortable: { 'button-height-md': 44, 'card-px': '28px' }, compact: { 'button-height-md': 30 } } });
    expect(r.errors).toEqual([]);
    expect(r.css).toContain('--dv-radius-card: 24px');
    expect(r.css).toContain('--dv-radius-control: 18px'); // preset still applies to the other radii
    expect(r.css).toMatch(/\[data-density='comfortable'\] \{[^}]*--dv-button-height-md: 44px[^}]*--dv-card-px: 28px/);
    expect(r.css).toMatch(/\[data-density='compact'\] \{[^}]*--dv-button-height-md: 30px/);
    const scoped = compileTheme({ size: { compact: { 'button-height-md': 30 } } }, { scope: "[data-dv-theme='x']" });
    expect(scoped.css).toContain("[data-dv-theme='x'][data-density='compact']");
  });

  it('rejects unknown radii/sizes, bad lengths and targets below the minimum size', () => {
    expect(compileTheme({ radius: { nope: { $value: 4 } } }).errors.join()).toMatch(/radius\.nope/);
    expect(compileTheme({ size: { comfortable: { nope: 4 } } }).errors.join()).toMatch(/size\.comfortable\.nope/);
    expect(compileTheme({ radius: { card: { $value: 'big' } } }).errors.join()).toMatch(/not a length/);
    const small = compileTheme({ size: { comfortable: { 'button-height-sm': 16 } } });
    expect(small.ok).toBe(false);
    expect(small.errors.join()).toMatch(/at least 24px/);
    expect(compileTheme({ size: { comfortable: { 'button-height-sm': 16 } }, $extensions: { davinci: { unsafe: true } } }).ok).toBe(true);
  });

  it('derives brand tokens that meet contrast for awkward colours', () => {
    for (const hex of ['#ffff00', '#f5f5f5', '#111111', '#00ff00']) expect(compileTheme({ brand: hex }).ok, hex).toBe(true);
  });

  it('writes a JSON schema listing every colour role', () => {
    const s = themeSchema(resolved) as { properties: { color: { properties: { dark: { properties: Record<string, unknown> } } } } };
    expect(Object.keys(s.properties.color.properties.dark.properties)).toEqual(expect.arrayContaining(['bg', 'text', 'brand-fill', 'positive']));
  });

  it('browser and CLI entry points give the same CSS', () => {
    expect(compileTheme(sample('sky')).css).toBe(compileCore(sample('sky'), resolved).css);
    expect(validateTheme(sample('sky')).ok).toBe(validateCore(sample('sky'), resolved).ok);
  });
});

describe('import from Figma', () => {
  it('round trip: the library\'s own variables produce an empty override theme', () => {
    const { theme, report } = imp(library);
    expect(report.matched).toBeGreaterThan(100);
    expect(report.changed).toBe(0);
    expect(theme.color).toEqual({ dark: {}, light: {} });
    expect(theme.size).toBeUndefined();
    expect(Object.keys(theme.radius)).toEqual(['$value']);
    expect(validateTheme(theme).ok).toBe(true);
  });

  it('keeps only differing values and reports unmatched variables', () => {
    const edited = JSON.parse(JSON.stringify(library));
    const sem = edited.collections.Semantic;
    const bg = sem.variables.find((v: { name: string }) => v.name === 'bg/default');
    bg.values.Dark = '#05080c';
    edited.collections.Semantic.variables.push({ name: 'mystery/colour', type: 'COLOR', values: { Dark: '#ff0000', Light: '#ff0000' } });
    const { theme, report } = imp(edited);
    expect(theme.color.dark.bg.$value).toBe('#05080c');
    expect(Object.keys(theme.color.dark)).toEqual(['bg']);
    expect(report.unmatched).toContain('mystery/colour');
    expect(validateTheme(theme).ok).toBe(true);
  });

  it('turns a changed brand/fill into a brand seed and derives the rest', () => {
    const edited = JSON.parse(JSON.stringify(library));
    for (const v of edited.collections.Semantic.variables) if (v.name === 'brand/fill') v.values = { Dark: '#0f766e', Light: '#0f766e' };
    const { theme, report } = importFromEdited(edited);
    expect((theme.brand as { $value: string }).$value).toBe('#0f766e');
    expect(theme.color.dark['brand-fill']).toBeUndefined();
    expect(report.notes.join()).toMatch(/Brand seed/);
  });

  it('imports radii and sizes that differ from the defaults', () => {
    const edited = JSON.parse(JSON.stringify(library));
    for (const v of edited.collections.Semantic.variables) if (v.name === 'radius/card') v.values = { Dark: 24, Light: 24 };
    for (const v of edited.collections.Component.variables) if (v.name === 'button/height-md') v.values = { Comfortable: 44, Compact: 30 };
    const { theme, report } = imp(edited);
    expect(theme.radius.card.$value).toBe('24px');
    expect(Object.keys(theme.radius).filter((k: string) => !k.startsWith('$'))).toEqual(['card']);
    expect(theme.size.comfortable['button-height-md'].$value).toBe('44px');
    expect(theme.size.compact['button-height-md'].$value).toBe('30px');
    expect(report.changed).toBe(3);
    expect(validateTheme(theme).ok).toBe(true);
    expect(compileTheme(theme).css).toContain('--dv-radius-card: 24px');
  });

  it('reads Figma REST local variables', () => {
    const rest = {
      meta: {
        variableCollections: { c1: { name: 'Semantic', modes: [{ modeId: 'm1', name: 'Dark' }, { modeId: 'm2', name: 'Light' }] } },
        variables: { v1: { name: 'bg/default', resolvedType: 'COLOR', variableCollectionId: 'c1', codeSyntax: { WEB: 'var(--dv-bg)' }, valuesByMode: { m1: { r: 0.02, g: 0.03, b: 0.05, a: 1 }, m2: { r: 1, g: 1, b: 1, a: 1 } } } },
      },
    };
    const { theme } = imp(rest);
    expect(theme.color.dark.bg.$value).toBe('#05080d');
  });

  it('reads a DTCG token tree with Dark/Light files', () => {
    const dtcg = { Dark: { bg: { default: { $type: 'color', $value: '#05080c' } } }, Light: { bg: { default: { $type: 'color', $value: '#f3f5f7' } } } };
    const { theme } = imp(dtcg);
    expect(theme.color.dark.bg.$value).toBe('#05080c');
    expect(theme.color.light.bg.$value).toBe('#f3f5f7');
  });
});

function importFromEdited(edited: unknown) { return imp(edited); }

describe('ThemeProvider themeConfig', () => {
  it('renders a scoped style and a matching attribute', () => {
    const html = renderToString(<ThemeProvider themeConfig={sample('teal')}><span>x</span></ThemeProvider>);
    expect(html).toMatch(/data-dv-theme="[a-z0-9]+"/);
    expect(html).toContain('<style data-dv-theme-style=');
    expect(html).toContain('--dv-brand-fill: #0f766e');
    const id = /data-dv-theme="([a-z0-9]+)"/.exec(html)![1];
    expect(html).toContain(`[data-dv-theme='${id}'][data-theme='dark']`); // the attribute and the selector must use the same id
  });

  it('ignores an invalid file and keeps the default theme', () => {
    const err = console.error; console.error = () => {};
    try {
      const html = renderToString(<ThemeProvider themeConfig={{ color: { dark: { text: { $value: '#111111' } } } }}><span>x</span></ThemeProvider>);
      expect(html).not.toContain('data-dv-theme');
    } finally { console.error = err; }
  });

  it('writes the scope attribute to <html> with attachToRoot and cleans up', () => {
    const { unmount } = render(<ThemeProvider attachToRoot themeConfig={sample('amber')}><Button>Go</Button></ThemeProvider>);
    expect(document.documentElement.getAttribute('data-dv-theme')).toBeTruthy();
    unmount();
    expect(document.documentElement.getAttribute('data-dv-theme')).toBeNull();
  });
});
