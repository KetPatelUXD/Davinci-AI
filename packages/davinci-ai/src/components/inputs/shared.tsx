'use client';
import type { ReactNode } from 'react';
import { FieldError, Label, Text } from 'react-aria-components';
import { Icon } from '../../foundations/Icon';

export type InputSize = 'sm' | 'md' | 'lg';

/** Props every labelled field shares. */
export interface FieldProps {
  /** Visible label. Required for accessibility – or pass `aria-label` for a visually hidden name. */
  label?: ReactNode;
  /** Helper text shown under the control (progressive: keep short). */
  description?: ReactNode;
  /** Error text. Shown with an icon whenever the field is invalid (never colour alone). */
  errorMessage?: ReactNode;
  /** Appends "(optional)" to the label instead of marking required fields. */
  isOptional?: boolean;
  /** sm 36 · md 44 · lg 48 px (compact 30 / 36 / 40). Inherits from `Form layout` when omitted. */
  size?: InputSize;
  className?: string;
}

export function FieldLabel({ label, isRequired, isOptional }: { label?: ReactNode; isRequired?: boolean; isOptional?: boolean }) {
  if (!label) return null;
  return (
    <Label className="dv-field__label">
      {label}
      {isRequired && <span className="dv-field__req" aria-hidden="true"> *</span>}
      {isOptional && !isRequired && <span className="dv-field__opt"> (optional)</span>}
    </Label>
  );
}

export function FieldFoot({ description, errorMessage }: { description?: ReactNode; errorMessage?: ReactNode }) {
  return (
    <>
      {description && <Text slot="description" className="dv-field__hint">{description}</Text>}
      <FieldError className="dv-field__error">
        {({ validationErrors }) => (
          <>
            <Icon name="circle-xmark" size={14} />
            <span>{errorMessage ?? validationErrors.join(' ')}</span>
          </>
        )}
      </FieldError>
    </>
  );
}
