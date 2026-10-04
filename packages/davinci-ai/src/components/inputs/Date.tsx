'use client';
import {
  Calendar as RACCalendar, RangeCalendar as RACRangeCalendar, CalendarGrid, CalendarGridHeader, CalendarHeaderCell, CalendarGridBody, CalendarCell, Heading,
  DatePicker as RACDatePicker, DateRangePicker as RACDateRangePicker, DateInput, DateSegment, Group, Button as RACButton, Dialog, TimeField as RACTimeField,
  type CalendarProps, type RangeCalendarProps, type DatePickerProps as RACDatePickerProps, type DateRangePickerProps as RACDateRangePickerProps, type TimeFieldProps as RACTimeFieldProps, type DateValue, type TimeValue,
} from 'react-aria-components';
import { Icon } from '../../foundations/Icon';
import { cn } from '../../utils/cn';
import { ThemedPopover } from '../overlays/Popover';
import { FieldFoot, FieldLabel, type FieldProps } from './shared';

function CalendarHead() {
  return (
    <header className="dv-cal__head">
      <RACButton slot="previous" className="dv-iconbtn" data-variant="ghost" data-size="sm"><Icon name="chevron-left" size={14} /></RACButton>
      <Heading className="dv-cal__title" />
      <RACButton slot="next" className="dv-iconbtn" data-variant="ghost" data-size="sm"><Icon name="chevron-right" size={14} /></RACButton>
    </header>
  );
}
function CalendarBody() {
  return (
    <CalendarGrid className="dv-cal__grid">
      <CalendarGridHeader>{(d) => <CalendarHeaderCell className="dv-cal__dow">{d}</CalendarHeaderCell>}</CalendarGridHeader>
      <CalendarGridBody>{(date) => <CalendarCell date={date} className="dv-cal__cell" />}</CalendarGridBody>
    </CalendarGrid>
  );
}

/** Month calendar (single date). Arrow keys move by day, PageUp/PageDown by month. */
export function Calendar<T extends DateValue>({ className, ...rest }: Omit<CalendarProps<T>, 'className' | 'children'> & { className?: string }) {
  return (
    <RACCalendar {...rest} className={cn('dv-cal', className)}>
      <CalendarHead />
      <CalendarBody />
    </RACCalendar>
  );
}

export function RangeCalendar<T extends DateValue>({ className, ...rest }: Omit<RangeCalendarProps<T>, 'className' | 'children'> & { className?: string }) {
  return (
    <RACRangeCalendar {...rest} className={cn('dv-cal', className)}>
      <CalendarHead />
      <CalendarBody />
    </RACRangeCalendar>
  );
}

export interface DatePickerProps<T extends DateValue> extends Omit<RACDatePickerProps<T>, 'className' | 'children'>, FieldProps {}

/** Typed date field with a calendar popover. Segments are individually editable by keyboard. */
export function DatePicker<T extends DateValue>({ label, description, errorMessage, isOptional, size, className, ...rest }: DatePickerProps<T>) {
  return (
    <RACDatePicker {...rest} className={cn('dv-field', className)} data-size={size}>
      <FieldLabel label={label} isRequired={rest.isRequired} isOptional={isOptional} />
      <Group className="dv-input">
        <DateInput className="dv-dateinput">{(seg) => <DateSegment segment={seg} className="dv-dateseg" />}</DateInput>
        <RACButton className="dv-input__action" aria-label="Open calendar"><Icon name="calendar" size={16} /></RACButton>
      </Group>
      <FieldFoot description={description} errorMessage={errorMessage} />
      <ThemedPopover placement="bottom end"><Dialog className="dv-popover__dialog"><Calendar /></Dialog></ThemedPopover>
    </RACDatePicker>
  );
}

export interface DateRangePickerProps<T extends DateValue> extends Omit<RACDateRangePickerProps<T>, 'className' | 'children'>, FieldProps {}

/** Start–end date range with a two-month-capable range calendar. */
export function DateRangePicker<T extends DateValue>({ label, description, errorMessage, isOptional, size, className, ...rest }: DateRangePickerProps<T>) {
  return (
    <RACDateRangePicker {...rest} className={cn('dv-field', className)} data-size={size}>
      <FieldLabel label={label} isRequired={rest.isRequired} isOptional={isOptional} />
      <Group className="dv-input">
        <DateInput slot="start" className="dv-dateinput">{(seg) => <DateSegment segment={seg} className="dv-dateseg" />}</DateInput>
        <span aria-hidden="true" className="dv-dateinput__sep">–</span>
        <DateInput slot="end" className="dv-dateinput">{(seg) => <DateSegment segment={seg} className="dv-dateseg" />}</DateInput>
        <RACButton className="dv-input__action" aria-label="Open calendar"><Icon name="calendar" size={16} /></RACButton>
      </Group>
      <FieldFoot description={description} errorMessage={errorMessage} />
      <ThemedPopover placement="bottom end"><Dialog className="dv-popover__dialog"><RangeCalendar /></Dialog></ThemedPopover>
    </RACDateRangePicker>
  );
}

export interface TimeFieldProps<T extends TimeValue> extends Omit<RACTimeFieldProps<T>, 'className' | 'children'>, FieldProps {}

/** Hour/minute (optionally seconds) field in the locale's 12/24-hour convention. */
export function TimeField<T extends TimeValue>({ label, description, errorMessage, isOptional, size, className, ...rest }: TimeFieldProps<T>) {
  return (
    <RACTimeField {...rest} className={cn('dv-field', className)} data-size={size}>
      <FieldLabel label={label} isRequired={rest.isRequired} isOptional={isOptional} />
      <Group className="dv-input">
        <DateInput className="dv-dateinput">{(seg) => <DateSegment segment={seg} className="dv-dateseg" />}</DateInput>
      </Group>
      <FieldFoot description={description} errorMessage={errorMessage} />
    </RACTimeField>
  );
}
