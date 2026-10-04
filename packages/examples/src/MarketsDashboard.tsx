import { useState } from 'react';
import {
  AppHeader, AppShell, Button, Card, Composer, DonutChart, GridItem, Grid, IconButton, Menu, PageHeader, PriceChart, QuoteCard, SearchField, SegmentedControl, Stat,
  TimeRangeSelector, UserChip, useTheme, OrderTicket, MarketPulse, Table, TableToolbar, AssetCell, CodeChip, PriceChange, PriceFlash, DayRange, Sparkline, RowActions,
  formatNumber, type TableColumn,
} from '@davinci-ai/react';
import { assessments, exposure, heroAxis, heroLabels, heroSeries, kpis, pulse, type Assessment } from './data';

const columns: TableColumn<Assessment>[] = [
  { id: 'name', header: 'Assessment', isRowHeader: true, allowsSorting: true, cell: (r) => <AssetCell name={r.name} category={r.category} icon={r.icon} /> },
  { id: 'code', header: 'Code', cell: (r) => <CodeChip>{r.code}</CodeChip> },
  { id: 'last', header: 'Last', numeric: true, allowsSorting: true, cell: (r) => <PriceFlash value={r.last}>{formatNumber(r.last)}</PriceFlash> },
  { id: 'chg', header: 'Chg %', numeric: true, allowsSorting: true, cell: (r) => <PriceChange percent={r.change} hideIcon /> },
  { id: 'range', header: 'Day range', cell: (r) => <DayRange low={r.low} high={r.high} value={r.last} /> },
  { id: '30d', header: '30D', cell: (r) => <Sparkline data={r.series} tone="mono" height={30} animate={false} baseline={false} decorative style={{ width: 120 }} /> },
  { id: 'actions', header: <span className="dv:sr-only">Actions</span>, textValue: 'Actions', align: 'end', cell: (r) => (
    <RowActions name={r.name} items={[{ id: 'open', label: 'Open assessment', icon: 'chart-line' }, { id: 'alert', label: 'Create alert', icon: 'bell' }, { id: 'rm', label: 'Remove from watchlist', icon: 'trash', destructive: true }]} />
  ) },
];

/** Recreates the Graphite reference screen using only library components. Fictional sample data. */
export function MarketsDashboard({ rise = true }: { rise?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState('watchlist');
  const [nav, setNav] = useState('markets');
  const [ctx, setCtx] = useState([{ id: 'nsc1', label: 'NSC1' }]);
  return (
    <AppShell
      header={
        <AppHeader
          nav={[{ id: 'markets', label: 'Markets' }, { id: 'assessments', label: 'Assessments' }, { id: 'watchlists', label: 'Watchlists' }, { id: 'analytics', label: 'Analytics' }, { id: 'reports', label: 'Reports' }, { id: 'settings', label: 'Settings' }]}
          currentId={nav}
          onNavigate={setNav}
          actions={
            <>
              <IconButton label="Search" icon="magnifying-glass" size="lg" />
              <IconButton label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} icon={theme === 'dark' ? 'moon' : 'sun'} size="lg" onPress={toggleTheme} />
              <Menu aria-label="Account" placement="bottom end" items={[{ id: 'p', label: 'Profile', icon: 'user' }, { id: 's', label: 'Settings', icon: 'gear' }, { id: 'sep', type: 'separator' }, { id: 'o', label: 'Sign out' }]} trigger={<UserChip name="Ket Patel" subtitle="Product Design" />} />
            </>
          }
        />
      }
      dock={
        <Composer
          docked
          contexts={ctx}
          onRemoveContext={(id) => setCtx((c) => c.filter((x) => x.id !== id))}
          modes={[{ id: 'markets', label: 'Markets' }, { id: 'news', label: 'News' }]}
          suggestions={['Why did North Sea crude rise today?', 'Compare diesel cracks vs last month', 'Summarise freight news']}
          onSubmit={() => {}}
        />
      }
    >
      <PageHeader
        title="Markets"
        subtitle="Follow prices from assessment to decision · fictional sample data"
        actions={
          <>
            <Button variant="subtle" iconStart="filter">Filters</Button>
            <Button variant="subtle" iconStart="calendar" iconEnd="chevron-down">Sep 2 – Oct 2, 2026</Button>
            <Button iconStart="plus">New alert</Button>
            <IconButton label="Refresh" icon="rotate-right" />
          </>
        }
      />
      <Grid>
        <GridItem span={{ base: 12, md: 6, lg: 3 }} style={{ display: 'grid', gap: 16, gridTemplateRows: '1fr 1fr' }}>
          {kpis.map((k, i) => (
            <Stat key={k.title} rise={rise ? i * 0.5 + 0.5 : false} title={k.title} value={k.value} series={k.series} delta={{ value: k.delta, context: '1D' }} />
          ))}
        </GridItem>
        <GridItem span={{ base: 12, lg: 6 }}>
          <QuoteCard
            rise={rise ? 2.5 : false}
            title="North Sea Crude M1"
            unit="$/bbl"
            price={84.62}
            currency="USD"
            change={{ percent: 1.42, context: 'vs yesterday' }}
            rangeSelector={<TimeRangeSelector defaultValue="1M" />}
            stats={[{ label: 'Open', value: '83.44' }, { label: 'High', value: '85.10' }, { label: 'Low', value: '82.97' }, { label: 'Volume', value: '412k' }]}
            dayRange={{ low: 82.97, high: 85.1 }}
          >
            <PriceChart fill aria-label="North Sea Crude M1 30-day price, up 1.42 percent" data={heroSeries} labels={heroLabels} xAxisLabels={heroAxis} tooltipPrefix="$" />
          </QuoteCard>
        </GridItem>
        <GridItem span={{ base: 12, md: 6, lg: 3 }}>
          <Card rise={rise ? 3.5 : false} title="Watchlist exposure" style={{ height: '100%' }}>
            <DonutChart aria-label="Watchlist exposure by sector" segments={exposure} centerValue={24} centerLabel="Assessments" />
          </Card>
        </GridItem>
        <GridItem span={{ base: 12, lg: 4 }}>
          <OrderTicket symbol="NSC1" />
        </GridItem>
        <GridItem span={{ base: 12, lg: 8 }}>
          <Card rise={rise ? 5.5 : false} padded={false} title={undefined} aria-label="Watchlist table" style={{ overflow: 'hidden', height: '100%' }}>
            <Table
              aria-label="Watchlist"
              columns={columns}
              rows={assessments}
              density="comfortable"
              toolbar={
                <TableToolbar
                  end={
                    <>
                      <SearchField aria-label="Search assessments" placeholder="Search assessments" />
                      <IconButton label="Filter" icon="filter" />
                    </>
                  }
                >
                  <SegmentedControl aria-label="View" value={view} onChange={setView} options={[{ id: 'watchlist', label: 'Watchlist' }, { id: 'recent', label: 'Recently viewed' }, { id: 'alerts', label: 'Alerts' }]} />
                </TableToolbar>
              }
            />
          </Card>
        </GridItem>
        <GridItem span={12}>
          <MarketPulse markets={pulse} />
        </GridItem>
      </Grid>
    </AppShell>
  );
}
