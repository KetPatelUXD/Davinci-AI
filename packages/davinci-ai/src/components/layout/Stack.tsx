import { createElement, type CSSProperties, type ElementType, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  direction?: 'column' | 'row';
  /** Gap in px. */
  gap?: number;
  align?: CSSProperties['alignItems'];
  wrap?: boolean;
}

/** One-dimensional flex layout with token-friendly gaps. */
export function Stack({ as = 'div', direction = 'column', gap = 16, align, wrap, className, style, ...rest }: StackProps) {
  return createElement(as, {
    className: cn('dv-stack', className),
    'data-dir': direction,
    'data-wrap': wrap || undefined,
    style: { ['--dv-gap' as string]: `${gap}px`, ...(align ? { ['--dv-align' as string]: align } : {}), ...style },
    ...rest,
  });
}

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number;
  gap?: number;
}
/** CSS grid, 12 columns by default. Children place themselves with `GridItem`. */
export function Grid({ columns = 12, gap = 16, className, style, ...rest }: GridProps) {
  return <div className={cn('dv-grid', className)} style={{ ['--dv-cols' as string]: columns, ['--dv-gap' as string]: `${gap}px`, ...style }} {...rest} />;
}

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Column span, or per-breakpoint spans `{ base, md, lg }` (≥760 / ≥1280). */
  span?: number | { base?: number; md?: number; lg?: number };
}
export function GridItem({ span = 12, className, style, ...rest }: GridItemProps) {
  const s = typeof span === 'number' ? { base: span } : span;
  return (
    <div
      className={cn('dv-griditem', className)}
      style={{ ['--dv-span' as string]: s.base ?? 12, ['--dv-span-md' as string]: s.md ?? s.base ?? 12, ['--dv-span-lg' as string]: s.lg ?? s.md ?? s.base ?? 12, ...style }}
      {...rest}
    />
  );
}
