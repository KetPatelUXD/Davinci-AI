  const mkFrame = async (t, parent, root) => {
    const f = root ? figma.createComponent() : figma.createFrame();
    if (parent) parent.appendChild(f);
    f.layoutMode = t.d === 'V' ? 'VERTICAL' : 'HORIZONTAL'; f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; f.fills = []; f.clipsContent = false; f.name = t.n;
    if (t.a) f.counterAxisAlignItems = ({ center: 'CENTER', start: 'MIN', end: 'MAX', baseline: 'MIN' })[t.a] || 'MIN';
    if (t.j) f.primaryAxisAlignItems = ({ center: 'CENTER', between: 'SPACE_BETWEEN', end: 'MAX' })[t.j] || 'MIN';
    if (t.p) ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach((k, i) => bnum(f, k, t.p[i]));
    if (t.g) bnum(f, 'itemSpacing', t.gt || t.g);
    if (t.wr) { f.layoutWrap = 'WRAP'; if (t.g) bnum(f, 'counterAxisSpacing', t.gt || t.g); }
    if (t.r) ['topLeftRadius', 'topRightRadius', 'bottomRightRadius', 'bottomLeftRadius'].forEach((k, i) => bnum(f, k, t.r === 'pill' ? 'radius/pill' : t.r[i], 'r'));
    if (t.f) f.fills = [t.f.s ? SHEEN(t.f.s.split('/')[1]) : t.f.t ? SOL(t.f.t) : { type: 'SOLID', color: { r: t.f.c[0], g: t.f.c[1], b: t.f.c[2] }, opacity: t.f.c[3] }];
    if (t.s && t.s.style) { const st = ES[t.s.style + '/Dark'] || ES[t.s.style]; if (st) f.effectStyleId = st.id; }
    else if (t.s && t.s.layers) {
      const fx = [];
      for (const l of t.s.layers) {
        const sty = l.k && l.k.find((x) => /^style:/.test(x));
        if (sty) { const nm = sty.slice(6); if (/^inset/.test(l.t.trim())) { const w = /([\d.]+)px\s+(?:rgba?|#)/.exec(l.t); f.strokes = [SOL(/strong/.test(nm) ? 'border/line-strong' : 'border/line')]; f.strokeWeight = w ? parseFloat(w[1]) : 1; f.strokeAlign = 'INSIDE'; } else { const st = ES[nm + '/Dark'] || ES[nm]; if (st) f.effectStyleId = st.id; } continue; }
        const m = /^inset\s+0(?:px)?\s+0(?:px)?\s+0(?:px)?\s+([\d.]+)px\s+/.exec(l.t.trim());
        const pe = parseShadow(l.t);
        if (m && pe) { f.strokes = [l.k && l.k[0] ? SOL(l.k[0]) : { type: 'SOLID', color: { r: pe.color.r, g: pe.color.g, b: pe.color.b }, opacity: pe.color.a }]; f.strokeWeight = parseFloat(m[1]); f.strokeAlign = 'INSIDE'; }
        else if (pe) fx.push(pe);
      }
      if (fx.length) f.effects = fx;
    }
    if (t.op !== undefined) f.opacity = t.op;
    if (t.bb) f.effects = (f.effects || []).concat([{ type: 'BACKGROUND_BLUR', radius: t.bb, visible: true }]);
    if (t.cl) f.clipsContent = true;
    if (t.bd) {
      f.strokes = [t.bd.t ? SOL(t.bd.t) : { type: 'SOLID', color: { r: t.bd.c[0], g: t.bd.c[1], b: t.bd.c[2] }, opacity: t.bd.c[3] }]; f.strokeAlign = 'INSIDE';
      const w = t.bd.w; if (w.every((x) => x === w[0])) f.strokeWeight = w[0]; else { f.strokeTopWeight = w[0]; f.strokeRightWeight = w[1]; f.strokeBottomWeight = w[2]; f.strokeLeftWeight = w[3]; }
    }
    for (const c of (t.ch || [])) {
      const nd = c.k === 't' ? await mkText(c, f) : c.k === 'i' ? mkIcon(c, f) : c.k === 'v' ? mkVector(c, f) : c.k === 'x' ? await mkInst(c, f) : await mkFrame(c, f, false);
      if (c.abs) { nd.layoutPositioning = 'ABSOLUTE'; nd.x = c.abs[0]; nd.y = c.abs[1]; nd.resize(c.abs[2], c.abs[3]); }
      else if (c.gr || c.fw) { nd.layoutSizingHorizontal = 'FILL'; }
    }
    if (t.sz && !t.ht && !t.wt) f.resize(t.sz[0], t.sz[1]);
    if (t.fx && !t.sz) { f.resize(t.fx[0] === null ? f.width : t.fx[0], t.fx[1] === null ? f.height : t.fx[1]); if (t.fx[0] === null) f.layoutSizingHorizontal = 'HUG'; if (t.fx[1] === null) f.layoutSizingVertical = 'HUG'; }
    if (t.ht) { f.resize(f.width, 100); f.setBoundVariable('height', V(t.ht)); f.layoutSizingVertical = 'FIXED'; f.layoutSizingHorizontal = t.wt ? 'FIXED' : 'HUG'; }
    if (t.wt) { f.setBoundVariable('width', V(t.wt)); f.layoutSizingHorizontal = 'FIXED'; }
    if (t.fl) { const m = /brightness\(([\d.]+)\)/.exec(t.fl); const b = parseFloat(m ? m[1] : '1'); if (b < 1) OVER(f, 1 - b, false); else if (b > 1) OVER(f, b - 1, true); }
    if (t.o) RING(f, t.o.w, t.o.off, t.o.t);
    return f;
  };

