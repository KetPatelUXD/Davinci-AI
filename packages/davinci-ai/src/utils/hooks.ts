'use client';
import { animate } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';

const isBrowser = typeof window !== 'undefined';
const useIso = isBrowser ? useLayoutEffect : useEffect;

/** True when the user asked for reduced motion. SSR-safe (false on the server). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (!isBrowser) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

/**
 * Cursor spotlight: writes `--mx` / `--my` (px, relative to the element) so `.dv-card` can light its edge near the pointer.
 * Keyboard focus moves the light to the focused element so `:focus-within` is visible too.
 */
export function useSpotlight<T extends HTMLElement = HTMLElement>(ref?: RefObject<T | null>) {
  const own = useRef<T | null>(null);
  const target = ref ?? own;
  const onPointerMove = useCallback((e: PointerEvent<T>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, []);
  const onFocus = useCallback((e: React.FocusEvent<T>) => {
    const el = e.currentTarget;
    const t = e.target as HTMLElement;
    if (!t.matches?.(':focus-visible')) return;
    const r = el.getBoundingClientRect();
    const tr = t.getBoundingClientRect();
    el.style.setProperty('--mx', `${tr.left - r.left + tr.width / 2}px`);
    el.style.setProperty('--my', `${tr.top - r.top + tr.height / 2}px`);
  }, []);
  return { ref: target, onPointerMove, onFocus };
}

/** Animates a number from 0 to `value` (ease-out, `duration` ms) with Motion. Instant under reduced motion; renders the final value on the server. */
export function useCountUp(value: number, { duration = 1200, enabled = true }: { duration?: number; enabled?: boolean } = {}): number {
  const [n, setN] = useState(value);
  const first = useRef(true);
  useIso(() => {
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!enabled || reduced || !first.current) { setN(value); first.current = false; return; }
    first.current = false;
    setN(0);
    const controls = animate(0, value, { duration: duration / 1000, ease: [0.215, 0.61, 0.355, 1], onUpdate: setN });
    return () => controls.stop();
  }, [value, duration, enabled]);
  return n;
}

/** Measures an element's width/height (ResizeObserver). */
export function useElementSize<T extends HTMLElement>(): [RefObject<T | null>, { width: number; height: number }] {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ width: el.offsetWidth, height: el.offsetHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}
