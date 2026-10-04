'use client';
import { Separator, type SeparatorProps } from 'react-aria-components';
import { cn } from '../../utils/cn';

/** 1px hairline using the decorative `line` token. */
export function Divider({ className, ...rest }: Omit<SeparatorProps, 'className'> & { className?: string }) {
  return <Separator {...rest} className={cn('dv-divider', className)} />;
}
