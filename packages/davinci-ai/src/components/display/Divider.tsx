'use client';
import { Separator, type SeparatorProps } from 'react-aria-components';
import { cn } from '../../utils/cn';

/** 1px hairline using the decorative `line` token. */
export function Divider({ className, orientation = 'horizontal', ...rest }: Omit<SeparatorProps, 'className'> & { className?: string }) {
  return <Separator {...rest} orientation={orientation} data-orientation={orientation} className={cn('dv-divider', className)} />;
}
