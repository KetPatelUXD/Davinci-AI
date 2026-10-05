#!/usr/bin/env node
/* global document, window, CSSRule, matchMedia, getComputedStyle, SVGElement */
/**
 * Extracts a build spec for the Figma library from the REAL rendered components (built Storybook).
 * For every component × variant combination × state it records the part tree (named by the `dv-{block}__{part}` classes),
 * layout, sizes, and for each visual property the design TOKEN the stylesheet actually uses (resolved through local
 * custom properties such as `--h: var(--dv-button-height-md)`), so the Figma build is bound to the same variables.
 *
 * Usage: node scripts/figma-extract.mjs Button [Other…] [--theme dark|light] [--out dist/figma/spec]
 * Needs: pnpm build-storybook, and the static Storybook served on :6007 (npx http-server apps/storybook/storybook-static -p 6007 -s).
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const theme = flag('theme', 'dark');
const outDir = join(root, flag('out', 'dist/figma/spec'));
const names = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));
const { targets } = await import(pathToFileURL(join(root, 'scripts/figma-extract.config.mjs')).href);

// css custom property -> Figma variable name (Semantic + Component collections only; primitives are never bound)
const vars = JSON.parse(readFileSync(join(root, 'dist/figma/variables.json'), 'utf8')).collections;
const tokenMap = {};
const styles = JSON.parse(readFileSync(join(root, 'dist/figma/styles.json'), 'utf8'));
for (const grp of ['paintStyles', 'effectStyles']) for (const st of styles[grp]) { const m = /var\((--[\w-]+)\)/.exec(st.codeSyntax?.WEB ?? ''); if (m) tokenMap[m[1]] = `style:${st.name.replace(/\/(Dark|Light)$/, '')}`; }
for (const [col, c] of Object.entries(vars)) {
  if (col === 'Primitives') continue;
  for (const v of c.variables) { const m = /var\((--[\w-]+)\)/.exec(v.codeSyntax?.WEB ?? ''); if (m) tokenMap[m[1]] = v.name; }
}

/** Runs inside the page. Returns the node tree for `rootEl`. */
function inPage({ tokenMap, rootSel, attrs, forceState, rootName, applySrc, combo, comboState, instSel, fixRoot, forceMap, NAMES }) {
  const el = document.querySelector(rootSel);
  if (!el) return { error: `no ${rootSel}` };
  for (const [k, v] of Object.entries(attrs)) { if (v === null) el.removeAttribute(k); else el.setAttribute(k, v); }
  // remove only attributes a previous combination forced (never the element's natural state attributes)
  for (const [node, attr] of window.__forced ?? []) node.removeAttribute(attr);
  window.__forced = [];
  if (applySrc) { new Function('el', 'combo', 'state', applySrc)(el, combo, comboState); }
  else if (forceState && forceState !== 'default') {
    const f = forceMap && forceMap[forceState];
    const tgt = f ? el.querySelector(f[0]) : el;
    if (tgt) { const a = f ? f[1] : `data-${forceState}`; if (!tgt.hasAttribute(a)) { tgt.setAttribute(a, 'true'); window.__forced.push([tgt, a]); } }
  }

  // ---- cascade helpers -------------------------------------------------------------------------------------------
  const rules = [];
  const collect = (list, order) => {
    for (const r of list) {
      if (r.type === CSSRule.STYLE_RULE) rules.push({ r, i: rules.length });
      else if (r.cssRules && (r.type !== CSSRule.MEDIA_RULE || matchMedia(r.conditionText).matches)) collect(r.cssRules, order);
    }
  };
  for (const s of document.styleSheets) { try { collect(s.cssRules, 0); } catch { /* cross-origin */ } }
  const spec = (sel) => { // [ids, classes/attrs/pseudo, types] — good enough for the library's selectors
    const s = sel.replace(/:not\(([^)]*)\)/g, '$1').replace(/:(where)\([^)]*\)/g, '');
    return [(s.match(/#[\w-]+/g) ?? []).length, (s.match(/\.[\w-]+|\[[^\]]+\]|:[\w-]+/g) ?? []).length, (s.match(/(^|[\s>+~])[a-z][\w-]*/gi) ?? []).length];
  };
  const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
  const splitSel = (t) => { const out = []; let d = 0, cur = ''; for (const ch of t) { if (ch === '(' || ch === '[') d++; if (ch === ')' || ch === ']') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch; } out.push(cur.trim()); return out; };
  const SHORT = { 'padding-top': 'padding', 'padding-right': 'padding', 'padding-bottom': 'padding', 'padding-left': 'padding', 'border-top-left-radius': 'border-radius', 'border-top-right-radius': 'border-radius', 'border-bottom-left-radius': 'border-radius', 'border-bottom-right-radius': 'border-radius', 'column-gap': 'gap', 'row-gap': 'gap' };
  const sides = (v, side) => { const p = splitTop(v); const m = { 1: [0, 0, 0, 0], 2: [0, 1, 0, 1], 3: [0, 1, 2, 1], 4: [0, 1, 2, 3] }[p.length]; if (!m) return v; const idx = { top: 0, right: 1, bottom: 2, left: 3 }[side]; return p[m[idx]]; };
  const corners = (v, c) => { const p = splitTop(v); const m = { 1: [0, 0, 0, 0], 2: [0, 1, 0, 1], 3: [0, 1, 2, 1], 4: [0, 1, 2, 3] }[p.length]; if (!m) return v; return p[m[{ tl: 0, tr: 1, br: 2, bl: 3 }[c]]]; };
  function splitTop(v) { const out = []; let d = 0, cur = ''; for (const ch of v.trim()) { if (ch === '(') d++; if (ch === ')') d--; if (/\s/.test(ch) && d === 0) { if (cur) out.push(cur); cur = ''; } else cur += ch; } if (cur) out.push(cur); return out; }
  /** Winning declared text for `prop` on element `e` (own rules + inline), or null. */
  const declared = (e, prop, pseudo) => {
    let best = null;
    const consider = (value, sp, i) => { if (!value) return; if (!best || cmp(sp, best.sp) > 0 || (cmp(sp, best.sp) === 0 && i > best.i)) best = { value: value.trim(), sp, i }; };
    for (const { r, i } of rules) {
      const sels = splitSel(r.selectorText).filter((s) => { try { if (pseudo) return s.endsWith(pseudo) && e.matches(s.slice(0, -pseudo.length) || '*'); return e.matches(s); } catch { return false; } });
      if (!sels.length) continue;
      const sp = sels.map(spec).sort(cmp).at(-1);
      let val = r.style.getPropertyValue(prop);
      if (!val && SHORT[prop]) { const sh = r.style.getPropertyValue(SHORT[prop]); if (sh) val = SHORT[prop] === 'padding' ? sides(sh, prop.split('-')[1]) : SHORT[prop] === 'gap' ? sh.split(/\s+/)[0] : corners(sh, { 'border-top-left-radius': 'tl', 'border-top-right-radius': 'tr', 'border-bottom-right-radius': 'br', 'border-bottom-left-radius': 'bl' }[prop]); }
      consider(val, sp, i);
    }
    const inl = e.style.getPropertyValue(prop); if (inl) consider(inl, [9, 0, 0], 1e9);
    return best?.value ?? null;
  };
  /** Resolve `var()` chains. Returns { text, tokens[] } where tokens are Figma variable names used. */
  const resolve = (e, text, seen = 0) => {
    const tokens = []; if (!text || seen > 10) return { text, tokens };
    let out = '', k = 0;
    while (k < text.length) {
      const at = text.indexOf('var(', k);
      if (at < 0) { out += text.slice(k); break; }
      out += text.slice(k, at);
      let d = 0, end = -1;
      for (let q = at + 3; q < text.length; q++) { if (text[q] === '(') d++; else if (text[q] === ')') { d--; if (d === 0) { end = q; break; } } }
      if (end < 0) { out += text.slice(at); break; }
      const inner = text.slice(at + 4, end); const comma = inner.indexOf(',');
      const name = (comma < 0 ? inner : inner.slice(0, comma)).trim(); const fb = comma < 0 ? undefined : inner.slice(comma + 1).trim();
      let rep = null;
      if (tokenMap[name]) { tokens.push(tokenMap[name]); rep = getComputedStyle(e).getPropertyValue(name).trim() || text.slice(at, end + 1); }
      else {
        for (let a = e; a && rep === null; a = a.parentElement) { const dd = declared(a, name); if (dd) { const r = resolve(a, dd, seen + 1); tokens.push(...r.tokens); rep = r.text; } }
        if (rep === null && fb !== undefined) { const r = resolve(e, fb, seen + 1); tokens.push(...r.tokens); rep = r.text; }
        if (rep === null) rep = text.slice(at, end + 1);
      }
      out += rep; k = end + 1;
    }
    return { text: out, tokens };
  };
  const exactToken = (e, prop) => { const d = declared(e, prop); if (!d) return null; const r = resolve(e, d); return r.tokens.length === 1 && /^var\(--[\w-]+\)$/.test(d) || (r.tokens.length === 1 && /^var\(--[\w-]+\)$/.test(d.trim())) ? r.tokens[0] : (r.tokens.length === 1 && !/[a-z0-9]\s+[a-z0-9]/i.test(d.replace(/var\([^)]*\)/g, 'X')) ? r.tokens[0] : null); };
  const inherited = (e, prop) => { for (let a = e; a; a = a.parentElement) { const t = exactToken(a, prop) ?? (prop === 'color' ? tokensOf(a, 'color')[0] : null); if (t) return t; if (declared(a, prop)) return null; } return null; };
  const topSplit = (v) => { const out = []; let d = 0, cur = ''; for (const ch of v) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch; } out.push(cur.trim()); return out; };
  const shadowInfo = (e) => { const d = declared(e, 'box-shadow'); if (!d || d === 'none') return { layers: [], style: null }; if (/^var\(--[\w-]+\)$/.test(d.trim())) { const r = resolve(e, d); const st = r.tokens.find((t) => t.startsWith('style:')); if (st) return { layers: [], style: st }; } return { layers: topSplit(resolve(e, d).text).map((t, i) => ({ text: t, tokens: resolve(e, topSplit(d)[i] ?? '').tokens.concat(/currentcolor/i.test(topSplit(d)[i] ?? '') && inherited(e, 'color') ? [inherited(e, 'color')] : []) })), style: null }; };
  const tokensOf2 = (e, prop, pseudo) => { const d = declared(e, prop, pseudo); return d ? resolve(e, d).tokens : []; };
  const tokensOf = (e, prop) => { const d = declared(e, prop); return d ? resolve(e, d).tokens : []; };

  // measure at rest: a pressed/hovered scale() transform on the root must not distort descendant sizes
  el.style.transform = 'none';
  // computed text colour -> token, for colour that is inherited from outside the component (e.g. `intent=inherit`)
  const textMatch = {};
  { const probe = document.createElement('span'); el.appendChild(probe); for (const [css, name] of Object.entries(tokenMap)) { if (!name.startsWith('text/')) continue; probe.style.color = `var(${css})`; textMatch[getComputedStyle(probe).color] ??= name; } probe.remove(); }
  // ---- tree ------------------------------------------------------------------------------------------------------
  const kebabToPascal = (k) => k.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');
  const PART_NAME = { El: 'Value', Steppers: 'Steppers' };
  const TAG_NAME = { thead: 'TableHead', tbody: 'TableBody', tr: 'TableRow', td: 'TableCell', th: 'TableHeaderCell', ul: 'List', ol: 'List', li: 'ListItem', dt: 'Term', dd: 'Details', p: 'Paragraph', h1: 'Heading', h2: 'Heading', h3: 'Heading', h4: 'Heading', h5: 'Heading', h6: 'Heading', pre: 'Code', code: 'Code', blockquote: 'Quote', table: 'Table' };
  const BLOCK_NAME = { input: 'Input', dateinput: 'DateInput', dateseg: 'Segment', listbox: 'ListBox', 'app-background': 'Background', 'grid-item': 'GridItem' };
  const partName = (e) => {
    for (const c of e.classList) { const m = /^dv-[a-z0-9-]+?__([a-z0-9-]+)$/.exec(c); if (m) { const nm = kebabToPascal(m[1]); return PART_NAME[nm] ?? nm; } }
    for (const c of e.classList) { const m = /^dv-([a-z0-9-]+)$/.exec(c); if (m && BLOCK_NAME[m[1]]) return BLOCK_NAME[m[1]]; }
    for (const [sel, nm] of Object.entries(NAMES ?? {})) if (e.matches(sel)) return nm;
    for (const c of e.classList) { const m = /^dv-([a-z0-9-]+)$/.exec(c); if (m && !/^(glass|overlay|field|tabular-nums|icon|input|dateinput|dateseg)$/.test(m[1])) return kebabToPascal(m[1]); }
    return e.getAttribute('data-extract-name') ?? TAG_NAME[e.tagName.toLowerCase()] ?? null;
  };
  const px = (v) => Math.round(parseFloat(v) * 100) / 100 || 0;
  const color = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return null; const p = m[1].split(/[ ,/]+/).map(Number); return { r: p[0] / 255, g: p[1] / 255, b: p[2] / 255, a: p[3] ?? 1 }; };
  const node = (e, pr) => {
    const cs = getComputedStyle(e);
    const prevT = e.style.transform, prevF = e.style.filter; e.style.transform = 'none'; e.style.filter = 'none';
    const rect = e.getBoundingClientRect(); e.style.transform = prevT; e.style.filter = prevF;
    const isSvg = e.namespaceURI.endsWith('svg') || e instanceof SVGElement;
    const n = { name: partName(e), tag: e.tagName.toLowerCase(), w: Math.round(rect.width * 100) / 100, h: Math.round(rect.height * 100) / 100 };
    if (cs.position === 'absolute' && pr) n.abs = [Math.round((rect.left - pr.left) * 100) / 100, Math.round((rect.top - pr.top) * 100) / 100, n.w, n.h];
    if (isSvg && e.tagName.toLowerCase() === 'svg' && !e.getAttribute('data-icon')) {
      const hx = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return null; const p = m[1].split(/[ ,/]+/).map(Number); const h = (x) => Math.round(x).toString(16).padStart(2, '0'); return { hex: '#' + h(p[0]) + h(p[1]) + h(p[2]), a: p[3] ?? 1 }; };
      const GEO = 'circle,path,rect,line,polyline,polygon,ellipse';
      const geo = [...e.querySelectorAll(GEO)]; const clone = e.cloneNode(true); const cg = [...clone.querySelectorAll(GEO)];
      const ct = inherited(e, 'color') ?? textMatch[cs.color] ?? null;
      { const so = [...e.querySelectorAll('stop')], sc = [...clone.querySelectorAll('stop')];
        so.forEach((st, i) => { const gs = getComputedStyle(st), h = hx(gs.getPropertyValue('stop-color')); sc[i].removeAttribute('style'); if (h) { sc[i].setAttribute('stop-color', h.hex); sc[i].setAttribute('stop-opacity', String((h.a ?? 1) * Number(gs.getPropertyValue('stop-opacity') || 1))); } }); }
      const vt = geo.map((g, i) => {
        const gs = getComputedStyle(g), c = cg[i]; c.removeAttribute('class'); c.removeAttribute('style'); const out = [null, null];
        for (const [prop, k] of [['fill', 0], ['stroke', 1]]) {
          const v = gs.getPropertyValue(prop);
          if (!v || v === 'none') { c.setAttribute(prop, 'none'); continue; }
          if (v.startsWith('url')) { c.setAttribute(prop, v.replace(/url\(["']?([^"')]+)["']?\)/, 'url($1)')); continue; }
          const h = hx(v); if (!h) continue; c.setAttribute(prop, h.hex); if (h.a < 1) c.setAttribute(prop + '-opacity', String(h.a));
          const dv = declared(g, prop); const attr = g.getAttribute(prop);
          const inl = g.style.getPropertyValue(prop) || attr || ''; out[k] = (dv ? tokensOf(g, prop)[0] : null) ?? (/var\(/.test(inl) ? resolve(g, inl).tokens[0] : null) ?? (((attr ?? '').toLowerCase() === 'currentcolor' || /currentcolor/i.test(dv ?? '')) ? ct : null) ?? null; if (out[k]) c.setAttribute(prop, '#808080');
        }
        for (const [css, attr] of [['stroke-width', 'stroke-width'], ['stroke-linecap', 'stroke-linecap'], ['stroke-linejoin', 'stroke-linejoin'], ['stroke-dasharray', 'stroke-dasharray'], ['stroke-dashoffset', 'stroke-dashoffset']]) { const v = gs.getPropertyValue(css); if (v && v !== 'none' && v !== 'butt' && v !== 'miter' && v !== '0px') c.setAttribute(attr, parseFloat(v) === Number(parseFloat(v)) && /px$/.test(v) ? String(parseFloat(v)) : v); }
        if (Number(gs.opacity) < 1) c.setAttribute('opacity', gs.opacity);
        { const dl = gs.getPropertyValue('stroke-dasharray').split(/[ ,]+/).map(parseFloat).filter((x) => x > 0), off = parseFloat(gs.getPropertyValue('stroke-dashoffset')) || 0;
          if (c.tagName.toLowerCase() === 'circle' && dl.length) { // dashed circle (progress / donut arc) -> real arc path: Figma's SVG import ignores dashes
            const cx = parseFloat(c.getAttribute('cx')), cy = parseFloat(c.getAttribute('cy')), r = parseFloat(c.getAttribute('r')), C = 2 * Math.PI * r, len = dl[0];
            const a0 = Math.max(0, -off), a1 = Math.min(C, -off + len), f0 = a0 / C, f1 = a1 / C;
            const pt = (t) => [cx + r * Math.cos(t), cy + r * Math.sin(t)].map((x) => Math.round(x * 1000) / 1000).join(' ');
            const T = 2 * Math.PI, d = f1 - f0 > 0.9999 ? `M${pt(0)}A${r} ${r} 0 1 1 ${pt(Math.PI)}A${r} ${r} 0 1 1 ${pt(0)}` : `M${pt(T * f0)}A${r} ${r} 0 ${f1 - f0 > 0.5 ? 1 : 0} 1 ${pt(T * f1)}`;
            const pth = document.createElementNS('http://www.w3.org/2000/svg', 'path'); for (const at of [...c.attributes]) if (!/^(cx|cy|r|stroke-dasharray|stroke-dashoffset)$/.test(at.name)) pth.setAttribute(at.name, at.value);
            pth.setAttribute('d', d); c.replaceWith(pth); } }
        return out;
      });
      clone.removeAttribute('class'); clone.removeAttribute('style'); clone.setAttribute('width', n.w); clone.setAttribute('height', n.h); clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      n.kind = 'vector'; n.svg = clone.outerHTML; n.vt = vt; return n;
    }
    if (isSvg) { n.kind = 'icon'; if (parseFloat(cs.flexGrow) > 0) n.grow = 1; n.icon = e.getAttribute('data-icon'); n.fill = { token: inherited(e, 'color') ?? textMatch[cs.color] ?? null, computed: color(cs.color) }; return n; }
    const grid = cs.display.includes('grid');
    const sameRow = grid && (() => { const ks = [...e.children].filter((k) => { const c = getComputedStyle(k); return c.position !== 'absolute' && c.display !== 'none'; }); if (ks.length < 2) return false; const mid = (k) => { const r = k.getBoundingClientRect(); return r.top + r.height / 2; }; const m0 = mid(ks[0]); return ks.every((k) => Math.abs(mid(k) - m0) < 6 || (() => { const r = k.getBoundingClientRect(), r0 = ks[0].getBoundingClientRect(); return r.top < r0.bottom && r.bottom > r0.top; })()); })();
    n.layout = { display: cs.display, direction: grid ? (/^column/.test(cs.gridAutoFlow) || sameRow ? 'row' : 'column') : /table-row$|table-row-group$/.test(cs.display) && cs.display === 'table-row' ? 'row' : /table/.test(cs.display) ? 'column' : cs.flexDirection, align: grid ? (/^column/.test(cs.gridAutoFlow) || sameRow ? cs.alignItems : cs.justifyItems) : cs.alignItems, justify: grid ? (/^column/.test(cs.gridAutoFlow) ? 'normal' : (cs.alignItems === 'center' || cs.alignContent === 'center') ? 'center' : 'normal') : cs.justifyContent, wrap: cs.flexWrap, gap: px(cs.columnGap), gapToken: exactToken(e, 'gap') ?? exactToken(e, 'column-gap') };
    n.padding = {}; for (const s of ['top', 'right', 'bottom', 'left']) n.padding[s] = { px: px(cs[`padding${s[0].toUpperCase()}${s.slice(1)}`]), token: exactToken(e, `padding-${s}`) };
    n.radius = {}; for (const c of ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft']) n.radius[c] = { px: Math.min(px(cs[`border${c}Radius`]), Math.min(rect.width, rect.height) / 2), token: exactToken(e, `border-${c.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1)}-radius`) ?? exactToken(e, 'border-radius'), pill: px(cs[`border${c}Radius`]) >= Math.min(rect.width, rect.height) / 2 && rect.height > 0 };
    const bgTokens = tokensOf(e, 'background').concat(tokensOf(e, 'background-color'), tokensOf(e, 'background-image'));
    if (/^currentcolor$/i.test((declared(e, 'background') ?? declared(e, 'background-color') ?? '').trim()) && inherited(e, 'color')) bgTokens.push(inherited(e, 'color'));
    n.fill = { computed: color(cs.backgroundColor), gradient: cs.backgroundImage !== 'none' ? cs.backgroundImage.slice(0, 160) : null, tokens: [...new Set(bgTokens)] };
    n.shadow = { computed: cs.boxShadow === 'none' ? null : cs.boxShadow, ...shadowInfo(e) };
    n.filter = cs.filter === 'none' ? null : cs.filter;
    n.outline = cs.outlineStyle !== 'none' && px(cs.outlineWidth) > 0 ? { width: px(cs.outlineWidth), offset: px(cs.outlineOffset), token: tokensOf(e, 'outline')[0] ?? null } : null;
    n.height = { token: exactToken(e, 'height') ?? exactToken(e, 'min-height') }; n.width = { token: exactToken(e, 'width') };
    n.opacity = Number(cs.opacity);
    if (/^(td|th)$/i.test(e.tagName)) n.fix = [Math.round(rect.width), n.fix ? n.fix[1] : null];
    n.mt = px(cs.marginTop); n.ml = px(cs.marginLeft);
    if (parseFloat(cs.flexGrow) > 0) n.grow = 1;
    { const bw = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map(px);
      if (bw.some((v) => v > 0)) { const bt = ['border-color', 'border', 'border-top', 'border-bottom', 'border-left', 'border-right', 'border-top-color', 'border-bottom-color'].flatMap((q) => tokensOf(e, q)); n.border = { w: bw, token: bt[0] ?? null, computed: color(cs.borderTopColor) }; } }
    if (/hidden|clip/.test(cs.overflowX) || /hidden|clip/.test(cs.overflowY)) n.clip = true;
    { const fxw = declared(e, 'width'), fxh = declared(e, 'height'); const lit = (d) => d && /^-?[\d.]+px$/.test(resolve(e, d).text.trim()) && resolve(e, d).tokens.length === 0;
      if (lit(fxw) || lit(fxh)) n.fix = [lit(fxw) ? Math.round(rect.width) : null, lit(fxh) ? Math.round(rect.height) : null]; }
    { const m = /blur\(([\d.]+)px\)/.exec(cs.backdropFilter || cs.webkitBackdropFilter || ''); if (m) n.bb = parseFloat(m[1]); }
    if (pr && /^(block|flex|grid|flow-root)$/.test(cs.display) && !n.abs) { const pcs = e.parentElement ? getComputedStyle(e.parentElement) : null; if (pcs && !/^inline/.test(pcs.display)) { const inner = pr.width - px(pcs.paddingLeft) - px(pcs.paddingRight) - px(pcs.borderLeftWidth) - px(pcs.borderRightWidth); if (inner > 0 && Math.abs(rect.width - inner) < 0.6) n.fillW = true; } }
    if (e.parentElement && /grid/.test(getComputedStyle(e.parentElement).display) && /^column/.test(getComputedStyle(e.parentElement).gridAutoFlow)) n.grow = 1;
    n.text = { color: color(cs.color), colorToken: inherited(e, 'color') ?? textMatch[cs.color] ?? null, size: px(cs.fontSize), sizeToken: inherited(e, 'font-size'), weight: cs.fontWeight, lh: px(cs.lineHeight) || null, ls: cs.letterSpacing === 'normal' ? 0 : px(cs.letterSpacing), family: cs.fontFamily.split(',')[0].replace(/"/g, ''), transform: cs.textTransform };
    n.children = [];
    const kids = [...e.childNodes];
    for (const c of kids) {
      if (c.nodeType === 3 && c.textContent.replace(/[\u2066-\u2069\u200e\u200f\u200b]/g, '').trim()) {
        const rg = document.createRange(); rg.selectNodeContents(c); const tr = rg.getBoundingClientRect();
        const lhpx = px(cs.lineHeight) || px(cs.fontSize) * 1.3;
        const udc = color(cs.textDecorationColor);
        n.children.push({ kind: 'text', name: 'Label', text: c.textContent.replace(/[\u2066-\u2069\u200e\u200f\u200b]/g, '').trim(), tw: tr.height > lhpx * 1.5 ? Math.round(tr.width) : null, al: cs.textAlign, ul: /underline/.test(cs.textDecorationLine) && !!udc && udc.a > 0.01 });
      }
      else if (c.nodeType === 1 && /^(input|textarea)$/i.test(c.tagName) && !/^(checkbox|radio|hidden)$/i.test(c.type || '') && c.getBoundingClientRect().width > 8) {
        const ics = getComputedStyle(c); const ph = !c.value; const pcs = ph ? getComputedStyle(c, '::placeholder') : ics; const ir = c.getBoundingClientRect();
        n.children.push({ kind: 'text', name: partName(c) ?? 'Value', text: c.value || c.placeholder || ' ', grow: true, own: { color: color(pcs.color), colorToken: textMatch[pcs.color] ?? null, size: px(ics.fontSize), weight: ics.fontWeight, lh: px(ics.lineHeight) || null, ls: ics.letterSpacing === 'normal' ? 0 : px(ics.letterSpacing), sizeToken: inherited(c, 'font-size') }, tw: c.tagName === 'TEXTAREA' ? Math.round(ir.width) : null, h: Math.round(ir.height) });
      }
      else if (c.nodeType === 1 && instSel && Object.keys(instSel).some((sel) => c.matches(sel))) {
        const cmp = instSel[Object.keys(instSel).find((sel) => c.matches(sel))];
        const props = {}; for (const a of c.attributes) if (a.name.startsWith('data-') && !/^data-(rac|react-aria|ready|full-width)/.test(a.name)) props[a.name.slice(5).replace('selected-index', 'selected')] = a.value;
        const cr = c.getBoundingClientRect();
        n.children.push({ kind: 'inst', cmp, name: partName(c), props, texts: [...c.querySelectorAll('*')].filter((x) => x.children.length === 0 && x.tagName.toLowerCase() !== 'svg' && !x.closest('svg') && !/sr-only/.test(String(x.className?.baseVal ?? x.className)) && (x.textContent || '').trim()).map((x) => x.textContent.trim()), icon: c.querySelector('svg[data-icon]')?.getAttribute('data-icon') ?? null, text: (c.querySelectorAll('*').length - c.querySelectorAll('svg, svg *').length <= 1 ? (c.textContent || '').trim() : ''), w: cr.width, h: cr.height, grow: parseFloat(getComputedStyle(c).flexGrow) > 0 });
      }
      else if (c.nodeType === 1 && !/^(script|style|input)$/i.test(c.tagName) && !/sr-only/.test(c.className?.baseVal ?? c.className) && !(c.getAttribute('aria-hidden') === 'true' && c.tagName.toLowerCase() !== 'svg' && !c.className && c.querySelector('select,input')) && getComputedStyle(c).display !== 'none' && !(getComputedStyle(c).position === 'absolute' && c.getBoundingClientRect().width <= 1 && c.getBoundingClientRect().height <= 1)) { const ch = node(c, rect); if (ch) n.children.push(ch); }
    }
    // name icons by position relative to a text sibling
    const hasText = n.children.some((c) => c.kind === 'text' || (c.children?.length === 0 && false));
    const lblIdx = n.children.findIndex((c) => c.kind === 'text' || c.name === 'Label');
    const valIdx = n.children.findIndex((c) => c.name === 'Value');
    n.children.forEach((c, i) => { if (c.name === 'Affix') c.name = valIdx >= 0 && i > valIdx ? 'Suffix' : 'Prefix'; });
    // pseudo-elements (::before / ::after) with a solid box become decorative layers
    const pseudoNodes = [];
    for (const pseudo of ['::before', '::after']) {
      const ps = getComputedStyle(e, pseudo);
      if (!ps.content || ps.content === 'none' || ps.content === 'normal' || ps.display === 'none' || ps.backgroundImage !== 'none' || Number(ps.opacity) === 0) continue;
      const w = px(ps.width), h = px(ps.height); const bg = color(ps.backgroundColor);
      if (!w || !h || !bg || bg.a === 0) continue;
      const pw = rect.width, ph = rect.height;
      let left = parseFloat(ps.left), top = parseFloat(ps.top);
      if (!Number.isFinite(left)) left = pw - (parseFloat(ps.right) || 0) - w; if (!Number.isFinite(top)) top = ph - (parseFloat(ps.bottom) || 0) - h;
      const tr = /matrix\(([^)]+)\)/.exec(ps.transform || ''); if (tr) { const m = tr[1].split(',').map(Number); if (m[0] === 0 || m[3] === 0) continue; left += m[4] || 0; top += m[5] || 0; }
      const bgTokens = [...new Set([...tokensOf2(e, 'background', pseudo), ...tokensOf2(e, 'background-color', pseudo)])];
      const rad = Math.min(px(ps.borderTopLeftRadius), Math.min(w, h) / 2);
      pseudoNodes.push({ pseudo, node: { name: pseudo === '::before' ? 'Before' : 'After', tag: 'pseudo', w, h, abs: [Math.round(left * 100) / 100, Math.round(top * 100) / 100, w, h], layout: { display: 'block', direction: 'row', align: 'normal', justify: 'normal', wrap: 'nowrap', gap: 0, gapToken: null }, padding: { top: { px: 0 }, right: { px: 0 }, bottom: { px: 0 }, left: { px: 0 } }, radius: Object.fromEntries(['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map((c) => [c, { px: rad, token: null, pill: rad >= Math.min(w, h) / 2 - 0.01 }])), fill: { computed: bg, gradient: null, tokens: bgTokens }, shadow: { computed: null, layers: [], style: null }, outline: null, height: { token: null }, width: { token: null }, opacity: 1, text: { color: null, colorToken: null, size: 12, sizeToken: null, weight: '400', lh: null, ls: 0, family: '', transform: 'none' }, children: [] } });
    }
    for (const pn of pseudoNodes) { if (pn.pseudo === '::before') n.children.unshift(pn.node); else n.children.push(pn.node); }
    const hostName = n.name ?? rootName;
    const generic = !n.name || ['Input', 'Option', 'Track', 'Trigger', 'Item'].includes(n.name);
    n.children.forEach((c) => {
      if (n.name === 'Label' && !c.name && (c.kind === 'text' || (c.children?.length === 1 && c.children[0].kind === 'text'))) c.name = 'Title';
      if (n.name === 'Error' && !c.name && (c.kind === 'text' || (c.children?.length === 1 && c.children[0].kind === 'text'))) c.name = 'Message';
      if ((c.kind === 'icon' || c.kind === 'vector') && !c.name && !generic) c.name = hostName + 'Icon';
    });
    if (grid && !sameRow && !/^column/.test(cs.gridAutoFlow)) { // multi-row grid -> wrapping auto-layout with fixed item widths
      const ks = [...e.children].filter((k) => { const c = getComputedStyle(k); return c.position !== 'absolute' && c.display !== 'none'; });
      const tops = new Set(ks.map((k) => Math.round(k.getBoundingClientRect().top)));
      if (ks.length > 1 && tops.size > 1 && tops.size < ks.length && ks.length === n.children.length) { n.gridWrap = true; n.layout.direction = 'row'; ks.forEach((k, i) => { n.children[i].gridW = Math.round(k.getBoundingClientRect().width * 100) / 100; }); }
    }
    n.children.forEach((c, i) => { if (c.kind === 'icon' && !c.name) c.name = lblIdx < 0 ? 'Icon' : i < lblIdx ? 'IconStart' : 'IconEnd'; if (!c.name && !c.kind && !(c.children && c.children.length) && c.grow) c.name = 'Spacer'; if (!c.name) c.name = c.kind === 'text' ? 'Label' : c.kind === 'inst' ? c.cmp : (c.children?.length === 1 && c.children[0].kind === 'text') ? 'Label' : 'Group'; });
    void hasText;
    return n;
  };
  const tree = node(el, null); tree.name = rootName; if (fixRoot) tree.fix = [Math.round(el.getBoundingClientRect().width), tree.fix ? tree.fix[1] : null]; return { tree };
}

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1200, height: 800 }, reducedMotion: 'reduce' })).newPage();
mkdirSync(outDir, { recursive: true });
const summary = [];
for (const name of names) {
  const t = targets[name]; if (!t) { console.error(`no target for ${name}`); continue; }
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${t.story}&viewMode=story&globals=theme:${theme}${t.args ? `&args=${t.args}` : ''}`, { waitUntil: 'load' });
  if (t.open) { await page.waitForSelector(t.open); await page.click(t.open); await page.waitForTimeout(500); }
  await page.waitForSelector(t.root, { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  const out = { component: name, theme, story: t.story, variants: [] };
  const axes = Object.entries(t.axes ?? {}); const combos = axes.reduce((a, [k, vs]) => a.flatMap((c) => vs.map((v) => [...c, [k, v]])), [[]]);
  for (const combo of combos) for (const state of t.states ?? ['default']) {
    const attrs = Object.fromEntries(combo.filter(([k]) => !(t.noAttr ?? []).includes(k)).map(([k, v]) => [`data-${k}`, v]));
    const r = await page.evaluate(inPage, { tokenMap, rootSel: t.stateRoots?.[state] ?? t.root, attrs, forceState: t.stateRoots?.[state] ? null : state, rootName: name, applySrc: t.apply ?? null, combo: Object.fromEntries(combo), comboState: state, instSel: t.instances ?? null, fixRoot: !!t.fixRootWidth, forceMap: t.force ?? null, NAMES: { '[role=gridcell]': 'Content', ...(t.names ?? {}) } });
    if (r.error) { console.error(name, r.error); continue; }
    out.variants.push({ props: { ...Object.fromEntries(combo), ...(t.stateAs ? { [t.stateAs]: state } : {}) }, state: t.stateAs ? 'default' : state, tree: r.tree });
  }
  writeFileSync(join(outDir, `${name}.${theme}.json`), JSON.stringify(out, null, 1));
  summary.push(`${name}: ${out.variants.length} variants`);
}
await browser.close();
console.log(summary.join('\n'));
