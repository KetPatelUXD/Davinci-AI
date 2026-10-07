import { useState } from 'react';
import {
  AppHeader, AppShell, ArticleView, Breadcrumbs, Button, Card, Chip, IconButton, Link, Menu, NewsList, NumberText, PageHeader, PriceChange, PriceChart, SearchField, SideNav, Table, Tabs,
  TimeRangeSelector, useTheme, formatNumber, type TableColumn,
} from '@davinci-ai/react';
import { articleBody, chartAxis, chartLabels, chartSeries, commentary, deals, keyAssessments, reports, tiles, topNews, type KeyAssessment, type Commentary, type Deal, type Report } from './corePricesData';

const NAV = [
  { id: 'news', label: 'News & Insights' }, { id: 'reports', label: 'Market Reports' }, { id: 'near', label: 'Near-Term' }, { id: 'short', label: 'Short-Term' },
  { id: 'long', label: 'Long-Term' }, { id: 'forecast', label: 'Price Forecast' }, { id: 'supply', label: 'Supply Volumes' }, { id: 'prices', label: 'Prices' },
];
const RAIL = [
  { id: 'home', label: 'Home', icon: 'house' }, { id: 'global', label: 'Global view', icon: 'globe' }, { id: 'reports', label: 'Reports', icon: 'file' }, { id: 'tables', label: 'Tables', icon: 'table' },
  { id: 'charts', label: 'Charts', icon: 'chart-line' }, { id: 'news', label: 'News', icon: 'newspaper' }, { id: 'watch', label: 'Watchlists', icon: 'bookmark' }, { id: 'settings', label: 'Settings', icon: 'gear' },
];

const More = ({ label = 'More' }: { label?: string }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 4px 0' }}><Link href="#">{label} →</Link></div>
);
const bookmark = (name: string) => <IconButton label={`Save ${name}`} icon="bookmark" size="sm" variant="ghost" />;

const assessmentColumns: TableColumn<KeyAssessment>[] = [
  { id: 'description', header: 'Description', isRowHeader: true, allowsSorting: true, cell: (r) => r.description },
  { id: 'region', header: 'Geography', allowsSorting: true, cell: (r) => r.region },
  { id: 'price', header: 'Price', numeric: true, allowsSorting: true, cell: (r) => formatNumber(r.price) },
  { id: 'symbol', header: 'Symbol', allowsSorting: true, cell: (r) => r.symbol },
  { id: 'change', header: 'Change', numeric: true, cell: (r) => <PriceChange value={r.change} /> },
  { id: 'percent', header: 'Change %', numeric: true, cell: (r) => <PriceChange percent={r.percent} /> },
  { id: 'unit', header: 'Curr/UOM', cell: (r) => r.unit },
];
const dealColumns: TableColumn<Deal>[] = [
  { id: 'title', header: 'Title', isRowHeader: true, cell: (r) => r.title },
  { id: 'date', header: 'Date', numeric: true, cell: (r) => r.date },
];
const commentaryColumns: TableColumn<Commentary>[] = [
  { id: 'title', header: 'Title', isRowHeader: true, cell: (r) => r.title },
  { id: 'commodity', header: 'Commodity', cell: (r) => r.commodity },
  { id: 'date', header: 'Date', numeric: true, cell: (r) => r.date },
  { id: 'actions', header: <span className="dv:sr-only">Actions</span>, textValue: 'Actions', align: 'end', cell: (r) => bookmark(r.title) },
];
const reportColumns: TableColumn<Report>[] = [
  { id: 'title', header: 'Title', isRowHeader: true, cell: (r) => r.title },
  { id: 'commodity', header: 'Commodity', cell: (r) => r.commodity },
  { id: 'geography', header: 'Geography', cell: (r) => r.geography },
  { id: 'date', header: 'Date', numeric: true, cell: (r) => r.date },
  { id: 'actions', header: <span className="dv:sr-only">Actions</span>, textValue: 'Actions', align: 'end', cell: (r) => bookmark(r.title) },
];

/**
 * Rebuild of a Core "Global prices" page using only library components. Fictional sample data.
 * Layout wrappers below only arrange library parts (grid columns and gaps); no colours or radii are set here.
 */
export function CoreGlobalPrices() {
  const { theme, toggleTheme } = useTheme();
  const [nav, setNav] = useState('prices');
  const [rail, setRail] = useState('tables');
  const [group, setGroup] = useState<string | null>('Geography');
  const [range, setRange] = useState('1Y');
  const [articleId, setArticleId] = useState<string | null>(null);
  const article = articleId ? topNews.flat().find((n) => n.id === articleId) : undefined;
  return (
    <AppShell
      maxWidth={2000}
      header={
        <AppHeader
          brand="Core"
          nav={NAV}
          currentId={nav}
          onNavigate={setNav}
          actions={
            <>
              <SearchField aria-label="Search" placeholder="Search" />
              <IconButton label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} icon={theme === 'dark' ? 'moon' : 'sun'} size="lg" onPress={toggleTheme} />
              <Menu aria-label="Account" placement="bottom end" trigger={<IconButton label="Account" icon="user" size="lg" />} items={[{ id: 'p', label: 'Profile', icon: 'user' }, { id: 's', label: 'Settings', icon: 'gear' }, { id: 'sep', type: 'separator' }, { id: 'o', label: 'Sign out' }]} />
            </>
          }
        />
      }
      sidebar={<SideNav aria-label="Core sections" items={RAIL} currentId={rail} onNavigate={setRail} defaultCollapsed />}
    >
      {article ? (
        <ArticleView title={article.headline} onBack={() => setArticleId(null)} backLabel="Back to Global prices" source={article.source} time={article.time} tags={article.tags} standfirst={article.summary}>
          {articleBody(article.headline).map((p) => <p key={p}>{p}</p>)}
        </ArticleView>
      ) : (
        <>
      <Breadcrumbs items={[{ id: 'oil', label: 'Oil' }, { id: 'crude', label: 'Crude' }, { id: 'pma', label: 'Prices & Market Activity' }, { id: 'prices', label: 'Prices' }, { id: 'global', label: 'Global' }]} />
      <PageHeader
        title="Global"
        actions={
          <>
            <Button variant="subtle" iconStart="up-right-from-square">Open in workspace</Button>
            <IconButton label="Refresh" icon="rotate-right" />
            <IconButton label="Bookmark page" icon="bookmark" />
            <Menu aria-label="Page options" placement="bottom end" trigger={<IconButton label="Page options" icon="ellipsis-vertical" />} items={[{ id: 'exp', label: 'Export', icon: 'download' }, { id: 'share', label: 'Share', icon: 'link' }]} />
          </>
        }
      />

      <div style={{ display: 'grid', gap: 16 }}>
        {/* Price tiles */}
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {tiles.map((t) => (
            <Card key={t.id} title={t.name} unit={`${t.code} · ${t.asOf}`} actions={<IconButton label={`Options for ${t.name}`} icon="ellipsis-vertical" size="sm" variant="ghost" />}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <span><NumberText strong>{formatNumber(t.price)}</NumberText> <small>{t.unit}</small></span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <PriceChange value={t.change} size="sm" />
                  <PriceChange percent={t.percent} size="sm" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* News */}
        <Card title="News & Insights" padded>
          <Tabs
            aria-label="News"
            items={[
              {
                id: 'top',
                label: 'Top News',
                content: (
                  <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {topNews.map((col, i) => <NewsList key={i} aria-label={`Top news column ${i + 1}`} items={col} onOpen={setArticleId} />)}
                  </div>
                ),
              },
              { id: 'insights', label: 'Insights', content: <NewsList aria-label="Insights" items={topNews.flat().filter((n) => n.tags?.includes('Analysis'))} onOpen={setArticleId} /> },
            ]}
          />
          <More />
        </Card>

        {/* Assessments + chart */}
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 520px), 1fr))' }}>
          <Card title="Key crude price assessments" style={{ minWidth: 0 }}>
            <Table
              aria-label="Key crude price assessments"
              columns={assessmentColumns}
              rows={keyAssessments}
              density="compact"
              selectionMode="multiple"
              toolbar={
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {group ? <Chip icon="list" onRemove={() => setGroup(null)}>{group}</Chip> : <Button variant="subtle" size="sm" iconStart="list" onPress={() => setGroup('Geography')}>Group by geography</Button>}
                </div>
              }
            />
            <More />
          </Card>
          <Card
            style={{ minWidth: 0 }}
            title="Chart"
            unit="Basket Composite Daily · BKT001"
            actions={<TimeRangeSelector value={range} onChange={setRange} ranges={['1M', 'YTD', '1Y']} size="sm" />}
          >
            <PriceChart fill aria-label="Basket Composite Daily one-year price, up 0.51 percent" data={chartSeries} labels={chartLabels} xAxisLabels={chartAxis} tooltipPrefix="$" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}><Link href="#">View in advanced charting →</Link></div>
          </Card>
        </div>

        {/* Deals, commentary, reports */}
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 520px), 1fr))' }}>
          <Card title="Reported deals" style={{ minWidth: 0 }}>
            <Table aria-label="Reported deals" columns={dealColumns} rows={deals} density="compact" stickyHeader maxHeight={560} />
            <More />
          </Card>
          <div style={{ display: 'grid', gap: 16, alignContent: 'start', minWidth: 0, gridTemplateColumns: 'minmax(0, 1fr)' }}>
            <Card title="Market commentary">
              <Table aria-label="Market commentary" columns={commentaryColumns} rows={commentary} density="compact" selectionMode="multiple" />
              <More />
            </Card>
            <Card title="Market reports">
              <Table aria-label="Market reports" columns={reportColumns} rows={reports} density="compact" selectionMode="multiple" />
              <More />
            </Card>
          </div>
        </div>
      </div>
        </>
      )}
    </AppShell>
  );
}
