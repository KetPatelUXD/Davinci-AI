import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Remove padding (e.g. for a pill bar or table header). */
  flush?: boolean;
}

/** Nested surface inside a card: `panel` fill, hairline inset edge, radius 20. Groups form controls or a pill bar. */
export function Panel({ flush, className, ...rest }: PanelProps) {
  return <div className={cn('dv-panel', flush && 'dv-panel--flush', className)} {...rest} />;
}
