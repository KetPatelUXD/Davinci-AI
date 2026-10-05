'use client';
import { useEffect, useState, type HTMLAttributes } from 'react';
import { usePrefersReducedMotion } from '../../utils/hooks';
import { cn } from '../../utils/cn';

export interface StreamingTextProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The text so far (from a real stream), or the full text when `simulate` is on. */
  text: string;
  /** True while more text may arrive – shows the cursor. */
  isStreaming?: boolean;
  /** Reveal `text` progressively on mount (demos, replay). Instant under reduced motion. */
  simulate?: boolean;
  /** Characters per frame when simulating. */
  speed?: number;
}

/**
 * Progressive text with a cursor. The cursor blinks only without `prefers-reduced-motion`. Wrap in a container that is
 * **not** a live region – announce completion once with `ChatThread announcement` instead.
 */
export function StreamingText({ text, isStreaming, simulate, speed = 2, className, ...rest }: StreamingTextProps) {
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(simulate && !reduced ? 0 : text.length);
  useEffect(() => {
    if (!simulate || reduced) { setN(text.length); return; }
    let raf = 0;
    const tick = () => { setN((c) => Math.min(text.length, c + speed)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [simulate, reduced, text, speed]);
  const shown = simulate ? text.slice(0, n) : text;
  const live = isStreaming || (simulate && n < text.length);
  return (
    <span className={cn('dv-streaming-text', className)} {...rest}>
      {shown}
      {live && <span className="dv-streaming-text__cursor" aria-hidden="true" />}
    </span>
  );
}
