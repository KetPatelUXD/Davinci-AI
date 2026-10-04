import type { Meta, StoryObj } from '@storybook/react-vite';
import { parseDate, Time } from '@internationalized/date';
import { DatePicker, DateRangePicker, TimeField, Calendar, RangeCalendar } from './Date';
import { Slider, RangeSlider } from './Slider';
import { FileUpload } from './FileUpload';
import { Form, FormField, Fieldset } from './FormField';
import { TextField } from './TextField';
import { Button } from '../actions/Button';
import { Col, Section } from '../../stories/helpers';

const meta = { title: 'Components/Inputs/Date, Slider, FileUpload, Form', component: DatePicker, parameters: { docs: { components: ["DatePicker", "DateRangePicker", "TimeField", "Calendar", "RangeCalendar", "Slider", "RangeSlider", "FileUpload", "FormField", "Form", "Fieldset"], description: { component: 'Date/time fields (typed segments + calendar popover), sliders, file drop zone and form wrappers. Dates use `@internationalized/date` values and the locale from `ThemeProvider` (default en-US).' } } } } satisfies Meta<typeof DatePicker>;
export default meta;
type S = StoryObj<typeof meta>;

export const Date_: S = {
  name: 'Date and time',
  render: () => (<Col width={340}><DatePicker label="Expiry" defaultValue={parseDate('2026-10-02')} /><DateRangePicker label="Period" /><TimeField label="Cut-off" defaultValue={new Time(17, 30)} /></Col>),
};
export const Calendars: S = { render: () => (<Col><Calendar aria-label="Pick a day" defaultValue={parseDate('2026-10-02')} /><RangeCalendar aria-label="Pick a range" /></Col>) };
export const Sliders: S = { render: () => (<Col width={360}><Slider label="Alert threshold" defaultValue={30} /><RangeSlider label="Price band" defaultValue={[20, 65]} /></Col>) };
export const Upload: S = { render: () => (<div style={{ width: 420 }}><FileUpload description="CSV or XLSX, up to 5 MB" accept={['text/csv']} maxFileSizeMB={5} /></div>) };
export const Forms: S = {
  render: () => (
    <Col gap={32}>
      <Section title="Dense"><div style={{ width: 360 }}><Form layout="dense"><TextField label="Name" /><TextField label="Email" /></Form></div></Section>
      <Section title="Sparse"><div style={{ width: 420 }}><Form layout="sparse"><Fieldset legend="Profile" description="Visible to teammates"><TextField label="Name" /><FormField label="Custom control" description="Wrapped by FormField"><input aria-label="Custom control" style={{ height: 40, width: '100%' }} /></FormField></Fieldset><Button type="submit">Save</Button></Form></div></Section>
    </Col>
  ),
};
