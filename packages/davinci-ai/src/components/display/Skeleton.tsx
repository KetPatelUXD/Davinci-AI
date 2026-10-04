import type { CSSProperties, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  /** Render several text-like lines. */
  lines?: number;
}

/** Loading placeholder. Decorative – set `aria-busy` on the region that is loading. Shimmer is static under reduced motion. */
export function Skeleton({ width, height = 14, circle, lines, className, style, ...rest }: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <span className={cn('dv-skeleton-lines', className)} aria-hidden="true" {...rest}>
        {Array.from({ length: lines }, (_, i) => <span key={i} className="dv-skeleton" style={{ height, width: i === lines - 1 ? '60%' : '100%' } as CSSProperties} />)}
      </span>
    );
  }
  return <span aria-hidden="true" className={cn('dv-skeleton', circle && 'dv-skeleton--circle', className)} style={{ width: width ?? (circle ? height : '100%'), height, ...style }} {...rest} />;
}
