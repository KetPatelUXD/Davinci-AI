import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { Card } from './Card';
import { Panel } from './Panel';
import { AccentTile } from './AccentTile';
import { Stack, Grid, GridItem } from './Stack';
import { Toolbar } from './Toolbar';
import { SplitPane } from './SplitPane';
import { ScrollArea } from './ScrollArea';
import { Disclosure, Accordion, CollapsibleSection } from './Disclosure';
import { Button } from '../actions/Button';
import { IconButton } from '../actions/IconButton';
import { Col, Row, Section } from '../../stories/helpers';

const meta = {
  title: 'Components/Layout/Card',
  component: Card,
  args: { title: 'Watchlist exposure', unit: '· 24 assessments', children: 'Card content goes here. Hover (or Tab into) the card to see the lit spotlight edge.', style: { width: 380 } },
  argTypes: { border: { control: 'inline-radio', options: ['spotlight', 'none', '1px'] } },
  parameters: { docs: { components: ["Card", "Panel", "AccentTile", "Stack", "Grid", "Toolbar", "SplitPane", "ScrollArea", "Disclosure", "Accordion", "CollapsibleSection", "AppShell"], description: { component: '**Graphite card**: lit-corner gradient, borderless at rest, radius 26, quiet 16/400 title. The cursor **spotlight** (a 1px edge lit near the pointer plus a soft inner glow) appears on hover *and* `:focus-within`. `border="1px"` draws a constant hairline; `"none"` disables the effect. Under `prefers-reduced-transparency` cards become solid.' } } },
} satisfies Meta<typeof Card>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {};
export const WithActions: S = { args: { actions: <IconButton label="More" icon="ellipsis-vertical" variant="ghost" size="sm" /> } };
export const BorderModes: S = { render: () => (<Row gap={24} align="start">{(['spotlight', 'none', '1px'] as const).map((b) => <Card key={b} title={`border="${b}"`} border={b} style={{ width: 240 }}>Hover me</Card>)}</Row>) };
export const Rise: S = { render: () => (<Row gap={16} align="start">{[0, 1, 2].map((i) => <Card key={i} rise={i} title={`Card ${i + 1}`} style={{ width: 200 }}>Rises in with a 40ms stagger.</Card>)}</Row>) };
export const Surfaces: S = {
  render: () => (
    <Card title="Panel inside a card" style={{ width: 420 }}>
      <Panel><Col gap={8}><b>Nested panel</b><span style={{ color: 'var(--dv-text-secondary)' }}>Used for grouped form controls, pill bars and table headers.</span></Col></Panel>
      <div style={{ height: 12 }} />
      <Row><AccentTile label="Brent-style" value="+1.42%" intent="positive" /><AccentTile label="Diesel" value="−0.86%" intent="negative" /></Row>
    </Card>
  ),
};
export const StackAndGrid: S = {
  render: () => (<Col width={560}><Stack orientation="horizontal" gap={8}><Button>One</Button><Button variant="subtle">Two</Button></Stack><Grid gap={12}>{[3, 3, 6].map((s, i) => <GridItem key={i} span={s}><Panel>span {s}</Panel></GridItem>)}</Grid></Col>),
};
export const Interactive: S = {
  render: () => (
    <Col width={640} gap={28}>
      <Section title="Toolbar (roving arrow keys)"><Toolbar aria-label="Chart tools"><IconButton label="Zoom in" icon="plus" /><IconButton label="Zoom out" icon="minus" /><IconButton label="Reset" icon="rotate-right" /></Toolbar></Section>
      <Section title="SplitPane (←/→, Home/End)"><div style={{ height: 120 }}><SplitPane aria-label="Resize panes"><Panel style={{ height: '100%' }}>Left</Panel><Panel style={{ height: '100%' }}>Right</Panel></SplitPane></div></Section>
      <Section title="ScrollArea"><ScrollArea aria-label="Log" maxHeight={80}>{Array.from({ length: 12 }, (_, i) => <div key={i}>Log line {i + 1}</div>)}</ScrollArea></Section>
    </Col>
  ),
};
export const Disclosures: S = {
  render: () => (<Col width={480}><Disclosure title="Methodology" summary="3 notes" defaultExpanded>Sample methodology text for fictional data.</Disclosure><Accordion items={[{ id: 'a', title: 'Fees', content: 'Sample fee schedule.' }, { id: 'b', title: 'Settlement', content: 'Sample settlement notes.' }]} /><CollapsibleSection title="Advanced options">Hidden until needed (progressive disclosure).</CollapsibleSection></Col>),
};

export const SpotlightHover: S = {
  args: { tabIndex: 0 },
  play: async ({ canvasElement }) => { const card = within(canvasElement).getByRole('region'); await userEvent.pointer({ target: card, coords: { clientX: 120, clientY: 40 } }); await userEvent.hover(card); },
};
export const SpotlightFocusWithin: S = { render: () => (<Card title="Focus within" style={{ width: 380 }}><Button variant="subtle">Tab to me</Button></Card>), play: async () => { await userEvent.tab(); } };
