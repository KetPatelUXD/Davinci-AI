'use client';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { UNSTABLE_Toast as Toast, UNSTABLE_ToastQueue as ToastQueue, UNSTABLE_ToastRegion as ToastRegion, Button as RACButton, Text } from 'react-aria-components';
import { Icon } from '../../foundations/Icon';
import { useThemeAttributes } from '../../foundations/ThemeProvider';
import type { Tone } from '../display/Badge';

export interface ToastOptions {
  title: string;
  description?: string;
  intent?: Tone;
  /** ms before auto-dismiss. Default 5000; `0` keeps it until dismissed. Errors should use 0 or ≥ 8000. */
  timeout?: number;
  /** Optional action rendered as a link-like button. */
  action?: { label: string; onPress: () => void };
}

type ToastContentValue = ToastOptions;
const ICONS: Record<Tone, string> = { neutral: 'circle-info', brand: 'sparkles', positive: 'circle-check', negative: 'circle-xmark', warning: 'triangle-exclamation', info: 'circle-info' };

const ToastCtx = createContext<{ show: (o: ToastOptions) => string } | null>(null);

/** Returns `{ show }` to raise a toast. Requires `<ToastProvider>` above. */
export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

/**
 * Toast queue + region. The region is a polite live region so a toast is announced once, without stealing focus.
 * Pauses on hover/focus; every toast has a dismiss button.
 */
export function ToastProvider({ children, placement = 'bottom-end' }: { children: ReactNode; placement?: 'bottom-end' | 'bottom' | 'top-end' }) {
  const queue = useMemo(() => new ToastQueue<ToastContentValue>({ maxVisibleToasts: 4 }), []);
  const [announcement, setAnnouncement] = useState('');
  const value = useMemo(
    () => ({
      show: (o: ToastOptions) => {
        // A persistent polite live region announces the toast once (inserted live regions are unreliable across screen readers).
        setAnnouncement('');
        requestAnimationFrame(() => setAnnouncement(o.description ? `${o.title}. ${o.description}` : o.title));
        return queue.add(o, { timeout: o.timeout === 0 ? undefined : (o.timeout ?? 5000) });
      },
    }),
    [queue],
  );
  const { className: root, ...attrs } = useThemeAttributes();
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="dv:sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
      <ToastRegion queue={queue} {...attrs} className={`${root} dv-toast-provider__region`} data-placement={placement}>
        {({ toast }) => (
          <Toast toast={toast} className="dv-toast-provider__toast dv-glass" data-intent={toast.content.intent ?? 'neutral'}>
            <Icon name={ICONS[toast.content.intent ?? 'neutral']} size={18} className="dv-toast-provider__toast-icon" />
            <div className="dv-toast-provider__toast-content">
              <Text slot="title" className="dv-toast-provider__toast-title">{toast.content.title}</Text>
              {toast.content.description && <Text slot="description" className="dv-toast-provider__toast-description">{toast.content.description}</Text>}
            </div>
            {toast.content.action && <RACButton className="dv-toast-provider__toast-action" onPress={() => { toast.content.action!.onPress(); queue.close(toast.key); }}>{toast.content.action.label}</RACButton>}
            <RACButton slot="close" className="dv-icon-button" data-variant="ghost" data-size="sm" aria-label="Dismiss notification"><Icon name="xmark" size={14} /></RACButton>
          </Toast>
        )}
      </ToastRegion>
    </ToastCtx.Provider>
  );
}
