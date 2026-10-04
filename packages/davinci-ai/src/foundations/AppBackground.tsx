import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface AppBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  /** `fixed` covers the viewport (app); `absolute` fills the nearest positioned parent (docs, previews). */
  position?: 'fixed' | 'absolute';
  /** Show the 16px dot grid used behind chart canvases instead of the ambient light. */
  dotGrid?: boolean;
}

/**
 * Graphite ambient light: a large soft glow from the top-left plus one blurred diagonal beam that drifts very slowly
 * (static under `prefers-reduced-motion`). Purely decorative (`aria-hidden`).
 */
export function AppBackground({ position = 'fixed', dotGrid, className, ...rest }: AppBackgroundProps) {
  return <div aria-hidden="true" className={cn('dv-ambient', dotGrid && 'dv-ambient--dots', className)} data-position={position} {...rest} />;
}
