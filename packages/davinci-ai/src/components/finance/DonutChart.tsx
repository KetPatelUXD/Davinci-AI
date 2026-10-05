'use client';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { useTheme } from '../../foundations/ThemeProvider';
import { formatNumber } from '../../utils/format';
import { useCountUp, usePrefersReducedMotion } from '../../utils/hooks';
import { DisplayNumber } from '../../foundations/Typography';
import { cn } from '../../utils/cn';

export interface DonutSegment {
  id: string;
  label: string;
  value: number;
  /** CSS colour, usually a token: `var(--dv-data-2)`. Defaults to the categorical `data-*` order. */
  color?: string;
}

export interface LegendItem {
  id: string;
  label: string;
  value: ReactNode;
  percent?: string;
  color: string;
}

/** Legend rows: dot · label · value · percent, separated by 1px lines. Pairs colour with text. */
export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cn('dv-chart-legend dv:tabular-nums', className)}>
      {items.map((it) => (
        <li key={it.id} className="dv-chart-legend__row">
          <i style={{ background: it.color }} aria-hidden="true" />
          <span>{it.label}</span>
          <b>{it.value}</b>
          {it.percent && <span className="dv-chart-legend__percent">{it.percent}</span>}
        </li>
      ))}
    </ul>
  );
}

export interface DonutChartProps {
  /** ≤ 6 segments. */
  segments: DonutSegment[];
  /** Centre numeral. Defaults to the sum of values. */
  centerValue?: number | string;
  /** Small label under the centre numeral. */
  centerLabel?: ReactNode;
  size?: number;
  showLegend?: boolean;
  /** Formats values in the legend / table. */
  formatValue?: (n: number) => string;
  /** Required: names the chart. */
  'aria-label': string;
  animate?: boolean;
  className?: string;
}

const DEFAULTS = ['var(--dv-data-1)', 'var(--dv-data-2)', 'var(--dv-data-6)', 'var(--dv-data-4)', 'var(--dv-data-5)', 'var(--dv-data-3)'];
const R = 84, C = 2 * Math.PI * R, GAP = 6;

/**
 * Ring chart with rounded caps and small gaps, a thin display numeral in the centre and a legend. Arcs sweep in.
 * The SVG is decorative; the same data is exposed as a visually hidden table (and visibly in the legend).
 */
export function DonutChart({ segments, centerValue, centerLabel, size = 200, showLegend = true, formatValue, animate = true, className, ...rest }: DonutChartProps) {
  const { locale } = useTheme();
  const id = useId();
  const fmt = formatValue ?? ((n: number) => formatNumber(n, { decimals: 0, locale }));
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const reduced = usePrefersReducedMotion();
  const [on, setOn] = useState(!animate);
  useEffect(() => {
    if (!animate) return;
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(r);
  }, [animate]);
  const numeric = typeof (centerValue ?? total) === 'number';
  const count = useCountUp(Number(centerValue ?? total), { enabled: animate && numeric });
  let offset = 0;
  const colors = segments.map((s, i) => s.color ?? DEFAULTS[i % DEFAULTS.length]!);
  const pct = segments.map((s) => Math.round((s.value / total) * 100));
  return (
    <div className={cn('dv-donut-chart', className)}>
      <div className="dv-donut-chart__ring" style={{ width: size, height: size }} role="group" aria-label={rest['aria-label']}>
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r={R} fill="none" stroke="var(--dv-line)" strokeWidth="16" />
          <circle cx="100" cy="100" r="62" fill="none" stroke="var(--dv-line)" strokeWidth="1" />
          {segments.map((s, i) => {
            const len = Math.max(0, (C * s.value) / total - GAP);
            const el = (
              <circle key={s.id} cx="100" cy="100" r={R} fill="none" stroke={colors[i]} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${on || reduced ? len : 0} ${C}`} strokeDashoffset={-offset}
                style={{ transition: reduced ? 'none' : `stroke-dasharray 1.1s ${0.3 + 0.15 * i}s cubic-bezier(.3,.7,.3,1)` }} />
            );
            offset += (C * s.value) / total;
            return el;
          })}
        </svg>
        <div className="dv-donut-chart__center">
          <div>
            <DisplayNumber size={48} value={numeric ? formatNumber(count, { decimals: 0, locale }) : centerValue} />
            {centerLabel && <small>{centerLabel}</small>}
          </div>
        </div>
      </div>
      <table className="dv:sr-only" aria-labelledby={id}>
        <caption id={id}>{rest['aria-label']}</caption>
        <thead><tr><th>Segment</th><th>Value</th><th>Share</th></tr></thead>
        <tbody>{segments.map((s, i) => <tr key={s.id}><td>{s.label}</td><td>{fmt(s.value)}</td><td>{pct[i]}%</td></tr>)}</tbody>
      </table>
      {showLegend && <ChartLegend items={segments.map((s, i) => ({ id: s.id, label: s.label, value: fmt(s.value), percent: `${pct[i]}%`, color: colors[i]! }))} />}
    </div>
  );
}
