'use client';
import { useState } from 'react';
import { IconButton } from '../actions/IconButton';
import { PriceChange } from './PriceChange';
import { CodeChip } from '../display/CodeChip';
import { useTheme } from '../../foundations/ThemeProvider';
import { formatNumber } from '../../utils/format';
import { cn } from '../../utils/cn';

export interface TickerItem {
  id: string;
  symbol: string;
  last: number;
  changePercent: number;
}

export interface TickerTapeProps {
  'aria-label'?: string;
  items: TickerItem[];
  decimals?: number;
  /** Seconds for one full loop. */
  duration?: number;
  className?: string;
}

/**
 * Scrolling quote strip. Pausable (explicit button, and on hover/focus – WCAG 2.2.2). Under reduced motion it does not
 * animate and becomes a horizontally scrollable list. Not a live region.
 */
export function TickerTape({ items, decimals = 2, duration = 40, className, 'aria-label': label = 'Market ticker' }: TickerTapeProps) {
  const { locale } = useTheme();
  const [paused, setPaused] = useState(false);
  const list = (hidden?: boolean) => (
    <ul className="dv-ticker__list" {...(hidden ? { 'aria-hidden': true } : {})}>
      {items.map((it) => (
        <li key={it.id} className="dv-ticker__item">
          <CodeChip>{it.symbol}</CodeChip>
          <span className="dv:tabular-nums">{formatNumber(it.last, { decimals, locale })}</span>
          <PriceChange percent={it.changePercent} size="sm" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={cn('dv-ticker', className)} role="region" aria-label={label} data-paused={paused || undefined}>
      <IconButton label={paused ? 'Resume ticker' : 'Pause ticker'} icon={paused ? 'arrow-right' : 'stop'} size="sm" variant="ghost" onPress={() => setPaused((p) => !p)} />
      <div className="dv-ticker__viewport" tabIndex={0} aria-label={`${label} items`} style={{ ['--dv-ticker-duration' as string]: `${duration}s` }}>
        <div className="dv-ticker__track">{list()}{list(true)}</div>
      </div>
    </div>
  );
}
