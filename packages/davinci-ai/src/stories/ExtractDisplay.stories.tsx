import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../components/display/Badge';
import { Chip } from '../components/display/Chip';
import { DeltaPill } from '../components/display/DeltaPill';
import { CodeChip } from '../components/display/CodeChip';
import { Avatar, AvatarGroup } from '../components/display/Avatar';
import { Kbd } from '../components/display/Kbd';
import { Divider } from '../components/display/Divider';
import { Tooltip } from '../components/display/Tooltip';
import { Skeleton } from '../components/display/Skeleton';
import { Spinner } from '../components/display/Spinner';
import { ProgressBar, ProgressCircle, Meter } from '../components/display/Progress';
import { EmptyState } from '../components/display/EmptyState';
import { Callout } from '../components/display/Callout';
import { Button } from '../components/actions/Button';

/** Internal hosts for `scripts/figma-extract.mjs` (Display). Not documentation. */
const meta = { title: 'Internal/Extract Display', parameters: { layout: 'centered', docs: { disable: true } }, tags: ['!autodocs'] } satisfies Meta;
export default meta;
type S = StoryObj<typeof meta>;
const Col = ({ children, w = 340 }: { children: React.ReactNode; w?: number }) => <div style={{ display: 'grid', gap: 20, width: w, padding: 8, justifyItems: 'start' }}>{children}</div>;
const W = ({ id, children }: { id: string; children: React.ReactNode }) => <div id={id} style={{ width: '100%' }}>{children}</div>;
const PEOPLE = [{ name: 'Ada Lovelace' }, { name: 'Bo Chen' }, { name: 'Cy Diaz' }, { name: 'Di Evans' }, { name: 'Ev Fox' }];

export const BadgeFull: S = { render: () => <Col><Badge dot icon="bolt">Live</Badge></Col> };
export const ChipFull: S = { render: () => <Col><Chip icon="droplet" onRemove={() => {}}>Crude</Chip></Col> };
export const DeltaPillFull: S = { render: () => (<Col>
  <W id="up"><DeltaPill value={1.42} context="vs yesterday" /></W>
  <W id="down"><DeltaPill value={-0.86} context="vs yesterday" /></W>
  <W id="flat"><DeltaPill value={0} context="vs yesterday" /></W>
</Col>) };
export const CodeChipFull: S = { render: () => <Col><CodeChip>NSC1</CodeChip></Col> };
export const AvatarFull: S = { render: () => <Col><Avatar name="Ada Lovelace" /></Col> };
export const AvatarGroupFull: S = { render: () => <Col><AvatarGroup people={PEOPLE} max={4} /></Col> };
export const KbdFull: S = { render: () => <Col><Kbd>⌘K</Kbd></Col> };
export const DividerFull: S = { render: () => <Col><div id="h" style={{ width: 200, height: 48, display: 'flex', alignItems: 'center' }}><Divider /></div></Col> };
export const TooltipFull: S = { render: () => <Col><Tooltip content="Refresh prices" isOpen><Button variant="subtle">Refresh</Button></Tooltip></Col> };
export const SkeletonFull: S = { render: () => <Col><Skeleton width={200} height={14} /></Col> };
export const SpinnerFull: S = { render: () => <Col><Spinner label="Loading" /></Col> };
export const ProgressBarFull: S = { render: () => (<Col>
  <W id="default"><ProgressBar label="Importing assessments" value={64} showValue /></W>
  <W id="indeterminate"><ProgressBar label="Importing assessments" isIndeterminate /></W>
</Col>) };
export const ProgressCircleFull: S = { render: () => (<Col>
  <W id="default"><ProgressCircle aria-label="Sync" value={72} /></W>
  <W id="indeterminate"><ProgressCircle aria-label="Sync" isIndeterminate /></W>
</Col>) };
export const MeterFull: S = { render: () => (<Col>
  <W id="default"><Meter label="Limit usage" value={40} showValue warnAt={0.7} criticalAt={0.9} /></W>
  <W id="warning"><Meter label="Limit usage" value={78} showValue warnAt={0.7} criticalAt={0.9} /></W>
  <W id="critical"><Meter label="Limit usage" value={96} showValue warnAt={0.7} criticalAt={0.9} /></W>
</Col>) };
export const EmptyStateFull: S = { render: () => <Col w={460}><EmptyState icon="bell" title="No alerts yet" description="Create an alert to be told when a price crosses a level." action={<Button iconStart="plus">New alert</Button>} /></Col> };
export const CalloutFull: S = { render: () => (<Col w={460}>{(['neutral', 'brand', 'positive', 'negative', 'warning', 'info'] as const).map((i) => <W key={i} id={i}><Callout intent={i} title="Delayed data" action={<Button variant="subtle" size="sm">Learn more</Button>}>Sample prices are 15 minutes delayed.</Callout></W>)}</Col>) };
