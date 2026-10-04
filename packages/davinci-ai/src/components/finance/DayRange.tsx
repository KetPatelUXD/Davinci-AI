import { useTheme } from '../../foundations/ThemeProvider';
import { formatNumber } from '../../utils/format';
import { cn } from '../../utils/cn';

export interface DayRangeProps {
  low: number;
  high: number;
  value: number;
  decimals?: number;
  /** `marker` = thin tick on a hairline (table) · `bar` = gradient bar with a round marker (hero stats). */
  variant?: 'marker' | 'bar';
  className?: string;
}

/** Where the last price sits between the day's low and high. Exposed as an image with a text equivalent. */
export function DayRange({ low, high, value, decimals = 2, variant = 'marker', className }: DayRangeProps) {
  const { locale } = useTheme();
  const f = (n: number) => formatNumber(n, { decimals, locale });
  const pos = Math.min(100, Math.max(0, ((value - low) / (high - low || 1)) * 100));
  return (
    <div role="img" aria-label={`Day range ${f(low)} to ${f(high)}, last ${f(value)}`} className={cn(variant === 'bar' ? 'dv-rangebar' : 'dv-dayrange', className)}>
      <i style={{ left: `${pos}%` }} />
    </div>
  );
}
