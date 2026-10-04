import { parse, wcagContrast, formatHex8 } from 'culori';
type Rgb = { r: number; g: number; b: number; alpha?: number };
import tokens from '../generated/tokens.resolved.json';

type Mode = 'dark' | 'light';
export type Variant = 'default' | 'cvd' | 'inverted';
export interface RGBA { r: number; g: number; b: number; a: number }

const toRgba = (c: string): RGBA => {
  const p = parse(c) as Rgb | undefined;
  if (!p) throw new Error(`Cannot parse colour: ${c}`);
  return { r: p.r, g: p.g, b: p.b, a: p.alpha ?? 1 };
};

/** Alpha-composite `top` over opaque `bottom` (sRGB, like the browser). */
export const over = (top: RGBA, bottom: RGBA): RGBA => {
  const a = top.a + bottom.a * (1 - top.a);
  const ch = (t: number, b: number) => (t * top.a + b * bottom.a * (1 - top.a)) / (a || 1);
  return { r: ch(top.r, bottom.r), g: ch(top.g, bottom.g), b: ch(top.b, bottom.b), a };
};

export const contrast = (fg: RGBA, bg: RGBA): number => wcagContrast({ mode: 'rgb', r: fg.r, g: fg.g, b: fg.b }, { mode: 'rgb', r: bg.r, g: bg.g, b: bg.b });
export const hex = (c: RGBA) => formatHex8({ mode: 'rgb', r: c.r, g: c.g, b: c.b, alpha: c.a });

/** Resolved semantic tokens for a mode, including colour-blind-safe / inverted-direction overrides. */
export function theme(mode: Mode, variant: Variant = 'default'): Record<string, string> {
  const base = { ...(tokens[mode] as Record<string, string>) };
  if (variant === 'cvd') Object.assign(base, (tokens.variants.cvd as Record<Mode, Record<string, string>>)[mode]);
  if (variant === 'inverted') Object.assign(base, (tokens.variants.inverted as Record<Mode, Record<string, string>>)[mode]);
  return base;
}

export const color = (t: Record<string, string>, name: string): RGBA => toRgba(t[name]!);

/** Stops of a CSS linear-gradient string as RGBA colours. */
export function gradientStops(css: string): RGBA[] {
  const m = css.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}/gi);
  if (!m) throw new Error(`No colours in gradient: ${css}`);
  return m.map(toRgba);
}

export interface Surface { name: string; color: RGBA }

/**
 * Every surface text can sit on. `card`/`panel` gradients are composited over `bg` at **every stop** (the lit top-left
 * corner is the brightest, the bottom-right the darkest) and again with the hover spotlight fill on top.
 */
export function surfaces(t: Record<string, string>): Surface[] {
  const bg = color(t, 'bg');
  const out: Surface[] = ['bg', 'bg-elevated', 'surface', 'raised', 'hover', 'well'].map((n) => ({ name: n, color: over(color(t, n), bg) }));
  const spot = color(t, 'spotlight-fill');
  for (const g of ['card', 'panel'] as const) {
    gradientStops(t[g]!).forEach((s, i) => {
      const c = over(s, bg);
      out.push({ name: `${g}[stop ${i}]`, color: c });
      out.push({ name: `${g}[stop ${i}]+spotlight`, color: over(spot, c) });
    });
  }
  // field fill (inputs, chips) sits on card or panel
  const field = color(t, 'field');
  for (const s of out.filter((x) => x.name.startsWith('card[') || x.name === 'surface' || x.name === 'raised').slice()) {
    out.push({ name: `field on ${s.name}`, color: over(field, s.color) });
  }
  return out;
}

export const MODES: Mode[] = ['dark', 'light'];
export const VARIANTS: Variant[] = ['default', 'cvd', 'inverted'];
