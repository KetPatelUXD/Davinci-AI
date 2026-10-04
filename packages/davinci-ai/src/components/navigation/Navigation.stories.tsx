import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppHeader, UserChip } from './AppHeader';
import { PageHeader } from './PageHeader';
import { SideNav } from './SideNav';
import { Tabs } from './Tabs';
import { Breadcrumbs } from './Breadcrumbs';
import { Pagination } from './Pagination';
import { Stepper } from './Stepper';
import { IconButton } from '../actions/IconButton';
import { Button } from '../actions/Button';
import { Col, Section } from '../../stories/helpers';

const nav = [{ id: 'markets', label: 'Markets' }, { id: 'assessments', label: 'Assessments' }, { id: 'watchlists', label: 'Watchlists' }, { id: 'analytics', label: 'Analytics' }, { id: 'reports', label: 'Reports' }, { id: 'settings', label: 'Settings' }];

const meta = { title: 'Components/Navigation/AppHeader', component: AppHeader, parameters: { layout: 'padded', docs: { components: ["AppHeader", "UserChip", "PageHeader", "SideNav", "Tabs", "Breadcrumbs", "Pagination", "Stepper"], description: { component: 'Top bar: logo tile + wordmark, **centred pill navigation** (active tab = white `on` pill, `aria-current="page"`), circle actions and a user chip.' } } } } satisfies Meta<typeof AppHeader>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = { args: { nav, currentId: 'markets', actions: <><IconButton label="Search" icon="magnifying-glass" size="lg" /><IconButton label="Toggle theme" icon="moon" size="lg" /><UserChip name="Ket Patel" subtitle="Product Design" /></> } };
export const PageHeaderStory: S = { name: 'PageHeader', render: () => (<PageHeader title="Markets" subtitle="Follow prices from assessment to decision" actions={<><Button variant="subtle" iconStart="filter">Filters</Button><Button iconStart="plus">New alert</Button></>} />) };
export const SideNavigation: S = {
  render: () => (<div style={{ display: 'flex', gap: 24 }}><SideNav items={[{ id: 'home', label: 'Overview', icon: 'house' }, { id: 'markets', label: 'Markets', icon: 'chart-line', badge: '12' }, { id: 'news', label: 'News', icon: 'newspaper' }, { id: 'settings', label: 'Settings', icon: 'gear' }]} currentId="markets" /><SideNav defaultCollapsed items={[{ id: 'home', label: 'Overview', icon: 'house' }, { id: 'markets', label: 'Markets', icon: 'chart-line' }, { id: 'news', label: 'News', icon: 'newspaper' }]} currentId="markets" /></div>),
};
export const Wayfinding: S = {
  render: () => (
    <Col width={520} gap={28}>
      <Section title="Tabs"><Tabs aria-label="Sections" items={[{ id: 'a', label: 'Overview', content: 'Overview content' }, { id: 'b', label: 'Positions', icon: 'list', content: 'Positions content' }, { id: 'c', label: 'Disabled', isDisabled: true, content: 'x' }]} /></Section>
      <Section title="Breadcrumbs"><Breadcrumbs items={[{ id: 'home', label: 'Home', href: '#' }, { id: 'm', label: 'Markets', href: '#' }, { id: 'nsc1', label: 'North Sea Crude M1', href: '#' }]} /></Section>
      <Section title="Pagination"><Pagination page={4} pageCount={12} onPageChange={() => {}} /></Section>
      <Section title="Stepper"><Stepper current={1} steps={[{ id: 'a', label: 'Instrument' }, { id: 'b', label: 'Quantity' }, { id: 'c', label: 'Review' }]} /></Section>
    </Col>
  ),
};
