  const RING = (comp, w, off, tok) => {
    comp.clipsContent = false;
    const rr = Math.min(typeof comp.topLeftRadius === 'number' ? comp.topLeftRadius : 0, Math.min(comp.width, comp.height) / 2);
    const mk = (name, o, col, wt, rad) => { const x = figma.createRectangle(); x.name = name; comp.appendChild(x); x.layoutPositioning = 'ABSOLUTE'; x.fills = []; x.resize(comp.width + o * 2, comp.height + o * 2); x.x = -o; x.y = -o; x.cornerRadius = rad; x.strokes = [SOL(col)]; x.strokeWeight = wt; x.strokeAlign = 'OUTSIDE'; x.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' }; };
    if (off < 0) { const x = figma.createRectangle(); x.name = 'Focus ring'; comp.appendChild(x); x.layoutPositioning = 'ABSOLUTE'; x.fills = []; x.resize(comp.width, comp.height); x.x = 0; x.y = 0; x.cornerRadius = rr; x.strokes = [SOL(tok || 'focus/ring')]; x.strokeWeight = w; x.strokeAlign = 'INSIDE'; x.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' }; return; }
    mk('Focus gap', 0, 'bg/default', off, rr);
    mk('Focus ring', off, tok || 'focus/ring', w, rr + off);
  };
  const OVER = (comp, a, white) => {
    const o = figma.createRectangle(); o.name = 'State overlay'; comp.appendChild(o);
    o.layoutPositioning = 'ABSOLUTE'; o.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' }; o.x = 0; o.y = 0; o.resize(comp.width, comp.height);
    o.cornerRadius = Math.min(typeof comp.topLeftRadius === 'number' ? comp.topLeftRadius : 0, Math.min(comp.width, comp.height) / 2);
    o.fills = [{ type: 'SOLID', color: white ? { r: 1, g: 1, b: 1 } : { r: 0, g: 0, b: 0 }, opacity: a }]; o.strokes = [];
  };
  const mkText = async (t, parent) => {
    const tx = t.tx; const n = figma.createText(); parent.appendChild(n);
    const fs = WN[tx.w] || 'Regular';
    const cands = TSL.filter((s) => s.fontName.style === fs).sort((a, b) => Math.abs(a.fontSize - tx.s) - Math.abs(b.fontSize - tx.s));
    if (cands[0]) await n.setTextStyleIdAsync(cands[0].id); else n.fontName = { family: 'Inter', style: fs };
    n.characters = t.tc;
    n.fills = [tx.c ? SOL(tx.c) : { type: 'SOLID', color: { r: tx.cc[0], g: tx.cc[1], b: tx.cc[2] }, opacity: tx.cc[3] }];
    if (tx.st) n.setBoundVariable('fontSize', V(tx.st)); else if (!cands[0] || cands[0].fontSize !== tx.s) n.fontSize = tx.s;
    if (tx.up) n.textCase = 'UPPER';
    if (tx.ul) n.textDecoration = 'UNDERLINE';
    if (tx.al) n.textAlignHorizontal = ({ center: 'CENTER', right: 'RIGHT', end: 'RIGHT' })[tx.al] || 'LEFT';
    if (t.tw) { n.resize(t.tw, n.height); n.textAutoResize = 'HEIGHT'; }
    n.name = t.n; return n;
  };
  const mkIcon = (t, parent) => {
    const c = ICON.children.find((k) => k.name === 'style=light, size=' + t.w) || ICON.children.find((k) => k.name === 'style=light, size=16');
    const i = c.createInstance(); parent.appendChild(i);
    if (t.ic) i.setProperties({ 'name#10:0': t.ic });
    i.children[0].fills = [t.ct ? SOL(t.ct) : { type: 'SOLID', color: { r: t.c[0], g: t.c[1], b: t.c[2] }, opacity: t.c[3] }];
    i.name = t.n; return i;
  };
  const mkVector = (t, parent) => {
    const g = figma.createNodeFromSvg(t.svg); parent.appendChild(g); g.name = t.n; g.fills = []; g.clipsContent = false;
    const geo = g.findAll((n) => ['VECTOR', 'ELLIPSE', 'RECTANGLE', 'LINE', 'POLYGON', 'STAR', 'BOOLEAN_OPERATION'].includes(n.type));
    if (geo.length === (t.vt || []).length) geo.forEach((n, i) => { const [ft, st] = t.vt[i]; if (ft && n.fills.length) n.fills = [Object.assign({}, SOL(ft), { opacity: n.fills[0].opacity })]; if (st && n.strokes.length) n.strokes = [Object.assign({}, SOL(st), { opacity: n.strokes[0].opacity })]; });
    return g;
  };
  const SETS = () => JSON.parse(figma.root.getSharedPluginData('dvlib', 'sets') || '{}');
  const mkInst = async (c, parent) => {
    const setNode = await figma.getNodeByIdAsync(SETS()[c.cmp]);
    if (!setNode) throw new Error('component set not registered: ' + c.cmp);
    const want = Object.assign({}, c.ip || {}, { state: 'default' });
    const cand = setNode.children.find((v) => { const vp = Object.fromEntries(v.name.split(', ').map((x) => x.split('='))); return Object.keys(want).every((k) => vp[k] === undefined || vp[k] === String(want[k])); }) || setNode.defaultVariant;
    const inst = cand.createInstance(); parent.appendChild(inst); inst.name = c.n;
    if (c.tc) { const k = Object.keys(inst.componentProperties).find((x) => /^(label|children)#/.test(x) && inst.componentProperties[x].type === 'TEXT'); if (k) inst.setProperties({ [k]: c.tc }); else { const t = inst.findOne((n) => n.type === 'TEXT' && n.name !== 'Glyph' && !/Awesome/i.test(String(n.fontName.family))); if (t) { await figma.loadFontAsync(t.fontName); t.characters = c.tc; } } }
    if (c.tt) { const ts = inst.findAll((n) => n.type === 'TEXT' && !/Awesome/i.test(String(n.fontName.family))); if (ts.length === c.tt.length) for (let i = 0; i < ts.length; i++) { await figma.loadFontAsync(ts[i].fontName); ts[i].characters = c.tt[i]; } }
    if (c.ic) { const ic = inst.findAll((n) => n.type === 'INSTANCE' && Object.keys(n.componentProperties).some((x) => x.startsWith('name#')))[0]; if (ic) ic.setProperties({ [Object.keys(ic.componentProperties).find((x) => x.startsWith('name#'))]: c.ic }); }
    return inst;
  };
