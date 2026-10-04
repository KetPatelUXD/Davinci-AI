'use client';
import { forwardRef, useState, type ReactNode } from 'react';
import { Input, TextArea as RACTextArea, TextField as RACTextField, SearchField as RACSearchField, Group, Button as RACButton, type TextFieldProps as RACTextFieldProps, type SearchFieldProps as RACSearchFieldProps } from 'react-aria-components';
import { Icon, renderIcon, type IconRef } from '../../foundations/Icon';
import { cn } from '../../utils/cn';
import { FieldFoot, FieldLabel, type FieldProps } from './shared';

export interface TextFieldProps extends Omit<RACTextFieldProps, 'className' | 'children'>, FieldProps {
  placeholder?: string;
  /** Leading icon (decorative). */
  iconStart?: IconRef;
  /** Muted unit or suffix inside the field, e.g. "bbl" or "USD". Read by screen readers as part of the description. */
  suffix?: ReactNode;
  /** Muted prefix, e.g. "$". */
  prefix?: ReactNode;
  inputClassName?: string;
}

/** Single-line text input. 14px radius, `field` fill, 1px `border-strong` edge (WCAG 1.4.11). */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, description, errorMessage, isOptional, size, placeholder, iconStart, suffix, prefix, className, inputClassName, ...rest },
  ref,
) {
  return (
    <RACTextField {...rest} className={cn('dv-field', className)} data-size={size}>
      <FieldLabel label={label} isRequired={rest.isRequired} isOptional={isOptional} />
      <Group className="dv-input">
        {iconStart && <span className="dv-input__icon">{renderIcon(iconStart)}</span>}
        {prefix && <span className="dv-input__affix">{prefix}</span>}
        <Input ref={ref} placeholder={placeholder} className={cn('dv-input__el', inputClassName)} />
        {suffix && <span className="dv-input__affix dv-input__affix--end">{suffix}</span>}
      </Group>
      <FieldFoot description={description} errorMessage={errorMessage} />
    </RACTextField>
  );
});

export interface TextAreaProps extends Omit<RACTextFieldProps, 'className' | 'children'>, FieldProps {
  placeholder?: string;
  rows?: number;
}

/** Multi-line text input. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea({ label, description, errorMessage, isOptional, size, placeholder, rows = 4, className, ...rest }, ref) {
  return (
    <RACTextField {...rest} className={cn('dv-field', className)} data-size={size}>
      <FieldLabel label={label} isRequired={rest.isRequired} isOptional={isOptional} />
      <div className="dv-input dv-input--area">
        <RACTextArea ref={ref} rows={rows} placeholder={placeholder} className="dv-input__el" />
      </div>
      <FieldFoot description={description} errorMessage={errorMessage} />
    </RACTextField>
  );
});

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'suffix' | 'iconStart'>;

/** Password input with a show/hide toggle (announced as a button with state). */
export function PasswordField(props: PasswordFieldProps) {
  const [shown, setShown] = useState(false);
  return (
    <TextField
      {...props}
      type={shown ? 'text' : 'password'}
      autoComplete={props.autoComplete ?? 'current-password'}
      suffix={
        <RACButton className="dv-input__action" aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown} onPress={() => setShown((s) => !s)}>
          <Icon name={shown ? 'eye-slash' : 'eye'} size={16} />
        </RACButton>
      }
    />
  );
}

export interface SearchFieldProps extends Omit<RACSearchFieldProps, 'className' | 'children'>, Omit<FieldProps, 'size'> {
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Required when there is no visible `label`. */
  'aria-label'?: string;
}

/** Pill search field with a clear button (Escape also clears). */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField({ label, description, errorMessage, isOptional, size = 'md', placeholder = 'Search', className, ...rest }, ref) {
  return (
    <RACSearchField {...rest} className={cn('dv-field dv-search', className)} data-size={size}>
      <FieldLabel label={label} isRequired={rest.isRequired} isOptional={isOptional} />
      <Group className="dv-input dv-input--pill">
        <span className="dv-input__icon"><Icon name="magnifying-glass" /></span>
        <Input ref={ref} placeholder={placeholder} className="dv-input__el" />
        <RACButton className="dv-input__action dv-search__clear" aria-label="Clear search"><Icon name="xmark" size={14} /></RACButton>
      </Group>
      <FieldFoot description={description} errorMessage={errorMessage} />
    </RACSearchField>
  );
});
