/**
 * Hand-written usage for every component's generated stories (see scripts/gen-stories.mjs).
 *   r   JSX that renders the component; `P` is the props object (Controls args + the variant being shown)
 *   a   default args (Controls)            w/h  fixed width/height of the preview frame
 *   fx  names imported from stories/fixtures   imp  extra names imported from @davinci-ai/react
 *   pre/ext  code / import lines placed above the story   col  stack variants vertically (wide components)
 *   nv  no auto Variants/Matrix            nst  no auto States      st  extra states [label, propsLiteral]
 *   sa  extra props added to every state   skip props to leave out of the auto stories   x  extra stories [name, jsx, doc]
 * Fictional data only. Colour is never the only signal.
 */
const NOOP = '() => {}';
const stateful = (name, init, body) => `function ${name}() {\n  ${init}\n  return (${body});\n}`;

export const SPEC = {
  /* ───────── Foundations ───────── */
  ThemeProvider: { r: `<ThemeProvider {...P} canvas={false} attachToRoot={false}><div style={{ padding: 16, borderRadius: 12, background: 'var(--dv-surface)', color: 'var(--dv-text)', display: 'grid', gap: 8 }}><b>Scoped region</b><span>Nested providers scope theme, density and direction.</span><Row><Badge intent="positive" dot>Up</Badge><Badge intent="negative" dot>Down</Badge></Row></div></ThemeProvider>`, imp: ['Badge'], a: `{ theme: 'light' }`, nst: true, x: [['Themes', `<Row gap={16}>{(['dark', 'light'] as const).map((t) => <ThemeProvider key={t} theme={t} canvas={false} attachToRoot={false}><div style={{ padding: 16, borderRadius: 12, background: 'var(--dv-surface)', color: 'var(--dv-text)' }}>{t}</div></ThemeProvider>)}</Row>`], ['Inverted direction', `<Row gap={16}>{(['standard', 'inverted'] as const).map((d) => <ThemeProvider key={d} direction={d} canvas={false} attachToRoot={false}><div style={{ padding: 12, borderRadius: 12, background: 'var(--dv-surface)', color: 'var(--dv-text)' }}><PriceChange percent={1.42} /></div></ThemeProvider>)}</Row>`]] , skip: ['density', 'cardBorder', 'direction'] },
  DensityProvider: { r: `<DensityProvider {...P}><Row><Button>Action</Button><TextField label="Name" aria-label="Name" /></Row></DensityProvider>`, imp: ['Button', 'TextField'], a: `{ density: 'compact' }` },
  AppBackground: { r: `<div style={{ position: 'relative', height: 160, overflow: 'hidden', borderRadius: 12 }}><AppBackground {...P} position="absolute" /></div>`, w: 360 },
  Icon: { r: `<Icon name="chart-line" size={24} {...P} />`, a: `{}`, nv: true, nst: true, x: [['Gallery', `<Row gap={20}>{['house', 'chart-line', 'bell', 'star', 'gear', 'magnifying-glass', 'droplet', 'fire'].map((n) => <Icon key={n} name={n} size={24} />)}</Row>`], ['Sizes', `<Row gap={20}>{[12, 16, 20, 24, 32].map((n) => <Icon key={n} name="star" size={n} />)}</Row>`]] },
  IconProvider: { r: `<IconProvider {...P}><Row gap={16}><Icon name="bell" size={24} /><Icon name="star" size={24} /><Icon name="gear" size={24} /></Row></IconProvider>`, imp: ['Icon'], a: `{ defaultStyle: 'regular' }` },
  DaVinciLogo: { r: `<DaVinciLogo {...P} />`, a: `{ variant: 'lockup' }` },
  LeoMark: { r: `<LeoMark {...P} />`, nv: true, nst: true },
  Heading: { r: `<Heading {...P}>Markets overview</Heading>`, a: `{ variant: 'title' }`, x: [['Levels', `<Col>{([1, 2, 3, 4, 5, 6] as const).map((l) => <Heading key={l} level={l}>Heading level {l}</Heading>)}</Col>`, 'Semantic level (h1–h6) is independent of the visual `variant`.']] },
  Text: { r: `<Text {...P}>The quick brown fox jumps over the lazy dog</Text>`, w: 220, a: `{}`, skip: [] },
  Label: { r: `<Label {...P}>Limit price</Label>`, nv: true, nst: true },
  NumberText: { r: `<NumberText {...P}>1,234.56</NumberText>`, nv: true, x: [['Alignment', `<Col width={160}><NumberText strong>1,234.56</NumberText><NumberText>98.10</NumberText><NumberText>7.00</NumberText></Col>`, 'Tabular figures keep decimals aligned.']] },
  DisplayNumber: { r: `<DisplayNumber value={84.62} {...P} />`, a: `{ size: 42 }`, nst: true },
  VisuallyHidden: { r: `<div><VisuallyHidden {...P}>Text only assistive technology reads</VisuallyHidden><span>The hidden text sits before this visible text.</span></div>`, nv: true, nst: true },
  FocusRing: { r: `<FocusRing {...P}><button type="button" style={{ padding: '8px 14px', borderRadius: 999, background: 'var(--dv-fill-field)', color: 'var(--dv-text)', border: 0 }}>Press Tab to focus me</button></FocusRing>`, nv: true },

  /* ───────── Actions ───────── */
  Button: { r: `<Button {...P}>New alert</Button>`, a: `{ iconStart: 'plus' }`, x: [['WithIcons', `<Row><Button iconStart="plus">Start</Button><Button iconEnd="chevron-down">End</Button><Button iconStart="plus" iconEnd="chevron-down">Both</Button></Row>`], ['Buy and sell', `<Row><Button intent="positive" size="xl">Buy</Button><Button intent="negative" size="xl">Sell</Button></Row>`, 'Primary CTAs use size xl; Buy/Sell use positive / negative intent.']], w: undefined },
  IconButton: { r: `<IconButton label="Refresh" icon="rotate-right" {...P} />`, a: `{}` },
  ButtonGroup: { r: `<ButtonGroup aria-label="Range" {...P}><Button variant="subtle">Day</Button><Button variant="subtle">Week</Button><Button variant="subtle">Month</Button></ButtonGroup>`, imp: ['Button'], nv: true },
  Link: { r: `<Link href="#assessments" {...P}>View all assessments</Link>`, a: `{}` },
  ToggleButton: { r: `<ToggleButton iconStart="star" {...P}>Pin</ToggleButton>`, a: `{}` },
  SegmentedControl: { r: `<SegmentedControl aria-label="Range" defaultValue="1d" options={[{ id: '1d', label: '1D' }, { id: '1w', label: '1W' }, { id: '1m', label: '1M' }]} {...P} />`, w: 280, x: [['With icons', `<SegmentedControl aria-label="View" defaultValue="chart" options={[{ id: 'chart', label: 'Chart', icon: 'chart-line' }, { id: 'table', label: 'Table', icon: 'list' }]} />`]] },
  SideToggle: { r: `<SideToggle {...P} />`, w: 360, x: [['Sell', `<Frame w={360}><SideToggle defaultValue="sell" /></Frame>`]], fx: ['Frame'] },
  PillTabs: { r: `<PillTabs aria-label="Views" items={[{ id: 'a', label: 'Overview', content: 'Overview panel' }, { id: 'b', label: 'Holdings', content: 'Holdings panel' }, { id: 'c', label: 'Activity', content: 'Activity panel' }]} {...P} />`, w: 360 },

  /* ───────── Inputs ───────── */
  Checkbox: { r: `<Checkbox description="We email you once a day" {...P}>Remember my filters</Checkbox>`, sa: `{}`, st: [['invalid', `{ isInvalid: true }`]] },
  CheckboxGroup: { r: `<CheckboxGroup label="Notify me by" description="Choose at least one channel" errorMessage="Select at least one channel" {...P}><Checkbox value="email">Email</Checkbox><Checkbox value="push">Push</Checkbox><Checkbox value="sms">SMS</Checkbox></CheckboxGroup>`, imp: ['Checkbox'], w: 320 },
  RadioGroup: { r: `<RadioGroup label="Delivery" description="How alerts reach you" options={RADIOS} errorMessage="Choose a delivery option" {...P} />`, fx: ['RADIOS'], w: 340 },
  Switch: { r: `<Switch {...P}>Price alerts</Switch>`, nv: true },
  SwitchRow: { r: `<SwitchRow title="Price alerts" hint="Notify me when a threshold is crossed" switchLabel="Price alerts" {...P} />`, w: 520 },
  TextField: { r: `<TextField label="Limit price" description="Per barrel, excluding fees" placeholder="0.00" {...P} />`, a: `{}`, sa: `{ errorMessage: 'Enter a valid price' }`, w: 320, x: [['With affixes', `<Frame w={320}><TextField label="Limit price" placeholder="0.00" iconStart="magnifying-glass" prefix="$" suffix="USD" /></Frame>`]], fx: ['Frame'], st: [['read-only', `{ isReadOnly: true, defaultValue: '84.62' }`]] },
  TextArea: { r: `<TextArea label="Notes" description="Visible to your team" placeholder="Add a note…" {...P} />`, sa: `{ errorMessage: 'Notes are required' }`, w: 320 },
  PasswordField: { r: `<PasswordField label="Password" description="At least 12 characters" placeholder="Enter password" {...P} />`, sa: `{ errorMessage: 'Password is too short' }`, w: 320 },
  SearchField: { r: `<SearchField label="Search" description="Instruments, news and people" placeholder="Search…" defaultValue="brent" {...P} />`, sa: `{ errorMessage: 'No results' }`, w: 320 },
  NumberField: { r: `<NumberField label="Quantity" description="Lots of 1,000 bbl" placeholder="0" suffix="lots" {...P} />`, sa: `{ errorMessage: 'Must be a whole number' }`, w: 320 },
  PriceField: { r: `<PriceField label="Limit price" description="Snaps to the tick size" currency="USD" precision={2} tickSize={0.05} defaultValue={84.6} {...P} />`, sa: `{ errorMessage: 'Outside the daily limit' }`, w: 320 },
  Select: { r: `<Select label="Instrument" description="Choose one" placeholder="Select…" items={ITEMS} {...P} />`, fx: ['ITEMS'], sa: `{ errorMessage: 'Select an instrument' }`, w: 320, st: [['open', `{ defaultOpen: true }`]], skip: ['isOpen', 'defaultOpen'] },
  ComboBox: { r: `<ComboBox label="Instrument" description="Type to search" placeholder="Search…" items={ITEMS} {...P} />`, fx: ['ITEMS'], sa: `{ errorMessage: 'Pick an instrument' }`, w: 320 },
  MultiSelect: { r: `<MultiSelect label="Instruments" description="Pick any" placeholder="Select…" items={ITEMS} defaultValue={['nsc1', 'wtx1']} {...P} />`, fx: ['ITEMS'], sa: `{ errorMessage: 'Pick at least one' }`, w: 360 },
  DatePicker: { r: `<DatePicker label="Expiry" description="Contract expiry" defaultValue={parseDate('2026-10-02')} {...P} />`, ext: `import { parseDate } from '@internationalized/date';`, sa: `{ errorMessage: 'Date is in the past' }`, w: 320, skip: ['isOpen', 'defaultOpen'] },
  DateRangePicker: { r: `<DateRangePicker label="Period" description="Reporting window" defaultValue={{ start: parseDate('2026-10-01'), end: parseDate('2026-10-31') }} {...P} />`, ext: `import { parseDate } from '@internationalized/date';`, sa: `{ errorMessage: 'Range is too long' }`, w: 360, skip: ['isOpen', 'defaultOpen'] },
  TimeField: { r: `<TimeField label="Cut-off" description="Local time" defaultValue={new Time(17, 30)} {...P} />`, ext: `import { Time } from '@internationalized/date';`, sa: `{ errorMessage: 'After market close' }`, w: 240 },
  Calendar: { r: `<Calendar aria-label="Pick a day" defaultValue={parseDate('2026-10-14')} {...P} />`, ext: `import { parseDate } from '@internationalized/date';`, nv: true },
  RangeCalendar: { r: `<RangeCalendar aria-label="Pick a range" defaultValue={{ start: parseDate('2026-10-12'), end: parseDate('2026-10-16') }} {...P} />`, ext: `import { parseDate } from '@internationalized/date';`, nv: true },
  Slider: { r: `<div style={{ width: P.orientation === 'vertical' ? undefined : 320, height: P.orientation === 'vertical' ? 160 : undefined }}><Slider label="Alert threshold" defaultValue={30} {...P} /></div>`, a: `{}` },
  RangeSlider: { r: `<div style={{ width: P.orientation === 'vertical' ? undefined : 320, height: P.orientation === 'vertical' ? 160 : undefined }}><RangeSlider label="Price band" defaultValue={[20, 65]} {...P} /></div>`, a: `{}` },
  FileUpload: { r: `<FileUpload label="Upload files" description="PDF or CSV up to 10 MB" {...P} />`, w: 360, st: [['error', `{ errorMessage: 'File is too large' }`]] },
  FormField: { r: `<FormField label="Counterparty" description="Legal entity name" {...P}><Slot /></FormField>`, fx: ['Slot'], w: 320, st: [['error', `{ errorMessage: 'Counterparty is required' }`]] },
  Form: { r: `<Form {...P}><FormField label="Counterparty"><Slot /></FormField><FormField label="Reference"><Slot /></FormField></Form>`, imp: ['FormField'], fx: ['Slot'], w: 360 },
  Fieldset: { r: `<Fieldset legend="Delivery" description="Where and when" {...P}><FormField label="Port"><Slot /></FormField></Fieldset>`, imp: ['FormField'], fx: ['Slot'], w: 360, nv: true },

  /* ───────── Display ───────── */
  Badge: { r: `<Badge {...P}>Live</Badge>`, a: `{ dot: true }`, x: [['With icon', `<Row><Badge icon="bolt">Live</Badge><Badge icon="triangle-exclamation" intent="warning">Delayed</Badge></Row>`]] },
  Chip: { r: `<Chip icon="droplet" onRemove={${NOOP}} {...P}>Crude</Chip>`, nv: true, x: [['Tag', `<Row><Tag>Gas</Tag><Tag>Freight</Tag></Row>`, 'A non-removable label.']], imp: ['Tag'] },
  DeltaPill: { r: `<DeltaPill value={1.42} context="vs yesterday" {...P} />`, nv: true, x: [['Directions', `<Col><DeltaPill value={1.42} context="vs yesterday" /><DeltaPill value={-0.86} context="vs yesterday" /><DeltaPill value={0} context="vs yesterday" /></Col>`, 'Direction is shown by sign, arrow and colour.'], ['Custom arrow', `<Row>{(['none', 'up', 'down'] as const).map((a) => <DeltaPill key={a} arrow={a}>12 markets · 7 up</DeltaPill>)}</Row>`]] },
  CodeChip: { r: `<CodeChip {...P}>NSC1</CodeChip>`, nv: true },
  Avatar: { r: `<Avatar name="Ada Lovelace" {...P} />`, a: `{}` },
  AvatarGroup: { r: `<AvatarGroup people={PEOPLE} max={4} {...P} />`, fx: ['PEOPLE'] },
  Kbd: { r: `<Kbd {...P}>⌘K</Kbd>`, nv: true },
  Divider: { r: `<div style={{ width: P.orientation === 'vertical' ? undefined : 240, height: P.orientation === 'vertical' ? 48 : undefined, display: 'flex', alignItems: 'center' }}><Divider {...P} /></div>`, a: `{}` },
  Tooltip: { r: `<div style={{ padding: '36px 24px 8px' }}><Tooltip content="Refresh prices" {...P}><Button variant="subtle">Refresh</Button></Tooltip></div>`, imp: ['Button'], nv: true, st: [['open', `{ isOpen: true }`]] },
  Skeleton: { r: `<Skeleton width={200} height={14} {...P} />`, nv: true, x: [['Layout', `<Col width={260}><Row><Skeleton circle width={40} height={40} /><Col gap={8}><Skeleton width={160} height={12} /><Skeleton width={110} height={12} /></Col></Row><Skeleton width={260} height={80} /></Col>`]] },
  Spinner: { r: `<Spinner label="Loading" {...P} />`, a: `{}` },
  ProgressBar: { r: `<ProgressBar label="Importing assessments" value={64} {...P} />`, w: 320, st: [['indeterminate', `{ isIndeterminate: true }`]] },
  ProgressCircle: { r: `<ProgressCircle aria-label="Sync" value={72} {...P} />`, st: [['indeterminate', `{ isIndeterminate: true }`]] },
  Meter: { r: `<Meter label="Limit usage" value={40} warnAt={0.7} criticalAt={0.9} {...P} />`, w: 320, x: [['Thresholds', `<Col width={320}>{[40, 78, 96].map((v) => <Meter key={v} label="Limit usage" value={v} showValue warnAt={0.7} criticalAt={0.9} />)}</Col>`, 'Warning and critical thresholds change the colour and the label.']] },
  EmptyState: { r: `<EmptyState icon="bell" title="No alerts yet" description="Create an alert to be told when a price crosses a level." action={<Button iconStart="plus">New alert</Button>} {...P} />`, imp: ['Button'], w: 460, nv: true },
  Callout: { r: `<Callout title="Delayed data" action={<Button variant="subtle" size="sm">Learn more</Button>} {...P}>Sample prices are 15 minutes delayed.</Callout>`, imp: ['Button'], a: `{ intent: 'info' }`, w: 460, col: true },

  /* ───────── Navigation ───────── */
  AppHeader: { r: `<AppHeader nav={NAV} currentId="markets" actions={<><IconButton label="Search" icon="magnifying-glass" size="lg" /><UserChip name="Ket Patel" subtitle="Product Design" /></>} {...P} />`, imp: ['IconButton', 'UserChip'], fx: ['NAV'], layout: 'padded', nv: true },
  UserChip: { r: `<UserChip name="Ket Patel" subtitle="Product Design" {...P} />`, nv: true },
  PageHeader: { r: `<PageHeader eyebrow="Overview" title="Markets" subtitle="Follow prices from assessment to decision" actions={<><Button variant="subtle" iconStart="filter">Filters</Button><Button iconStart="plus">New alert</Button></>} {...P} />`, imp: ['Button'], w: 900, nv: true },
  SideNav: { r: `<SideNav items={SIDE} currentId="markets" {...P} />`, fx: ['SIDE'], w: 260 },
  Tabs: { r: `<Tabs aria-label="Sections" items={TABS} {...P} />`, fx: ['TABS'], w: 520 },
  Breadcrumbs: { r: `<Breadcrumbs items={[{ id: 'home', label: 'Home', href: '#' }, { id: 'm', label: 'Markets', href: '#' }, { id: 'nsc1', label: 'North Sea Crude M1', href: '#' }]} {...P} />`, nv: true },
  Pagination: { r: `<Pagination page={4} pageCount={12} onPageChange={${NOOP}} {...P} />`, nv: true, x: [['Interactive', `<PaginationDemo />`]], pre: stateful('PaginationDemo', 'const [page, setPage] = useState(4);', '<Pagination page={page} pageCount={12} onPageChange={setPage} />'), ext: `import { useState } from 'react';` },
  Stepper: { r: `<Stepper current={1} steps={[{ id: 'a', label: 'Instrument' }, { id: 'b', label: 'Quantity' }, { id: 'c', label: 'Review' }]} {...P} />`, w: 520 },
  Menu: { r: `<div style={{ minHeight: 120 }}><Menu trigger={<Button variant="subtle" iconEnd="chevron-down">Actions</Button>} items={MENU} aria-label="Actions" {...P} /></div>`, imp: ['Button'], fx: ['MENU'], nv: true, x: [['Placements', `<Row gap={24} style={{ minHeight: 220, alignItems: 'center' }}>{(['bottom start', 'bottom end', 'top start'] as const).map((p) => <Menu key={p} placement={p} trigger={<Button variant="subtle">{p}</Button>} items={MENU} aria-label={p} />)}</Row>`]] },
  ContextMenu: { r: `<ContextMenu items={MENU} {...P}><div style={{ padding: 40, border: '1px dashed var(--dv-border-line-strong)', borderRadius: 12, color: 'var(--dv-text-secondary)' }}>Right-click or long-press here</div></ContextMenu>`, fx: ['MENU'], nv: true },
  CommandPalette: { r: `<PaletteDemo {...P} />`, imp: ['Button'], fx: ['COMMANDS'], ext: `import { useState } from 'react';`, pre: stateful('PaletteDemo', 'const [open, setOpen] = useState(false);', `<><Button variant="subtle" onPress={() => setOpen(true)}>Open command palette</Button><CommandPalette isOpen={open} onOpenChange={setOpen} commands={COMMANDS} onRun={() => setOpen(false)} /></>`), nv: true, nst: true },

  /* ───────── Overlays ───────── */
  Popover: { r: `<Popover aria-label="Alert details" trigger={<Button variant="subtle">Details</Button>} arrow {...P}><div style={{ display: 'grid', gap: 6, padding: 4 }}><b>Alert rule</b><span>Notify when NSC1 crosses 85.00.</span></div></Popover>`, imp: ['Button'], nv: true, x: [['Placements', `<Row gap={16} style={{ minHeight: 200, alignItems: 'center' }}>{(['top', 'bottom', 'left', 'right'] as const).map((p) => <Popover key={p} placement={p} aria-label={p} trigger={<Button variant="subtle">{p}</Button>}>Popover on the {p}</Popover>)}</Row>`]] },
  Dialog: { r: `<Dialog title="Rename watchlist" description="Names are visible to teammates you share with." trigger={<Button variant="subtle">Rename…</Button>} footer={<><Button variant="subtle" slot="close">Cancel</Button><Button slot="close">Save</Button></>} {...P}><TextField label="Name" defaultValue="Core energy desk" /></Dialog>`, imp: ['Button', 'TextField'], layout: 'centered', skip: ['isOpen', 'defaultOpen', 'isDismissable'] },
  ConfirmDialog: { r: `<ConfirmDialog trigger={<Button variant="subtle">Delete alert</Button>} title="Delete this alert?" description="You will stop receiving notifications for NSC1 above 85.00." confirmLabel="Delete" onConfirm={${NOOP}} {...P} />`, imp: ['Button'], a: `{ intent: 'destructive' }`, nst: true },
  Drawer: { r: `<Drawer title="Assessment details" trigger={<Button variant="subtle">Open drawer</Button>} footer={<Button slot="close">Done</Button>} {...P}><p>Methodology, timestamps and fictional sample notes.</p></Drawer>`, imp: ['Button'], nst: true },
  ToastProvider: { r: `<ToastProvider {...P}><ToastDemo /></ToastProvider>`, imp: ['Button', 'useToast'], pre: `function ToastDemo() {\n  const { show } = useToast();\n  return (\n    <Row>\n      {(['neutral', 'brand', 'positive', 'negative', 'warning', 'info'] as const).map((intent) => (\n        <Button key={intent} variant="subtle" onPress={() => show({ title: 'Order placed', description: 'Buy 25,000 bbl NSC1 @ 84.60', intent, action: { label: 'Undo', onPress: () => {} } })}>{intent}</Button>\n      ))}\n    </Row>\n  );\n}`, nst: true },
  Alert: { r: `<Alert title="Heads up" onDismiss={${NOOP}} {...P}>Supporting text that explains what to do next.</Alert>`, a: `{ intent: 'info' }`, w: 480, col: true },
  Banner: { r: `<Banner dismissible title="Maintenance tonight 22:00–23:00." {...P}>Pricing remains available.</Banner>`, a: `{ intent: 'warning' }`, w: 760, col: true },
  InlineMessage: { r: `<InlineMessage {...P}>Prices are 15 minutes delayed.</InlineMessage>`, a: `{ intent: 'info' }`, w: 420, col: true },

  /* ───────── Layout ───────── */
  Card: { r: `<Card title="Watchlist exposure" unit="· 24 assessments" actions={<IconButton label="More" icon="ellipsis-vertical" variant="ghost" size="sm" />} {...P}>Card content goes here.</Card>`, imp: ['IconButton'], w: 420, x: [['Borders', `<Row gap={16}>{(['spotlight', 'none', '1px'] as const).map((b) => <Card key={b} border={b} title={b} style={{ width: 200 }}>Hover me</Card>)}</Row>`, 'Cards are borderless at rest; the edge is lit by the cursor on hover or focus.']], skip: ['border'] },
  Panel: { r: `<Panel {...P}>Grouped controls live on a panel.</Panel>`, w: 360, nv: true },
  AccentTile: { r: `<AccentTile label="Brent-style" value="+1.42%" {...P} />`, a: `{ intent: 'positive' }`, w: 260 },
  Stack: { r: `<Stack gap={8} {...P}><Panel>First</Panel><Panel>Second</Panel><Panel>Third</Panel></Stack>`, imp: ['Panel'], w: 420 },
  Grid: { r: `<Grid gap={12} {...P}><GridItem span={3}><Panel>span 3</Panel></GridItem><GridItem span={3}><Panel>span 3</Panel></GridItem><GridItem span={6}><Panel>span 6</Panel></GridItem></Grid>`, imp: ['GridItem', 'Panel'], w: 560, nv: true },
  GridItem: { r: `<Grid gap={12}><GridItem span={4} {...P}><Panel>span 4</Panel></GridItem><GridItem span={8}><Panel>span 8</Panel></GridItem></Grid>`, imp: ['Grid', 'Panel'], w: 560, nv: true, nst: true },
  Toolbar: { r: `<Toolbar aria-label="Chart tools" {...P}><IconButton label="Zoom in" icon="plus" /><IconButton label="Zoom out" icon="minus" /><IconButton label="Reset" icon="rotate-right" /></Toolbar>`, imp: ['IconButton'] },
  SplitPane: { r: `<div style={{ height: 160 }}><SplitPane aria-label="Resize panes" {...P}><Panel style={{ height: '100%' }}>Left</Panel><Panel style={{ height: '100%' }}>Right</Panel></SplitPane></div>`, imp: ['Panel'], w: 560 },
  ScrollArea: { r: `<ScrollArea aria-label="Log" maxHeight={90} {...P}><div style={{ height: 260, width: 520 }}>{Array.from({ length: 8 }, (_, i) => <div key={i}>Log line {i + 1}</div>)}</div></ScrollArea>`, w: 320 },
  Disclosure: { r: `<Disclosure title="Methodology" summary="3 notes" {...P}>Sample methodology text for fictional data.</Disclosure>`, w: 460, nv: true },
  Accordion: { r: `<Accordion defaultExpandedKeys={['a']} items={[{ id: 'a', title: 'Fees', content: 'Sample fee schedule.' }, { id: 'b', title: 'Settlement', content: 'Sample settlement notes.' }]} {...P} />`, w: 460, nv: true },
  CollapsibleSection: { r: `<CollapsibleSection title="Advanced options" {...P}>Hidden until needed.</CollapsibleSection>`, w: 460, nv: true },
  AppShell: { r: `<AppShell header={<AppHeader nav={NAV} currentId="markets" actions={<UserChip name="Ket Patel" subtitle="Product Design" />} />} sidebar={<SideNav items={SIDE} currentId="markets" />} {...P}><PageHeader title="Markets" subtitle="Follow prices from assessment to decision" /></AppShell>`, imp: ['AppHeader', 'UserChip', 'SideNav', 'PageHeader'], fx: ['NAV', 'SIDE'], layout: 'fullscreen', w: '100%', h: 520, nv: true },

  /* ───────── Data ───────── */
  Table: { r: `<Card padded={false} style={{ overflow: 'hidden' }}><Table<AssetRow> aria-label="Watchlist" columns={COLUMNS} rows={ROWS} {...P} /></Card>`, imp: ['Card'], fx: ['COLUMNS', 'ROWS', 'AssetRow'], w: 760, x: [['Selection modes', `<Col gap={20}>{(['none', 'single', 'multiple'] as const).map((m) => <Section key={m} title={m}><Card padded={false} style={{ overflow: 'hidden', width: 760 }}><Table<AssetRow> aria-label={m} columns={COLUMNS} rows={ROWS} selectionMode={m} /></Card></Section>)}</Col>`], ['With toolbar', `<Card padded={false} style={{ overflow: 'hidden', width: 760 }}><Table<AssetRow> aria-label="Watchlist" columns={COLUMNS} rows={ROWS} toolbar={<TableToolbar end={<SearchField aria-label="Search assessments" placeholder="Search assessments" />}><SegmentedControl aria-label="View" defaultValue="watchlist" options={[{ id: 'watchlist', label: 'Watchlist' }, { id: 'alerts', label: 'Alerts' }]} /></TableToolbar>} /></Card>`]], ext: '', skip: [] },
  TableToolbar: { r: `<TableToolbar end={<SearchField aria-label="Search assessments" placeholder="Search assessments" />} {...P}><SegmentedControl aria-label="View" defaultValue="watchlist" options={[{ id: 'watchlist', label: 'Watchlist' }, { id: 'alerts', label: 'Alerts' }]} /></TableToolbar>`, imp: ['SearchField', 'SegmentedControl'], w: 760, nv: true },
  AssetCell: { r: `<AssetCell name="North Sea Crude M1" category="Crude oil" icon="droplet" {...P} />`, w: 320, nv: true },
  RowActions: { r: `<RowActions name="North Sea Crude M1" items={[{ id: 'o', label: 'Open', icon: 'chart-line' }, { id: 'a', label: 'Create alert…', icon: 'bell' }]} {...P} />`, nv: true },
  List: { r: `<List aria-label="Alerts" items={LIST_ITEMS} {...P} />`, fx: ['LIST_ITEMS'], w: 360, x: [['Selection modes', `<Col gap={20}>{(['none', 'single', 'multiple'] as const).map((m) => <Section key={m} title={m}><Frame w={360}><List aria-label={m} selectionMode={m} items={LIST_ITEMS} /></Frame></Section>)}</Col>`]] },
  TreeView: { r: `<TreeView aria-label="Instruments" defaultExpandedKeys={['oil']} nodes={TREE} {...P} />`, fx: ['TREE'], w: 320, nv: true, x: [['Selection modes', `<Row gap={24} align="start">{(['none', 'single', 'multiple'] as const).map((m) => <Section key={m} title={m}><Frame w={240}><TreeView aria-label={m} selectionMode={m} defaultExpandedKeys={['oil']} nodes={TREE} /></Frame></Section>)}</Row>`]] },
  DescriptionList: { r: `<DescriptionList items={DESCRIPTIONS} {...P} />`, fx: ['DESCRIPTIONS'], w: 360 },

  /* ───────── Finance ───────── */
  Sparkline: { r: `<div style={{ width: 260, height: 56 }}><Sparkline data={P.intent === 'trend' ? seriesDown : series} animate={false} {...P} /></div>`, fx: ['series', 'seriesDown'], a: `{ intent: 'mono' }`, x: [['Trend up and down', `<Col width={260}><div style={{ height: 44 }}><Sparkline data={series} intent="trend" animate={false} /></div><div style={{ height: 44 }}><Sparkline data={seriesDown} intent="trend" animate={false} /></div></Col>`, 'Trend colour follows the data direction (and respects the market-direction toggle).']] },
  PriceChange: { r: `<PriceChange value={1.2} percent={1.42} {...P} />`, x: [['Directions', `<Col><PriceChange value={1.2} percent={1.42} /><PriceChange value={-0.69} percent={-0.86} /><PriceChange percent={0} /></Col>`, 'Direction is shown by sign and icon as well as colour.']] },
  PriceFlash: { r: `<PriceFlash value={84.62} {...P}>84.62</PriceFlash>`, nv: true, imp: ['Button'], x: [['Live', `<FlashDemo />`, 'Flashes when the value changes. Screen readers are only told about significant moves (announceThresholdPercent).']], ext: `import { useState } from 'react';`, pre: stateful('FlashDemo', 'const [v, setV] = useState(84.62);', `<Row><PriceFlash value={v}>{v.toFixed(2)}</PriceFlash><Button variant="subtle" onPress={() => setV((x) => x + (Math.random() > 0.5 ? 0.35 : -0.35))}>Tick</Button></Row>`) },
  DayRange: { r: `<DayRange low={82.97} high={85.1} value={84.62} {...P} />`, w: 260, a: `{ variant: 'marker' }` },
  Stat: { r: `<Stat title="Brent-style M1" value={84.62} series={series} delta={{ value: 1.42, context: '1D' }} countUp={false} {...P} />`, fx: ['series'], w: 352 },
  QuoteCard: { r: `<QuoteCard title="North Sea Crude M1" unit="$/bbl" price={84.62} currency="USD" change={{ percent: 1.42, context: 'vs yesterday' }} rangeSelector={<TimeRangeSelector />} stats={QUOTE_STATS} dayRange={{ low: 82.97, high: 85.1 }} {...P}><PriceChart aria-label="Price" data={LONG} xAxisLabels={['Sep 02', 'Sep 16', 'Sep 30']} height={200} animate={false} /></QuoteCard>`, imp: ['TimeRangeSelector', 'PriceChart'], fx: ['LONG', 'QUOTE_STATS'], w: 720, nv: true },
  PriceChart: { r: `<PriceChart aria-label="North Sea Crude M1, 30-day price" data={LONG} xAxisLabels={X_LABELS} tooltipPrefix="$" height={250} animate={false} {...P} />`, fx: ['LONG', 'X_LABELS'], w: 700, nv: true },
  DonutChart: { r: `<DonutChart aria-label="Exposure by sector" centerValue={24} centerLabel="Assessments" animate={false} segments={SEGMENTS} {...P} />`, fx: ['SEGMENTS'], w: 320, nv: true },
  ChartLegend: { r: `<ChartLegend items={LEGEND as never} {...P} />`, fx: ['LEGEND'], w: 260, nv: true },
  TimeRangeSelector: { r: `<TimeRangeSelector {...P} />`, w: 360 },
  MarketPulse: { r: `<MarketPulse markets={MARKETS} {...P} />`, fx: ['MARKETS'], w: 980, nv: true },
  FilterBar: { r: `<FilterBar defaultValue={['crude']} filters={FILTERS} savedViews={[{ id: 'a', label: 'Energy morning' }]} onSaveView={${NOOP}} {...P} />`, fx: ['FILTERS'], w: 720, nv: true },
  ChartPanel: { r: `<ChartPanel title="North Sea Crude M1" unit="· $/bbl" rangeSelector={<TimeRangeSelector size="sm" />} {...P}><PriceChart aria-label="Price" data={LONG} xAxisLabels={['Sep 02', 'Sep 16', 'Sep 30']} height={200} animate={false} /></ChartPanel>`, imp: ['TimeRangeSelector', 'PriceChart'], fx: ['LONG'], w: 720, nv: true },
  Watchlist: { r: `<Watchlist aria-label="Core energy desk" items={WL} {...P} />`, fx: ['WL'], w: 560, x: [['Selection', `<Frame w={560}><Watchlist aria-label="Selectable" selectionMode="single" defaultSelectedKeys={new Set(['nsc1'])} items={WL} /></Frame>`]] },
  WatchlistRow: { r: `<Watchlist aria-label="Single row" items={[WL[0]!]} {...P} />`, imp: ['Watchlist'], fx: ['WL'], w: 560, nv: true, nst: true },
  NewsList: { r: `<NewsList aria-label="Latest" items={NEWS} onOpen={${NOOP}} {...P} />`, fx: ['NEWS'], w: 640, nv: true },
  ArticleView: { r: `<ArticleView title="North Sea loading programme revised lower" onBack={${NOOP}} backLabel="Back to news" source="Fictional Wire" time="10/05/2026 09:42" tags={['Crude', 'Top News']} standfirst="Sample text only. The programme was trimmed by about 4% against schedule." {...P}><p>Sample text only. Loading programmes for the coming month were revised lower after maintenance was scheduled at two terminals.</p><p>Traders said the change tightened prompt supply, while spreads for later months were little changed.</p></ArticleView>`, w: 760, nv: true, nst: true },
  NewsItem: { r: `<NewsList aria-label="One story" items={[NEWS[0]!]} onOpen={${NOOP}} {...P} />`, imp: ['NewsList'], fx: ['NEWS'], w: 640, nv: true, nst: true },
  OrderTicket: { r: `<OrderTicket symbol="NSC1" {...P} />`, w: 460, x: [['Sell', `<Frame w={460}><OrderTicket symbol="NSC1" defaultSide="sell" /></Frame>`]], fx: ['Frame'], nv: true },
  TickerTape: { r: `<TickerTape items={TAPE} {...P} />`, fx: ['TAPE'], w: 760, nv: true },

  /* ───────── Chat ───────── */
  ChatThread: { r: `<ChatThread aria-label="Conversation with LEO" {...P}><ChatMessage role="user">Why did North Sea crude rise today?</ChatMessage><ChatMessage role="assistant"><Prose><p>North Sea Crude M1 rose <strong>+1.42%</strong> to 84.62 as loading programmes were trimmed.</p></Prose></ChatMessage></ChatThread>`, imp: ['ChatMessage', 'Prose'], w: 760, h: 320, nv: true },
  ChatMessage: { r: `<ChatMessage {...P}>{P.role === 'user' ? 'Why did North Sea crude rise today?' : <Prose><p>North Sea Crude M1 rose <strong>+1.42%</strong> to 84.62 as loading programmes were trimmed.</p></Prose>}</ChatMessage>`, imp: ['Prose'], a: `{ role: 'assistant' }`, w: 720, col: true, nst: true, x: [['With trace and actions', `<Frame w={720}><ChatMessage role="assistant" trace={<ReasoningBlock summary="Thought for 4 s">Looked at the programme revision.</ReasoningBlock>} actions={<MessageActions copyText="x" />}><Prose><p>Rose <strong>+1.42%</strong> to 84.62.</p></Prose></ChatMessage></Frame>`]], fx: ['Frame'] },
  StreamingText: { r: `<StreamingText text="Streaming text reveals progressively, with a cursor, while the model is responding." {...P} />`, w: 480, nv: true, st: [['streaming', `{ isStreaming: true, simulate: true }`]] },
  MessageActions: { r: `<Frame w={560}><ChatMessage role="assistant" actions={<MessageActions copyText="Sample answer" onRetry={${NOOP}} feedback={null} onFeedback={${NOOP}} {...P} />}>Hover or focus this message to reveal its actions.</ChatMessage></Frame>`, imp: ['ChatMessage'], fx: ['Frame'], nv: true },
  Composer: { r: `<Composer onSubmit={${NOOP}} contexts={CONTEXTS} modes={MODES} onAttach={${NOOP}} onTools={${NOOP}} {...P} />`, fx: ['CONTEXTS', 'MODES'], w: 720, nv: true, st: [['streaming', `{ isStreaming: true, onStop: () => {} }`]] },
  SuggestedPrompts: { r: `<SuggestedPrompts prompts={PROMPTS} onSelect={${NOOP}} {...P} />`, fx: ['PROMPTS'], w: 720, nv: true },
  Prose: { r: `<Prose {...P}><h3>Drivers</h3><p>North Sea Crude M1 rose <strong>+1.42%</strong> to 84.62.</p><ul><li>Programme cut of ~4%</li><li>Firmer diesel cracks</li></ul><table><thead><tr><th>Market</th><th>Change</th></tr></thead><tbody><tr><td>NSC1</td><td>+1.42%</td></tr><tr><td>ULS</td><td>+0.64%</td></tr></tbody></table></Prose>`, w: 560, nv: true },
  CodeBlock: { r: `<CodeBlock language="json" code={'{\\n  "code": "NSC1",\\n  "range": "1M"\\n}'} {...P} />`, w: 480, nv: true },
  ReasoningBlock: { r: `<ReasoningBlock summary="Thought for 4 s" {...P}>Looked at the programme revision, product cracks and freight.</ReasoningBlock>`, w: 560, nv: true, st: [['streaming', `{ summary: '', isStreaming: true }`]] },
  ToolUseBlock: { r: `<ToolUseBlock name="Search assessments" summary="NSC1, 30 days" {...P}>Returned 30 daily points.</ToolUseBlock>`, a: `{ status: 'success' }`, w: 560 },
  CitationChip: { r: `<CitationChip n={1} title="Fictional Wire: loading programme revised" href="#" {...P} />`, nv: true },
  ArtifactPanel: { r: `<ArtifactPanel title="NSC1 vs peers" type="Table" onClose={${NOOP}} {...P}><Prose><p>Larger outputs open in a side panel with their own scroll.</p></Prose></ArtifactPanel>`, imp: ['Prose'], w: 520, h: 300, nv: true },
};

/**
 * Interaction stories (hover / focus / pressed / open). They double as the visual-regression captures of those states
 * and run as play tests. [name, play body, extra story props].
 */
const BTN = `within(canvasElement).getByRole('button')`;
const hover = ['Hover', `await userEvent.hover(${BTN});`];
const focus = ['FocusVisible', `await userEvent.tab();`];
const pressed = ['Pressed', `await userEvent.pointer({ keys: '[MouseLeft>]', target: ${BTN} });`];
export const PLAY = {
  Button: [hover, ['FocusVisible', `await userEvent.tab(); await expect(${BTN}).toHaveFocus();`], pressed, ['DensityCompact', '', `globals: { density: 'compact' }`]],
  IconButton: [hover, focus, pressed],
  SegmentedControl: [['KeyboardArrowRight', `await userEvent.tab(); await userEvent.keyboard('{ArrowRight}'); await new Promise((r) => setTimeout(r, 500));`], ['HoverOption', `await userEvent.hover(within(canvasElement).getByRole('radio', { name: '1W' }));`], focus],
  TextField: [['Focused', `await userEvent.tab();`]],
  Checkbox: [['FocusVisible', `await userEvent.tab();`, `args: { defaultSelected: true }`]],
  Switch: [['FocusVisible', `await userEvent.tab();`, `args: { defaultSelected: true }`]],
  Select: [['Open', `await userEvent.click(${BTN});`]],
  Menu: [['Open', `await userEvent.click(${BTN});`]],
  MessageActions: [['Hover', `await userEvent.hover(canvasElement.querySelector('.dv-chat-message') as HTMLElement);`]],
  Dialog: [['Open', `await userEvent.click(within(canvasElement).getByRole('button', { name: 'Rename…' }));`]],
  Card: [['SpotlightHover', `const card = within(canvasElement).getByRole('region'); await userEvent.pointer({ target: card, coords: { clientX: 120, clientY: 40 } }); await userEvent.hover(card);`, `args: { tabIndex: 0 }`], ['SpotlightFocusWithin', `await userEvent.tab();`, `render: () => <Card title="Focus within" style={{ width: 380 }}><Button variant="subtle">Tab to me</Button></Card>`]],
  Table: [['RowHover', `await userEvent.hover(canvasElement.querySelector('.dv-table__row') as HTMLElement);`]],
  PriceChart: [['HoverCrosshair', `const el = canvasElement.querySelector('.dv-price-chart') as HTMLElement; await userEvent.hover(el, { clientX: 400, clientY: 120 } as never); await userEvent.tab(); await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');`]],
  Composer: [['Focused', `await userEvent.click(within(canvasElement).getByRole('textbox'));`]],
};
