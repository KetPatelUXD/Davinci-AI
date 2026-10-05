import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../components/actions/Button';
import { IconButton } from '../components/actions/IconButton';
import { ButtonGroup } from '../components/actions/ButtonGroup';
import { Link } from '../components/actions/Link';
import { ToggleButton } from '../components/actions/ToggleButton';
import { SegmentedControl } from '../components/actions/SegmentedControl';
import { SideToggle } from '../components/actions/SideToggle';
import { PillTabs } from '../components/actions/PillTabs';
import { Checkbox, CheckboxGroup } from '../components/inputs/Checkbox';
import { RadioGroup } from '../components/inputs/RadioGroup';
import { Switch, SwitchRow } from '../components/inputs/Switch';
import { TextField, TextArea, PasswordField, SearchField } from '../components/inputs/TextField';
import { NumberField, PriceField } from '../components/inputs/NumberField';
import { Select, ComboBox, MultiSelect } from '../components/inputs/Select';
import { DatePicker, DateRangePicker, TimeField, Calendar, RangeCalendar } from '../components/inputs/Date';
import { Slider, RangeSlider } from '../components/inputs/Slider';
import { FileUpload } from '../components/inputs/FileUpload';
import { FormField, Form, Fieldset } from '../components/inputs/FormField';
import { parseDate, Time } from '@internationalized/date';

/**
 * Internal hosts for `scripts/figma-extract.mjs`: every optional part is switched on so the extractor sees the full
 * anatomy of each component. Not documentation – skipped by the a11y runner and hidden from the docs.
 */
const meta = { title: 'Internal/Extract', parameters: { layout: 'centered', docs: { disable: true } }, tags: ['!autodocs'] } satisfies Meta;
export default meta;
type S = StoryObj<typeof meta>;

export const ButtonFull: S = { render: () => <Button iconStart="plus" iconEnd="chevron-down">New alert</Button> };
export const IconButtonFull: S = { render: () => <IconButton label="Refresh" icon="rotate-right" /> };
export const ButtonGroupFull: S = { render: () => (<ButtonGroup aria-label="Range"><Button variant="subtle">Day</Button><Button variant="subtle">Week</Button><Button variant="subtle">Month</Button></ButtonGroup>) };
export const LinkFull: S = { render: () => <Link href="#assessments" external>View all assessments</Link> };
export const ToggleButtonFull: S = { render: () => <ToggleButton iconStart="star">Pin</ToggleButton> };
export const SegmentedControlFull: S = { render: () => <SegmentedControl aria-label="Range" defaultValue="1d" options={[{ id: '1d', label: '1D', icon: 'chart-line' }, { id: '1w', label: '1W', icon: 'chart-line' }, { id: '1m', label: '1M', icon: 'chart-line' }]} /> };
export const SideToggleFull: S = { render: () => <div style={{ width: 360 }}><SideToggle /></div> };
export const PillTabsFull: S = { render: () => (<div style={{ width: 360 }}><PillTabs aria-label="Views" items={[{ id: 'a', label: 'Overview', content: 'Overview panel' }, { id: 'b', label: 'Holdings', content: 'Holdings panel' }, { id: 'c', label: 'Activity', content: 'Activity panel' }]} /></div>) };

/** One column of sample instances; each wrapper id is a state root for scripts/figma-extract.mjs (`stateRoots`). */
const Col = ({ children }: { children: React.ReactNode }) => <div style={{ display: 'grid', gap: 20, width: 340, padding: 8 }}>{children}</div>;
const W = ({ id, children }: { id: string; children: React.ReactNode }) => <div id={id}>{children}</div>;
const ITEMS = [{ id: 'nsc1', label: 'North Sea Crude M1', description: 'Dated Brent' }, { id: 'wtx1', label: 'Texas Light Sweet M1' }, { id: 'ttf1', label: 'Continental Gas M1' }];

export const CheckboxFull: S = { render: () => (<Col>
  <W id="default"><Checkbox description="We email you once a day">Remember my filters</Checkbox></W>
  <W id="selected"><Checkbox defaultSelected description="We email you once a day">Remember my filters</Checkbox></W>
  <W id="indeterminate"><Checkbox isIndeterminate description="We email you once a day">Remember my filters</Checkbox></W>
  <W id="disabled"><Checkbox isDisabled description="We email you once a day">Remember my filters</Checkbox></W>
  <W id="invalid"><Checkbox isInvalid description="We email you once a day">Remember my filters</Checkbox></W>
</Col>) };
export const CheckboxGroupFull: S = { render: () => {
  const kids = [<Checkbox key="a" value="email">Email</Checkbox>, <Checkbox key="b" value="push">Push</Checkbox>, <Checkbox key="c" value="sms">SMS</Checkbox>];
  return (<Col>
    <W id="default"><CheckboxGroup label="Notify me by" description="Choose at least one channel">{kids}</CheckboxGroup></W>
    <W id="invalid"><CheckboxGroup label="Notify me by" description="Choose at least one channel" errorMessage="Select at least one channel" isInvalid>{kids}</CheckboxGroup></W>
    <W id="disabled"><CheckboxGroup label="Notify me by" description="Choose at least one channel" isDisabled>{kids}</CheckboxGroup></W>
  </Col>);
} };
const RADIOS = [{ value: 'instant', label: 'Instant', description: 'As soon as a threshold is crossed' }, { value: 'digest', label: 'Daily digest', description: 'One summary each morning' }];
export const RadioGroupFull: S = { render: () => (<Col>
  <W id="default"><RadioGroup label="Delivery" description="How alerts reach you" options={RADIOS} /></W>
  <W id="selected"><RadioGroup label="Delivery" description="How alerts reach you" options={RADIOS} defaultValue="digest" /></W>
  <W id="disabled"><RadioGroup label="Delivery" description="How alerts reach you" options={RADIOS} isDisabled /></W>
  <W id="invalid"><RadioGroup label="Delivery" description="How alerts reach you" options={RADIOS} isInvalid errorMessage="Choose a delivery option" /></W>
</Col>) };
export const SwitchFull: S = { render: () => (<Col>
  <W id="default"><Switch>Price alerts</Switch></W>
  <W id="selected"><Switch defaultSelected>Price alerts</Switch></W>
  <W id="disabled"><Switch isDisabled>Price alerts</Switch></W>
</Col>) };
export const SwitchRowFull: S = { render: () => (<div style={{ display: 'grid', gap: 20, width: 520, padding: 8 }}>
  <W id="default"><SwitchRow title="Price alerts" hint="Notify me when a threshold is crossed" switchLabel="Price alerts" /></W>
  <W id="selected"><SwitchRow title="Price alerts" hint="Notify me when a threshold is crossed" switchLabel="Price alerts" defaultSelected /></W>
  <W id="disabled"><SwitchRow title="Price alerts" hint="Notify me when a threshold is crossed" switchLabel="Price alerts" isDisabled /></W>
</div>) };
const tf = { label: 'Limit price', description: 'Per barrel, excluding fees', placeholder: '0.00', iconStart: 'magnifying-glass', prefix: '$', suffix: 'USD' } as const;
export const TextFieldFull: S = { render: () => (<Col>
  <W id="default"><TextField {...tf} /></W>
  <W id="invalid"><TextField {...tf} isInvalid errorMessage="Enter a valid price" /></W>
  <W id="disabled"><TextField {...tf} isDisabled /></W>
  <W id="read-only"><TextField {...tf} isReadOnly defaultValue="84.62" /></W>
</Col>) };
const ta = { label: 'Notes', description: 'Visible to your team', placeholder: 'Add a note…' } as const;
export const TextAreaFull: S = { render: () => (<Col>
  <W id="default"><TextArea {...ta} /></W>
  <W id="invalid"><TextArea {...ta} isInvalid errorMessage="Notes are required" /></W>
  <W id="disabled"><TextArea {...ta} isDisabled /></W>
  <W id="read-only"><TextArea {...ta} isReadOnly defaultValue="Rolled the position into the October contract." /></W>
</Col>) };
const pw = { label: 'Password', description: 'At least 12 characters', placeholder: 'Enter password' } as const;
export const PasswordFieldFull: S = { render: () => (<Col>
  <W id="default"><PasswordField {...pw} /></W>
  <W id="invalid"><PasswordField {...pw} isInvalid errorMessage="Password is too short" /></W>
  <W id="disabled"><PasswordField {...pw} isDisabled /></W>
</Col>) };
const sf = { label: 'Search', description: 'Instruments, news and people', placeholder: 'Search…' } as const;
export const SearchFieldFull: S = { render: () => (<Col>
  <W id="default"><SearchField {...sf} defaultValue="brent" /></W>
  <W id="disabled"><SearchField {...sf} isDisabled /></W>
</Col>) };
const nf = { label: 'Quantity', description: 'Lots of 1,000 bbl', placeholder: '0', suffix: 'lots' } as const;
export const NumberFieldFull: S = { render: () => (<Col>
  <W id="default"><NumberField {...nf} /></W>
  <W id="invalid"><NumberField {...nf} isInvalid errorMessage="Must be a whole number" /></W>
  <W id="disabled"><NumberField {...nf} isDisabled /></W>
</Col>) };
const pf = { label: 'Limit price', description: 'Snaps to the tick size', currency: 'USD', precision: 2, tickSize: 0.05 } as const;
export const PriceFieldFull: S = { render: () => (<Col>
  <W id="default"><PriceField {...pf} defaultValue={84.6} /></W>
  <W id="invalid"><PriceField {...pf} defaultValue={84.6} isInvalid errorMessage="Outside the daily limit" /></W>
  <W id="disabled"><PriceField {...pf} defaultValue={84.6} isDisabled /></W>
</Col>) };
const se = { label: 'Instrument', description: 'Choose one', placeholder: 'Select…', items: ITEMS } as const;
export const SelectFull: S = { render: () => (<Col>
  <W id="default"><Select {...se} /></W>
  <W id="invalid"><Select {...se} isInvalid errorMessage="Select an instrument" /></W>
  <W id="disabled"><Select {...se} isDisabled /></W>
</Col>) };
const cb = { label: 'Instrument', description: 'Type to search', placeholder: 'Search…', items: ITEMS } as const;
export const ComboBoxFull: S = { render: () => (<Col>
  <W id="default"><ComboBox {...cb} /></W>
  <W id="invalid"><ComboBox {...cb} isInvalid errorMessage="Pick an instrument" /></W>
  <W id="disabled"><ComboBox {...cb} isDisabled /></W>
</Col>) };
const ms = { label: 'Instruments', description: 'Pick any', placeholder: 'Select…', items: ITEMS } as const;
export const MultiSelectFull: S = { render: () => (<Col>
  <W id="default"><MultiSelect {...ms} defaultValue={['nsc1', 'wtx1']} /></W>
  <W id="disabled"><MultiSelect {...ms} defaultValue={['nsc1']} isDisabled /></W>
</Col>) };
export const DatePickerFull: S = { render: () => (<Col>
  <W id="default"><DatePicker label="Expiry" description="Contract expiry" defaultValue={parseDate('2026-10-02')} /></W>
  <W id="invalid"><DatePicker label="Expiry" description="Contract expiry" defaultValue={parseDate('2026-10-02')} isInvalid errorMessage="Date is in the past" /></W>
  <W id="disabled"><DatePicker label="Expiry" description="Contract expiry" defaultValue={parseDate('2026-10-02')} isDisabled /></W>
</Col>) };
export const DateRangePickerFull: S = { render: () => (<Col>
  <W id="default"><DateRangePicker label="Period" description="Reporting window" defaultValue={{ start: parseDate('2026-10-01'), end: parseDate('2026-10-31') }} /></W>
  <W id="invalid"><DateRangePicker label="Period" description="Reporting window" defaultValue={{ start: parseDate('2026-10-01'), end: parseDate('2026-10-31') }} isInvalid errorMessage="Range is too long" /></W>
  <W id="disabled"><DateRangePicker label="Period" description="Reporting window" defaultValue={{ start: parseDate('2026-10-01'), end: parseDate('2026-10-31') }} isDisabled /></W>
</Col>) };
export const TimeFieldFull: S = { render: () => (<Col>
  <W id="default"><TimeField label="Cut-off" description="Local time" defaultValue={new Time(17, 30)} /></W>
  <W id="invalid"><TimeField label="Cut-off" description="Local time" defaultValue={new Time(17, 30)} isInvalid errorMessage="After market close" /></W>
  <W id="disabled"><TimeField label="Cut-off" description="Local time" defaultValue={new Time(17, 30)} isDisabled /></W>
</Col>) };
export const CalendarFull: S = { render: () => (<Col><W id="default"><Calendar aria-label="Pick a day" defaultValue={parseDate('2026-10-14')} /></W></Col>) };
export const RangeCalendarFull: S = { render: () => (<Col><W id="default"><RangeCalendar aria-label="Pick a range" defaultValue={{ start: parseDate('2026-10-12'), end: parseDate('2026-10-16') }} /></W></Col>) };
export const SliderFull: S = { render: () => (<Col>
  <W id="default"><Slider label="Alert threshold" defaultValue={30} /></W>
  <W id="disabled"><Slider label="Alert threshold" defaultValue={30} isDisabled /></W>
</Col>) };
export const RangeSliderFull: S = { render: () => (<Col>
  <W id="default"><RangeSlider label="Price band" defaultValue={[20, 65]} /></W>
  <W id="disabled"><RangeSlider label="Price band" defaultValue={[20, 65]} isDisabled /></W>
</Col>) };
export const FileUploadFull: S = { render: () => (<Col>
  <W id="default"><FileUpload label="Upload files" description="PDF or CSV up to 10 MB" /></W>
  <W id="disabled"><FileUpload label="Upload files" description="PDF or CSV up to 10 MB" isDisabled /></W>
  <W id="invalid"><FileUpload label="Upload files" description="PDF or CSV up to 10 MB" errorMessage="File is too large" /></W>
</Col>) };
const Slot = () => <div data-extract-name="Control" style={{ height: 38, borderRadius: 999, background: 'rgba(255,255,255,.06)' }} />;
export const FormFieldFull: S = { render: () => (<Col>
  <W id="default"><FormField label="Counterparty" description="Legal entity name"><Slot /></FormField></W>
  <W id="invalid"><FormField label="Counterparty" description="Legal entity name" errorMessage="Counterparty is required"><Slot /></FormField></W>
</Col>) };
export const FormFull: S = { render: () => (<Col><W id="default"><Form><FormField label="Counterparty"><Slot /></FormField><FormField label="Reference"><Slot /></FormField></Form></W></Col>) };
export const FieldsetFull: S = { render: () => (<Col><W id="default"><Fieldset legend="Delivery" description="Where and when"><FormField label="Port"><Slot /></FormField></Fieldset></W></Col>) };
