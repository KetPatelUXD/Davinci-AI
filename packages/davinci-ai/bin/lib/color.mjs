/** Tiny colour toolkit (no dependencies): hex/rgba parsing, WCAG contrast, HSL tuning, alpha compositing. */
export const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));

export function parse(c) {
  c = String(c).trim();
  let m = /^#([0-9a-f]{3})$/i.exec(c);
  if (m) return { r: parseInt(m[1][0] + m[1][0], 16) / 255, g: parseInt(m[1][1] + m[1][1], 16) / 255, b: parseInt(m[1][2] + m[1][2], 16) / 255, a: 1 };
  m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(c);
  if (m) return { r: parseInt(m[1].slice(0, 2), 16) / 255, g: parseInt(m[1].slice(2, 4), 16) / 255, b: parseInt(m[1].slice(4, 6), 16) / 255, a: m[2] ? parseInt(m[2], 16) / 255 : 1 };
  m = /^rgba?\(([^)]+)\)$/i.exec(c);
  if (m) { const [r, g, b, a = 1] = m[1].split(',').map(Number); return { r: r / 255, g: g / 255, b: b / 255, a }; }
  throw new Error(`Cannot parse colour "${c}"`);
}
export const toHex = ({ r, g, b }) => '#' + [r, g, b].map((x) => Math.round(clamp(x) * 255).toString(16).padStart(2, '0')).join('');
export const over = (top, bottom) => {
  const a = top.a + bottom.a * (1 - top.a);
  const ch = (t, b) => (t * top.a + b * bottom.a * (1 - top.a)) / (a || 1);
  return { r: ch(top.r, bottom.r), g: ch(top.g, bottom.g), b: ch(top.b, bottom.b), a };
};
const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
export const luminance = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
export const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

export function toHsl({ r, g, b }) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}
export function fromHsl({ h, s, l }) {
  const f = (n) => { const k = (n + h / 30) % 12; return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  return { r: f(0), g: f(8), b: f(4), a: 1 };
}
/** Moves lightness of `base` (in steps) until `ok(colour)` passes; returns the first passing colour or the extreme. */
export function tune(base, direction, ok, step = 0.01) {
  const hsl = toHsl(base);
  let c = base;
  for (let i = 0; i < 100 && !ok(c); i++) { hsl.l = clamp(hsl.l + direction * step, 0.04, 0.96); c = fromHsl(hsl); }
  return c;
}
export const rgba = (c, a) => `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${a})`;
