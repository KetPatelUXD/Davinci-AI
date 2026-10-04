import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from './Button';
import { Col, Row, Section } from '../../stories/helpers';

const meta = {
  title: 'Components/Actions/Button',
  component: Button,
  args: { children: 'New alert', iconStart: 'plus' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'subtle', 'ghost'] },
    intent: { control: 'select', options: ['primary', 'brand', 'positive', 'negative', 'destructive', 'neutral'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
    iconStart: { control: 'text' },
    iconEnd: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          '**Pill button.** One `solid primary` (white in dark / ink in light) per view; `subtle` for secondary tools like *Filters*; `ghost` for tertiary actions.\n\n' +
          '**Keyboard:** `Tab` to focus, `Enter`/`Space` to press. **ARIA:** native `button`; loading sets `aria-disabled` and keeps focus. Icon-only actions must use `IconButton`.',
      },
    },
  },
} satisfies Meta<typeof Button>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {};

export const Variants: S = {
  render: () => (
    <Col>
      <Section title="Solid"><Row><Button>Primary</Button><Button intent="brand">Brand</Button><Button intent="positive">Buy · Long</Button><Button intent="negative">Sell · Short</Button><Button intent="destructive">Delete</Button></Row></Section>
      <Section title="Subtle"><Row><Button variant="subtle" iconStart="filter">Filters</Button><Button variant="subtle" intent="positive">Buy</Button><Button variant="subtle" intent="negative">Sell</Button><Button variant="subtle" intent="brand">LEO</Button></Row></Section>
      <Section title="Ghost"><Row><Button variant="ghost">Cancel</Button><Button variant="ghost" iconEnd="chevron-down">More</Button><Button variant="ghost" intent="negative">Remove</Button></Row></Section>
    </Col>
  ),
};

export const Sizes: S = {
  render: () => (
    <Row align="end">
      <Button size="sm">Small 30</Button><Button size="md">Medium 38</Button><Button size="lg">Large 44</Button><Button size="xl" intent="positive">Place buy order</Button>
    </Row>
  ),
};

export const States: S = {
  render: () => (
    <Row>
      <Button>Default</Button><Button isLoading>Loading</Button><Button isDisabled>Disabled</Button>
      <Button variant="subtle" isDisabled>Disabled</Button><Button variant="ghost" isDisabled>Disabled</Button>
    </Row>
  ),
};

export const Hover: S = {
  play: async ({ canvasElement }) => { await userEvent.hover(within(canvasElement).getByRole('button')); },
};

export const FocusVisible: S = {
  play: async ({ canvasElement }) => { await userEvent.tab(); await expect(within(canvasElement).getByRole('button')).toHaveFocus(); },
};

export const DensityCompact: S = {
  globals: { density: 'compact' },
  render: () => (<Row align="end"><Button size="sm">Small 24</Button><Button>Medium 32</Button><Button size="lg">Large 40</Button></Row>),
};

export const Pressed: S = {
  play: async ({ canvasElement }) => { await userEvent.pointer({ keys: '[MouseLeft>]', target: within(canvasElement).getByRole('button') }); },
};
