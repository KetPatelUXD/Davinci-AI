  const COLS = await figma.variables.getLocalVariableCollectionsAsync();
  const CN = Object.fromEntries(COLS.map((c) => [c.name, c]));
  const ALLV = await figma.variables.getLocalVariablesAsync();
  const REG = {};
  for (const v of ALLV) REG[COLS.find((c) => c.id === v.variableCollectionId).name + '/' + v.name] = v;
  const V = (n) => REG[n] || REG['Semantic/' + n] || REG['Component/' + n] || REG['Primitives/' + n] || (() => { throw new Error('no variable ' + n); })();
  const MID = (c, m) => CN[c].modes.find((x) => x.name === m).modeId;
  for (const s of ['Light', 'Regular', 'Medium', 'Semi Bold', 'Bold']) await figma.loadFontAsync({ family: 'Inter', style: s });
  const TSL = await figma.getLocalTextStylesAsync();
  const TS = Object.fromEntries(TSL.map((s) => [s.name, s]));
  const ESL = await figma.getLocalEffectStylesAsync();
  const ES = Object.fromEntries(ESL.map((s) => [s.name, s]));
  const ESID = Object.fromEntries(ESL.map((s) => [s.id, s]));
  const SOL = (n) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V(n));
  const NT = { s: {}, r: {} };
  for (const v of ALLV) {
    if (v.variableCollectionId === CN.Primitives.id) {
      const x = v.valuesByMode[CN.Primitives.modes[0].modeId];
      if (v.name.startsWith('space/')) NT.s[x] = NT.s[x] || v.name;
      if (v.name.startsWith('radius/')) NT.r[x] = NT.r[x] || v.name;
    }
  }
  NT.r[9999] = 'radius/pill';
  const bnum = (n, f, val, kind) => {
    kind = kind || 's';
    if (typeof val === 'string') n.setBoundVariable(f, V(val));
    else { n[f] = val; const t = NT[kind][val]; if (t) n.setBoundVariable(f, V(t)); }
  };
  const GT = (deg) => { const r = (deg - 90) * Math.PI / 180, dx = Math.cos(r), dy = Math.sin(r), tx = 0.5 - dx / 2 + dy / 2, ty = 0.5 - dy / 2 - dx / 2; return [[dx, dy, -(dx * tx + dy * ty)], [-dy, dx, -(-dy * tx + dx * ty)]]; };
  const SHEEN = (kind) => {
    const st = kind === 'card' ? [['sheen/card-0', 0], ['sheen/card-34', 0.34], ['sheen/card-100', 1]] : [['sheen/panel-0', 0], ['sheen/panel-100', 1]];
    return { type: 'GRADIENT_LINEAR', gradientTransform: GT(kind === 'card' ? 158 : 170), gradientStops: st.map(([n, p]) => ({ position: p, color: { r: 1, g: 1, b: 1, a: 1 }, boundVariables: { color: { type: 'VARIABLE_ALIAS', id: V(n).id } } })) };
  };
  const ICON = await figma.getNodeByIdAsync('10:26');
  const ICON_DEFAULT = ICON.children.find((k) => k.name === 'style=light, size=16').id;
  const WN = { '300': 'Light', '400': 'Regular', '500': 'Medium', '600': 'Semi Bold', '700': 'Bold' };

