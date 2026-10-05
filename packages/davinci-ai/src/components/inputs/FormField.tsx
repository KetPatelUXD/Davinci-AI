'use client';
import { cloneElement, useId, type FieldsetHTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { Form as RACForm, type FormProps as RACFormProps } from 'react-aria-components';
import { Icon } from '../../foundations/Icon';
import { cn } from '../../utils/cn';

export interface FormFieldProps {
  label: ReactNode;
  /** Helper text under the control. */
  description?: ReactNode;
  /** Error text; also sets `aria-invalid` on the control. */
  errorMessage?: ReactNode;
  isRequired?: boolean;
  isOptional?: boolean;
  /** Single control. FormField injects `id`, `aria-describedby` and `aria-invalid`. */
  children: ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>;
  className?: string;
}

/**
 * Label + helper + error wrapper for **custom** controls that are not already library fields.
 * Library inputs (TextField, Select…) render these parts themselves – don't wrap them.
 */
export function FormField({ label, description, errorMessage, isRequired, isOptional, children, className }: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [description ? hintId : null, errorMessage ? errId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('dv-field dv-form-field', className)}>
      <label htmlFor={id} className="dv-field__label">
        {label}
        {isRequired && <span className="dv-field__req" aria-hidden="true"> *</span>}
        {isOptional && !isRequired && <span className="dv-field__opt"> (optional)</span>}
      </label>
      {cloneElement(children, { id, 'aria-describedby': describedBy, 'aria-invalid': errorMessage ? true : undefined })}
      {description && <p id={hintId} className="dv-field__hint">{description}</p>}
      {errorMessage && <p id={errId} className="dv-field__error"><Icon name="circle-xmark" size={14} /><span>{errorMessage}</span></p>}
    </div>
  );
}

export interface FormProps extends Omit<RACFormProps, 'className' | 'validationBehavior'> {
  /** `dense` – compact controls for data-heavy screens. `sparse` – comfortable, larger controls for occasional forms. */
  layout?: 'dense' | 'sparse';
  validationBehavior?: 'native' | 'aria';
  className?: string;
}

/** Form wrapper that sets control size/spacing for its fields. Native validation by default. */
export function Form({ layout = 'dense', validationBehavior = 'native', className, ...rest }: FormProps) {
  return <RACForm {...rest} validationBehavior={validationBehavior} data-layout={layout} className={cn('dv-form', className)} />;
}

export interface FieldsetProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'className'> {
  legend: ReactNode;
  description?: ReactNode;
  className?: string;
}

/** Groups related fields under a legend. */
export function Fieldset({ legend, description, className, children, ...rest }: FieldsetProps) {
  return (
    <fieldset className={cn('dv-fieldset', className)} {...rest}>
      <legend className="dv-fieldset__legend">{legend}</legend>
      {description && <p className="dv-field__hint">{description}</p>}
      <div className="dv-fieldset__body">{children}</div>
    </fieldset>
  );
}
