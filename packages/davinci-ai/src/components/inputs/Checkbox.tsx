'use client';
import { forwardRef, type ReactNode } from 'react';
import { Checkbox as RACCheckbox, CheckboxGroup as RACCheckboxGroup, type CheckboxProps as RACCheckboxProps, type CheckboxGroupProps as RACCheckboxGroupProps } from 'react-aria-components';
import { Icon } from '../../foundations/Icon';
import { cn } from '../../utils/cn';
import { FieldFoot, FieldLabel, type FieldProps } from './shared';

export interface CheckboxProps extends Omit<RACCheckboxProps, 'className' | 'children'> {
  className?: string;
  children?: ReactNode;
  /** Secondary line under the label. */
  description?: ReactNode;
}

/** Checkbox with indeterminate support. Box border is `border-strong` (≥3:1); checked state uses the `on` fill. */
export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(function Checkbox({ className, children, description, ...rest }, ref) {
  return (
    <RACCheckbox ref={ref} {...rest} className={cn('dv-checkbox', className)}>
      {({ isSelected, isIndeterminate }) => (
        <>
          <span className="dv-checkbox__box" aria-hidden="true">
            {isIndeterminate ? <Icon name="minus" size={12} strokeWidth={2.4} /> : isSelected ? <Icon name="check" size={12} strokeWidth={2.4} /> : null}
          </span>
          {(children || description) && (
            <span className="dv-checkbox__label">
              {children && <span>{children}</span>}
              {description && <span className="dv-field__hint">{description}</span>}
            </span>
          )}
        </>
      )}
    </RACCheckbox>
  );
});

export interface CheckboxGroupProps extends Omit<RACCheckboxGroupProps, 'className' | 'children'>, Pick<FieldProps, 'label' | 'description' | 'errorMessage' | 'isOptional' | 'className'> {
  children: ReactNode;
  orientation?: 'vertical' | 'horizontal';
}

export function CheckboxGroup({ label, description, errorMessage, isOptional, orientation = 'vertical', className, children, ...rest }: CheckboxGroupProps) {
  return (
    <RACCheckboxGroup {...rest} className={cn('dv-field dv-checkbox-group', className)} data-orientation={orientation}>
      <FieldLabel label={label} isRequired={rest.isRequired} isOptional={isOptional} />
      <div className="dv-checkbox-group__items">{children}</div>
      <FieldFoot description={description} errorMessage={errorMessage} />
    </RACCheckboxGroup>
  );
}
