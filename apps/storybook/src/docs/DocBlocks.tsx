import { useState, type CSSProperties, type ReactNode } from 'react';
import { tokens } from '@davinci-ai/react/tokens';
import { Badge, BUILTIN_ICONS, Button, Card, Icon, Kbd, Panel, SegmentedControl, Switch, Text, ThemeProvider, useTheme } from '@davinci-ai/react';

const mono: CSSProperties = { fontFamily: 'var(--dv-font-mono)', fontSize: 11.5, color: 'var(--dv-text-secondary)' };

/** Renders the docs content in both themes side by side so light/dark are reviewed together. */
export function BothThemes({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))' }}>
      {(['dark', 'light'] as const).map((t) => (
        <ThemeProvider key={t} theme={t} canvas style={{ padding: 20, borderRadius: 24 }}>
          <div style={{ ...mono, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>{t}</div>
          {children}
        </ThemeProvider>
      ))}
    </div>
  );
}

const GROUPS: Record<string, string[]> = {
  Canvas: ['bg', 'bg-elevated', 'surface', 'raised', 'well', 'hover', 'field', 'row-hover', 'glass', 'scrim'],
  Edges: ['line', 'line-strong', 'border-strong', 'focus', 'focus-halo'],
  Text: ['text', 'text-secondary', 'text-muted', 'text-disabled', 'on', 'on-text', 'on-fill'],
  Brand: ['brand', 'brand-fill', 'wash-brand'],
  Positive: ['positive', 'positive-fill', 'wash-positive'],
  Negative: ['negative', 'negative-fill', 'wash-negative'],
  Warning: ['warning', 'warning-fill', 'wash-warning'],
  Info: ['info', 'info-fill', 'wash-info'],
  'Data viz': ['data-1', 'data-2', 'data-3', 'data-4', 'data-5', 'data-6', 'chart-line', 'chart-band', 'chart-grid', 'chart-dots'],
  Light: ['ambient-glow', 'ambient-beam', 'spotlight-edge', 'spotlight-fill'],
};

/** Semantic colour roles for the active theme with token name, CSS variable and resolved value. */
export function ColorSwatches() {
  const { theme } = useTheme();
  const values = tokens[theme === 'light' ? 'light' : 'dark'] as Record<string, string>;
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {Object.entries(GROUPS).map(([group, names]) => (
        <section key={group}>
          <div role="heading" aria-level={4} style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--dv-text)' }}>{group}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {names.map((n) => (
              <div key={n} style={{ display: 'grid', gap: 6 }}>
                <div style={{ height: 44, borderRadius: 12, background: `var(--dv-${n})`, boxShadow: 'inset 0 0 0 1px var(--dv-line-strong)' }} />
                <div style={{ fontSize: 12, fontWeight: 500 }}>{n}</div>
                <div style={mono}>--dv-{n}</div>
                <div style={mono}>{values[n]}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function GradientSwatches() {
  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
      {[['card', 'Card fill'], ['panel', 'Panel / pill bar / table header']].map(([n, d]) => (
        <div key={n} style={{ display: 'grid', gap: 6 }}>
          <div style={{ height: 120, borderRadius: 26, background: `var(--dv-${n})`, boxShadow: 'var(--dv-shadow-card)' }} />
          <div style={{ fontSize: 12, fontWeight: 500 }}>{n} · {d}</div>
          <div style={mono}>--dv-{n}</div>
        </div>
      ))}
    </div>
  );
}

const SCALE: [string, string, string][] = [
  ['overline', '11 / 16 · 500 · +0.04em', 'OVERLINE'],
  ['small', '12 / 16 · 400', 'Small – table headers, captions'],
  ['base', '13 / 19 · 400 (dense default)', 'Base – the default for data-dense screens'],
  ['comfortable', '14 / 20 · 400', 'Comfortable – sparse forms'],
  ['card-title', '16 / 23 · 400 · secondary', 'Card title (quiet)'],
  ['section', '15 / 22 · 600', 'Section heading'],
  ['title', '20 / 29 · 600', 'Page title'],
  ['heading-24', '24 / 32 · 600', 'Heading 24'],
  ['heading-32', '32 / 40 · 600', 'Heading 32'],
  ['display-42', '42 · 300 · −0.035em', '84.62'],
  ['display-48', '48 · 300 · −0.035em', '24'],
  ['display-64', '64 · 300 · −0.035em', '84.62'],
];
export function TypeScale() {
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      {SCALE.map(([n, spec, sample]) => (
        <div key={n} style={{ display: 'grid', gridTemplateColumns: '160px 220px 1fr', alignItems: 'baseline', gap: 16, padding: '10px 0', boxShadow: '0 1px 0 var(--dv-line)' }}>
          <span style={mono}>type/{n}</span>
          <span style={mono}>{spec}</span>
          <span style={{ fontSize: `var(--dv-type-${n}-size)`, lineHeight: `var(--dv-type-${n}-lh)`, fontWeight: `var(--dv-type-${n}-weight)` as never, letterSpacing: `var(--dv-type-${n}-ls)`, fontVariantNumeric: 'tabular-nums', textTransform: n === 'overline' ? 'uppercase' : undefined, color: n === 'card-title' ? 'var(--dv-text-secondary)' : undefined }}>{sample}</span>
        </div>
      ))}
    </div>
  );
}

export function SizeTable() {
  const c = tokens.component;
  const rows = ['button-height', 'button-px', 'button-font', 'button-icon', 'button-gap', 'icon-button', 'input-height'];
  const sizes = ['sm', 'md', 'lg', 'xl'];
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', fontVariantNumeric: 'tabular-nums' }}>
      <thead><tr><th style={{ textAlign: 'left' }}>Token</th>{sizes.map((s) => <th key={s} colSpan={2} style={{ textAlign: 'left' }}>{s}</th>)}</tr><tr><th />{sizes.flatMap((s) => [<th key={s + 'c'} style={{ ...mono, textAlign: 'left' }}>comfortable</th>, <th key={s + 'k'} style={{ ...mono, textAlign: 'left' }}>compact</th>])}</tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r} style={{ boxShadow: '0 1px 0 var(--dv-line)' }}>
            <td style={{ ...mono, padding: '6px 0' }}>{r}-*</td>
            {sizes.flatMap((s) => [
              <td key={s + 'c'}>{(c.comfortable as Record<string, string>)[`${r}-${s}`] ?? '—'}</td>,
              <td key={s + 'k'}>{(c.compact as Record<string, string>)[`${r}-${s}`] ?? '—'}</td>,
            ])}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RadiusSamples() {
  const items: [string, string][] = [['pill', 'Buttons, tabs, chips, switches, avatars'], ['card', 'Cards, dialogs (26)'], ['composer', 'Composer (26)'], ['panel', 'Nested panels (20)'], ['tile', 'Tiles (16)'], ['control', 'Inputs & selects (14)'], ['menu', 'Menus & popovers (16)'], ['tooltip', 'Tooltips (12)'], ['code', 'Code chips (7)']];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
      {items.map(([n, d]) => (
        <div key={n} style={{ display: 'grid', gap: 6 }}>
          <div style={{ height: 70, background: 'var(--dv-panel)', boxShadow: 'var(--dv-inset-line-strong)', borderRadius: `var(--dv-radius-${n})` }} />
          <div style={{ fontSize: 12, fontWeight: 500 }}>radius/{n}</div>
          <div style={mono}>{d}</div>
        </div>
      ))}
    </div>
  );
}

export function ElevationSamples() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 28, padding: 12 }}>
      {[['shadow-card', 'Card'], ['shadow-pop', 'Popover'], ['shadow-glass', 'Glass (floating)'], ['shadow-tip', 'Tooltip'], ['shadow-on', 'Primary pill glow'], ['shadow-thumb', 'Selected nav pill']].map(([n, d]) => (
        <div key={n} style={{ display: 'grid', gap: 10 }}>
          <div style={{ height: 80, borderRadius: 20, background: n === 'shadow-glass' ? 'var(--dv-glass)' : 'var(--dv-surface)', boxShadow: `var(--dv-${n})`, backdropFilter: 'blur(24px) saturate(140%)' }} />
          <div style={{ fontSize: 12, fontWeight: 500 }}>{d}</div>
          <div style={mono}>--dv-{n}</div>
        </div>
      ))}
    </div>
  );
}

export function MotionDemos() {
  const [on, setOn] = useState('b');
  const [sw, setSw] = useState(true);
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gap: 6 }}><Text variant="small" tone="muted">Segmented thumb slides (300ms) · press scale .985 (120ms) · switch thumb slides</Text>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <SegmentedControl aria-label="Demo" value={on} onChange={setOn} options={[{ id: 'a', label: 'One' }, { id: 'b', label: 'Two' }, { id: 'c', label: 'Three' }]} />
          <Button>Press me</Button>
          <Switch isSelected={sw} onChange={setSw}>Switch</Switch>
        </div>
      </div>
      <Text variant="small" tone="muted">Durations 120 / 160 / 200 ms · easing cubic-bezier(.3,.7,.4,1) · cards rise 12px / 700ms with 40ms stagger · chart line draws 1.6s · donut arcs sweep · numerals count up 1.2s. <b>All motion honours prefers-reduced-motion</b>; the only looping animation is the slow ambient beam.</Text>
    </div>
  );
}

export function KeyboardMap() {
  const rows: [string, string[], string][] = [
    ['Button / IconButton / Link', ['Enter', 'Space'], 'Activate'],
    ['SegmentedControl / RadioGroup', ['←', '→', '↑', '↓'], 'Move and select (one tab stop)'],
    ['Tabs / PillTabs', ['←', '→', 'Home', 'End'], 'Move between tabs (automatic activation)'],
    ['Select / Menu / ComboBox', ['Enter', '↓', 'Esc', 'type-ahead'], 'Open, move, close; focus returns to the trigger'],
    ['Menu', ['→', '←'], 'Open / close submenu'],
    ['Table', ['↑', '↓', '←', '→', 'Space', 'Enter'], 'Navigate cells, select row, run row action'],
    ['NumberField', ['↑', '↓', 'PageUp', 'PageDown', 'Home', 'End'], 'Step, large step, min/max'],
    ['Slider', ['←', '→', 'PageUp', 'PageDown', 'Home', 'End'], 'Adjust value'],
    ['Dialog / Drawer / Popover', ['Esc', 'Tab'], 'Close; focus is trapped in modals and restored on close'],
    ['SplitPane', ['←', '→', 'PageUp', 'PageDown', 'Home', 'End'], 'Resize (2% / 10%)'],
    ['PriceChart', ['←', '→', 'Home', 'End', 'PageUp', 'PageDown', 'Esc'], 'Move the crosshair; value announced politely'],
    ['Composer', ['Enter', 'Shift+Enter', '⌘/Ctrl+L'], 'Send, new line, focus the composer'],
    ['CommandPalette', ['⌘/Ctrl+K', '↑', '↓', 'Enter', 'Esc'], 'Open, move, run, close'],
    ['ContextMenu', ['Menu key', 'Shift+F10'], 'Open without a mouse'],
  ];
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead><tr><th style={{ textAlign: 'left', padding: '6px 0' }}>Component</th><th style={{ textAlign: 'left' }}>Keys</th><th style={{ textAlign: 'left' }}>Result</th></tr></thead>
      <tbody>{rows.map(([c, keys, r]) => (<tr key={c} style={{ boxShadow: '0 1px 0 var(--dv-line)', verticalAlign: 'top' }}><td style={{ padding: '8px 12px 8px 0', fontWeight: 500 }}>{c}</td><td style={{ padding: '8px 12px 8px 0' }}><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{keys.map((k) => <Kbd key={k}>{k}</Kbd>)}</div></td><td style={{ color: 'var(--dv-text-secondary)' }}>{r}</td></tr>))}</tbody>
    </table>
  );
}

export function IconGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
      {Object.keys(BUILTIN_ICONS).map((n) => (<div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}><Icon name={n} size={18} /><code>{n}</code></div>))}
    </div>
  );
}

export function DensityDemo() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
      {(['comfortable', 'compact'] as const).map((d) => (
        <Card key={d} title={d} data-density={d} style={{ padding: 20 }}>
          <div data-density={d} style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Button size="sm">sm</Button><Button>md</Button><Button size="lg">lg</Button></div>
            <Panel><Badge>Panel padding var(--dv-panel-p)</Badge></Panel>
          </div>
        </Card>
      ))}
    </div>
  );
}
