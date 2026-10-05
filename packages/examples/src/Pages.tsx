import { useState } from 'react';
import {
  AppHeader, AppShell, Button, Card, ChatMessage, ChatThread, Checkbox, CitationChip, CodeBlock, Composer, DeltaPill, Fieldset, FilterBar, Form, MessageActions, NewsList,
  NumberField, PageHeader, PriceChart, Prose, ReasoningBlock, RadioGroup, Select, Stack, StreamingText, Switch, SuggestedPrompts, TextField, ToolUseBlock, Watchlist, SideToggle,
  ArtifactPanel, SplitPane, Table, AssetCell, CodeChip, PriceChange, PriceFlash, formatNumber, EmptyState, TextArea, PriceField, MultiSelect, DatePicker, Callout, Panel, Grid, GridItem,
  type TableColumn, type OrderSide,
} from '@davinci-ai/react';
import { assessments, heroAxis, heroLabels, heroSeries, news, type Assessment } from './data';

const nav = [{ id: 'markets', label: 'Markets' }, { id: 'assessments', label: 'Assessments' }, { id: 'watchlists', label: 'Watchlists' }, { id: 'analytics', label: 'Analytics' }, { id: 'reports', label: 'Reports' }, { id: 'settings', label: 'Settings' }];

/** Watchlist page: selectable dense watchlist beside the chart of the selected instrument. */
export function WatchlistPage() {
  const [sel, setSel] = useState<Set<string>>(new Set(['nsc1']));
  const active = assessments.find((a) => sel.has(a.id)) ?? assessments[0]!;
  const items = assessments.map((a) => ({ id: a.id, symbol: a.code, name: a.name, last: a.last, change: +(a.last * a.change / 100).toFixed(2), changePercent: a.change, series: a.series }));
  return (
    <AppShell header={<AppHeader nav={nav} currentId="watchlists" />}>
      <PageHeader title="Watchlists" subtitle="Core energy desk · fictional sample data" actions={<Button iconStart="plus">Add instrument</Button>} />
      <Grid>
        <GridItem span={{ base: 12, lg: 5 }}>
          <Card title="Core energy desk" padded={false} style={{ padding: '22px 12px 12px' }}>
            <Watchlist aria-label="Core energy desk" items={items} selectionMode="single" selectedKeys={sel} onSelectionChange={(k) => k !== 'all' && k.size && setSel(new Set([...k].map(String)))} />
          </Card>
        </GridItem>
        <GridItem span={{ base: 12, lg: 7 }}>
          <Card title={active.name} unit={`· ${active.category}`}>
            <Stack gap={12}>
              <Stack orientation="horizontal" gap={12}>
                <span className="dv-display dv-display--48 dv:tabular-nums">{formatNumber(active.last)}</span>
                <DeltaPill value={active.change} context="1D" />
              </Stack>
              <PriceChart aria-label={`${active.name} price`} data={heroSeries} labels={heroLabels} xAxisLabels={heroAxis} height={280} highlight={false} />
            </Stack>
          </Card>
        </GridItem>
      </Grid>
    </AppShell>
  );
}

/** Dense order-style form (compact controls for data-heavy screens). */
export function DenseOrderForm() {
  const [side, setSide] = useState<OrderSide>('buy');
  return (
    <Card title="Order entry" style={{ width: 760 }}>
      <Form layout="dense" onSubmit={(e) => e.preventDefault()}>
        <Grid gap={12}>
          <GridItem span={12}><SideToggle value={side} onChange={setSide} size="sm" /></GridItem>
          <GridItem span={4}><Select label="Instrument" items={assessments.map((a) => ({ id: a.id, label: a.name }))} defaultSelectedKey="nsc1" /></GridItem>
          <GridItem span={4}><Select label="Order type" items={[{ id: 'limit', label: 'Limit' }, { id: 'market', label: 'Market' }, { id: 'stop', label: 'Stop' }]} defaultSelectedKey="limit" /></GridItem>
          <GridItem span={4}><Select label="Time in force" items={[{ id: 'gtc', label: 'Good till cancelled' }, { id: 'day', label: 'Day' }, { id: 'ioc', label: 'Immediate or cancel' }]} defaultSelectedKey="gtc" /></GridItem>
          <GridItem span={4}><NumberField label="Quantity" defaultValue={25000} step={1000} suffix="bbl" formatOptions={{ maximumFractionDigits: 0 }} isRequired /></GridItem>
          <GridItem span={4}><PriceField label="Limit price" defaultValue={84.6} precision={2} tickSize={0.05} currency="USD" isRequired /></GridItem>
          <GridItem span={4}><PriceField label="Stop price" defaultValue={82.5} precision={2} tickSize={0.05} currency="USD" isOptional /></GridItem>
          <GridItem span={6}><DatePicker label="Expires" isOptional /></GridItem>
          <GridItem span={6}><TextField label="Client reference" placeholder="e.g. DESK-2231" isOptional /></GridItem>
          <GridItem span={12}>
            <Stack orientation="horizontal" gap={16}>
              <Checkbox defaultSelected>Reduce only</Checkbox>
              <Checkbox>Post only</Checkbox>
              <span className="dv:flex-1" />
              <Button variant="subtle" type="reset">Reset</Button>
              <Button type="submit" intent={side === 'buy' ? 'positive' : 'negative'}>{side === 'buy' ? 'Review buy order' : 'Review sell order'}</Button>
            </Stack>
          </GridItem>
        </Grid>
      </Form>
    </Card>
  );
}

/** Sparse settings form: occasional use, comfortable density and larger controls. */
export function SparseSettingsForm() {
  return (
    <Card title="Notification settings" style={{ width: 560 }}>
      <Form layout="sparse" onSubmit={(e) => e.preventDefault()}>
        <Fieldset legend="Profile" description="Shown to teammates you share watchlists with.">
          <TextField label="Display name" defaultValue="Ket Patel" isRequired size="lg" />
          <TextField label="Email" type="email" defaultValue="ket@example.com" description="We only use this for alerts you create." size="lg" />
          <TextArea label="Bio" rows={3} isOptional placeholder="A line about what you cover" />
        </Fieldset>
        <Fieldset legend="Alerts">
          <RadioGroup label="Delivery" defaultValue="digest" options={[{ value: 'instant', label: 'Instant', description: 'Notify me as soon as a threshold is crossed' }, { value: 'digest', label: 'Daily digest', description: 'One summary each morning' }]} />
          <MultiSelect label="Markets" isOptional items={assessments.map((a) => ({ id: a.id, label: a.name }))} defaultValue={['nsc1', 'ttf1']} />
          <Switch defaultSelected>Pause alerts outside market hours</Switch>
        </Fieldset>
        <Callout intent="info" title="Fictional demo">Nothing on this page is saved.</Callout>
        <Stack orientation="horizontal" gap={8}><span className="dv:flex-1" /><Button variant="subtle">Cancel</Button><Button type="submit" size="lg">Save changes</Button></Stack>
      </Form>
    </Card>
  );
}

/** News page with filters and expandable summaries. */
export function NewsPage() {
  const [filters, setFilters] = useState<string[]>([]);
  const list = filters.length ? news.filter((n) => n.tags?.some((t) => filters.includes(t.toLowerCase()))) : news;
  return (
    <AppShell header={<AppHeader nav={nav} currentId="analytics" />}>
      <PageHeader title="News" subtitle="Headlines for your watchlists · fictional sample data" />
      <Card title="Latest" actions={<FilterBar filters={[{ id: 'crude', label: 'Crude' }, { id: 'products', label: 'Products' }, { id: 'gas', label: 'Gas' }, { id: 'freight', label: 'Freight' }]} value={filters} onChange={setFilters} savedViews={[{ id: 'a', label: 'Energy morning' }]} />}>
        {list.length ? <NewsList aria-label="Latest news" items={list} /> : <EmptyState title="No headlines match" description="Clear a filter to see more." />}
      </Card>
    </AppShell>
  );
}

const cols: TableColumn<Assessment>[] = [
  { id: 'name', header: 'Assessment', isRowHeader: true, cell: (r) => <AssetCell name={r.name} category={r.category} icon={r.icon} /> },
  { id: 'code', header: 'Code', cell: (r) => <CodeChip>{r.code}</CodeChip> },
  { id: 'last', header: 'Last', numeric: true, cell: (r) => <PriceFlash value={r.last}>{formatNumber(r.last)}</PriceFlash> },
  { id: 'chg', header: 'Chg %', numeric: true, cell: (r) => <PriceChange percent={r.change} /> },
];

/** Chat panel ("Ask LEO") with reasoning, tool use, citations, an artifact and the floating composer. */
export function ChatPanel() {
  const [streaming, setStreaming] = useState(false);
  const [open, setOpen] = useState(true);
  return (
    <div style={{ height: 760, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <SplitPane defaultSize={open ? 58 : 100} min={35} max={open ? 75 : 100} aria-label="Resize artifact panel">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          <ChatThread aria-label="Conversation with LEO" isStreaming={streaming} announcement="LEO replied">
            <ChatMessage role="user" text="Why did North Sea crude rise today?" onEdit={() => {}}>Why did North Sea crude rise today?</ChatMessage>
            <ChatMessage
              role="assistant"
              trace={<><ReasoningBlock summary="Thought for 4 s">Comparing the move against loading programme news, product cracks and freight. The programme revision is the most direct driver.</ReasoningBlock><ToolUseBlock name="Search assessments" summary="NSC1, 30 days" status="success"><CodeBlock language="json" code={'{ "code": "NSC1", "range": "1M" }'} /></ToolUseBlock></>}
              actions={<MessageActions copyText="North Sea crude rose 1.42% …" />}
            >
              <Prose>
                <p>North Sea Crude M1 rose <strong>+1.42%</strong> to 84.62 <CitationChip n={1} title="Fictional Wire: North Sea loading programme revised lower" href="#" /> as loading programmes were trimmed and prompt differentials firmed <CitationChip n={2} title="Sample Shipping Desk: Atlantic freight" href="#" />.</p>
                <h3>What moved with it</h3>
                <ul><li>NWE diesel cracks widened by about $0.8/bbl</li><li>Capesize 5TC firmed on Atlantic demand</li></ul>
                <StreamingText text="Let me know if you want this compared with last month." simulate />
              </Prose>
            </ChatMessage>
          </ChatThread>
          <div style={{ padding: '0 16px 16px' }}>
            <SuggestedPrompts prompts={['Compare diesel cracks vs last month', 'Summarise freight news']} onSelect={() => {}} />
            <div style={{ height: 12 }} />
            <Composer isStreaming={streaming} onStop={() => setStreaming(false)} onSubmit={() => { setStreaming(true); setTimeout(() => setStreaming(false), 1500); }} contexts={[{ id: 'nsc1', label: 'NSC1' }]} />
          </div>
        </div>
        {open ? (
          <ArtifactPanel title="NSC1 vs peers" type="Table" onClose={() => setOpen(false)}>
            <Table aria-label="Peer comparison" columns={cols} rows={assessments.slice(0, 4)} density="compact" />
          </ArtifactPanel>
        ) : <span />}
      </SplitPane>
      {panelHint(open, setOpen)}
    </div>
  );
}
function panelHint(open: boolean, setOpen: (o: boolean) => void) {
  return open ? null : <div style={{ position: 'absolute', right: 16, top: 16 }}><Button size="sm" variant="subtle" onPress={() => setOpen(true)}>Open artifact</Button></div>;
}
export { Panel as _Panel };
