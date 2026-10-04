import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { SegmentedControl } from './SegmentedControl';
import { SideToggle } from './SideToggle';
import { PillTabs } from './PillTabs';
import { Col, Section } from '../../stories/helpers';

const opts = ['1D', '1W', '1M', 'YTD', '1Y'].map((i) => ({ id: i, label: i }));

const meta = {
  title: 'Components/Actions/SegmentedControl',
  component: SegmentedControl,
  args: { 'aria-label': 'Time range', options: opts, defaultValue: '1M' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  parameters: { docs: { components: ["SegmentedControl", "SideToggle", "PillTabs"], description: { component: 'Pill track with a **sliding white (`on`) thumb**. Radio-group semantics: one tab stop, arrow keys move *and* select. Use for time ranges, view switches and the order side. `PillTabs` is the same look with tab panels; `SideToggle` adds Buy/Sell dots.' } } },
} satisfies Meta<typeof SegmentedControl>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {};
export const Sizes: S = { render: (a) => (<Col><SegmentedControl {...a} size="sm" /><SegmentedControl {...a} /><SegmentedControl {...a} size="lg" /></Col>) };
export const WithIcons: S = {
  render: () => (<SegmentedControl aria-label="Layout" defaultValue="grid" options={[{ id: 'grid', label: 'Grid', icon: 'grid-2' }, { id: 'list', label: 'List', icon: 'list' }, { id: 'table', label: 'Table', icon: 'table' }]} />),
};
export const FullWidth: S = { render: (a) => (<div style={{ width: 420 }}><SegmentedControl {...a} fullWidth /></div>) };
export const Disabled: S = { args: { isDisabled: true } };
export const KeyboardArrowRight: S = {
  play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.tab(); await userEvent.keyboard('{ArrowRight}'); void c; },
};
export const SideAndTabs: S = {
  render: () => (
    <Col width={440} gap={24}>
      <Section title="SideToggle"><SideToggle /></Section>
      <Section title="PillTabs"><PillTabs aria-label="Views" items={[{ id: 'a', label: 'Overview', content: 'Overview panel' }, { id: 'b', label: 'Positions', content: 'Positions panel' }, { id: 'c', label: 'Activity', content: 'Activity panel' }]} /></Section>
    </Col>
  ),
};

export const HoverOption: S = { play: async ({ canvasElement }) => { await userEvent.hover(within(canvasElement).getByRole('radio', { name: '1W' })); } };
export const FocusVisible: S = { play: async () => { await userEvent.tab(); } };
