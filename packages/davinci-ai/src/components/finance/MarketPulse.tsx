'use client';
import { useId } from 'react';
import { Card } from '../layout/Card';
import { AccentTile } from '../layout/AccentTile';
import { DeltaPill } from '../display/DeltaPill';
import { useTheme } from '../../foundations/ThemeProvider';
import { formatPercent } from '../../utils/format';
import { cn } from '../../utils/cn';

export interface PulseMarket {
  id?: string;
  name: string;
  /** Percent change, signed. */
  change: number;
}

export interface MarketPulseProps {
  markets: PulseMarket[];
  title?: string;
  /** Columns on wide screens (collapses responsively). */
  columns?: number;
  onSelect?: (market: PulseMarket) => void;
  className?: string;
}

/** Grid of `AccentTile`s (name + signed change, accent bar by direction) with a summary delta pill. */
export function MarketPulse({ markets, title = 'Market pulse', columns = 6, onSelect, className }: MarketPulseProps) {
  const { locale } = useTheme();
  const id = useId();
  const up = markets.filter((m) => m.change >= 0).length;
  return (
    <Card title={title} actions={<DeltaPill arrow="up">{markets.length} markets · <b style={{ color: 'var(--dv-text)' }}>{up} up</b></DeltaPill>} className={cn('dv-market-pulse', className)}>
      <ul className="dv-market-pulse__grid" style={{ ['--dv-cols' as string]: columns }} aria-labelledby={id}>
        {markets.map((m) => (
          <li key={m.id ?? m.name}>
            <AccentTile label={m.name} value={formatPercent(m.change, { locale })} intent={m.change > 0 ? 'positive' : m.change < 0 ? 'negative' : 'neutral'} onPress={onSelect ? () => onSelect(m) : undefined} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
