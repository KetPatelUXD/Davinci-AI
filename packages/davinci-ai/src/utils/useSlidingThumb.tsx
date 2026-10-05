'use client';
import { useLayoutEffect, useEffect, useState, type RefObject } from 'react';
import { motion } from 'motion/react';

const useIso = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Tracks the selected option inside a pill track and returns the left/width for the sliding `on` thumb.
 * `ready` flips true after the first measurement so the initial paint doesn't animate.
 */
export function useSlidingThumb(ref: RefObject<HTMLElement | null>, selectedKey: unknown, selector = '[data-selected="true"], [aria-checked="true"], [aria-selected="true"]') {
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);
  const [ready, setReady] = useState(false);
  useIso(() => {
    const root = ref.current;
    if (!root) return;
    const measure = () => {
      const el = root.querySelector<HTMLElement>(selector);
      if (el) setBox({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    const id = requestAnimationFrame(() => setReady(true));
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    root.querySelectorAll('*').forEach((c) => c instanceof HTMLElement && ro.observe(c));
    document.fonts?.ready.then(measure);
    const mo = new MutationObserver(measure);
    mo.observe(root, { subtree: true, attributes: true, attributeFilter: ['data-selected', 'aria-checked', 'aria-selected'] });
    return () => { cancelAnimationFrame(id); ro.disconnect(); mo.disconnect(); };
  }, [ref, selectedKey, selector]);
  return { box, ready };
}

/** The white `on` thumb. Slides between options with Motion (instant on first paint and under reduced motion). */
export function SlidingThumb({ box, ready }: { box: { left: number; width: number } | null; ready: boolean }) {
  return (
    <motion.span
      className="dv-segmented-control__thumb"
      aria-hidden="true"
      initial={false}
      animate={box ? { left: box.left, width: box.width, opacity: 1 } : { opacity: 0 }}
      transition={ready ? { duration: 0.3, ease: [0.3, 0.7, 0.3, 1] } : { duration: 0 }}
    />
  );
}
