import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';
import { Sparkline } from './Sparkline';
import { PriceChart } from './PriceChart';
import { DonutChart } from './DonutChart';
import { PriceChange, PriceFlash } from './PriceChange';
import { DayRange } from './DayRange';
import { Stat } from './Stat';
import { QuoteCard } from './QuoteCard';
import { TimeRangeSelector } from './TimeRangeSelector';
import { Card } from '../layout/Card';
import { Col, Row, Section, series, seriesDown } from '../../stories/helpers';

const long = Array.from({ length: 90 }, (_, i) => 80 + Math.sin(i / 6) * 2 + i * 0.05 + Math.cos(i / 2.3) * 0.6);
const labels = long.map((_, i) => `Sep ${((i / 3) | 0) + 2}`);

const meta = {
  title: 'Components/Finance/Charts',
  component: PriceChart,
  args: { 'aria-label': 'North Sea Crude M1, 30-day price', data: long, labels, xAxisLabels: ['Sep 02', 'Sep 09', 'Sep 16', 'Sep 23', 'Sep 30'], tooltipPrefix: '$', height: 280 },
  decorators: [(S) => <div style={{ width: 760 }}><S /></div>],
  parameters: { docs: { components: ["PriceChart", "Sparkline", "DonutChart", "ChartLegend", "PriceChange", "PriceFlash", "DayRange", "Stat", "QuoteCard"], description: { component: '**No chart library.** Small custom SVG components. Lines are monochrome (`chart-line`) with soft glow, dashed grid, dot-grid canvas and a static highlight band with ring markers. **Markers and labels are HTML** so circles stay round under the stretched SVG. Keyboard: focus the chart, then ←/→/Home/End move the crosshair; values are announced politely. Every chart exposes a text summary; the donut also has a table fallback.' } } },
} satisfies Meta<typeof PriceChart>;
export default meta;
type S = StoryObj<typeof meta>;

export const Hero: S = {};
export const HoverCrosshair: S = { play: async ({ canvasElement }) => { const el = canvasElement.querySelector('.dv-price-chart') as HTMLElement; await userEvent.hover(el, { clientX: 400, clientY: 120 } as never); await userEvent.tab(); await userEvent.keyboard('{ArrowLeft}{ArrowLeft}'); } };
export const NoHighlight: S = { args: { highlight: false } };
export const Sparklines: S = {
  decorators: [(S) => <div style={{ width: 520 }}><S /></div>],
  render: () => (
    <Col>
      <Section title="Mono (default) with band + markers"><Sparkline data={series} band height={70} /></Section>
      <Section title="Trend colouring"><Row gap={32}><div style={{ width: 200 }}><Sparkline data={series} intent="trend" height={40} /></div><div style={{ width: 200 }}><Sparkline data={seriesDown} intent="trend" height={40} /></div></Row></Section>
      <Section title="Plain, no baseline"><Sparkline data={series} baseline={false} height={30} style={{ width: 120 }} /></Section>
    </Col>
  ),
};
export const Donut: S = {
  decorators: [(S) => <div style={{ width: 300 }}><S /></div>],
  render: () => (<DonutChart aria-label="Watchlist exposure by sector" centerValue={24} centerLabel="Assessments" segments={[{ id: 'oil', label: 'Oil & products', value: 11 }, { id: 'gas', label: 'Gas & power', value: 8 }, { id: 'fm', label: 'Freight & metals', value: 5, color: 'var(--dv-text-muted)' }]} />),
};
export const Indicators: S = {
  render: () => (
    <Col>
      <Row gap={24}><PriceChange value={1.2} percent={1.42} /><PriceChange percent={-0.86} /><PriceChange percent={0} /><PriceChange percent={2.4} size="lg" /></Row>
      <Row gap={24}><PriceFlash value={84.62}>84.62</PriceFlash><DayRange low={82.97} high={85.1} value={84.62} /><div style={{ width: 240 }}><DayRange variant="bar" low={82.97} high={85.1} value={84.62} /></div></Row>
    </Col>
  ),
};
export const StatCards: S = {
  decorators: [(S) => <div style={{ width: 760 }}><S /></div>],
  render: () => (<Row align="stretch" gap={16}><div style={{ width: 352 }}><Stat title="Brent-style M1" value={84.62} series={series} delta={{ value: 1.42, context: '1D' }} /></div><div style={{ width: 352 }}><Stat title="Gulf Coast Diesel" value={261.35} series={seriesDown} delta={{ value: -0.86, context: '1D' }} /></div></Row>),
};
export const Quote: S = {
  decorators: [(S) => <div style={{ width: 720 }}><S /></div>],
  render: (a) => (
    <QuoteCard title="North Sea Crude M1" unit="$/bbl" price={84.62} currency="USD" change={{ percent: 1.42, context: 'vs yesterday' }} rangeSelector={<TimeRangeSelector />} stats={[{ label: 'Open', value: '83.44' }, { label: 'High', value: '85.10' }, { label: 'Low', value: '82.97' }, { label: 'Volume', value: '412k' }]} dayRange={{ low: 82.97, high: 85.1 }}>
      <PriceChart {...a} />
    </QuoteCard>
  ),
};
export const Shell: S = { render: () => <Card title="In a card" style={{ width: 640 }}><PriceChart aria-label="Demo" data={long} xAxisLabels={['A', 'B', 'C']} height={200} /></Card> };
