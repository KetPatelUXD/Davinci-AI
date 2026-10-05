'use client';
import { useCallback, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { IconButton } from '../actions/IconButton';
import { cn } from '../../utils/cn';

export interface ChatThreadProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Required: names the conversation log. */
  'aria-label': string;
  children: ReactNode;
  /** True while a reply streams: keeps the view pinned to the latest text if the user is already at the bottom. */
  isStreaming?: boolean;
  /**
   * Short text announced politely once (e.g. "LEO replied") – set it when a message **completes**.
   * The streamed text itself is never announced token by token.
   */
  announcement?: string;
}

/**
 * Scrolling conversation in a centred readable column (720px). Auto-follows new content only when the reader is at
 * the bottom; otherwise a "Scroll to latest" button appears. Not a live region – see `announcement`.
 */
export function ChatThread({ children, isStreaming, announcement, className, ...rest }: ChatThreadProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const stick = useRef(true);
  const toBottom = useCallback((smooth = false) => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
  }, []);
  useEffect(() => {
    const el = scroller.current, content = inner.current;
    if (!el || !content) return;
    const ro = new ResizeObserver(() => { if (stick.current) toBottom(); });
    ro.observe(content);
    return () => ro.disconnect();
  }, [toBottom]);
  return (
    <div className={cn('dv-chat-thread', className)} data-streaming={isStreaming || undefined}>
      <div
        ref={scroller}
        role="log"
        aria-live="off"
        tabIndex={0}
        className="dv-chat-thread__scroll"
        {...rest}
        onScroll={(e) => {
          const el = e.currentTarget;
          const near = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
          stick.current = near;
          setAtBottom(near);
        }}
      >
        <div ref={inner} className="dv-chat-thread__column">{children}</div>
      </div>
      {!atBottom && (
        <IconButton label="Scroll to latest message" icon="arrow-down" size="md" className="dv-chat-thread__scroll-down" onPress={() => { stick.current = true; toBottom(true); }} />
      )}
      <div className="dv:sr-only" role="status" aria-live="polite">{announcement}</div>
    </div>
  );
}
