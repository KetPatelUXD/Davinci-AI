import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label. Omit when the spinner sits inside an element that already announces loading (`aria-busy`). */
  label?: string;
}

/** Indeterminate activity indicator. Motion is reduced to a static arc under `prefers-reduced-motion`. */
export function Spinner({ size = 'md', label, className, ...rest }: SpinnerProps) {
  return (
    <span className={cn('dv-spinner', className)} data-size={size} {...(label ? { role: 'status', 'aria-label': label } : { 'aria-hidden': true })} {...rest}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}
