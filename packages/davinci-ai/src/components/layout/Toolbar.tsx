'use client';
import { Toolbar as RACToolbar, type ToolbarProps as RACToolbarProps } from 'react-aria-components';
import { cn } from '../../utils/cn';

export interface ToolbarProps extends Omit<RACToolbarProps, 'className'> {
  /** Required: names the toolbar. */
  'aria-label': string;
  className?: string;
}

/** Row of related controls with roving arrow-key navigation (one tab stop). */
export function Toolbar({ className, ...rest }: ToolbarProps) {
  return <RACToolbar {...rest} className={cn('dv-toolbar', className)} />;
}
