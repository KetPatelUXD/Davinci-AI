'use client';
import { useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface SplitPaneProps {
  /** Two children: [first pane, second pane]. */
  children: [ReactNode, ReactNode];
  orientation?: 'horizontal' | 'vertical';
  /** Initial size of the first pane in percent. */
  defaultSize?: number;
  /** Controlled size of the first pane in percent. */
  size?: number;
  onSizeChange?: (percent: number) => void;
  min?: number;
  max?: number;
  /** Accessible name of the divider ("Resize sidebar"). */
  'aria-label'?: string;
  className?: string;
}

/** Resizable two-pane layout. The divider is a keyboard-operable `separator` (←/→ or ↑/↓ by 2%, PageUp/Down by 10%, Home/End). */
export function SplitPane({ children, orientation = 'horizontal', defaultSize = 50, size, onSizeChange, min = 15, max = 85, 'aria-label': label = 'Resize panes', className }: SplitPaneProps) {
  const [own, setOwn] = useState(defaultSize);
  const value = size ?? own;
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const set = (v: number) => { const c = Math.min(max, Math.max(min, v)); setOwn(c); onSizeChange?.(c); };
  const horizontal = orientation === 'horizontal';
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const move = (ev: globalThis.PointerEvent) => {
      const r = root.current!.getBoundingClientRect();
      set(horizontal ? ((ev.clientX - r.left) / r.width) * 100 : ((ev.clientY - r.top) / r.height) * 100);
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const dec = horizontal ? 'ArrowLeft' : 'ArrowUp', inc = horizontal ? 'ArrowRight' : 'ArrowDown';
    const map: Record<string, number | undefined> = { [dec]: value - 2, [inc]: value + 2, PageUp: value + 10, PageDown: value - 10, Home: min, End: max };
    if (map[e.key] !== undefined) { e.preventDefault(); set(map[e.key]!); }
  };
  return (
    <div ref={root} className={cn('dv-split-pane', className)} data-orientation={orientation} style={{ ['--dv-split' as string]: `${value}%` }}>
      <div id={id} className="dv-split-pane__pane" data-pane="a">{children[0]}</div>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- focusable separator is a WAI-ARIA window-splitter widget */}
      <div
        role="separator"
        tabIndex={0}
        aria-label={label}
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-controls={id}
        aria-valuenow={Math.round(value)}
        aria-valuemin={min}
        aria-valuemax={max}
        className="dv-split-pane__handle"
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
      />
      <div className="dv-split-pane__pane" data-pane="b">{children[1]}</div>
    </div>
  );
}
