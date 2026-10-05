'use client';
import { useId, type ReactNode } from 'react';
import { Card, type CardProps } from '../layout/Card';
import { DisplayNumber } from '../../foundations/Typography';
import { useTheme } from '../../foundations/ThemeProvider';
import { useCountUp } from '../../utils/hooks';
import { formatNumber } from '../../utils/format';
import { DeltaPill, type DeltaPillProps } from '../display/DeltaPill';
import { Sparkline } from './Sparkline';
import { cn } from '../../utils/cn';

export interface StatProps extends Omit<CardProps, 'title' | 'children' | 'unit'> {
  title: ReactNode;
  /** Numeric value (counts up on mount) or a preformatted string. */
  value: number | string;
  decimals?: number;
  unit?: ReactNode;
  /** Change vs a reference: `{ value: 1.42, context: '1D' }`. */
  delta?: Pick<DeltaPillProps, 'value' | 'context' | 'decimals'>;
  /** Series for the sparkline above the numeral (highlight band + ring markers). Omit for a numeral-only tile. */
  series?: number[];
  size?: 'sm' | 'md' | 'lg';
  /** Count the numeral up on mount (1.2s, ease-out). Respects reduced motion. */
  countUp?: boolean;
}

/** KPI card: quiet title, sparkline, thin display numeral and a delta pill. Stack two to sit beside a hero chart. */
export function Stat({ title, value, decimals = 2, unit, delta, series, size = 'md', countUp = true, className, ...rest }: StatProps) {
  const { locale } = useTheme();
  const id = useId();
  const numeric = typeof value === 'number';
  const n = useCountUp(numeric ? value : 0, { enabled: countUp && numeric });
  const text = numeric ? formatNumber(n, { decimals, locale }) : value;
  const px = size === 'lg' ? 48 : size === 'sm' ? 42 : 42;
  return (
    <Card {...rest} padded={false} title={undefined} aria-labelledby={id} className={cn('dv-stat', className)} data-size={size}>
      <h2 id={id} className="dv-card__title">{title}</h2>
      {series && <div className="dv-stat__sparkline"><Sparkline data={series} band intent="mono" height="100%" decorative /></div>}
      <div className="dv-stat__row">
        <DisplayNumber value={text} unit={unit} size={px as 42 | 48} />
        {delta && <DeltaPill {...delta} />}
      </div>
      {numeric && <span className="dv:sr-only">{formatNumber(value, { decimals, locale })}</span>}
    </Card>
  );
}
