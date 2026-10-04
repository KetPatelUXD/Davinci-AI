import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { IconButton } from './IconButton';
import { Row } from '../../stories/helpers';

const meta = {
  title: 'Components/Actions/IconButton',
  component: IconButton,
  args: { label: 'Refresh', icon: 'rotate-right' },
  argTypes: { variant: { control: 'inline-radio', options: ['subtle', 'ghost', 'solid'] }, size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  parameters: { docs: { description: { component: 'Circular icon-only button. **`label` is required** (TypeScript) and becomes the accessible name – describe the action, not the glyph.' } } },
} satisfies Meta<typeof IconButton>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {};
export const Variants: S = {
  render: () => (<Row><IconButton label="Search" icon="magnifying-glass" /><IconButton label="Toggle theme" icon="moon" variant="ghost" /><IconButton label="Send message" icon="arrow-up" variant="solid" /><IconButton label="Disabled" icon="plus" isDisabled /></Row>),
};
export const Sizes: S = {
  render: () => (<Row><IconButton label="Small" icon="plus" size="sm" /><IconButton label="Medium" icon="plus" /><IconButton label="Large" icon="plus" size="lg" /></Row>),
};

export const Hover: S = { play: async ({ canvasElement }) => { await userEvent.hover(within(canvasElement).getByRole('button')); } };
export const FocusVisible: S = { play: async () => { await userEvent.tab(); } };
export const Pressed: S = { play: async ({ canvasElement }) => { await userEvent.pointer({ keys: '[MouseLeft>]', target: within(canvasElement).getByRole('button') }); } };
