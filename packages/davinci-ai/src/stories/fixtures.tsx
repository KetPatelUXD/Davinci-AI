import type { ReactNode } from 'react';
import { AssetCell, Badge, Button, CodeChip, PriceChange, RowActions, type TableColumn } from '../index';

/** Fictional sample data shared by the component stories. Never real assessments, prices or brands. */
import { series, seriesDown } from './helpers';
export { series, seriesDown };

export const ITEMS = [{ id: 'nsc1', label: 'North Sea Crude M1', description: 'Dated Brent' }, { id: 'wtx1', label: 'Texas Light Sweet M1' }, { id: 'ttf1', label: 'Continental Gas M1' }];
export const RADIOS = [{ value: 'instant', label: 'Instant', description: 'As soon as a threshold is crossed' }, { value: 'digest', label: 'Daily digest', description: 'One summary each morning' }];
export const PEOPLE = [{ name: 'Ada Lovelace' }, { name: 'Bo Chen' }, { name: 'Cy Diaz' }, { name: 'Di Evans' }, { name: 'Ev Fox' }];
export const INTENTS = ['neutral', 'brand', 'positive', 'negative', 'warning', 'info'] as const;

export const NAV = [{ id: 'markets', label: 'Markets' }, { id: 'assessments', label: 'Assessments' }, { id: 'watchlists', label: 'Watchlists' }, { id: 'analytics', label: 'Analytics' }];
export const SIDE = [{ id: 'home', label: 'Overview', icon: 'house' }, { id: 'markets', label: 'Markets', icon: 'chart-line', badge: '12' }, { id: 'news', label: 'News', icon: 'newspaper' }, { id: 'settings', label: 'Settings', icon: 'gear' }];
export const MENU = [
  { id: 'open', label: 'Open assessment', icon: 'chart-line', shortcut: '⏎' },
  { id: 'alert', label: 'Create alert…', icon: 'bell' },
  { id: 'more', label: 'Export', icon: 'download', children: [{ id: 'csv', label: 'CSV' }, { id: 'xlsx', label: 'Excel' }] },
  { id: 'sep', type: 'separator' as const },
  { id: 'rm', label: 'Remove from watchlist', icon: 'trash', destructive: true },
];
export const TABS = [{ id: 'a', label: 'Overview', content: 'Overview content' }, { id: 'b', label: 'Positions', icon: 'list', content: 'Positions content' }, { id: 'c', label: 'Disabled', isDisabled: true, content: 'Unavailable' }];
export const COMMANDS = [{ id: 'm', label: 'Go to Markets', icon: 'chart-line', group: 'Navigate', shortcut: 'G M' }, { id: 'w', label: 'Go to Watchlists', icon: 'list', group: 'Navigate' }, { id: 'a', label: 'New alert', icon: 'bell', group: 'Create', shortcut: 'N' }];

export const Slot = () => <div style={{ height: 38, borderRadius: 999, border: '1px dashed var(--dv-text-muted)', color: 'var(--dv-text-muted)', display: 'grid', placeItems: 'center', fontSize: 12 }}>Control</div>;
export const Frame = ({ children, w = 520, h }: { children: ReactNode; w?: number | string; h?: number }) => <div style={{ width: w, height: h }}>{children}</div>;
export const OpenButton = ({ children = 'Open' }: { children?: ReactNode }) => <Button variant="subtle">{children}</Button>;

export interface AssetRow { id: string; name: string; category: string; code: string; chg: number; icon: string }
export const ROWS: AssetRow[] = [
  { id: 'nsc1', name: 'North Sea Crude M1', category: 'Crude oil', code: 'NSC1', chg: 1.42, icon: 'droplet' },
  { id: 'wtx1', name: 'Texas Light Sweet M1', category: 'Crude oil', code: 'WTX1', chg: -0.86, icon: 'droplet' },
  { id: 'ttf1', name: 'Continental Gas M1', category: 'Natural gas', code: 'TTF1', chg: -2.14, icon: 'fire' },
];
export const COLUMNS: TableColumn<AssetRow>[] = [
  { id: 'name', header: 'Assessment', isRowHeader: true, allowsSorting: true, cell: (r) => <AssetCell name={r.name} category={r.category} icon={r.icon} /> },
  { id: 'code', header: 'Code', cell: (r) => <CodeChip>{r.code}</CodeChip> },
  { id: 'chg', header: 'Chg %', numeric: true, allowsSorting: true, cell: (r) => <PriceChange percent={r.chg} hideIcon /> },
  { id: 'act', header: <span className="dv:sr-only">Actions</span>, textValue: 'Actions', align: 'end', cell: (r) => <RowActions name={r.name} items={[{ id: 'o', label: 'Open', icon: 'chart-line' }]} /> },
];
export const LIST_ITEMS = [{ id: 'a', title: 'NSC1 above 85.00', description: 'Created today', icon: 'bell', trailing: <Badge intent="positive">Active</Badge> }, { id: 'b', title: 'TTF1 below 30.00', description: 'Created yesterday', icon: 'bell', trailing: <Badge>Paused</Badge> }];
export const TREE = [{ id: 'oil', label: 'Oil & products', icon: 'droplet', children: [{ id: 'nsc1', label: 'North Sea Crude M1' }, { id: 'uls', label: 'NWE Diesel 10ppm' }] }, { id: 'gas', label: 'Gas & power', icon: 'fire', children: [{ id: 'ttf1', label: 'Continental Gas M1' }] }];
export const DESCRIPTIONS = [{ term: 'Notional', details: '$2,115,000.00' }, { term: 'Est. fees', details: '$412.50' }, { term: 'Settlement', details: 'T+2' }];

export const LONG = Array.from({ length: 60 }, (_, i) => 80 + Math.sin(i / 6) * 2 + i * 0.05 + Math.cos(i / 2.3) * 0.6);
export const X_LABELS = ['Sep 02', 'Sep 09', 'Sep 16', 'Sep 23', 'Sep 30'];
export const SEGMENTS = [{ id: 'oil', label: 'Oil & products', value: 11 }, { id: 'gas', label: 'Gas & power', value: 8 }, { id: 'fm', label: 'Freight & metals', value: 5 }];
export const LEGEND = [{ id: 'oil', label: 'Oil & products', value: 11, percent: 46 }, { id: 'gas', label: 'Gas & power', value: 8, percent: 33 }, { id: 'fm', label: 'Freight & metals', value: 5, percent: 21 }];
export const MARKETS = [{ name: 'Brent-style', change: 1.42 }, { name: 'WTI-style', change: 0.88 }, { name: 'Diesel', change: -0.86 }, { name: 'Jet', change: 0.31 }, { name: 'Gas TTF', change: -2.14 }, { name: 'Power DE', change: -0.42 }];
export const FILTERS = [{ id: 'crude', label: 'Crude' }, { id: 'products', label: 'Products' }, { id: 'gas', label: 'Gas' }, { id: 'freight', label: 'Freight' }];
export const NEWS = [{ id: '1', time: '09:42', headline: 'North Sea loading programme revised lower', source: 'Fictional Wire', tags: ['Crude'], unread: true, summary: 'Sample text only. Programme trimmed ~4% against schedule.' }, { id: '2', time: '09:15', headline: 'Diesel stocks draw for a third week', source: 'Fictional Wire', tags: ['Products'], summary: 'Sample text only.' }];
export const TAPE = [{ id: 'a', symbol: 'NSC1', last: 84.62, changePercent: 1.42 }, { id: 'b', symbol: 'WTX1', last: 80.11, changePercent: -0.86 }, { id: 'c', symbol: 'TTF1', last: 31.08, changePercent: -2.14 }, { id: 'd', symbol: 'CPF', last: 18420, changePercent: 1.95 }];
export const QUOTE_STATS = [{ label: 'Open', value: '83.44' }, { label: 'High', value: '85.10' }, { label: 'Low', value: '82.97' }, { label: 'Volume', value: '412k' }];
export const CONTEXTS = [{ id: 'nsc1', label: 'NSC1' }];
export const MODES = [{ id: 'markets', label: 'Markets' }, { id: 'news', label: 'News' }];
export const PROMPTS = ['Why did crude rise?', 'Compare cracks', 'Summarise news'];
export const WL = [
  { id: 'nsc1', symbol: 'NSC1', name: 'North Sea Crude M1', last: 84.62, change: 1.19, changePercent: 1.42, series },
  { id: 'wtx1', symbol: 'WTX1', name: 'Texas Light Sweet M1', last: 80.11, change: -0.69, changePercent: -0.86, series: seriesDown },
  { id: 'ttf1', symbol: 'TTF1', name: 'Continental Gas M1', last: 31.08, change: -0.68, changePercent: -2.14, series: seriesDown },
];
