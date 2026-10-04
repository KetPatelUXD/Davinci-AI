'use client';
import { useId, type ReactNode } from 'react';
import { Card, type CardProps } from '../layout/Card';
import { DisplayNumber } from '../../foundations/Typography';
import { useTheme } from '../../foundations/ThemeProvider';
import { useCountUp } from '../../utils/hooks';
import { formatNumber } from '../../utils/format';
import { DeltaPill } from '../display/DeltaPill';
import { DayRange } from './DayRange';
import { cn } from '../../utils/cn';

export interface QuoteStat {
  label: string;
  value: ReactNode;
}

export interface QuoteCardProps extends Omit<CardProps, 'title' | 'children' | 'unit'> {
  /** Instrument name, e.g. "North Sea Crude M1". Fictional sample data only in docs. */
  title: string;
  /** Muted unit next to the title, e.g. "$/bbl". */
  unit?: string;
  price: number;
  /** Shown as the small suffix of the price numeral. */
  currency?: string;
  decimals?: number;
  /** Percent change and its context ("vs yesterday"). */
  change?: { percent: number; context?: string };
  /** Top-right slot, normally a `TimeRangeSelector`. */
  rangeSelector?: ReactNode;
  /** Key figures under the chart. */
  stats?: QuoteStat[];
  /** Adds the day-range marker to the stats row. */
  dayRange?: { low: number; high: number };
  /** Chart or other visual (e.g. `PriceChart fill`). */
  children?: ReactNode;
}

/** Hero quote: title, 64px display price with currency, delta pill, range selector, chart slot and key stats. */
export function QuoteCard({ title, unit, price, currency, decimals = 2, change, rangeSelector, stats, dayRange, children, className, ...rest }: QuoteCardProps) {
  const { locale } = useTheme();
  const id = useId();
  const n = useCountUp(price);
  return (
    <Card {...rest} title={undefined} aria-labelledby={id} className={cn('dv-quote', className)}>
      <div className="dv-quote__top">
        <div>
          <h2 id={id} className="dv-card__title">{title}{unit && <> <span className="dv-card__unit">· {unit}</span></>}</h2>
          <DisplayNumber size={64} className="dv-quote__price" value={formatNumber(n, { decimals, locale })} unit={currency} />
          <span className="dv:sr-only">{formatNumber(price, { decimals, locale })} {currency}</span>
          {change && <div className="dv-quote__delta"><DeltaPill value={change.percent} context={change.context} /></div>}
        </div>
        {rangeSelector && <div className="dv-quote__range">{rangeSelector}</div>}
      </div>
      {children && <div className="dv-quote__chart">{children}</div>}
      {(stats || dayRange) && (
        <dl className="dv-quote__stats dv:tabular-nums">
          {stats?.map((s) => (<div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>))}
          {dayRange && (
            <div className="dv-quote__range-stat">
              <dt>Day range · {formatNumber(dayRange.low, { decimals, locale })} – {formatNumber(dayRange.high, { decimals, locale })}</dt>
              <dd><DayRange variant="bar" low={dayRange.low} high={dayRange.high} value={price} decimals={decimals} /></dd>
            </div>
          )}
        </dl>
      )}
    </Card>
  );
}
