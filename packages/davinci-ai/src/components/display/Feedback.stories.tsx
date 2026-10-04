import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';
import { Skeleton } from './Skeleton';
import { Spinner } from './Spinner';
import { ProgressBar, ProgressCircle, Meter } from './Progress';
import { EmptyState } from './EmptyState';
import { Callout } from './Callout';
import { Button } from '../actions/Button';
import { IconButton } from '../actions/IconButton';
import { Col, Row, Section } from '../../stories/helpers';

const meta = { title: 'Components/Display/Tooltip, Skeleton, Progress, EmptyState, Callout', component: Callout, args: { tone: 'info', title: 'Delayed data', children: 'Sample prices are 15 minutes delayed.' }, argTypes: { tone: { control: 'select', options: ['neutral', 'brand', 'positive', 'negative', 'warning', 'info'] } }, parameters: { docs: { components: ["Tooltip", "Skeleton", "Spinner", "ProgressBar", "ProgressCircle", "Meter", "EmptyState", "Callout"], description: { component: 'Feedback and placeholder components. Loading states never rely on motion alone; progress and meters expose numeric values.' } } } } satisfies Meta<typeof Callout>;
export default meta;
type S = StoryObj<typeof meta>;

export const CalloutTones: S = {
  render: () => (<Col width={480}>{(['neutral', 'info', 'positive', 'warning', 'negative', 'brand'] as const).map((t) => <Callout key={t} tone={t} title={`${t} callout`}>Supporting text that explains what to do next.</Callout>)}</Col>),
};
export const Tooltips: S = { render: () => (<Row style={{ minHeight: 120, paddingTop: 48 }}><Tooltip content="Refresh prices" delay={0}><IconButton label="Refresh" icon="rotate-right" /></Tooltip><Tooltip content="Create a price alert"><Button variant="subtle">New alert</Button></Tooltip></Row>) };
export const Loading: S = {
  render: () => (<Row gap={32} align="start"><Col width={220}><Skeleton height={20} width={140} /><Skeleton lines={3} /></Col><Skeleton circle height={44} /><Spinner label="Loading" size="lg" /></Row>),
};
export const Progress: S = {
  render: () => (<Col width={360}><ProgressBar label="Importing assessments" value={64} showValue /><ProgressBar label="Waiting…" isIndeterminate /><Row gap={24}><ProgressCircle aria-label="Sync" value={72} /><ProgressCircle aria-label="Sync done" value={100} tone="positive" /></Row></Col>),
};
export const Meters: S = {
  render: () => (<Col width={360}><Meter label="Limit usage" value={40} showValue warnAt={0.7} criticalAt={0.9} /><Meter label="Limit usage" value={78} showValue warnAt={0.7} criticalAt={0.9} /><Meter label="Limit usage" value={96} showValue warnAt={0.7} criticalAt={0.9} /></Col>),
};
export const Empty: S = { render: () => (<div style={{ width: 460 }}><EmptyState icon="bell" title="No alerts yet" description="Create an alert to be told when a price crosses a level." action={<Button iconStart="plus">New alert</Button>} /></div>) };
export const Section_: S = { name: 'Section helper', render: () => <Section title="Placeholder">—</Section> };
