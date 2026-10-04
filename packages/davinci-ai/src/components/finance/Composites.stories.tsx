import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrderTicket } from './OrderTicket';
import { MarketPulse } from './MarketPulse';
import { Watchlist } from './Watchlist';
import { NewsList } from './News';
import { FilterBar } from './FilterBar';
import { TickerTape } from './TickerTape';
import { ChartPanel } from './ChartPanel';
import { PriceChart } from './PriceChart';
import { TimeRangeSelector } from './TimeRangeSelector';
import { Card } from '../layout/Card';
import { series, seriesDown } from '../../stories/helpers';

const meta = { title: 'Components/Finance/Composites', component: OrderTicket, args: { symbol: 'NSC1' }, decorators: [(S) => <div style={{ width: 460 }}><S /></div>], parameters: { docs: { components: ["OrderTicket", "MarketPulse", "Watchlist", "WatchlistRow", "NewsList", "NewsItem", "FilterBar", "TickerTape", "ChartPanel", "TimeRangeSelector"], description: { component: 'Finance composites built from library primitives. All data in stories is **fictional**. `OrderTicket`: header `SwitchRow`, nested `Panel` (side toggle, order type, quantity, limit), notional/fee summary and an xl CTA whose intent and label follow the side.' } } } } satisfies Meta<typeof OrderTicket>;
export default meta;
type S = StoryObj<typeof meta>;

export const Ticket: S = {};
export const Pulse: S = {
  decorators: [(S) => <div style={{ width: 980 }}><S /></div>],
  render: () => (<MarketPulse markets={[{ name: 'Brent-style', change: 1.42 }, { name: 'WTI-style', change: 0.88 }, { name: 'Diesel', change: -0.86 }, { name: 'Jet', change: 0.31 }, { name: 'Gas TTF', change: -2.14 }, { name: 'Power DE', change: -0.42 }]} />),
};
export const WatchlistStory: S = {
  name: 'Watchlist',
  decorators: [(S) => <div style={{ width: 560 }}><S /></div>],
  render: () => (
    <Card padded={false} style={{ padding: 12 }}>
      <Watchlist aria-label="Core energy desk" selectionMode="single" defaultSelectedKeys={new Set(['nsc1'])} items={[
        { id: 'nsc1', symbol: 'NSC1', name: 'North Sea Crude M1', last: 84.62, change: 1.19, changePercent: 1.42, series },
        { id: 'wtx1', symbol: 'WTX1', name: 'Texas Light Sweet M1', last: 80.11, change: -0.69, changePercent: -0.86, series: seriesDown },
        { id: 'ttf1', symbol: 'TTF1', name: 'Continental Gas M1', last: 31.08, change: -0.68, changePercent: -2.14, series: seriesDown },
      ]} />
    </Card>
  ),
};
export const News: S = {
  decorators: [(S) => <div style={{ width: 640 }}><S /></div>],
  render: () => (<Card><NewsList aria-label="Latest" items={[{ id: '1', time: '09:42', headline: 'North Sea loading programme revised lower', source: 'Fictional Wire', tags: ['Crude'], unread: true, summary: 'Sample text only. Programme trimmed ~4% against schedule.' }, { id: '2', time: '09:15', headline: 'Diesel stocks draw for a third week', source: 'Fictional Wire', tags: ['Products'], summary: 'Sample text only.' }, { id: '3', time: '08:05', headline: 'Gas eases as injections beat expectations', source: 'Sample Desk' }]} /></Card>),
};
function FiltersDemo() {
  const [v, setV] = useState<string[]>(['crude']);
  return <FilterBar filters={[{ id: 'crude', label: 'Crude' }, { id: 'products', label: 'Products' }, { id: 'gas', label: 'Gas' }, { id: 'freight', label: 'Freight' }]} value={v} onChange={setV} savedViews={[{ id: 'a', label: 'Energy morning' }]} onSaveView={() => {}} />;
}
export const Filters: S = { decorators: [(S) => <div style={{ width: 720 }}><S /></div>], render: () => <FiltersDemo /> };
export const Ticker: S = {
  decorators: [(S) => <div style={{ width: 760 }}><S /></div>],
  render: () => (<TickerTape items={[{ id: 'a', symbol: 'NSC1', last: 84.62, changePercent: 1.42 }, { id: 'b', symbol: 'WTX1', last: 80.11, changePercent: -0.86 }, { id: 'c', symbol: 'TTF1', last: 31.08, changePercent: -2.14 }, { id: 'd', symbol: 'CPF', last: 18420, changePercent: 1.95 }]} />),
};
export const Panel: S = {
  decorators: [(S) => <div style={{ width: 720 }}><S /></div>],
  render: () => (<ChartPanel title="North Sea Crude M1" unit="· $/bbl" rangeSelector={<TimeRangeSelector size="sm" />}><PriceChart aria-label="Price" data={[...series, ...series]} xAxisLabels={['Sep 02', 'Sep 16', 'Sep 30']} height={220} /></ChartPanel>),
};
