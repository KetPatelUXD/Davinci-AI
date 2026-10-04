import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';
import { Chip, Tag } from './Chip';
import { DeltaPill } from './DeltaPill';
import { CodeChip } from './CodeChip';
import { Avatar, AvatarGroup } from './Avatar';
import { Kbd } from './Kbd';
import { Divider } from './Divider';
import { Col, Row, Section } from '../../stories/helpers';

const meta = { title: 'Components/Display/Badge, Chip, DeltaPill, CodeChip, Avatar', component: Badge, args: { children: 'Live', tone: 'positive', dot: true }, argTypes: { tone: { control: 'select', options: ['neutral', 'brand', 'positive', 'negative', 'warning', 'info'] }, variant: { control: 'inline-radio', options: ['subtle', 'solid', 'outline'] } }, parameters: { docs: { components: ["Badge", "Chip", "DeltaPill", "CodeChip", "Avatar", "AvatarGroup", "Kbd", "Divider"], description: { component: 'Small display primitives. Colour is **always paired with text, a sign or an icon**.' } } } } satisfies Meta<typeof Badge>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {};
export const Tones: S = {
  render: () => (
    <Col>
      {(['subtle', 'solid', 'outline'] as const).map((v) => (
        <Section key={v} title={v}><Row>{(['neutral', 'brand', 'positive', 'negative', 'warning', 'info'] as const).map((t) => <Badge key={t} tone={t} variant={v} dot>{t}</Badge>)}</Row></Section>
      ))}
    </Col>
  ),
};
export const Chips: S = { render: () => (<Row><Chip onRemove={() => {}}>Crude</Chip><Chip icon="droplet" onRemove={() => {}}>Products</Chip><Tag>Gas</Tag></Row>) };
export const Deltas: S = {
  render: () => (
    <Col>
      <Row><DeltaPill value={1.42} context="vs yesterday" /><DeltaPill value={-0.86} context="1D" /><DeltaPill value={0} context="flat" /></Row>
      <Row><DeltaPill arrow="up">12 markets · <b style={{ color: 'var(--dv-text)' }}>7 up</b></DeltaPill></Row>
    </Col>
  ),
};
export const Codes: S = { render: () => (<Row><CodeChip>NSC1</CodeChip><span>Highlighted <CodeChip>ULS</CodeChip> inside text</span><Kbd>⌘K</Kbd><Kbd>Ctrl</Kbd></Row>) };
export const Avatars: S = { render: () => (<Row gap={24}><Avatar name="Ket Patel" size="sm" /><Avatar name="Ket Patel" /><Avatar name="Ket Patel" size="lg" /><AvatarGroup people={[{ name: 'Ada L' }, { name: 'Bo C' }, { name: 'Cy D' }, { name: 'Di E' }, { name: 'Ev F' }]} max={4} /></Row>) };
export const Dividers: S = { render: () => (<div style={{ width: 300 }}><div>Above</div><Divider style={{ margin: '12px 0' }} /><div>Below</div></div>) };
