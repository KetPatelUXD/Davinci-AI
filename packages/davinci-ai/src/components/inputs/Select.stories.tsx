import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { Select, ComboBox, MultiSelect } from './Select';
import { Col, Section } from '../../stories/helpers';

const items = [{ id: 'limit', label: 'Limit', description: 'Fill at your price or better' }, { id: 'market', label: 'Market', description: 'Fill at the best available price' }, { id: 'stop', label: 'Stop' }, { id: 'ioc', label: 'Immediate or cancel', isDisabled: true }];

const meta = {
  title: 'Components/Inputs/Select',
  component: Select,
  args: { label: 'Order type', items, defaultSelectedKey: 'limit' },
  decorators: [(Story) => <div style={{ width: 320, minHeight: 300 }}><Story /></div>],
  parameters: { docs: { components: ["Select", "ComboBox", "MultiSelect"], description: { component: 'Pick one option (collapsed by default). **Keyboard:** Enter/Space/↓ opens, arrows move, type-ahead, Esc closes and returns focus. The popup is a glass surface that inherits the theme.' } } },
} satisfies Meta<typeof Select>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {};
export const Open: S = { play: async ({ canvasElement }) => { await userEvent.click(within(canvasElement).getByRole('button')); } };
export const Invalid: S = { args: { isInvalid: true, errorMessage: 'Choose an order type', defaultSelectedKey: undefined } };
export const Disabled: S = { args: { isDisabled: true } };
export const ComboAndMulti: S = {
  render: () => (
    <Col>
      <Section title="ComboBox"><ComboBox label="Instrument" items={[{ id: 'nsc1', label: 'North Sea Crude M1' }, { id: 'wtx1', label: 'Texas Light Sweet M1' }, { id: 'ttf1', label: 'Continental Gas M1' }]} /></Section>
      <Section title="MultiSelect"><MultiSelect label="Markets" items={[{ id: 'oil', label: 'Oil & products' }, { id: 'gas', label: 'Gas & power' }, { id: 'fm', label: 'Freight & metals' }]} value={['oil', 'gas']} /></Section>
    </Col>
  ),
};
