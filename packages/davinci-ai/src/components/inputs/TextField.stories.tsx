import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';
import { TextField, TextArea, PasswordField, SearchField } from './TextField';
import { Col, Section } from '../../stories/helpers';

const meta = {
  title: 'Components/Inputs/TextField',
  component: TextField,
  args: { label: 'Display name', placeholder: 'e.g. Ket Patel' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
  parameters: { docs: { components: ["TextField", "TextArea", "PasswordField", "SearchField"], description: { component: 'Single-line input: 14px radius, `field` fill and a **1px `border-strong` edge** (WCAG 1.4.11). Label is required; description and error are announced via `aria-describedby`. Errors always include an icon and text, never colour alone.' } } },
} satisfies Meta<typeof TextField>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {};
export const WithHintAndAffix: S = { args: { description: 'Shown to teammates', suffix: 'USD', iconStart: 'user' } };
export const Required: S = { args: { isRequired: true } };
export const Optional: S = { args: { isOptional: true } };
export const Invalid: S = { args: { isInvalid: true, errorMessage: 'Enter a valid name', defaultValue: '??' } };
export const Disabled: S = { args: { isDisabled: true, defaultValue: 'Locked' } };
export const ReadOnly: S = { args: { isReadOnly: true, defaultValue: 'Read only' } };
export const Focused: S = { play: async () => { await userEvent.tab(); } };
export const Sizes: S = { render: (a) => (<Col><TextField {...a} size="sm" label="Small" /><TextField {...a} label="Medium" /><TextField {...a} size="lg" label="Large" /></Col>) };
export const Variants: S = {
  render: () => (
    <Col>
      <Section title="TextArea"><TextArea label="Notes" description="Plain text only" /></Section>
      <Section title="PasswordField"><PasswordField label="Password" /></Section>
      <Section title="SearchField"><SearchField aria-label="Search assessments" placeholder="Search assessments" defaultValue="crude" /></Section>
    </Col>
  ),
};
