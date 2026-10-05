import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sparkline } from '../components/finance/Sparkline';
import { PriceChange, PriceFlash } from '../components/finance/PriceChange';
import { DayRange } from '../components/finance/DayRange';
import { Stat } from '../components/finance/Stat';
import { QuoteCard } from '../components/finance/QuoteCard';
import { PriceChart } from '../components/finance/PriceChart';
import { DonutChart, ChartLegend } from '../components/finance/DonutChart';
import { TimeRangeSelector } from '../components/finance/TimeRangeSelector';
import { MarketPulse } from '../components/finance/MarketPulse';
import { FilterBar } from '../components/finance/FilterBar';
import { ChartPanel } from '../components/finance/ChartPanel';
import { Watchlist } from '../components/finance/Watchlist';
import { NewsList } from '../components/finance/News';
import { OrderTicket } from '../components/finance/OrderTicket';
import { TickerTape } from '../components/finance/TickerTape';
import { series, seriesDown } from './helpers';

/** Internal hosts for `scripts/figma-extract.mjs` (Finance). Not documentation. */
const meta = { title: 'Internal/Extract Finance', parameters: { layout: 'centered', docs: { disable: true } }, tags: ['!autodocs'] } satisfies Meta;
export default meta;
type S = StoryObj<typeof meta>;
const Col = ({ children, w = 420 }: { children: React.ReactNode; w?: number }) => <div style={{ display: 'grid', gap: 20, width: w, padding: 8, justifyItems: 'stretch' }}>{children}</div>;
const W = ({ id, children }: { id: string; children: React.ReactNode }) => <div id={id}>{children}</div>;
const long = Array.from({ length: 60 }, (_, i) => 80 + Math.sin(i / 6) * 2 + i * 0.05 + Math.cos(i / 2.3) * 0.6);
const WL = [
  { id: 'nsc1', symbol: 'NSC1', name: 'North Sea Crude M1', last: 84.62, change: 1.19, changePercent: 1.42, series },
  { id: 'wtx1', symbol: 'WTX1', name: 'Texas Light Sweet M1', last: 80.11, change: -0.69, changePercent: -0.86, series: seriesDown },
  { id: 'ttf1', symbol: 'TTF1', name: 'Continental Gas M1', last: 31.08, change: -0.68, changePercent: -2.14, series: seriesDown },
];

export const SparklineFull: S = { render: () => (<Col>
  <W id="mono"><div style={{ height: 70 }}><Sparkline data={series} animate={false} band markers /></div></W>
  <W id="up"><div style={{ height: 40 }}><Sparkline data={series} intent="trend" animate={false} /></div></W>
  <W id="down"><div style={{ height: 40 }}><Sparkline data={seriesDown} intent="trend" animate={false} /></div></W>
</Col>) };
export const PriceChangeFull: S = { render: () => (<Col w={260}>
  <W id="up"><PriceChange value={1.2} percent={1.42} /></W>
  <W id="down"><PriceChange value={-0.69} percent={-0.86} /></W>
  <W id="flat"><PriceChange percent={0} /></W>
</Col>) };
export const PriceFlashFull: S = { render: () => <Col w={200}><PriceFlash value={84.62}>84.62</PriceFlash></Col> };
export const DayRangeFull: S = { render: () => (<Col w={260}>
  <W id="marker"><DayRange low={82.97} high={85.1} value={84.62} /></W>
  <W id="bar"><DayRange variant="bar" low={82.97} high={85.1} value={84.62} /></W>
</Col>) };
export const StatFull: S = { render: () => (<Col w={352}>
  <W id="sm"><Stat size="sm" title="Brent-style M1" value={84.62} series={series} delta={{ value: 1.42, context: '1D' }} countUp={false} /></W>
  <W id="md"><Stat title="Brent-style M1" value={84.62} series={series} delta={{ value: 1.42, context: '1D' }} countUp={false} /></W>
  <W id="lg"><Stat size="lg" title="Brent-style M1" value={84.62} series={series} delta={{ value: 1.42, context: '1D' }} countUp={false} /></W>
</Col>) };
export const QuoteCardFull: S = { render: () => (<Col w={720}><QuoteCard title="North Sea Crude M1" unit="$/bbl" price={84.62} currency="USD" change={{ percent: 1.42, context: 'vs yesterday' }} rangeSelector={<TimeRangeSelector />} stats={[{ label: 'Open', value: '83.44' }, { label: 'High', value: '85.10' }, { label: 'Low', value: '82.97' }, { label: 'Volume', value: '412k' }]} dayRange={{ low: 82.97, high: 85.1 }}><PriceChart aria-label="Price" data={long} xAxisLabels={['Sep 02', 'Sep 16', 'Sep 30']} height={200} animate={false} /></QuoteCard></Col>) };
export const PriceChartFull: S = { render: () => <Col w={700}><PriceChart aria-label="North Sea Crude M1, 30-day price" data={long} xAxisLabels={['Sep 02', 'Sep 09', 'Sep 16', 'Sep 23', 'Sep 30']} tooltipPrefix="$" height={250} animate={false} /></Col> };
export const DonutChartFull: S = { render: () => <Col w={300}><DonutChart aria-label="Exposure by sector" centerValue={24} centerLabel="Assessments" animate={false} segments={[{ id: 'oil', label: 'Oil & products', value: 11 }, { id: 'gas', label: 'Gas & power', value: 8 }, { id: 'fm', label: 'Freight & metals', value: 5 }]} /></Col> };
export const ChartLegendFull: S = { render: () => <Col w={260}><ChartLegend items={[{ id: 'oil', label: 'Oil & products', value: 11, percent: 46 } as never, { id: 'gas', label: 'Gas & power', value: 8, percent: 33 } as never, { id: 'fm', label: 'Freight & metals', value: 5, percent: 21 } as never]} /></Col> };
export const TimeRangeSelectorFull: S = { render: () => <Col w={360}><div id="default"><TimeRangeSelector /></div></Col> };
export const MarketPulseFull: S = { render: () => <Col w={980}><MarketPulse markets={[{ name: 'Brent-style', change: 1.42 }, { name: 'WTI-style', change: 0.88 }, { name: 'Diesel', change: -0.86 }, { name: 'Jet', change: 0.31 }, { name: 'Gas TTF', change: -2.14 }, { name: 'Power DE', change: -0.42 }]} /></Col> };
export const FilterBarFull: S = { render: () => <Col w={720}><FilterBar defaultValue={['crude']} filters={[{ id: 'crude', label: 'Crude' }, { id: 'products', label: 'Products' }, { id: 'gas', label: 'Gas' }, { id: 'freight', label: 'Freight' }]} savedViews={[{ id: 'a', label: 'Energy morning' }]} onSaveView={() => {}} /></Col> };
export const ChartPanelFull: S = { render: () => <Col w={720}><ChartPanel title="North Sea Crude M1" unit="· $/bbl" rangeSelector={<TimeRangeSelector size="sm" />}><PriceChart aria-label="Price" data={long} xAxisLabels={['Sep 02', 'Sep 16', 'Sep 30']} height={200} animate={false} /></ChartPanel></Col> };
export const WatchlistFull: S = { render: () => <Col w={560}><Watchlist aria-label="Core energy desk" selectionMode="single" defaultSelectedKeys={new Set(['nsc1'])} items={WL} /></Col> };
export const WatchlistRowFull: S = { render: () => <Col w={560}><Watchlist aria-label="Row" selectionMode="single" items={[WL[0]!]} /></Col> };
const NEWS = [{ id: '1', time: '09:42', headline: 'North Sea loading programme revised lower', source: 'Fictional Wire', tags: ['Crude'], unread: true, summary: 'Sample text only. Programme trimmed ~4% against schedule.' }, { id: '2', time: '09:15', headline: 'Diesel stocks draw for a third week', source: 'Fictional Wire', tags: ['Products'], summary: 'Sample text only.' }];
export const NewsListFull: S = { render: () => <Col w={640}><NewsList aria-label="Latest" items={NEWS} /></Col> };
export const NewsItemFull: S = { render: () => <Col w={640}><NewsList aria-label="One" items={[NEWS[0]!]} /></Col> };
export const OrderTicketFull: S = { render: () => (<Col w={460}>
  <W id="buy"><OrderTicket symbol="NSC1" /></W>
  <W id="sell"><OrderTicket symbol="NSC1" defaultSide="sell" /></W>
</Col>) };
export const TickerTapeFull: S = { render: () => <Col w={760}><TickerTape items={[{ id: 'a', symbol: 'NSC1', last: 84.62, changePercent: 1.42 }, { id: 'b', symbol: 'WTX1', last: 80.11, changePercent: -0.86 }, { id: 'c', symbol: 'TTF1', last: 31.08, changePercent: -2.14 }, { id: 'd', symbol: 'CPF', last: 18420, changePercent: 1.95 }]} /></Col> };
