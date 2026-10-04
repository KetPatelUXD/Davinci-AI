'use client';
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

export type Pt = [number, number];

/** Catmull-Rom → cubic Bézier smoothing (same curve as the Graphite reference). */
export function smoothPath(p: Pt[]): string {
  if (!p.length) return '';
  let d = `M${p[0]![0]},${p[0]![1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] ?? p[i]!, b = p[i]!, c = p[i + 1]!, e = p[i + 2] ?? c;
    d += `C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)},${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)},${(c[1] - (e[1] - b[1]) / 6).toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)}`;
  }
  return d;
}

export const toPoints = (vals: number[], w: number, h: number, pad: number): Pt[] => {
  const mn = Math.min(...vals), mx = Math.max(...vals);
  return vals.map((v, i) => [(i / Math.max(1, vals.length - 1)) * w, h - pad - ((v - mn) / (mx - mn || 1)) * (h - 2 * pad)]);
};

const useIso = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Draws a path in (stroke-dashoffset) once on mount. No-op under reduced motion or when disabled. */
export function useDrawIn(ref: RefObject<SVGPathElement | null>, enabled: boolean, duration = 1600) {
  const done = useRef(false);
  useIso(() => {
    const el = ref.current;
    if (!el || !enabled || done.current || typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    done.current = true;
    const len = el.getTotalLength?.() ?? 0;
    if (!len) return;
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
    el.getBoundingClientRect();
    el.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(.3,.7,.3,1)`;
    el.style.strokeDashoffset = '0';
    const t = setTimeout(() => { el.style.strokeDasharray = ''; el.style.transition = ''; }, duration + 50);
    return () => clearTimeout(t);
  }, [ref, enabled, duration]);
}

/** Textual summary used by charts for assistive technology. */
export function summarize(vals: number[], fmt: (n: number) => string, noun = 'series'): string {
  if (!vals.length) return `Empty ${noun}`;
  const first = vals[0]!, last = vals[vals.length - 1]!;
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const pct = first ? ((last - first) / Math.abs(first)) * 100 : 0;
  return `${noun}, ${vals.length} points. Started at ${fmt(first)}, ended at ${fmt(last)}, ${pct >= 0 ? 'up' : 'down'} ${Math.abs(pct).toFixed(2)} percent. Low ${fmt(mn)}, high ${fmt(mx)}.`;
}
