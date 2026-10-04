'use client';
import { forwardRef, type ReactNode } from 'react';
import { NumberField as RACNumberField, Group, Input, Button as RACButton, type NumberFieldProps as RACNumberFieldProps } from 'react-aria-components';
import { Icon } from '../../foundations/Icon';
import { cn } from '../../utils/cn';
import { FieldFoot, FieldLabel, type FieldProps } from './shared';

export interface NumberFieldProps extends Omit<RACNumberFieldProps, 'className' | 'children'>, FieldProps {
  placeholder?: string;
  /** Muted unit inside the field, e.g. "bbl". */
  suffix?: ReactNode;
  /** Hide the +/− steppers (keyboard ↑/↓ and PageUp/PageDown still work). */
  hideSteppers?: boolean;
}

/**
 * Locale-formatted number input (en-US by default; follows `ThemeProvider locale`). Supports `minValue`, `maxValue`,
 * `step`, `formatOptions`, ↑/↓ increment, PageUp/PageDown large steps and mouse-wheel on focus.
 */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  { label, description, errorMessage, isOptional, size, placeholder, suffix, hideSteppers, className, ...rest },
  ref,
) {
  return (
    <RACNumberField {...rest} className={cn('dv-field', className)} data-size={size}>
      <FieldLabel label={label} isRequired={rest.isRequired} isOptional={isOptional} />
      <Group className="dv-input">
        <Input ref={ref} placeholder={placeholder} className="dv-input__el dv:tabular-nums" />
        {suffix && <span className="dv-input__affix dv-input__affix--end">{suffix}</span>}
        {!hideSteppers && (
          <span className="dv-input__steppers">
            <RACButton slot="increment" className="dv-input__stepper"><Icon name="caret-up" size={12} /></RACButton>
            <RACButton slot="decrement" className="dv-input__stepper"><Icon name="caret-down" size={12} /></RACButton>
          </span>
        )}
      </Group>
      <FieldFoot description={description} errorMessage={errorMessage} />
    </RACNumberField>
  );
});

export interface PriceFieldProps extends Omit<NumberFieldProps, 'formatOptions' | 'step'> {
  /** Decimal places shown, e.g. 2 for 84.62. */
  precision?: number;
  /** Minimum price increment. Arrow keys step by one tick and values snap to the tick on blur. */
  tickSize?: number;
  /** ISO currency code shown as the suffix (display only). */
  currency?: string;
}

/** Price input: fixed precision, tick-size stepping and snapping. */
export const PriceField = forwardRef<HTMLInputElement, PriceFieldProps>(function PriceField({ precision = 2, tickSize, currency, suffix, onChange, onBlur, ...rest }, ref) {
  const tick = tickSize ?? 1 / 10 ** precision;
  return (
    <NumberField
      ref={ref}
      {...rest}
      step={tick}
      suffix={suffix ?? currency}
      formatOptions={{ minimumFractionDigits: precision, maximumFractionDigits: precision, useGrouping: true }}
      onChange={(v) => {
        // snap to the nearest tick (floating-point safe)
        if (Number.isFinite(v) && tickSize) onChange?.(Math.round(Math.round(v / tickSize) * tickSize * 1e10) / 1e10);
        else onChange?.(v);
      }}
      onBlur={onBlur}
    />
  );
});
