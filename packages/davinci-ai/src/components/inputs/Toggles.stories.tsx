import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';
import { Checkbox, CheckboxGroup } from './Checkbox';
import { RadioGroup } from './RadioGroup';
import { Switch, SwitchRow } from './Switch';
import { Col, Row, Section } from '../../stories/helpers';

const meta = { title: 'Components/Inputs/Checkbox, Radio, Switch', component: Checkbox, args: { children: 'Remember my filters' }, parameters: { docs: { components: ["Checkbox", "CheckboxGroup", "RadioGroup", "Switch", "SwitchRow"], description: { component: 'Boolean and choice controls. Boxes use a 1px `border-strong` edge; the checked state is the white/ink `on` fill. `SwitchRow` is the pill row from the order ticket (title, hint, switch).' } } } } satisfies Meta<typeof Checkbox>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {};
export const States: S = {
  render: () => (<Row gap={24}><Checkbox>Unchecked</Checkbox><Checkbox defaultSelected>Checked</Checkbox><Checkbox isIndeterminate>Indeterminate</Checkbox><Checkbox isDisabled>Disabled</Checkbox><Checkbox isInvalid>Invalid</Checkbox></Row>),
};
export const Group: S = {
  render: () => (<CheckboxGroup label="Markets" description="Pick the ones to follow" defaultValue={['oil']}><Checkbox value="oil">Oil &amp; products</Checkbox><Checkbox value="gas">Gas &amp; power</Checkbox><Checkbox value="fm">Freight &amp; metals</Checkbox></CheckboxGroup>),
};
export const Radios: S = {
  render: () => (<Col width={420}><RadioGroup label="Delivery" defaultValue="digest" options={[{ value: 'instant', label: 'Instant', description: 'As soon as a threshold is crossed' }, { value: 'digest', label: 'Daily digest' }, { value: 'off', label: 'Off', isDisabled: true }]} /></Col>),
};
export const Switches: S = {
  render: () => (<Col width={440}><Section title="Switch"><Row gap={24}><Switch>Alerts</Switch><Switch defaultSelected>On</Switch><Switch isDisabled>Disabled</Switch></Row></Section><Section title="SwitchRow"><SwitchRow title="Quick ticket · NSC1" hint="GTC" switchLabel="Good till cancelled" defaultSelected /></Section></Col>),
};

export const CheckboxFocusVisible: S = { args: { defaultSelected: true }, play: async () => { await userEvent.tab(); } };
export const SwitchFocusVisible: S = { render: () => <Switch defaultSelected>Alerts</Switch>, play: async () => { await userEvent.tab(); } };
