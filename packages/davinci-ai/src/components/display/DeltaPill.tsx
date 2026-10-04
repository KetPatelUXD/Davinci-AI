import type { HTMLAttributes, ReactNode } from 'react';
import { Icon } from '../../foundations/Icon';
import { useTheme } from '../../foundations/ThemeProvider';
import { formatPercent } from '../../utils/format';
import { cn } from '../../utils/cn';

export interface DeltaPillProps extends HTMLAttributes<HTMLSpanElement> {
  /** Signed change in percent, e.g. 1.42 or −0.86. Omit for a neutral summary pill (use `children`). */
  value?: number;
  /** Muted context after the value, e.g. "vs yesterday" or "1D". */
  context?: ReactNode;
  decimals?: number;
  /** Fully custom content (e.g. "12 markets · **7 up**"); overrides `value`/`context` text. */
  children?: ReactNode;
  /** Force the arrow direction for neutral summaries. */
  arrow?: 'up' | 'down' | 'none';
}

/**
 * Pill with a coloured signed value, muted context and a small circled arrow ("+1.42% vs yesterday ↑").
 * Direction is conveyed by the sign, the arrow **and** colour; screen readers hear "Up".
 */
export function DeltaPill({ value, context, decimals = 2, arrow, children, className, ...rest }: DeltaPillProps) {
  const { locale } = useTheme();
  const dir = value === undefined ? 'flat' : value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const a = arrow ?? (dir === 'flat' ? 'none' : dir);
  return (
    <span className={cn('dv-delta dv:tabular-nums', className)} data-dir={dir} {...rest}>
      {children ?? (
        <>
          <span className="dv:sr-only">{dir === 'up' ? 'Up ' : dir === 'down' ? 'Down ' : 'Unchanged '}</span>
          <b>{formatPercent(value ?? 0, { decimals, locale })}</b>
          {context && <span className="dv-delta__ctx">{context}</span>}
        </>
      )}
      {a !== 'none' && (
        <i className="dv-delta__arrow" aria-hidden="true"><Icon name={a === 'up' ? 'arrow-up' : 'arrow-down'} size={11} strokeWidth={2} /></i>
      )}
    </span>
  );
}
