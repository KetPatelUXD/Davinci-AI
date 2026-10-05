  const AL = (dir, name) => { const f = figma.createAutoLayout(dir); f.name = name; f.fills = []; return f; };
  const T = async (p, s, style, col, w) => {
    const t = figma.createText(); p.appendChild(t); await t.setTextStyleIdAsync(TS[style].id); t.characters = s; t.fills = [SOL(col || 'text/default')];
    if (w) { t.resize(w, t.height); t.textAutoResize = 'HEIGHT'; } return t;
  };
  const pageRoot = async (title, subtitle) => {
    const page = figma.currentPage;
    let r = page.findOne((n) => n.type === 'FRAME' && n.name === title + ' (new)' && n.parent === page);
    if (r) return r;
    const old = page.children.filter((n) => n.type === 'FRAME' && n.name !== 'STAGING');
    r = AL('VERTICAL', title + ' (new)'); page.appendChild(r);
    r.fills = [SOL('bg/default')]; ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'].forEach((k) => bnum(r, k, 80)); bnum(r, 'itemSpacing', 64);
    r.resize(1700, 100); r.primaryAxisSizingMode = 'AUTO'; r.counterAxisSizingMode = 'FIXED';
    r.x = old.length ? Math.max(...old.map((n) => n.x + n.width)) + 400 : 0; r.y = 0;
    const hd = AL('VERTICAL', 'Header'); r.appendChild(hd); bnum(hd, 'itemSpacing', 8);
    await T(hd, 'COMPONENTS', 'type/overline', 'text/muted'); await T(hd, title, 'type/display-48'); if (subtitle) await T(hd, subtitle, 'type/body-lg', 'text/secondary', 900);
    return r;
  };
  const toLight = (node) => {
    const swap = (n) => { if ('effectStyleId' in n && n.effectStyleId && ESID[n.effectStyleId] && /\/Dark$/.test(ESID[n.effectStyleId].name)) { const l = ES[ESID[n.effectStyleId].name.replace(/\/Dark$/, '/Light')]; if (l) n.effectStyleId = l.id; } };
    swap(node); if ('children' in node) node.findAll(() => true).forEach(swap);
  };

