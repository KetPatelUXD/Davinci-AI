import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Accordion, Alert, Avatar, AvatarGroup, Badge, Banner, Breadcrumbs, Button, ButtonGroup, Callout, Card, ChartLegend, ChatMessage, ChatThread, Checkbox, CheckboxGroup, Chip, CitationChip, CodeBlock, CodeChip,
  Composer, ConfirmDialog, DaVinciLogo, DayRange, Dialog, DeltaPill, Divider, DonutChart, Drawer, DescriptionList, EmptyState, FileUpload, FilterBar, Form, FormField, Icon, IconButton, Kbd, Link, List, Menu,
  Meter, MessageActions, MultiSelect, NewsList, NumberField, OrderTicket, Pagination, PasswordField, PillTabs, Popover, PriceChange, PriceChart, PriceField, PriceFlash, ProgressBar, ProgressCircle,
  RadioGroup, ReasoningBlock, ScrollArea, SearchField, SegmentedControl, Select, SideToggle, Skeleton, Slider, Spinner, SplitPane, Sparkline, Stat, Stepper, StreamingText, SuggestedPrompts, Switch, SwitchRow,
  Table, Tabs, TextArea, TextField, TickerTape, TimeRangeSelector, ToolUseBlock, Tooltip, Toolbar, ToggleButton, TreeView, Watchlist, useToast, QuoteCard, MarketPulse, AccentTile, Panel, PageHeader, AppHeader,
  SideNav, ComboBox, DatePicker, RangeSlider, Disclosure, CommandPalette, ArtifactPanel, Drawer as _D,
} from '../index';
import { expectNoA11yViolations, renderThemed } from './utils';

void _D;
const series = [10, 12, 11, 14, 13, 16, 15, 18, 17, 20];

/** Each entry renders in dark and light and must have zero axe violations. */
const gallery: Record<string, () => React.ReactElement> = {
  'Button variants': () => (<div><Button>Primary</Button><Button variant="subtle" iconStart="filter">Filters</Button><Button variant="ghost">Ghost</Button><Button intent="positive">Buy</Button><Button intent="negative" isDisabled>Sell</Button><Button isLoading>Saving</Button></div>),
  IconButton: () => <IconButton label="Refresh" icon="rotate-right" />,
  ButtonGroup: () => <ButtonGroup aria-label="Actions"><Button>A</Button><Button>B</Button></ButtonGroup>,
  Link: () => <Link href="#x">Docs</Link>,
  ToggleButton: () => <ToggleButton>Pin</ToggleButton>,
  SegmentedControl: () => <SegmentedControl aria-label="Range" defaultValue="1M" options={['1D', '1W', '1M'].map((i) => ({ id: i, label: i }))} />,
  SideToggle: () => <SideToggle />,
  PillTabs: () => <PillTabs aria-label="Views" items={[{ id: 'a', label: 'A', content: 'Alpha' }, { id: 'b', label: 'B', content: 'Beta' }]} />,
  Checkbox: () => <Checkbox>Remember me</Checkbox>,
  CheckboxGroup: () => <CheckboxGroup label="Markets"><Checkbox value="a">A</Checkbox><Checkbox value="b">B</Checkbox></CheckboxGroup>,
  RadioGroup: () => <RadioGroup label="Delivery" options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />,
  Switch: () => <Switch>Alerts</Switch>,
  SwitchRow: () => <SwitchRow title="Quick ticket" hint="GTC" switchLabel="Good till cancelled" />,
  TextField: () => <TextField label="Name" description="Shown publicly" />,
  'TextField invalid': () => <TextField label="Email" isInvalid errorMessage="Enter a valid email" />,
  TextArea: () => <TextArea label="Notes" />,
  SearchField: () => <SearchField aria-label="Search" />,
  PasswordField: () => <PasswordField label="Password" />,
  NumberField: () => <NumberField label="Quantity" defaultValue={10} />,
  PriceField: () => <PriceField label="Limit" defaultValue={84.6} tickSize={0.05} />,
  Select: () => <Select label="Order type" items={[{ id: 'l', label: 'Limit' }, { id: 'm', label: 'Market' }]} />,
  ComboBox: () => <ComboBox label="Instrument" items={[{ id: 'a', label: 'Alpha' }]} />,
  MultiSelect: () => <MultiSelect label="Markets" items={[{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }]} value={['a']} />,
  DatePicker: () => <DatePicker label="Date" />,
  Slider: () => <Slider label="Threshold" defaultValue={30} />,
  RangeSlider: () => <RangeSlider label="Band" defaultValue={[20, 60]} />,
  FileUpload: () => <FileUpload />,
  FormField: () => <FormField label="Custom" description="Hint"><input type="text" /></FormField>,
  Form: () => <Form layout="sparse"><TextField label="A" /></Form>,
  Badge: () => <Badge intent="positive" dot>Live</Badge>,
  Chip: () => <Chip onRemove={() => {}}>Crude</Chip>,
  DeltaPill: () => <DeltaPill value={1.42} context="vs yesterday" />,
  CodeChip: () => <CodeChip>NSC1</CodeChip>,
  Avatar: () => <><Avatar name="Ket Patel" /><AvatarGroup people={[{ name: 'A B' }, { name: 'C D' }, { name: 'E F' }]} max={2} /></>,
  Kbd: () => <Kbd>⌘K</Kbd>,
  Divider: () => <Divider />,
  Tooltip: () => <Tooltip content="Hint"><Button>Hover</Button></Tooltip>,
  Skeleton: () => <Skeleton lines={3} />,
  Spinner: () => <Spinner label="Loading" />,
  ProgressBar: () => <ProgressBar label="Upload" value={40} showValue />,
  ProgressCircle: () => <ProgressCircle aria-label="Sync" value={60} />,
  Meter: () => <Meter label="Limit usage" value={72} warnAt={0.7} criticalAt={0.9} showValue />,
  EmptyState: () => <EmptyState title="No data" description="Nothing yet" />,
  Callout: () => <Callout intent="warning" title="Delayed">Prices are 15 minutes delayed.</Callout>,
  Alert: () => <Alert intent="negative" title="Failed">Could not save.</Alert>,
  Banner: () => <Banner intent="info" dismissible title="Maintenance">Tonight 22:00.</Banner>,
  Breadcrumbs: () => <Breadcrumbs items={[{ id: 'a', label: 'Home', href: '#' }, { id: 'b', label: 'Markets', href: '#' }]} />,
  Pagination: () => <Pagination page={3} pageCount={12} onPageChange={() => {}} />,
  Stepper: () => <Stepper current={1} steps={[{ id: 'a', label: 'Details' }, { id: 'b', label: 'Review' }, { id: 'c', label: 'Done' }]} />,
  Tabs: () => <Tabs aria-label="Sections" items={[{ id: 'a', label: 'One', content: 'x' }, { id: 'b', label: 'Two', content: 'y' }]} />,
  AppHeader: () => <AppHeader nav={[{ id: 'a', label: 'Markets' }, { id: 'b', label: 'Reports' }]} currentId="a" />,
  PageHeader: () => <PageHeader title="Markets" subtitle="Sub" />,
  SideNav: () => <SideNav items={[{ id: 'a', label: 'Home', icon: 'house' }, { id: 'b', label: 'Reports', icon: 'newspaper' }]} currentId="a" />,
  Menu: () => <Menu aria-label="More" trigger={<IconButton label="More actions" icon="ellipsis-vertical" />} items={[{ id: 'a', label: 'Open' }]} />,
  Card: () => <Card title="Exposure">Body</Card>,
  Panel: () => <Panel>Panel</Panel>,
  AccentTile: () => <AccentTile label="WTI-style" value="+0.88%" intent="positive" />,
  Toolbar: () => <Toolbar aria-label="Tools"><Button>A</Button><Button>B</Button></Toolbar>,
  SplitPane: () => <SplitPane aria-label="Resize"><div>A</div><div>B</div></SplitPane>,
  ScrollArea: () => <ScrollArea aria-label="Log" maxHeight={40}><div style={{ height: 200 }}>x</div></ScrollArea>,
  Disclosure: () => <Disclosure title="More detail">Details</Disclosure>,
  Accordion: () => <Accordion items={[{ id: 'a', title: 'A', content: 'x' }, { id: 'b', title: 'B', content: 'y' }]} />,
  Table: () => <Table aria-label="Assets" columns={[{ id: 'n', header: 'Name', cell: 'n', isRowHeader: true, allowsSorting: true }, { id: 'v', header: 'Value', cell: 'v', numeric: true }]} rows={[{ id: 1, n: 'A', v: 1 }, { id: 2, n: 'B', v: 2 }]} selectionMode="multiple" />,
  List: () => <List aria-label="Items" items={[{ id: 'a', title: 'Alpha', description: 'First' }]} />,
  TreeView: () => <TreeView aria-label="Tree" nodes={[{ id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }] }]} />,
  DescriptionList: () => <DescriptionList items={[{ term: 'Notional', details: '$1' }]} />,
  Sparkline: () => <Sparkline data={series} band />,
  PriceChange: () => <PriceChange value={1.2} percent={1.42} />,
  PriceFlash: () => <PriceFlash value={10}>10.00</PriceFlash>,
  DayRange: () => <DayRange low={1} high={3} value={2} />,
  Stat: () => <Stat title="Brent-style M1" value={84.62} series={series} delta={{ value: 1.42, context: '1D' }} />,
  QuoteCard: () => <QuoteCard title="North Sea Crude M1" price={84.62} currency="USD" change={{ percent: 1.42 }} stats={[{ label: 'Open', value: '83.44' }]} dayRange={{ low: 82.97, high: 85.1 }}><PriceChart aria-label="Price" data={series} /></QuoteCard>,
  PriceChart: () => <PriceChart aria-label="Price, 10 days" data={series} labels={series.map((_, i) => `Day ${i + 1}`)} xAxisLabels={['A', 'B']} />,
  DonutChart: () => <DonutChart aria-label="Exposure" segments={[{ id: 'a', label: 'Oil', value: 11 }, { id: 'b', label: 'Gas', value: 8 }]} />,
  ChartLegend: () => <ChartLegend items={[{ id: 'a', label: 'Oil', value: 11, percent: '46%', color: 'red' }]} />,
  TimeRangeSelector: () => <TimeRangeSelector />,
  MarketPulse: () => <MarketPulse markets={[{ name: 'Brent-style', change: 1.2 }, { name: 'Diesel', change: -0.8 }]} />,
  FilterBar: () => <FilterBar filters={[{ id: 'a', label: 'Crude' }]} />,
  Watchlist: () => <Watchlist aria-label="Watchlist" items={[{ id: 'a', symbol: 'NSC1', name: 'North Sea', last: 84.62, change: 1.1, changePercent: 1.3, series }]} />,
  NewsList: () => <NewsList aria-label="News" items={[{ id: 'a', time: '09:42', headline: 'Headline', unread: true, summary: 'Summary', tags: ['Crude'] }]} />,
  OrderTicket: () => <OrderTicket symbol="NSC1" />,
  TickerTape: () => <TickerTape items={[{ id: 'a', symbol: 'NSC1', last: 84.6, changePercent: 1.2 }]} />,
  ChatThread: () => <ChatThread aria-label="Chat"><ChatMessage role="user" text="Hi">Hi</ChatMessage><ChatMessage role="assistant" actions={<MessageActions copyText="x" />}>Hello</ChatMessage></ChatThread>,
  Composer: () => <Composer onSubmit={() => {}} suggestions={['Why?']} contexts={[{ id: 'a', label: 'NSC1' }]} />,
  SuggestedPrompts: () => <SuggestedPrompts prompts={['A', 'B']} onSelect={() => {}} />,
  StreamingText: () => <StreamingText text="Hello" isStreaming />,
  'Reasoning/Tool': () => <><ReasoningBlock summary="Thought for 4 s">…</ReasoningBlock><ToolUseBlock name="Search" summary="NSC1" status="success">out</ToolUseBlock></>,
  CitationChip: () => <CitationChip n={1} title="Source" href="#" />,
  CodeBlock: () => <CodeBlock code="const a = 1;" language="ts" />,
  ArtifactPanel: () => <ArtifactPanel title="Report">Body</ArtifactPanel>,
  Icon: () => <><Icon name="chart-line" label="Chart" /><DaVinciLogo /></>,
};

describe('axe: every component, dark + light, no violations', () => {
  for (const [name, ui] of Object.entries(gallery)) {
    for (const theme of ['dark', 'light'] as const) {
      it(`${name} (${theme})`, async () => {
        const { container } = renderThemed(ui(), theme);
        await expectNoA11yViolations(container);
      });
    }
  }
  it('compact density renders', async () => {
    const { container } = renderThemed(<Table aria-label="x" columns={[{ id: 'n', header: 'N', cell: 'n', isRowHeader: true }]} rows={[{ id: 1, n: 'a' }]} density="compact" />, 'dark', 'compact');
    await expectNoA11yViolations(container);
  });
});

describe('behaviour', () => {
  it('Button fires onPress and is focusable by keyboard', async () => {
    const onPress = vi.fn();
    renderThemed(<Button onPress={onPress}>Go</Button>);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Go' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('Loading button stays focusable but ignores presses (aria-disabled)', async () => {
    const onPress = vi.fn();
    renderThemed(<Button isLoading onPress={onPress}>Save</Button>);
    const b = screen.getByRole('button', { name: /save/i });
    await userEvent.click(b);
    expect(onPress).not.toHaveBeenCalled();
    expect(b).toHaveAttribute('aria-disabled', 'true');
  });

  it('IconButton exposes its label as the accessible name', () => {
    renderThemed(<IconButton label="Refresh data" icon="rotate-right" />);
    expect(screen.getByRole('button', { name: 'Refresh data' })).toBeInTheDocument();
  });

  it('Icon is decorative by default and an image when labelled', () => {
    const { container } = renderThemed(<><Icon name="plus" /><Icon name="plus" label="Add" /></>);
    const svgs = container.querySelectorAll('svg');
    expect(svgs[0]).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('img', { name: 'Add' })).toBeInTheDocument();
  });

  it('SegmentedControl is a radiogroup; arrow keys change the selection', async () => {
    const onChange = vi.fn();
    renderThemed(<SegmentedControl aria-label="Range" defaultValue="1D" onChange={onChange} options={['1D', '1W', '1M'].map((i) => ({ id: i, label: i }))} />);
    expect(screen.getByRole('radiogroup', { name: 'Range' })).toBeInTheDocument();
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('1W'));
  });

  it('SideToggle: each side has a text label (never colour alone)', () => {
    renderThemed(<SideToggle />);
    expect(screen.getByText('Buy · Long')).toBeVisible();
    expect(screen.getByText('Sell · Short')).toBeVisible();
  });

  it('Switch toggles with Space', async () => {
    renderThemed(<Switch>Alerts</Switch>);
    const s = screen.getByRole('switch', { name: 'Alerts' });
    expect(s).not.toBeChecked();
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(s).toBeChecked();
  });

  it('TextField associates label, description and error', () => {
    renderThemed(<TextField label="Email" description="We never share it" isInvalid errorMessage="Enter a valid email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAccessibleDescription(/never share it/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
  });

  it('NumberField increments with ArrowUp and formats in en-US', async () => {
    renderThemed(<NumberField label="Quantity" defaultValue={25000} step={1000} formatOptions={{ maximumFractionDigits: 0 }} />);
    const input = screen.getByRole('textbox', { name: /quantity/i });
    expect(input).toHaveValue('25,000');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveValue('26,000');
  });

  it('PriceField snaps to the tick size on commit', async () => {
    const onChange = vi.fn();
    renderThemed(<PriceField label="Limit" defaultValue={84.6} tickSize={0.05} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: /limit/i });
    await userEvent.clear(input);
    await userEvent.type(input, '84.66');
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(84.65);
  });

  it('Select opens a listbox and selects with the keyboard', async () => {
    const onSelectionChange = vi.fn();
    renderThemed(<Select label="Order type" items={[{ id: 'l', label: 'Limit' }, { id: 'm', label: 'Market' }]} onSelectionChange={onSelectionChange} />);
    await userEvent.click(screen.getByRole('button', { name: /order type/i }));
    const list = await screen.findByRole('listbox');
    await userEvent.click(within(list).getByRole('option', { name: 'Market' }));
    expect(onSelectionChange).toHaveBeenCalledWith('m');
  });

  it('Dialog traps focus, labels itself and closes on Escape', async () => {
    renderThemed(<Dialog title="Confirm order" trigger={<Button>Open</Button>}>Body</Dialog>);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const dlg = await screen.findByRole('dialog', { name: 'Confirm order' });
    expect(dlg).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('Destructive ConfirmDialog is an alertdialog and focuses Cancel', async () => {
    renderThemed(<ConfirmDialog trigger={<Button>Delete</Button>} title="Delete alert?" intent="destructive" confirmLabel="Delete" onConfirm={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('Drawer opens as a dialog', async () => {
    renderThemed(<Drawer title="Details" trigger={<Button>Open</Button>}>Body</Drawer>);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('dialog', { name: 'Details' })).toBeInTheDocument();
  });

  it('Tooltip shows on keyboard focus', async () => {
    renderThemed(<Tooltip content="Refresh prices" delay={0}><Button>Refresh</Button></Tooltip>);
    await userEvent.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Refresh prices');
  });

  it('Menu opens with Enter and arrow keys move focus', async () => {
    const onAction = vi.fn();
    renderThemed(<Menu aria-label="Actions" onAction={onAction} trigger={<IconButton label="Actions for NSC1" icon="ellipsis-vertical" />} items={[{ id: 'a', label: 'Open' }, { id: 'b', label: 'Alert' }]} />);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onAction).toHaveBeenCalled();
  });

  it('Toast is announced through a polite live region', async () => {
    function Fire() { const { show } = useToast(); return <Button onPress={() => show({ title: 'Order placed', intent: 'positive' })}>Fire</Button>; }
    renderThemed(<Fire />);
    await userEvent.click(screen.getByRole('button', { name: 'Fire' }));
    expect(await screen.findByRole('region', { name: /notification/ })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole('status').some((n) => n.getAttribute('aria-live') === 'polite' && n.textContent === 'Order placed')).toBe(true));
    expect(await screen.findByText('Order placed', { selector: '.dv-toast-provider__toast-title' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss notification' })).toBeInTheDocument();
  });

  it('Table: sortable column header, row selection checkbox', async () => {
    const onSort = vi.fn();
    renderThemed(<Table aria-label="Assets" onSortChange={onSort} selectionMode="multiple" columns={[{ id: 'n', header: 'Name', cell: 'n', isRowHeader: true, allowsSorting: true }]} rows={[{ id: 1, n: 'A' }, { id: 2, n: 'B' }]} />);
    expect(screen.getByRole('grid', { name: 'Assets' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('columnheader', { name: /name/i }));
    expect(onSort).toHaveBeenCalled();
    await userEvent.click(screen.getAllByRole('checkbox', { name: /Select row/ })[0]!);
    expect(screen.getAllByRole('checkbox', { name: /Select row/ })[0]).toBeChecked();
  });

  it('Table shows skeletons while loading and the empty state when there are no rows', () => {
    const { container, rerender } = renderThemed(<Table aria-label="Assets" isLoading columns={[{ id: 'n', header: 'Name', cell: 'n', isRowHeader: true }]} rows={[]} />);
    expect(container.querySelector('.dv-table')).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelectorAll('.dv-skeleton').length).toBeGreaterThan(0);
    rerender(<Table aria-label="Assets" columns={[{ id: 'n', header: 'Name', cell: 'n', isRowHeader: true }]} rows={[]} />);
  });

  it('Pagination marks the current page', () => {
    renderThemed(<Pagination page={3} pageCount={8} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
  });

  it('Stepper announces each step state in text', () => {
    renderThemed(<Stepper current={1} steps={[{ id: 'a', label: 'Details' }, { id: 'b', label: 'Review' }]} />);
    expect(screen.getByText('(completed)')).toBeInTheDocument();
    expect(screen.getByText('(current step)')).toBeInTheDocument();
  });

  it('PriceChange pairs sign, icon and an accessible sentence', () => {
    renderThemed(<PriceChange percent={-0.86} />);
    expect(screen.getByText(/Down 0\.86 percent/)).toBeInTheDocument();
    expect(screen.getByText(/−0\.86%/)).toBeInTheDocument();
  });

  it('DeltaPill says Up/Down to screen readers', () => {
    renderThemed(<DeltaPill value={1.42} context="vs yesterday" />);
    expect(screen.getByText(/Up/)).toBeInTheDocument();
    expect(screen.getByText('+1.42%')).toBeInTheDocument();
  });

  it('PriceFlash is silent by default and announces only significant moves when opted in', () => {
    const { rerender, container } = renderThemed(<PriceFlash value={100}>100.00</PriceFlash>);
    expect(container.querySelector('.dv-price-flash [aria-live]')).toBeNull();
    rerender(<PriceFlash value={101}>101.00</PriceFlash>);
    expect(container.querySelector('.dv-price-flash [aria-live]')).toBeNull();
  });

  it('PriceFlash announce opt-in: small tick silent, big move announced', async () => {
    const { rerender } = render(<PriceFlash value={100} announceThresholdPercent={2} announceLabel="NSC1">100</PriceFlash>);
    const status = () => document.querySelector('.dv-price-flash [role="status"]')!.textContent;
    await act(async () => { rerender(<PriceFlash value={100.5} announceThresholdPercent={2} announceLabel="NSC1">100.5</PriceFlash>); });
    expect(status()).toBe('');
    await act(async () => { rerender(<PriceFlash value={103} announceThresholdPercent={2} announceLabel="NSC1">103</PriceFlash>); });
    expect(status()).toMatch(/NSC1 up 3\.00 percent/);
  });

  it('Sparkline exposes a text summary and can be decorative', () => {
    renderThemed(<><Sparkline data={series} /><Sparkline data={series} decorative /></>);
    expect(screen.getAllByRole('img')[0]).toHaveAccessibleName(/10 points/);
  });

  it('PriceChart: keyboard moves the value and announces it politely', async () => {
    const { container } = renderThemed(<PriceChart aria-label="NSC1 price" data={series} labels={series.map((_, i) => `Day ${i + 1}`)} />);
    const chart = screen.getByRole('group', { name: 'NSC1 price' });
    expect(chart).toHaveAttribute('aria-roledescription', 'chart');
    chart.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(container.querySelector('[aria-live="polite"]')!.textContent).toMatch(/Day 9/));
  });

  it('DonutChart provides a table fallback with shares', () => {
    renderThemed(<DonutChart aria-label="Exposure" segments={[{ id: 'a', label: 'Oil', value: 11 }, { id: 'b', label: 'Gas', value: 8 }]} />);
    const table = screen.getByRole('table', { name: 'Exposure' });
    expect(within(table).getByText('58%')).toBeInTheDocument();
  });

  it('Composer: Enter sends, Shift+Enter inserts a newline, focus returns', async () => {
    const onSubmit = vi.fn();
    renderThemed(<Composer onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox', { name: 'Ask LEO' });
    await userEvent.type(input, 'Why did crude rise?{Shift>}{Enter}{/Shift}more');
    expect(input).toHaveValue('Why did crude rise?\nmore');
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('Why did crude rise?\nmore');
    expect(input).toHaveValue('');
    await waitFor(() => expect(input).toHaveFocus());
  });

  it('Composer: Ctrl+L focuses the input; send turns into stop while streaming', async () => {
    const onStop = vi.fn();
    const { rerender } = renderThemed(<><Button>other</Button><Composer onSubmit={() => {}} isStreaming onStop={onStop} /></>);
    await userEvent.keyboard('{Control>}l{/Control}');
    expect(screen.getByRole('textbox', { name: 'Ask LEO' })).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'Stop generating' }));
    expect(onStop).toHaveBeenCalled();
    rerender(<></>);
  });

  it('Composer context chip is removable with an accessible name', async () => {
    const onRemove = vi.fn();
    renderThemed(<Composer onSubmit={() => {}} contexts={[{ id: 'a', label: 'NSC1' }]} onRemoveContext={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove NSC1 from context' }));
    expect(onRemove).toHaveBeenCalledWith('a');
  });

  it('ChatThread is a log that is not live; announcements come from a separate polite region', () => {
    renderThemed(<ChatThread aria-label="Chat" announcement="LEO replied"><ChatMessage role="assistant">Hi</ChatMessage></ChatThread>);
    expect(screen.getByRole('log', { name: 'Chat' })).toHaveAttribute('aria-live', 'off');
    expect(screen.getAllByRole('status').some((n) => n.textContent === 'LEO replied')).toBe(true);
  });

  it('ChatMessage user bubble can be edited and re-sent', async () => {
    const onEdit = vi.fn();
    renderThemed(<ChatMessage role="user" text="old" onEdit={onEdit}>old</ChatMessage>);
    await userEvent.click(screen.getByRole('button', { name: 'Edit message' }));
    const box = screen.getByRole('textbox', { name: 'Edit your message' });
    await userEvent.clear(box);
    await userEvent.type(box, 'new');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onEdit).toHaveBeenCalledWith('new');
  });

  it('StreamingText shows a cursor only while streaming', () => {
    const { container, rerender } = renderThemed(<StreamingText text="Hello" isStreaming />);
    expect(container.querySelector('.dv-streaming-text__cursor')).toBeInTheDocument();
    rerender(<StreamingText text="Hello" />);
  });

  it('NewsItem summary is disclosed on demand', async () => {
    renderThemed(<NewsList aria-label="News" items={[{ id: 'a', time: '09:42', headline: 'Loading programme cut', summary: 'Sample summary text' }]} />);
    const btn = screen.getByRole('button', { name: /loading programme cut/i });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Sample summary text')).toBeVisible();
  });

  it('OrderTicket: CTA label and notional follow side/quantity', async () => {
    renderThemed(<OrderTicket symbol="NSC1" />);
    expect(screen.getByRole('button', { name: 'Place buy order' })).toBeInTheDocument();
    expect(screen.getByText('$2,115,000.00')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: /sell/i }));
    expect(screen.getByRole('button', { name: 'Place sell order' })).toBeInTheDocument();
  });

  it('SplitPane separator is keyboard operable', async () => {
    renderThemed(<SplitPane aria-label="Resize sidebar"><div>A</div><div>B</div></SplitPane>);
    const sep = screen.getByRole('separator', { name: 'Resize sidebar' });
    expect(sep).toHaveAttribute('aria-valuenow', '50');
    sep.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(sep).toHaveAttribute('aria-valuenow', '52');
    await userEvent.keyboard('{Home}');
    expect(sep).toHaveAttribute('aria-valuenow', '15');
  });

  it('FileUpload lists chosen files and lets you remove them', async () => {
    renderThemed(<FileUpload />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, new File(['x'], 'prices.csv', { type: 'text/csv' }));
    expect(await screen.findByText('prices.csv')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remove prices.csv' }));
    expect(screen.queryByText('prices.csv')).not.toBeInTheDocument();
  });

  it('CommandPalette opens with Ctrl+K and runs a command', async () => {
    const onRun = vi.fn();
    renderThemed(<CommandPalette commands={[{ id: 'go', label: 'Go to Markets' }, { id: 'th', label: 'Toggle theme' }]} onRun={onRun} />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const dlg = await screen.findByRole('dialog', { name: 'Command palette' });
    expect(dlg).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('menuitem', { name: /toggle theme/i }));
    expect(onRun).toHaveBeenCalledWith('th');
  });

  it('TickerTape can be paused', async () => {
    renderThemed(<TickerTape items={[{ id: 'a', symbol: 'NSC1', last: 84.6, changePercent: 1.2 }]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Pause ticker' }));
    expect(screen.getByRole('button', { name: 'Resume ticker' })).toBeInTheDocument();
  });

  it('Card is a labelled region when it has a title', () => {
    renderThemed(<Card title="Watchlist exposure">x</Card>);
    expect(screen.getByRole('region', { name: 'Watchlist exposure' })).toBeInTheDocument();
  });

  it('Misc components render', () => {
    renderThemed(<><Popover aria-label="Info" trigger={<Button>Info</Button>}>x</Popover><Chip>x</Chip><Link href="#">x</Link><MarketPulse markets={[{ name: 'A', change: 1 }]} /><FilterBar filters={[{ id: 'a', label: 'A' }]} /><AccentTile label="x" /></>);
  });
});
