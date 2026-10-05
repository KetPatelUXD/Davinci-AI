  return {
    V, SOL, bnum, T, AL, ES, TS, ICON, ICON_DEFAULT, decode, mkFrame, pageRoot, MID, CN, toLight,
    /** Builds variants [from,to) of a factored spec into a staging frame (created by the first call). */
    async build(ENC, o) {
      const page = figma.currentPage;
      let staging = o.staging ? await figma.getNodeByIdAsync(o.staging) : null;
      if (!staging) { staging = figma.createFrame(); staging.name = 'STAGING'; staging.fills = []; page.appendChild(staging); staging.x = -4000; staging.y = 0; staging.resize(400, 400); }
      const all = decode(ENC); const ids = [];
      for (const v of all.slice(o.from || 0, o.to === undefined ? all.length : o.to)) {
        const c = await mkFrame(v.tree, staging, true);
        c.name = ENC.axes.map((a) => a + '=' + v.combo[a]).join(', '); ids.push(c.id);
      }
      return { staging: staging.id, total: all.length, built: ids.length, now: staging.children.length };
    },
    /** Combines the staged components into a component set inside a documented section of the page root. */
    async finish(o) {
      const staging = await figma.getNodeByIdAsync(o.staging);
      const root = o.root ? await figma.getNodeByIdAsync(o.root) : await pageRoot(o.page, o.pageSubtitle);
      const sec = AL('VERTICAL', o.category + '/' + o.name); root.appendChild(sec); bnum(sec, 'itemSpacing', 16);
      await T(sec, o.category + '/' + o.name, 'type/heading-24');
      if (o.description) for (const line of o.description.split('\n')) { if (line) await T(sec, line, 'type/base', 'text/secondary', 1100); }
      const comps = staging.children.slice();
      const set = figma.combineAsVariants(comps, sec); set.name = o.name; set.layoutMode = 'NONE';
      const cols = o.cols || 5; let mw = 0, mh = 0;
      for (const c of comps) { mw = Math.max(mw, c.width); mh = Math.max(mh, c.height); }
      const cw = mw + 56, ch = mh + 48;
      comps.forEach((c, i) => { c.x = 24 + (i % cols) * cw; c.y = 24 + Math.floor(i / cols) * ch; });
      set.resizeWithoutConstraints(24 + cols * cw, 24 + Math.ceil(comps.length / cols) * ch);
      if (o.setDescription) set.description = o.setDescription;
      // component properties linked to layers (names come from the manifest: label, iconStart, hasIconStart, …)
      const defs = o.props || {}; const made = {};
      const own = (rt, name) => rt.findAll((n) => { if (n.name !== name) return false; let p = n.parent; while (p && p !== rt) { if (p.type === 'INSTANCE') return false; p = p.parent; } return true; });
      const addProp = (name, type, def) => { if (!made[name]) made[name] = set.addComponentProperty(name, type, def); return made[name]; };
      for (const part of Object.keys(o.links || {})) {
        const l = o.links[part];
        const first = own(set, part).find((n) => n.type === 'TEXT' || n.type === 'INSTANCE' || n.type === 'FRAME');
        if (!first) continue;
        let kText = null, kSwap = null, kVis = null;
        if (l.text && first.type === 'TEXT' && own(comps[0], part).length === 1) kText = addProp(l.text, 'TEXT', first.characters);
        if (l.swap && first.type === 'INSTANCE') kSwap = addProp(l.swap, 'INSTANCE_SWAP', ICON_DEFAULT);
        if (l.vis) kVis = addProp(l.vis, 'BOOLEAN', defs[l.vis] && defs[l.vis].default !== undefined ? defs[l.vis].default : true);
        for (const v of comps) { for (const nd of own(v, part)) { const r = {}; if (kText && nd.type === 'TEXT') r.characters = kText; if (kSwap && nd.type === 'INSTANCE') r.mainComponent = kSwap; if (kVis) r.visible = kVis; if (Object.keys(r).length) nd.componentPropertyReferences = r; } }
      }
      staging.remove();
      let lightId = null;
      if (o.light && o.light.length) {
        const f = AL('HORIZONTAL', 'Light preview'); sec.appendChild(f);
        f.fills = [SOL('bg/default')]; f.setExplicitVariableModeForCollection(CN.Semantic, MID('Semantic', 'Light'));
        bnum(f, 'itemSpacing', 16); ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'].forEach((k) => bnum(f, k, 24));
        f.cornerRadius = 24; f.strokes = [SOL('border/line-strong')]; f.strokeWeight = 1; f.counterAxisAlignItems = 'CENTER';
        for (const n of o.light) { const c = set.children.find((x) => x.name === n); if (c) { const inst = c.createInstance(); f.appendChild(inst); toLight(inst); } }
        lightId = f.id;
      }
      const reg = SETS(); reg[o.name] = set.id; figma.root.setSharedPluginData('dvlib', 'sets', JSON.stringify(reg));
      return { set: set.id, section: sec.id, variants: set.children.length, props: Object.keys(made), lightId, root: root.id };
    },
  };
