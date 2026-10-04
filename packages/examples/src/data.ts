/** Fictional sample data. Names, codes and prices are invented and do not represent any real assessment. */

/** Small seeded PRNG (mulberry32) so screenshots and docs are deterministic. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random walk of `n` points starting at `start` with relative step `vol` and upward `bias` (0.5 = neutral). */
export function walk(n: number, start: number, vol: number, seed: number, bias = 0.48): number[] {
  const r = rng(seed);
  const out = [start];
  for (let i = 1; i < n; i++) out.push(out[i - 1]! * (1 + (r() - bias) * vol));
  return out;
}

/** Walk that ends exactly at `last`. */
export function walkTo(n: number, last: number, vol: number, seed: number, bias = 0.46): number[] {
  const d = walk(n, last * 0.97, vol, seed, bias);
  const shift = last - d[d.length - 1]!;
  const from = Math.floor(n * 0.66);
  return d.map((v, i) => (i >= from ? v + (shift * (i - from)) / (n - 1 - from) : v));
}

export interface Assessment {
  id: string;
  name: string;
  category: string;
  code: string;
  last: number;
  change: number;
  low: number;
  high: number;
  icon: string;
  series: number[];
}

const ASSESSMENTS: Omit<Assessment, 'series' | 'low' | 'high' | 'change'>[] = [
  { id: 'nsc1', name: 'North Sea Crude M1', category: 'Crude oil', code: 'NSC1', last: 84.62, icon: 'droplet' },
  { id: 'wtx1', name: 'Texas Light Sweet M1', category: 'Crude oil', code: 'WTX1', last: 80.11, icon: 'droplet' },
  { id: 'uls', name: 'NWE Diesel 10ppm', category: 'Refined products', code: 'ULS', last: 812.5, icon: 'droplet' },
  { id: 'ttf1', name: 'Continental Gas M1', category: 'Natural gas', code: 'TTF1', last: 31.08, icon: 'fire' },
  { id: 'cpf', name: 'Capesize 5TC', category: 'Dry freight', code: 'CPF', last: 18420, icon: 'ship' },
  { id: 'alu3', name: 'Aluminium 3M', category: 'Base metals', code: 'ALU3', last: 2318, icon: 'mountain' },
];
const CHG = [1.42, -0.86, 0.64, -2.14, 1.95, 0.37];
const POS = [0.77, 0.34, 0.58, 0.22, 0.81, 0.46];

export const assessments: Assessment[] = ASSESSMENTS.map((a, i) => ({
  ...a,
  change: CHG[i]!,
  low: a.last * (1 - 0.03 * POS[i]!),
  high: a.last * (1 + 0.03 * (1 - POS[i]!)),
  series: walk(30, a.last * 0.98, 0.015, 100 + i, CHG[i]! >= 0 ? 0.45 : 0.55),
}));

export const heroSeries = walkTo(90, 84.62, 0.008, 7);
export const heroLabels = heroSeries.map((_, i) => new Date(Date.UTC(2026, 8, 2 + Math.floor(i / 3))).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }));
export const heroAxis = ['Sep 02', 'Sep 09', 'Sep 16', 'Sep 23', 'Sep 30'];

export const kpis = [
  { title: 'Brent-style M1', value: 84.62, delta: 1.42, series: walk(36, 83.4, 0.005, 21, 0.42) },
  { title: 'Gulf Coast Diesel', value: 261.35, delta: -0.86, series: walk(36, 263.5, 0.005, 22, 0.58) },
];

export const exposure = [
  { id: 'oil', label: 'Oil & products', value: 11 },
  { id: 'gas', label: 'Gas & power', value: 8 },
  { id: 'fm', label: 'Freight & metals', value: 5, color: 'var(--dv-text-muted)' },
];

export const pulse = [
  { name: 'Brent-style', change: 1.42 }, { name: 'WTI-style', change: 0.88 }, { name: 'Diesel', change: -0.86 }, { name: 'Jet', change: 0.31 },
  { name: 'Gas TTF', change: -2.14 }, { name: 'Power DE', change: -0.42 }, { name: 'LNG JKM', change: 1.95 }, { name: 'Coal', change: -1.2 },
  { name: 'Capesize', change: 0.37 }, { name: 'Panamax', change: 2.4 }, { name: 'Aluminium', change: 1.06 }, { name: 'Copper', change: -0.18 },
];

export const news = [
  { id: 'n1', time: '09:42', headline: 'North Sea loading programme revised lower for next month', source: 'Fictional Wire', tags: ['Crude', 'Supply'], unread: true,
    summary: 'Sample text: loading programmes for the benchmark grades were trimmed by roughly 4% against the prior schedule, tightening prompt differentials.' },
  { id: 'n2', time: '09:15', headline: 'Diesel stocks in the hub draw for a third week', source: 'Fictional Wire', tags: ['Products'], unread: true,
    summary: 'Sample text: independent storage data showed a further draw, supporting prompt cracks.' },
  { id: 'n3', time: '08:50', headline: 'Capesize rates firm on Atlantic iron ore demand', source: 'Sample Shipping Desk', tags: ['Freight'],
    summary: 'Sample text: fixtures out of the Atlantic basin lifted the 5TC average.' },
  { id: 'n4', time: '08:05', headline: 'Continental gas eases as storage injections beat expectations', source: 'Fictional Wire', tags: ['Gas'] },
];

export const tickers = assessments.map((a) => ({ id: a.id, symbol: a.code, last: a.last, changePercent: a.change }));
