/**
 * Factors per-variant trees into axis-dependency tables so the spec the Figma builder receives stays small:
 * every leaf field (path like `ch.2.tx.c`) is stored once per distinct value of the *minimal* set of axes it depends on.
 *   encode(variants[{p:{axis:value}, st, tree}], axes) -> { axes, values, tables:[{s:[axisIdx], p:[paths], r:[[keys..., values...]]}] }
 *   decode(encoded) -> [{ combo, tree }]   (this exact function is pasted into the Figma builder)
 */
const ABSENT = { '-': 1 };
const isLeaf = (v) => v === null || typeof v !== 'object' || (Array.isArray(v) ? v.length === 0 : Object.keys(v).length === 0);
const flat = (v, path, out) => {
  if (isLeaf(v)) { out[path] = v; return out; }
  if (Array.isArray(v)) v.forEach((x, i) => flat(x, path ? `${path}.${i}` : String(i), out));
  else for (const [k, x] of Object.entries(v)) flat(x, path ? `${path}.${k}` : k, out);
  return out;
};
const isAbs = (y) => y === undefined || (y && typeof y === 'object' && !Array.isArray(y) && y['-'] === 1 && Object.keys(y).length === 1);
const clean = (x) => (Array.isArray(x) ? x.filter((y) => !isAbs(y)).map(clean) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).filter(([k, v]) => k !== '-' && !isAbs(v)).map(([k, v]) => [k, clean(v)])) : x);
const setPathNode = (o, path, v) => { if (v === undefined || (v && v['-'] === 1 && Object.keys(v).length === 1)) return; const ks = path === '' ? [] : path.split('.'); let cur = o; ks.forEach((k, i) => { const last = i === ks.length - 1; const nk = /^\d+$/.test(k) ? +k : k; if (last) cur[nk] = v; else { if (cur[nk] === undefined) cur[nk] = /^\d+$/.test(ks[i + 1]) ? [] : {}; cur = cur[nk]; } }); };
const subsets = (n) => { const out = []; for (let m = 0; m < 1 << n; m++) { const s = []; for (let i = 0; i < n; i++) if (m & (1 << i)) s.push(i); out.push(s); } return out.sort((a, b) => a.length - b.length); };

export function encode(variants, axes) {
  const rows = variants.map((v) => ({ combo: [...axes.map((a) => (a === 'state' ? v.st : v.p[a]))], f: flat(v.tree, '', {}) }));
  const paths = [...new Set(rows.flatMap((r) => Object.keys(r.f)))];
  const subs = subsets(axes.length);
  const byS = new Map();
  for (const p of paths) {
    const val = (r) => JSON.stringify(p in r.f ? r.f[p] : ABSENT);
    const S = subs.find((s) => { const m = new Map(); return rows.every((r) => { const k = s.map((i) => r.combo[i]).join('\u0001'); const x = val(r); if (m.has(k) && m.get(k) !== x) return false; m.set(k, x); return true; }); });
    const key = S.join(',');
    if (!byS.has(key)) byS.set(key, { s: S, p: [] });
    byS.get(key).p.push(p);
  }
  const values = axes.map((_, i) => [...new Set(rows.map((r) => r.combo[i]))]);
  const tables = [...byS.values()].map(({ s, p }) => {
    const seen = new Map();
    for (const r of rows) { const k = s.map((i) => r.combo[i]); const id = k.join('\u0001'); if (!seen.has(id)) { const vals = p.map((x) => (x in r.f ? r.f[x] : ABSENT)); while (vals.length && vals.at(-1) && vals.at(-1)['-'] === 1) vals.pop(); seen.set(id, [...k, ...vals]); } }
    return { s, p, r: [...seen.values()] };
  });
  // constants (tables that depend on no axis) become a nested base tree: far smaller than path lists
  const base = {}; const rest = [];
  for (const t of tables) { if (t.s.length === 0) t.p.forEach((pp, j) => setPathNode(base, pp, t.r[0][j])); else rest.push(t); }
  const fill = (x) => (Array.isArray(x) ? Array.from({ length: x.length }, (_, i) => (i in x ? fill(x[i]) : ABSENT)) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, fill(v)])) : x);
  return { axes, values, base: fill(base), tables: rest };
}

export function decode(enc) {
  const { axes, values, tables, base } = enc;
  const combos = values.reduce((a, vs) => a.flatMap((c) => vs.map((v) => [...c, v])), [[]]);
  const idx = tables.map((t) => new Map(t.r.map((row) => [row.slice(0, t.s.length).join('\u0001'), row.slice(t.s.length)])));
  const setPath = (o, path, v) => { if (v === undefined || (v && v['-'] === 1 && Object.keys(v).length === 1)) return; const ks = path === '' ? [] : path.split('.'); if (!ks.length) return v; let cur = o; ks.forEach((k, i) => { const last = i === ks.length - 1; const nk = /^\d+$/.test(k) ? +k : k; if (last) cur[nk] = v; else { if (cur[nk] === undefined) cur[nk] = /^\d+$/.test(ks[i + 1]) ? [] : {}; cur = cur[nk]; } }); };
  return combos.map((combo) => {
    const tree = JSON.parse(JSON.stringify(base ?? {}));
    tables.forEach((t, ti) => { const vals = idx[ti].get(t.s.map((i) => combo[i]).join('\u0001')); t.p.forEach((p, j) => setPath(tree, p, vals[j])); });
    return { combo: Object.fromEntries(axes.map((a, i) => [a, combo[i]])), tree: clean(tree) };
  });
}
