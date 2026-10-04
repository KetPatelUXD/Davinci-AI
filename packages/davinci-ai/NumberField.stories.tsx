import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberField, PriceField } from './NumberField';
import { Row } from '../../stories/helpers';

const meta = {
  title: 'Components/Inputs/NumberField',
  component: NumberField,
  args: { label: 'Quantity', defaultValue: 25000, step: 1000, suffix: 'bbl', formatOptions: { maximumFractionDigits: 0 } },
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
  parameters: { docs: { description: { component: 'Locale-formatted number input (en-US by default). **Keyboard:** ↑/↓ step, PageUp/PageDown large step, Home/End min/max, wheel while focused. `PriceField` adds fixed precision and tick-size stepping/snapping.' } } },
} satisfies Meta<typeof NumberField>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {};
export const WithSteppers: S = { args: { hideSteppers: false } };
export const HiddenSteppers: S = { args: { hideSteppers: true } };
export const MinMax: S = { args: { minValue: 0, maxValue: 100000, description: '0 – 100,000' } };
export const Invalid: S = { args: { isInvalid: true, errorMessage: 'Quantity must be a multiple of 1,000' } };
export const Price: S = {
  render: () => (<Row><PriceField label="Limit price" defaultValue={84.6} precision={2} tickSize={0.05} currency="USD" /><PriceField label="Freight rate" defaultValue={18420} precision={0} tickSize={5} currency="USD/day" /></Row>),
};
