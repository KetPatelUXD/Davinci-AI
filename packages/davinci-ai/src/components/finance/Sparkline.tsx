'use client';
import { useId, useMemo, useRef, type HTMLAttributes } from 'react';
import { useTheme } from '../../foundations/ThemeProvider';
import { smoothPath, summarize, toPoints, useDrawIn } from '../../utils/chart';
import { formatNumber } from '../../utils/format';
import { cn } from '../../utils/cn';

export interface SparklineProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Series values, oldest first. */
  data: number[];
  /** Height in px. Width is fluid (100% of the container). */
  height?: number | string;
  /** `mono` (default) uses the monochrome chart line; `trend` colours by direction; or force `positive` / `negative`. */
  tone?: 'mono' | 'trend' | 'positive' | 'negative';
  /** Highlight band (vertical gradient) between two points, as fractions 0–1 of the series. `true` = [0.62, 0.86]. */
  band?: boolean | [number, number];
  /** Ring markers at the band edges. Default = same as `band`. */
  markers?: boolean;
  /** Dashed baseline across the chart. */
  baseline?: boolean;
  /** Draw the line in on mount (1.6s). Respects reduced motion. */
  animate?: boolean;
  /** Accessible description. Defaults to an auto summary; set `decorative` to hide it when the numbers are shown nearby. */
  summary?: string;
  decorative?: boolean;
  /** Number of decimals in the auto summary. */
  decimals?: number;
}

/**
 * Lightweight monochrome sparkline (custom SVG, no chart library). Line fades in from the left; an optional highlight band
 * and ring markers match the Graphite style. Markers are HTML so they stay perfectly round at any size.
 */
export function Sparkline({ data, height = 62, tone = 'mono', band = false, markers, baseline, animate = true, summary, decorative, decimals = 2, className, style, ...rest }: SparklineProps) {
  const id = useId().replace(/:/g, '');
  const { locale } = useTheme();
  const W = 260, H = 62, P = 6;
  const pts = useMemo(() => toPoints(data, W, H, P), [data]);
  const d = useMemo(() => smoothPath(pts), [pts]);
  const bandRange: [number, number] | null = band ? (Array.isArray(band) ? band : [0.62, 0.86]) : null;
  const ia = bandRange ? Math.min(pts.length - 1, Math.floor(data.length * bandRange[0])) : 0;
  const ib = bandRange ? Math.min(pts.length - 1, Math.floor(data.length * bandRange[1])) : 0;
  const showMarkers = markers ?? !!bandRange;
  const path = useRef<SVGPathElement>(null);
  useDrawIn(path, animate);
  const t = tone === 'trend' ? ((data.at(-1) ?? 0) >= (data[0] ?? 0) ? 'positive' : 'negative') : tone;
  const stroke = t === 'positive' ? 'var(--dv-positive)' : t === 'negative' ? 'var(--dv-negative)' : 'var(--dv-chart-line)';
  const text = summary ?? summarize(data, (n) => formatNumber(n, { decimals, locale }), 'Sparkline');
  const dot = (p: [number, number]) => (
    <i className="dv-dot" style={{ left: `${(p[0] / W) * 100}%`, top: `${(p[1] / H) * 100}%` }} />
  );
  return (
    <div className={cn('dv-spark', className)} style={{ height, ...style }} {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': text })} {...rest}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--dv-chart-line)', stopOpacity: 0.1 }} />
            <stop offset="1" style={{ stopColor: 'var(--dv-chart-line)', stopOpacity: 0 }} />
          </linearGradient>
          <linearGradient id={`f${id}`} x1="0" x2="1">
            <stop offset="0" style={{ stopColor: stroke, stopOpacity: 0.15 }} />
            <stop offset=".25" style={{ stopColor: stroke, stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        {baseline !== false && <line x1="0" x2={W} y1={H * 0.62} y2={H * 0.62} stroke="var(--dv-chart-grid)" strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />}
        {bandRange && <rect x={pts[ia]![0]} y="0" width={pts[ib]![0] - pts[ia]![0]} height={H} rx="6" fill={`url(#b${id})`} />}
        <path ref={path} d={d} fill="none" stroke={`url(#f${id})`} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </svg>
      {showMarkers && bandRange && <>{dot(pts[ia]!)}{dot(pts[ib]!)}</>}
    </div>
  );
}
