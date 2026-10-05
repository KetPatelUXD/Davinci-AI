  const decode = (enc) => {
    const axes = enc.axes, values = enc.values, tables = enc.tables;
    const combos = values.reduce((a, vs) => a.flatMap((c) => vs.map((v) => c.concat([v]))), [[]]);
    const idx = tables.map((t) => new Map(t.r.map((row) => [row.slice(0, t.s.length).join('\u0001'), row.slice(t.s.length)])));
    const setPath = (o, path, v) => {
      if (v === undefined || (v && v['-'] === 1 && Object.keys(v).length === 1)) return;
      const ks = path === '' ? [] : path.split('.');
      let cur = o;
      ks.forEach((k, i) => {
        const last = i === ks.length - 1;
        const nk = /^\d+$/.test(k) ? +k : k;
        if (last) cur[nk] = v;
        else { if (cur[nk] === undefined) cur[nk] = /^\d+$/.test(ks[i + 1]) ? [] : {}; cur = cur[nk]; }
      });
    };
    const isAbs = (y) => y === undefined || (y && typeof y === 'object' && !Array.isArray(y) && y['-'] === 1 && Object.keys(y).length === 1);
    const clean = (x) => Array.isArray(x) ? x.filter((y) => !isAbs(y)).map(clean) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).filter(([k, v]) => k !== '-' && !isAbs(v)).map(([k, v]) => [k, clean(v)])) : x;
    return combos.map((combo) => {
      const tree = JSON.parse(JSON.stringify(enc.base || {}));
      tables.forEach((t, ti) => { const vals = idx[ti].get(t.s.map((i) => combo[i]).join('\u0001')); t.p.forEach((p, j) => setPath(tree, p, vals[j])); });
      return { combo: Object.fromEntries(axes.map((a, i) => [a, combo[i]])), tree: clean(tree) };
    });
  };

  const parseShadow = (txt) => {
    const m = /^(inset\s+)?(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?(?:\s+(-?[\d.]+)(?:px)?)?\s+(#[0-9a-fA-F]{6,8}|rgba?\([^)]+\))/.exec(txt.trim());
    if (!m) return null;
    let c;
    if (m[6][0] === '#') { const h = m[6].slice(1); c = { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255, a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 }; }
    else { const p = m[6].match(/[\d.]+/g).map(Number); c = { r: p[0] / 255, g: p[1] / 255, b: p[2] / 255, a: p[3] === undefined ? 1 : p[3] }; }
    return m[1] ? { type: 'INNER_SHADOW', color: c, offset: { x: +m[2], y: +m[3] }, radius: +m[4], spread: +(m[5] || 0), visible: true, blendMode: 'NORMAL' } : { type: 'DROP_SHADOW', color: c, offset: { x: +m[2], y: +m[3] }, radius: +m[4], spread: +(m[5] || 0), visible: true, blendMode: 'NORMAL', showShadowBehindNode: false };
  };
