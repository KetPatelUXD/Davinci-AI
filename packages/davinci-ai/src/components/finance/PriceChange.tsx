'use client';
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from '../../foundations/Icon';
import { useTheme } from '../../foundations/ThemeProvider';
import { formatNumber, formatPercent, formatSigned } from '../../utils/format';
import { usePrefersReducedMotion } from '../../utils/hooks';
import { cn } from '../../utils/cn';

export interface PriceChangeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Absolute change. */
  value?: number;
  /** Percent change, e.g. 1.42. At least one of `value` / `percent` is required. */
  percent?: number;
  decimals?: number;
  /** Hide the arrow icon (the sign still shows direction). */
  hideIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Signed price change. Direction is always shown by **▲/▼ icon, + / − sign and colour together** (never colour alone) and
 * is announced as e.g. "Up 1.42 percent". Colours follow `ThemeProvider direction` (standard or inverted).
 */
export function PriceChange({ value, percent, decimals = 2, hideIcon, size = 'md', className, ...rest }: PriceChangeProps) {
  const { locale } = useTheme();
  const basis = percent ?? value ?? 0;
  const dir = basis > 0 ? 'up' : basis < 0 ? 'down' : 'flat';
  const spoken = [
    value !== undefined ? formatNumber(Math.abs(value), { decimals, locale }) : null,
    percent !== undefined ? `${formatNumber(Math.abs(percent), { decimals, locale })} percent` : null,
  ].filter(Boolean).join(', ');
  const parts: string[] = [];
  if (value !== undefined) parts.push(formatSigned(value, decimals, locale));
  if (percent !== undefined) parts.push(value !== undefined ? `(${formatPercent(percent, { decimals, locale })})` : formatPercent(percent, { decimals, locale }));
  return (
    <span className={cn('dv-price-change dv:tabular-nums', className)} data-trend={dir} data-size={size} {...rest}>
      <span className="dv:sr-only">{dir === 'up' ? 'Up ' : dir === 'down' ? 'Down ' : 'Unchanged '}{spoken}</span>
      <span aria-hidden="true" className="dv-price-change__vis">
        {!hideIcon && dir !== 'flat' && <Icon name={dir === 'up' ? 'arrow-up' : 'arrow-down'} size={size === 'sm' ? 11 : 12} strokeWidth={2} />}
        {parts.join(' ')}
      </span>
    </span>
  );
}

/** Returns `'up' | 'down' | null` for `duration` ms after `value` changes (for a wash highlight). Skipped under reduced motion. */
export function usePriceFlash(value: number, duration = 600): 'up' | 'down' | null {
  const prev = useRef(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (value === prev.current) return;
    const dir = value > prev.current ? 'up' : 'down';
    prev.current = value;
    if (reduced) return;
    setFlash(dir);
    const t = setTimeout(() => setFlash(null), duration);
    return () => clearTimeout(t);
  }, [value, duration, reduced]);
  return flash;
}

export interface PriceFlashProps extends HTMLAttributes<HTMLSpanElement> {
  /** The numeric value being watched. */
  value: number;
  /** Rendered text (already formatted). */
  children: ReactNode;
  duration?: number;
  /**
   * Opt in to screen-reader announcements for **significant** moves only: announces when the change since the last
   * announcement is at least this many percent. Ticks are never announced individually.
   */
  announceThresholdPercent?: number;
  /** Spoken name of the instrument for announcements. */
  announceLabel?: string;
}

/** Briefly washes the value green/red (~600ms) when it ticks. Silent to assistive technology unless `announceThresholdPercent` is set. */
export function PriceFlash({ value, children, duration = 600, announceThresholdPercent, announceLabel, className, ...rest }: PriceFlashProps) {
  const flash = usePriceFlash(value, duration);
  const baseline = useRef(value);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (announceThresholdPercent === undefined) return;
    const pct = baseline.current ? ((value - baseline.current) / Math.abs(baseline.current)) * 100 : 0;
    if (Math.abs(pct) >= announceThresholdPercent) {
      setMessage(`${announceLabel ?? 'Price'} ${pct > 0 ? 'up' : 'down'} ${Math.abs(pct).toFixed(2)} percent to ${value}`);
      baseline.current = value;
    }
  }, [value, announceThresholdPercent, announceLabel]);
  return (
    <span className={cn('dv-price-flash dv:tabular-nums', className)} data-flash={flash ?? undefined} {...rest}>
      {children}
      {announceThresholdPercent !== undefined && <span className="dv:sr-only" role="status" aria-live="polite">{message}</span>}
    </span>
  );
}
