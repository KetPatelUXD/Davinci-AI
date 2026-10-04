import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** Scroll axis. */
  axis?: 'y' | 'x' | 'both';
  /** Required when the area is a labelled region (keyboard scrollable). */
  'aria-label'?: string;
  maxHeight?: number | string;
}

/** Overflow container with slim themed scrollbars. Focusable (`tabIndex=0`) so keyboard users can scroll it. */
export function ScrollArea({ axis = 'y', maxHeight, className, style, ...rest }: ScrollAreaProps) {
  return <div role="region" tabIndex={0} className={cn('dv-scroll', className)} data-axis={axis} style={{ maxHeight, ...style }} {...rest} />;
}
