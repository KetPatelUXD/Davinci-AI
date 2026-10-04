'use client';
import type { ReactNode } from 'react';
import { Radio as RACRadio, RadioGroup as RACRadioGroup, type RadioGroupProps as RACRadioGroupProps } from 'react-aria-components';
import { cn } from '../../utils/cn';
import { FieldFoot, FieldLabel, type FieldProps } from './shared';

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  isDisabled?: boolean;
}

export interface RadioGroupProps extends Omit<RACRadioGroupProps, 'className' | 'children'>, Pick<FieldProps, 'label' | 'description' | 'errorMessage' | 'isOptional' | 'className'> {
  options: RadioOption[];
}

/** Single choice from a few visible options (≤6). Use `Select` for longer lists. Arrow keys move and select. */
export function RadioGroup({ label, description, errorMessage, isOptional, options, className, ...rest }: RadioGroupProps) {
  return (
    <RACRadioGroup {...rest} className={cn('dv-field dv-group', className)}>
      <FieldLabel label={label} isRequired={rest.isRequired} isOptional={isOptional} />
      <div className="dv-group__items">
        {options.map((o) => (
          <RACRadio key={o.value} value={o.value} isDisabled={o.isDisabled} className="dv-radio">
            <span className="dv-radio__dot" aria-hidden="true" />
            <span className="dv-check__text">
              <span>{o.label}</span>
              {o.description && <span className="dv-field__hint">{o.description}</span>}
            </span>
          </RACRadio>
        ))}
      </div>
      <FieldFoot description={description} errorMessage={errorMessage} />
    </RACRadioGroup>
  );
}
