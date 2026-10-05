import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppHeader, UserChip } from '../components/navigation/AppHeader';
import { PageHeader } from '../components/navigation/PageHeader';
import { SideNav } from '../components/navigation/SideNav';
import { Tabs } from '../components/navigation/Tabs';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { Pagination } from '../components/navigation/Pagination';
import { Stepper } from '../components/navigation/Stepper';
import { Menu } from '../components/navigation/Menu';
import { CommandPalette } from '../components/navigation/CommandPalette';
import { Popover } from '../components/overlays/Popover';
import { Dialog, ConfirmDialog } from '../components/overlays/Dialog';
import { Drawer } from '../components/overlays/Drawer';
import { Alert, Banner, InlineMessage } from '../components/overlays/Alert';
import { useEffect } from 'react';
import { ToastProvider, useToast } from '../components/overlays/Toast';
import { Stack, Grid, GridItem } from '../components/layout/Stack';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/layout/Card';
import { Panel } from '../components/layout/Panel';
import { AccentTile } from '../components/layout/AccentTile';
import { Toolbar } from '../components/layout/Toolbar';
import { SplitPane } from '../components/layout/SplitPane';
import { ScrollArea } from '../components/layout/ScrollArea';
import { Disclosure, Accordion, CollapsibleSection } from '../components/layout/Disclosure';
import { Table, TableToolbar, AssetCell, RowActions, type TableColumn } from '../components/data/Table';
import { List, TreeView, DescriptionList } from '../components/data/List';
import { Button } from '../components/actions/Button';
import { IconButton } from '../components/actions/IconButton';
import { SegmentedControl } from '../components/actions/SegmentedControl';
import { SearchField } from '../components/inputs/TextField';
import { TextField } from '../components/inputs/TextField';
import { Badge } from '../components/display/Badge';
import { CodeChip } from '../components/display/CodeChip';
import { PriceChange } from '../components/finance/PriceChange';

/** Internal hosts for `scripts/figma-extract.mjs` (Navigation, Overlays, Layout, Data). Not documentation. */
const meta = { title: 'Internal/Extract Shell', parameters: { layout: 'centered', docs: { disable: true } }, tags: ['!autodocs'] } satisfies Meta;
export default meta;
type S = StoryObj<typeof meta>;
const Col = ({ children, w = 520 }: { children: React.ReactNode; w?: number }) => <div style={{ display: 'grid', gap: 20, width: w, padding: 8, justifyItems: 'stretch' }}>{children}</div>;
const W = ({ id, children }: { id: string; children: React.ReactNode }) => <div id={id}>{children}</div>;

const NAV = [{ id: 'markets', label: 'Markets' }, { id: 'assessments', label: 'Assessments' }, { id: 'watchlists', label: 'Watchlists' }, { id: 'analytics', label: 'Analytics' }];
const SIDE = [{ id: 'home', label: 'Overview', icon: 'house' }, { id: 'markets', label: 'Markets', icon: 'chart-line', badge: '12' }, { id: 'news', label: 'News', icon: 'newspaper' }, { id: 'settings', label: 'Settings', icon: 'gear' }];
const MENU = [
  { id: 'open', label: 'Open assessment', icon: 'chart-line', shortcut: '⏎' },
  { id: 'alert', label: 'Create alert…', icon: 'bell' },
  { id: 'more', label: 'Export', icon: 'download', children: [{ id: 'csv', label: 'CSV' }, { id: 'xlsx', label: 'Excel' }] },
  { id: 'sep', type: 'separator' as const },
  { id: 'rm', label: 'Remove from watchlist', icon: 'trash', destructive: true },
];

export const AppHeaderFull: S = { render: () => <Col w={1040}><AppHeader nav={NAV} currentId="markets" actions={<><IconButton label="Search" icon="magnifying-glass" size="lg" /><UserChip name="Ket Patel" subtitle="Product Design" /></>} /></Col> };
export const UserChipFull: S = { render: () => <Col w={260}><UserChip name="Ket Patel" subtitle="Product Design" /></Col> };
export const PageHeaderFull: S = { render: () => <Col w={900}><PageHeader eyebrow="Overview" title="Markets" subtitle="Follow prices from assessment to decision" actions={<><Button variant="subtle" iconStart="filter">Filters</Button><Button iconStart="plus">New alert</Button></>} /></Col> };
export const SideNavFull: S = { render: () => (<Col w={300}>
  <W id="default"><SideNav items={SIDE} currentId="markets" /></W>
  <W id="collapsed"><SideNav defaultCollapsed items={SIDE} currentId="markets" /></W>
</Col>) };
export const TabsFull: S = { render: () => <Col w={520}><Tabs aria-label="Sections" items={[{ id: 'a', label: 'Overview', content: 'Overview content' }, { id: 'b', label: 'Positions', icon: 'list', content: 'Positions content' }, { id: 'c', label: 'Disabled', isDisabled: true, content: 'x' }]} /></Col> };
export const BreadcrumbsFull: S = { render: () => <Col><Breadcrumbs items={[{ id: 'home', label: 'Home', href: '#' }, { id: 'm', label: 'Markets', href: '#' }, { id: 'nsc1', label: 'North Sea Crude M1', href: '#' }]} /></Col> };
export const PaginationFull: S = { render: () => <Col><Pagination page={4} pageCount={12} onPageChange={() => {}} /></Col> };
export const StepperFull: S = { render: () => <Col><Stepper current={1} steps={[{ id: 'a', label: 'Instrument' }, { id: 'b', label: 'Quantity' }, { id: 'c', label: 'Review' }]} /></Col> };
export const MenuFull: S = { render: () => <div style={{ minHeight: 360, minWidth: 360, padding: 24 }}><Menu trigger={<Button id="open-trigger" variant="subtle" iconEnd="chevron-down">Actions</Button>} items={MENU} aria-label="Actions" /></div> };
export const CommandPaletteFull: S = { render: () => (<CommandPalette isOpen onRun={() => {}} commands={[{ id: 'm', label: 'Go to Markets', icon: 'chart-line', group: 'Navigate', shortcut: 'G M' }, { id: 'w', label: 'Go to Watchlists', icon: 'list', group: 'Navigate' }, { id: 'a', label: 'New alert', icon: 'bell', group: 'Create', shortcut: 'N' }]} />), parameters: { layout: 'fullscreen' } };

export const PopoverFull: S = { render: () => <div style={{ minHeight: 220, minWidth: 360, padding: 24 }}><Popover defaultOpen aria-label="Alert details" trigger={<Button variant="subtle">Details</Button>} arrow><div data-extract-name="Content" style={{ display: 'grid', gap: 8 }}><b data-extract-name="Title">Alert rule</b><span data-extract-name="Text">Notify when NSC1 crosses 85.00.</span></div></Popover></div> };
export const DialogFull: S = { render: () => <Dialog defaultOpen title="Rename watchlist" description="Names are visible to teammates you share with." trigger={<Button>Rename…</Button>} footer={<><Button variant="subtle" slot="close">Cancel</Button><Button slot="close">Save</Button></>}><TextField label="Name" defaultValue="Core energy desk" /></Dialog>, parameters: { layout: 'fullscreen' } };
export const ConfirmDialogFull: S = { render: () => <ConfirmDialog isOpen trigger={<Button intent="destructive">Delete alert</Button>} title="Delete this alert?" description="You will stop receiving notifications for NSC1 above 85.00." intent="destructive" confirmLabel="Delete" onConfirm={() => {}} />, parameters: { layout: 'fullscreen' } };
export const DrawerFull: S = { render: () => <Drawer defaultOpen title="Assessment details" trigger={<Button variant="subtle">Open drawer</Button>} footer={<Button slot="close">Done</Button>}><p>Methodology, timestamps and fictional sample notes.</p></Drawer>, parameters: { layout: 'fullscreen' } };
export const AlertFull: S = { render: () => (<Col>{(['neutral', 'brand', 'positive', 'negative', 'warning', 'info'] as const).map((i) => <W key={i} id={i}><Alert intent={i} title="Heads up" onDismiss={() => {}}>Supporting text that explains what to do next.</Alert></W>)}</Col>) };
export const BannerFull: S = { render: () => (<Col w={900}>{(['neutral', 'brand', 'positive', 'negative', 'warning', 'info'] as const).map((i) => <W key={i} id={i}><Banner intent={i} dismissible title="Maintenance tonight 22:00–23:00.">Pricing remains available.</Banner></W>)}</Col>) };
export const InlineMessageFull: S = { render: () => (<Col>{(['neutral', 'brand', 'positive', 'negative', 'warning', 'info'] as const).map((i) => <W key={i} id={i}><InlineMessage intent={i}>Prices are 15 minutes delayed.</InlineMessage></W>)}</Col>) };

export const CardFull: S = { render: () => <Col w={420}><Card title="Watchlist exposure" unit="· 24 assessments" actions={<IconButton label="More" icon="ellipsis-vertical" variant="ghost" size="sm" />}>Card content goes here.</Card></Col> };
export const PanelFull: S = { render: () => <Col w={360}><Panel>Grouped controls live on a panel.</Panel></Col> };
export const AccentTileFull: S = { render: () => <Col w={260}><AccentTile label="Brent-style" value="+1.42%" intent="positive" /></Col> };
export const ToolbarFull: S = { render: () => <Col w={360}><Toolbar aria-label="Chart tools"><IconButton label="Zoom in" icon="plus" /><IconButton label="Zoom out" icon="minus" /><IconButton label="Reset" icon="rotate-right" /></Toolbar></Col> };
export const SplitPaneFull: S = { render: () => <Col w={560}><div style={{ height: 140 }}><SplitPane aria-label="Resize panes"><Panel style={{ height: '100%' }}>Left</Panel><Panel style={{ height: '100%' }}>Right</Panel></SplitPane></div></Col> };
export const ScrollAreaFull: S = { render: () => <Col w={360}><ScrollArea aria-label="Log" maxHeight={80}><div data-extract-name="Content" style={{ height: 240 }}>Log line 1</div></ScrollArea></Col> };
export const DisclosureFull: S = { render: () => (<Col w={460}>
  <W id="default"><Disclosure title="Methodology" summary="3 notes">Sample methodology text for fictional data.</Disclosure></W>
  <W id="expanded"><Disclosure title="Methodology" summary="3 notes" defaultExpanded>Sample methodology text for fictional data.</Disclosure></W>
</Col>) };
export const AccordionFull: S = { render: () => <Col w={460}><Accordion defaultExpandedKeys={['a']} items={[{ id: 'a', title: 'Fees', content: 'Sample fee schedule.' }, { id: 'b', title: 'Settlement', content: 'Sample settlement notes.' }]} /></Col> };
export const CollapsibleSectionFull: S = { render: () => (<Col w={460}>
  <W id="default"><CollapsibleSection title="Advanced options">Hidden until needed.</CollapsibleSection></W>
  <W id="expanded"><CollapsibleSection title="Advanced options" defaultExpanded>Hidden until needed.</CollapsibleSection></W>
</Col>) };

interface Row { id: string; name: string; category: string; code: string; chg: number; icon: string }
const rows: Row[] = [
  { id: 'nsc1', name: 'North Sea Crude M1', category: 'Crude oil', code: 'NSC1', chg: 1.42, icon: 'droplet' },
  { id: 'wtx1', name: 'Texas Light Sweet M1', category: 'Crude oil', code: 'WTX1', chg: -0.86, icon: 'droplet' },
  { id: 'ttf1', name: 'Continental Gas M1', category: 'Natural gas', code: 'TTF1', chg: -2.14, icon: 'fire' },
];
const columns: TableColumn<Row>[] = [
  { id: 'name', header: 'Assessment', isRowHeader: true, allowsSorting: true, cell: (r) => <AssetCell name={r.name} category={r.category} icon={r.icon} /> },
  { id: 'code', header: 'Code', cell: (r) => <CodeChip>{r.code}</CodeChip> },
  { id: 'chg', header: 'Chg %', numeric: true, allowsSorting: true, cell: (r) => <PriceChange percent={r.chg} hideIcon /> },
  { id: 'act', header: <span className="dv:sr-only">Actions</span>, textValue: 'Actions', align: 'end', cell: (r) => <RowActions name={r.name} items={[{ id: 'o', label: 'Open', icon: 'chart-line' }]} /> },
];
export const TableFull: S = { render: () => <Col w={760}><Card padded={false} style={{ overflow: 'hidden' }}><Table<Row> aria-label="Watchlist" columns={columns} rows={rows} toolbar={<TableToolbar end={<SearchField aria-label="Search assessments" placeholder="Search assessments" />}><SegmentedControl aria-label="View" defaultValue="watchlist" options={[{ id: 'watchlist', label: 'Watchlist' }, { id: 'alerts', label: 'Alerts' }]} /></TableToolbar>} /></Card></Col> };
export const TableToolbarFull: S = { render: () => <Col w={760}><TableToolbar end={<SearchField aria-label="Search assessments" placeholder="Search assessments" />}><SegmentedControl aria-label="View" defaultValue="watchlist" options={[{ id: 'watchlist', label: 'Watchlist' }, { id: 'alerts', label: 'Alerts' }]} /></TableToolbar></Col> };
export const AssetCellFull: S = { render: () => <Col w={320}><AssetCell name="North Sea Crude M1" category="Crude oil" icon="droplet" /></Col> };
export const RowActionsFull: S = { render: () => <Col w={120}><RowActions name="North Sea Crude M1" items={[{ id: 'o', label: 'Open', icon: 'chart-line' }]} /></Col> };
export const ListFull: S = { render: () => <Col w={360}><List aria-label="Alerts" selectionMode="single" defaultSelectedKeys={new Set(['a'])} items={[{ id: 'a', title: 'NSC1 above 85.00', description: 'Created today', icon: 'bell', trailing: <Badge intent="positive">Active</Badge> }, { id: 'b', title: 'TTF1 below 30.00', description: 'Created yesterday', icon: 'bell', trailing: <Badge>Paused</Badge> }]} /></Col> };
export const TreeViewFull: S = { render: () => <Col w={320}><TreeView aria-label="Instruments" defaultExpandedKeys={['oil']} nodes={[{ id: 'oil', label: 'Oil & products', icon: 'droplet', children: [{ id: 'nsc1', label: 'North Sea Crude M1' }, { id: 'uls', label: 'NWE Diesel 10ppm' }] }, { id: 'gas', label: 'Gas & power', icon: 'fire', children: [{ id: 'ttf1', label: 'Continental Gas M1' }] }]} /></Col> };
export const DescriptionListFull: S = { render: () => (<Col w={360}>
  <W id="inline"><DescriptionList items={[{ term: 'Notional', details: '$2,115,000.00' }, { term: 'Est. fees', details: '$412.50' }, { term: 'Settlement', details: 'T+2' }]} /></W>
  <W id="stacked"><DescriptionList layout="stacked" items={[{ term: 'Notional', details: '$2,115,000.00' }, { term: 'Est. fees', details: '$412.50' }, { term: 'Settlement', details: 'T+2' }]} /></W>
</Col>) };

function ToastSeed({ list }: { list: ('neutral' | 'brand' | 'positive' | 'negative' | 'warning' | 'info')[] }) {
  const { show } = useToast();
  useEffect(() => { list.forEach((i) => show({ title: 'Order placed', description: 'Buy 25,000 bbl NSC1 @ 84.60', intent: i, timeout: 0, action: { label: 'Undo', onPress: () => {} } })); }, [show, list]);
  return null;
}
const A = ['neutral', 'brand', 'positive'] as ('neutral' | 'brand' | 'positive')[], B = ['negative', 'warning', 'info'] as ('negative' | 'warning' | 'info')[];
export const ToastProviderFull: S = { render: () => <><ToastProvider placement="top-end"><ToastSeed list={A} /></ToastProvider><ToastProvider placement="bottom-end"><ToastSeed list={B} /></ToastProvider></>, parameters: { layout: 'fullscreen' } };

export const StackFull: S = { render: () => (<Col w={420}>
  <W id="vertical"><Stack orientation="vertical" gap={8}><Panel>First</Panel><Panel>Second</Panel><Panel>Third</Panel></Stack></W>
  <W id="horizontal"><Stack orientation="horizontal" gap={8}><Panel>First</Panel><Panel>Second</Panel><Panel>Third</Panel></Stack></W>
</Col>) };
export const GridFull: S = { render: () => <Col w={560}><Grid gap={12}><GridItem span={3}><Panel>span 3</Panel></GridItem><GridItem span={3}><Panel>span 3</Panel></GridItem><GridItem span={6}><Panel>span 6</Panel></GridItem></Grid></Col> };
export const AppShellFull: S = { render: () => <div style={{ width: 1200 }}><AppShell header={<AppHeader nav={NAV} currentId="markets" actions={<UserChip name="Ket Patel" subtitle="Product Design" />} />} sidebar={<SideNav items={SIDE} currentId="markets" />}><PageHeader title="Markets" subtitle="Follow prices from assessment to decision" /></AppShell></div>, parameters: { layout: 'fullscreen' } };
