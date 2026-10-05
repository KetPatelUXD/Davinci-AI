import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Required: names the group for assistive technology. */
  'aria-label': string;
  /** Join the buttons inside a single panel pill. */
  attached?: boolean;
}

/** Lays related buttons out together (`role="group"`). */
export function ButtonGroup({ attached, className, ...rest }: ButtonGroupProps) {
  return <div role="group" className={cn('dv-button-group', className)} data-attached={attached || undefined} {...rest} />;
}
