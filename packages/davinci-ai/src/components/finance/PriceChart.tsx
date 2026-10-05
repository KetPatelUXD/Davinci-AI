'use client';
import { useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useTheme } from '../../foundations/ThemeProvider';
import { smoothPath, summarize, useDrawIn, type Pt } from '../../utils/chart';
import { formatNumber } from '../../utils/format';
import { cn } from '../../utils/cn';

export interface PriceChartProps {
  /** Series values, oldest first. */
  data: number[];
  /** Tooltip / announcement text per point (e.g. dates). Same length as `data`. */
  labels?: string[];
  /** Evenly spaced x-axis labels along the bottom (e.g. five dates). */
  xAxisLabels?: string[];
  /** Number of horizontal grid lines with value labels. */
  yTicks?: number;
  /** Static highlight band between two points (fractions 0–1) with ring markers. `false` hides it. */
  highlight?: [number, number] | false;
  /** Value formatter for axis, tooltip and announcements. Default 2-decimals in the active locale. */
  formatValue?: (n: number) => string;
  /** Prefix for the tooltip value, e.g. "$". */
  tooltipPrefix?: string;
  /** Chart height in px (min). Use `fill` to stretch to the parent's height. */
  height?: number;
  fill?: boolean;
  animate?: boolean;
  /** Required: names the chart ("North Sea Crude M1, 30-day price"). */
  'aria-label': string;
  /** Replaces the auto text summary read by screen readers. */
  summary?: string;
  className?: string;
}

const W = 900, H = 260, P = 22, TOP = 18;

/**
 * Hero line/area chart (custom SVG). Monochrome line with a soft glow, faint area, dashed grid with right-aligned labels,
 * dot-grid canvas, a hover crosshair band + ring + `on`-coloured tooltip pill, and a draw-in animation.
 * Keyboard: focus the chart, then ←/→ (Home/End) move the crosshair; values are announced politely.
 * Markers/labels are HTML so circles stay round under the stretched SVG.
 */
export function PriceChart({ data, labels, xAxisLabels, yTicks = 4, highlight = [0.72, 0.9], formatValue, tooltipPrefix = '', height = 250, fill, animate = true, summary, className, ...rest }: PriceChartProps) {
  const id = useId().replace(/:/g, '');
  const { locale } = useTheme();
  const fmt = formatValue ?? ((n: number) => formatNumber(n, { decimals: 2, locale }));
  const mnRaw = Math.min(...data), mxRaw = Math.max(...data);
  const pad = (mxRaw - mnRaw) * 0.06 || 1;
  const mn = mnRaw - pad, mx = mxRaw + pad;
  const X = (i: number) => (i / Math.max(1, data.length - 1)) * W;
  const Y = (v: number) => H - P - ((v - mn) / (mx - mn)) * (H - P - TOP);
  const pts = useMemo<Pt[]>(() => data.map((v, i) => [X(i), Y(v)]), [data]); // eslint-disable-line react-hooks/exhaustive-deps
  const d = useMemo(() => smoothPath(pts), [pts]);
  const ia = highlight ? Math.floor(data.length * highlight[0]) : 0;
  const ib = highlight ? Math.min(data.length - 1, Math.floor(data.length * highlight[1])) : 0;
  const line = useRef<SVGPathElement>(null);
  useDrawIn(line, animate);

  const [active, setActive] = useState<number | null>(null);
  const [spoken, setSpoken] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const describe = (i: number) => `${labels?.[i] ?? `Point ${i + 1}`}: ${fmt(data[i]!)}`;
  const move = (i: number, speak: boolean) => {
    const c = Math.max(0, Math.min(data.length - 1, i));
    setActive(c);
    if (speak) setSpoken(describe(c));
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    move(Math.round(((e.clientX - r.left) / r.width) * (data.length - 1)), false);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const cur = active ?? data.length - 1;
    const next: Record<string, number> = { ArrowLeft: cur - 1, ArrowRight: cur + 1, Home: 0, End: data.length - 1, PageUp: cur - 10, PageDown: cur + 10 };
    if (e.key in next) { e.preventDefault(); move(next[e.key]!, true); }
    else if (e.key === 'Escape') { setActive(null); setSpoken(''); }
  };
  const gridYs = Array.from({ length: yTicks }, (_, k) => TOP + (k * (H - P - TOP)) / Math.max(1, yTicks - 1));
  const text = summary ?? summarize(data, fmt, 'Price chart');
  const lp = (i: number) => `${(X(i) / W) * 100}%`;
  const tp = (i: number) => `${(Y(data[i]!) / H) * 100}%`;

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the chart is a focusable composite widget with its own keyboard model
    <div
      ref={root}
      role="group"
      aria-roledescription="chart"
      aria-label={rest['aria-label']}
      aria-describedby={`${id}-sum`}
      tabIndex={0}
      className={cn('dv-price-chart', className)}
      data-fill={fill || undefined}
      style={{ minHeight: height, ...(fill ? {} : { height }) }}
      data-active={active !== null || undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setActive(null)}
      onKeyDown={onKeyDown}
      onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) move(data.length - 1, true); }}
      onBlur={() => { setActive(null); setSpoken(''); }}
    >
      <p id={`${id}-sum`} className="dv:sr-only">{text} Use left and right arrow keys to read individual values.</p>
      <div className="dv:sr-only" aria-live="polite">{spoken}</div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}b`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" style={{ stopColor: 'var(--dv-chart-line)', stopOpacity: 0.09 }} /><stop offset="1" style={{ stopColor: 'var(--dv-chart-line)', stopOpacity: 0 }} /></linearGradient>
          <linearGradient id={`${id}f`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" style={{ stopColor: 'var(--dv-chart-line)', stopOpacity: 0.07 }} /><stop offset=".8" style={{ stopColor: 'var(--dv-chart-line)', stopOpacity: 0 }} /></linearGradient>
          <linearGradient id={`${id}s`} x1="0" x2="1"><stop offset="0" style={{ stopColor: 'var(--dv-chart-line)', stopOpacity: 0.25 }} /><stop offset=".3" style={{ stopColor: 'var(--dv-chart-line)', stopOpacity: 1 }} /></linearGradient>
          <filter id={`${id}g`}><feGaussianBlur stdDeviation="5" /></filter>
        </defs>
        {gridYs.map((y) => <line key={y} x1="0" x2={W} y1={y} y2={y} stroke="var(--dv-chart-grid)" strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />)}
        {highlight && <rect x={X(ia)} y="0" width={X(ib) - X(ia)} height={H - P} rx="10" fill={`url(#${id}b)`} />}
        <path d={`${d} L${W},${H - P} L0,${H - P}Z`} fill={`url(#${id}f)`} />
        <path d={d} fill="none" stroke="var(--dv-chart-line)" strokeWidth="6" opacity=".18" filter={`url(#${id}g)`} vectorEffect="non-scaling-stroke" />
        <path ref={line} d={d} fill="none" stroke={`url(#${id}s)`} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      {gridYs.map((y, k) => (
        <span key={`yl${k}`} className="dv-price-chart__axis-y dv:tabular-nums" style={{ top: `calc(${(y / H) * 100}% - 17px)` }}>{fmt(mx - (k * (mx - mn)) / Math.max(1, yTicks - 1) - 0)}</span>
      ))}
      {xAxisLabels && (
        <div className="dv-price-chart__axis-x dv:tabular-nums" aria-hidden="true">
          {xAxisLabels.map((t, i) => <span key={i} style={{ left: `${(i / Math.max(1, xAxisLabels.length - 1)) * 100}%`, transform: i === 0 ? 'none' : i === xAxisLabels.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)' }}>{t}</span>)}
        </div>
      )}
      {highlight && <><i className="dv-dot" style={{ left: lp(ia), top: tp(ia) }} /><i className="dv-dot" style={{ left: lp(ib), top: tp(ib) }} /></>}
      <div className="dv-price-chart__band" style={{ left: active !== null ? lp(active) : 0 }} />
      <i className="dv-price-chart__ring" style={{ left: active !== null ? lp(active) : 0, top: active !== null ? tp(active) : 0 }} />
      <div className="dv-price-chart__tooltip dv:tabular-nums" style={{ ['--x' as string]: active !== null ? lp(active) : '0%', top: active !== null ? tp(active) : 0 }} aria-hidden="true">
        {active !== null && (<><b>{tooltipPrefix}{fmt(data[active]!)}</b> {labels?.[active] && <span>{labels[active]}</span>}</>)}
      </div>
    </div>
  );
}
