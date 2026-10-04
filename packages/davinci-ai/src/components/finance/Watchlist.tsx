'use client';
import type { Key } from 'react';
import { GridList, GridListItem, type Selection } from 'react-aria-components';
import { useTheme } from '../../foundations/ThemeProvider';
import { formatNumber } from '../../utils/format';
import { CodeChip } from '../display/CodeChip';
import { PriceChange, PriceFlash } from './PriceChange';
import { Sparkline } from './Sparkline';
import { cn } from '../../utils/cn';

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  last: number;
  change: number;
  changePercent: number;
  /** Trend series for the row sparkline. */
  series?: number[];
}

export interface WatchlistProps {
  'aria-label': string;
  items: WatchlistItem[];
  selectionMode?: 'none' | 'single';
  selectedKeys?: Selection;
  defaultSelectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
  onAction?: (id: Key) => void;
  decimals?: number;
  dense?: boolean;
  className?: string;
}

/**
 * Watchlist (also `PriceList`): symbol, name, last, change, %, trend sparkline. Rows are selectable, keyboard navigable
 * and tick-flash silently. Dense by default for side panels.
 */
export function Watchlist({ items, decimals = 2, dense = true, className, ...rest }: WatchlistProps) {
  return (
    <GridList {...rest} items={items} className={cn('dv-watch', dense && 'dv-watch--dense', className)}>
      {(it) => <WatchlistRow item={it} decimals={decimals} />}
    </GridList>
  );
}
export const PriceList = Watchlist;

/** One row of the watchlist (use inside `Watchlist`). */
export function WatchlistRow({ item, decimals = 2 }: { item: WatchlistItem; decimals?: number }) {
  const { locale } = useTheme();
  return (
    <GridListItem id={item.id} textValue={`${item.name}, ${formatNumber(item.last, { decimals, locale })}`} className="dv-watch__row">
      <span className="dv-watch__id">
        <CodeChip>{item.symbol}</CodeChip>
        <span className="dv-watch__name">{item.name}</span>
      </span>
      {item.series && <Sparkline className="dv-watch__spark" data={item.series} tone="mono" height={28} animate={false} baseline={false} decorative />}
      <PriceFlash value={item.last} className="dv-watch__last">{formatNumber(item.last, { decimals, locale })}</PriceFlash>
      <PriceChange percent={item.changePercent} value={item.change} decimals={decimals} size="sm" className="dv-watch__chg" />
    </GridListItem>
  );
}
