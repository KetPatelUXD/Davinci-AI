import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';
import type { SortDescriptor } from 'react-aria-components';
import { Table, TableToolbar, AssetCell, RowActions, type TableColumn } from './Table';
import { List, TreeView, DescriptionList } from './List';
import { Card } from '../layout/Card';
import { CodeChip } from '../display/CodeChip';
import { PriceChange, PriceFlash } from '../finance/PriceChange';
import { Sparkline } from '../finance/Sparkline';
import { DayRange } from '../finance/DayRange';
import { SegmentedControl } from '../actions/SegmentedControl';
import { SearchField } from '../inputs/TextField';
import { IconButton } from '../actions/IconButton';
import { Badge } from '../display/Badge';
import { series, seriesDown } from '../../stories/helpers';

interface Row { id: string; name: string; category: string; code: string; last: number; chg: number; low: number; high: number; series: number[]; icon: string }
const rows: Row[] = [
  { id: 'nsc1', name: 'North Sea Crude M1', category: 'Crude oil', code: 'NSC1', last: 84.62, chg: 1.42, low: 82.97, high: 85.1, series, icon: 'droplet' },
  { id: 'wtx1', name: 'Texas Light Sweet M1', category: 'Crude oil', code: 'WTX1', last: 80.11, chg: -0.86, low: 79.4, high: 81.2, series: seriesDown, icon: 'droplet' },
  { id: 'ttf1', name: 'Continental Gas M1', category: 'Natural gas', code: 'TTF1', last: 31.08, chg: -2.14, low: 30.5, high: 32.4, series: seriesDown, icon: 'fire' },
  { id: 'cpf', name: 'Capesize 5TC', category: 'Dry freight', code: 'CPF', last: 18420, chg: 1.95, low: 17900, high: 18600, series, icon: 'ship' },
  { id: 'alu3', name: 'Aluminium 3M', category: 'Base metals', code: 'ALU3', last: 2318, chg: 0.37, low: 2290, high: 2340, series, icon: 'mountain' },
];
const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const columns: TableColumn<Row>[] = [
  { id: 'name', header: 'Assessment', isRowHeader: true, allowsSorting: true, cell: (r) => <AssetCell name={r.name} category={r.category} icon={r.icon} /> },
  { id: 'code', header: 'Code', cell: (r) => <CodeChip>{r.code}</CodeChip> },
  { id: 'last', header: 'Last', numeric: true, allowsSorting: true, cell: (r) => <PriceFlash value={r.last}>{fmt(r.last)}</PriceFlash> },
  { id: 'chg', header: 'Chg %', numeric: true, allowsSorting: true, cell: (r) => <PriceChange percent={r.chg} hideIcon /> },
  { id: 'range', header: 'Day range', cell: (r) => <DayRange low={r.low} high={r.high} value={r.last} /> },
  { id: 'trend', header: '30D', cell: (r) => <Sparkline data={r.series} height={30} style={{ width: 120 }} animate={false} baseline={false} decorative /> },
  { id: 'act', header: <span className="dv:sr-only">Actions</span>, textValue: 'Actions', align: 'end', cell: (r) => <RowActions name={r.name} items={[{ id: 'o', label: 'Open', icon: 'chart-line' }, { id: 'a', label: 'Create alert', icon: 'bell' }]} /> },
];

const meta = {
  title: 'Components/Data/Table',
  component: Table,
  parameters: { layout: 'padded', docs: { components: ["Table", "TableToolbar", "AssetCell", "RowActions", "List", "TreeView", "DescriptionList"], description: { component: 'Data table styled like the Graphite reference: toolbar row, `panel` header with 12px muted labels and sort glyphs, two-line primary cells, `CodeChip`, right-aligned tabular numbers, `PriceChange`, day-range marker, monochrome sparkline, kebab actions, 1px `line` dividers, soft row hover.\n\n**Keyboard:** arrow keys move between cells, Space selects, Enter/Click on header sorts, Enter on a row triggers `onRowAction`. **Grid tokens** (`grid-header-bg`, `grid-row-hover`, `grid-border`, `grid-cell-padding-*`, `grid-font-size`) are named so an AG Grid theme can be generated later.' } } },
} satisfies Meta<typeof Table>;
export default meta;
type S = StoryObj<typeof meta>;
type Args = Parameters<typeof Table<Row>>[0];

const Wrapped = (p: Partial<Args>) => <Card padded={false} style={{ overflow: 'hidden' }}><Table<Row> aria-label="Watchlist" columns={columns} rows={rows} {...p} /></Card>;

export const Default: S = {
  args: { 'aria-label': 'Watchlist', columns: columns as never, rows: rows as never },
  render: () => (
    <Wrapped toolbar={<TableToolbar end={<><SearchField aria-label="Search assessments" placeholder="Search assessments" /><IconButton label="Filter" icon="filter" /></>}><SegmentedControl aria-label="View" defaultValue="watchlist" options={[{ id: 'watchlist', label: 'Watchlist' }, { id: 'recent', label: 'Recently viewed' }, { id: 'alerts', label: 'Alerts' }]} /></TableToolbar>} />
  ),
};
function SortableDemo() {
  const [d, setD] = useState<SortDescriptor>({ column: 'last', direction: 'descending' });
  const sorted = [...rows].sort((a, b) => (d.direction === 'ascending' ? 1 : -1) * ((a as never)[d.column as 'last'] > (b as never)[d.column as 'last'] ? 1 : -1));
  return <Wrapped rows={sorted} sortDescriptor={d} onSortChange={setD} />;
}
export const Sortable: S = { args: Default.args, render: () => <SortableDemo /> };
export const Selectable: S = { args: Default.args, render: () => <Wrapped selectionMode="multiple" /> };
export const Compact: S = { args: Default.args, globals: { density: 'compact' }, render: () => <Wrapped density="compact" zebra /> };
export const Loading: S = { args: Default.args, render: () => <Wrapped isLoading /> };
export const Empty: S = { args: Default.args, render: () => <Wrapped rows={[]} /> };

export const ListsAndTrees: S = {
  args: Default.args,
  render: () => (
    <div style={{ display: 'grid', gap: 32, gridTemplateColumns: 'repeat(3, minmax(0, 320px))' }}>
      <List aria-label="Alerts" selectionMode="single" items={[{ id: 'a', title: 'NSC1 above 85.00', description: 'Created today', icon: 'bell', trailing: <Badge tone="positive">Active</Badge> }, { id: 'b', title: 'TTF1 below 30.00', description: 'Created yesterday', icon: 'bell', trailing: <Badge>Paused</Badge> }]} />
      <TreeView aria-label="Instruments" defaultExpandedKeys={['oil']} nodes={[{ id: 'oil', label: 'Oil & products', icon: 'droplet', children: [{ id: 'nsc1', label: 'North Sea Crude M1' }, { id: 'uls', label: 'NWE Diesel 10ppm' }] }, { id: 'gas', label: 'Gas & power', icon: 'fire', children: [{ id: 'ttf1', label: 'Continental Gas M1' }] }]} />
      <DescriptionList items={[{ term: 'Notional', details: '$2,115,000.00' }, { term: 'Est. fees', details: '$412.50' }, { term: 'Settlement', details: 'T+2' }]} />
    </div>
  ),
};

export const RowHover: S = { args: Default.args, render: () => <Wrapped />, play: async ({ canvasElement }) => { await userEvent.hover(canvasElement.querySelector('.dv-table__row') as HTMLElement); } };
