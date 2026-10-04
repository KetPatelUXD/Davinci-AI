import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import tokens from '../generated/tokens.json';
import resolved from '../generated/tokens.resolved.json';
import { BUILTIN_ICONS } from '../foundations/icons/builtin';
import { color, MODES, theme } from './colors';

type Json = Record<string, unknown>;
type Tok = { $type?: string; $value: unknown; $extensions?: Record<string, Json & { collection?: string; scopes?: string[]; codeSyntax?: { WEB?: string } }> & { figmaType?: string } };
const walk = (o: Json, p: string[] = [], out: { path: string; t: Tok }[] = []) => {
  for (const [k, v] of Object.entries(o)) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && '$value' in v) out.push({ path: [...p, k].join('.'), t: v as Tok });
    else if (v && typeof v === 'object') walk(v as Json, [...p, k], out);
  }
  return out;
};
const all = walk(tokens as unknown as Json);

describe('token source (DTCG)', () => {
  it('every token carries the Figma extension: collection, scopes, codeSyntax.WEB', () => {
    const bad = all.filter(({ t }) => { const f = t.$extensions?.['com.figma'] as { collection?: string; scopes?: string[]; codeSyntax?: { WEB?: string } } | undefined; return !f?.collection || !f.scopes?.length || !f.codeSyntax?.WEB; });
    expect(bad.map((b) => b.path)).toEqual([]);
  });

  it('semantic colour tokens alias primitives (solid colours) so Figma keeps the alias chain', () => {
    const solids = all.filter(({ path, t }) => path.startsWith('semantic.') && t.$type === 'color' && !path.startsWith('semantic.data.') && !path.includes('shadow'));
    const raw = solids.filter(({ t }) => typeof t.$value === 'string' && !(t.$value as string).startsWith('{'));
    expect(raw.map((r) => r.path)).toEqual([]);
  });

  it('values Figma variables cannot hold are flagged with a figmaType', () => {
    const special = all.filter(({ t }) => ['gradient', 'shadow', 'typography'].includes(t.$type ?? ''));
    expect(special.length).toBeGreaterThan(20);
    expect(special.filter(({ t }) => !t.$extensions?.figmaType && !t.$extensions?.['com.figma']).map((s) => s.path)).toEqual([]);
    expect(all.find((a) => a.path === 'semantic.sheen.card')!.t.$extensions?.figmaType).toBe('paintStyle');
    expect(all.find((a) => a.path === 'semantic.shadow.card')!.t.$extensions?.figmaType).toBe('effectStyle');
    expect(all.find((a) => a.path === 'semantic.type.display-42')!.t.$extensions?.figmaType).toBe('textStyle');
  });

  it('primitives include the full Tailwind palette (50–950) and brand ramp', () => {
    const p = (tokens as unknown as { primitive: { color: Record<string, Record<string, { $value: string }>> } }).primitive.color;
    for (const hue of ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'brand']) {
      expect(Object.keys(p[hue]!), hue).toEqual(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']);
    }
    expect(p.graphite!['950']!.$value).toBe('#060607');
  });

  it('Graphite neutrals are pure greys (R=G=B within ±4) in both modes (surfaces)', () => {
    for (const mode of MODES) {
      const t = theme(mode);
      for (const n of ['bg', 'bg-elevated', 'surface', 'raised', 'well', 'hover', 'on', 'on-text']) {
        const c = color(t, n);
        const [r, g, b] = [c.r, c.g, c.b].map((x) => Math.round(x * 255));
        expect(Math.max(r!, g!, b!) - Math.min(r!, g!, b!), `${mode} ${n}`).toBeLessThanOrEqual(4); // spec says ±2; its own raised #1A1A1D is ±3 and hover #222226 ±4 (see DECISIONS.md)
      }
    }
  });

  it('matches the specified dark/light values', () => {
    expect(resolved.dark.bg).toBe('#060607');
    expect(resolved.dark.surface).toBe('#131315');
    expect(resolved.dark.text).toBe('#f5f5f6');
    expect(resolved.dark.focus).toBe('#a78bfa');
    expect(resolved.dark['positive-fill']).toBe('#05875f');
    expect(resolved.light.bg).toBe('#ececee');
    expect(resolved.light.on).toBe('#18181b');
    expect(resolved.light['brand-fill']).toBe('#7c3aed');
  });
});

describe('opacity rules (3.3)', () => {
  const alpha = (v: string) => {
    const m = /rgba\(([^)]+)\)/.exec(v);
    return m ? Number(m[1]!.split(',')[3] ?? 1) : 1;
  };
  const OPAQUE = ['text', 'text-secondary', 'text-muted', 'text-disabled', 'on-fill', 'on-text', 'border-strong', 'border-disabled', 'focus', 'brand', 'brand-fill', 'positive', 'positive-fill', 'negative', 'negative-fill', 'warning', 'info', 'fill-disabled', 'on'];
  for (const mode of MODES) {
    it(`text, icons, control borders, focus and disabled tokens are solid (${mode})`, () => {
      const t = theme(mode);
      expect(OPAQUE.filter((n) => alpha(t[n]!) < 1)).toEqual([]);
    });
  }
  it('translucent values exist only as named tokens (alpha primitives)', () => {
    const alphas = all.filter(({ path }) => path.startsWith('primitive.color.alpha.'));
    expect(alphas.length).toBeGreaterThan(30);
  });
});

describe('component tokens', () => {
  it('compact density maps button sm/md/lg to 24 / 32 / 40', () => {
    const c = resolved.component.compact as Record<string, string>;
    expect([c['button-height-sm'], c['button-height-md'], c['button-height-lg']]).toEqual(['24px', '32px', '40px']);
    expect(c['table-row-height']).toBe('40px');
  });
  it('comfortable matches the reference (30 / 38 / 44 / 48, rows 64)', () => {
    const c = resolved.component.comfortable as Record<string, string>;
    expect([c['button-height-sm'], c['button-height-md'], c['button-height-lg'], c['button-height-xl']]).toEqual(['30px', '38px', '44px', '48px']);
    expect(c['table-row-height']).toBe('64px');
  });
  it('nothing interactive is smaller than 24×24 (WCAG 2.5.8)', () => {
    const c = resolved.component.compact as Record<string, string>;
    for (const k of ['button-height-sm', 'icon-button-sm', 'target-min']) expect(parseInt(c[k]!)).toBeGreaterThanOrEqual(24);
  });
});

describe('icons', () => {
  it('every icon name used by the library exists in the built-in set', () => {
    const used = new Set<string>();
    const scan = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = join(d, f);
        if (statSync(p).isDirectory()) { if (!['test', 'generated'].includes(f)) scan(p); continue; }
        if (!/\.tsx?$/.test(f) || /\.(test|stories)\./.test(f) || f === 'builtin.tsx') continue;
        const src = readFileSync(p, 'utf8');
        for (const m of src.matchAll(/(?:name|icon|iconStart|iconEnd)=\{?['"]([a-z0-9-]+)['"]/g)) used.add(m[1]!);
        for (const m of src.matchAll(/icon: '([a-z0-9-]+)'/g)) used.add(m[1]!);
      }
    };
    scan(join(__dirname, '..'));
    const missing = [...used].filter((n) => !(n in BUILTIN_ICONS));
    expect(missing).toEqual([]);
  });
});
