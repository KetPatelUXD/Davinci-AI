'use client';
import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from '../../foundations/Icon';
import { IconButton } from '../actions/IconButton';
import { cn } from '../../utils/cn';
import type { Tone } from '../display/Badge';

const ICONS: Record<Tone, string> = { neutral: 'circle-info', brand: 'sparkles', positive: 'circle-check', negative: 'circle-xmark', warning: 'triangle-exclamation', info: 'circle-info' };

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  intent?: Tone;
  title?: ReactNode;
  action?: ReactNode;
  /** Show a dismiss button. */
  onDismiss?: () => void;
  children?: ReactNode;
}

/**
 * Inline alert for something that needs attention *now* – `role="alert"` (assertive) for negative/warning,
 * `role="status"` (polite) otherwise. Don't use for static info (`Callout`).
 */
export function Alert({ intent = 'info', title, action, onDismiss, className, children, ...rest }: AlertProps) {
  const urgent = intent === 'negative' || intent === 'warning';
  return (
    <div role={urgent ? 'alert' : 'status'} className={cn('dv-alert dv-callout', className)} data-intent={intent} {...rest}>
      <Icon name={ICONS[intent]} size={16} className="dv-callout__icon" />
      <div className="dv-callout__body">
        {title && <p className="dv-callout__title">{title}</p>}
        {children && <div className="dv-callout__text">{children}</div>}
      </div>
      {action}
      {onDismiss && <IconButton label="Dismiss alert" icon="xmark" variant="ghost" size="sm" onPress={onDismiss} />}
    </div>
  );
}

export interface BannerProps extends Omit<AlertProps, 'onDismiss'> {
  /** Makes the banner dismissible and hides it on dismiss. */
  dismissible?: boolean;
}

/** Full-width strip at the top of a page or card (maintenance, delayed data). Polite `role="status"`. */
export function Banner({ intent = 'info', title, action, dismissible, className, children, ...rest }: BannerProps) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div role="status" className={cn('dv-banner', className)} data-intent={intent} {...rest}>
      <Icon name={ICONS[intent]} size={16} />
      <p className="dv-banner__text">{title && <b>{title} </b>}{children}</p>
      {action}
      {dismissible && <IconButton label="Dismiss banner" icon="xmark" variant="ghost" size="sm" onPress={() => setOpen(false)} />}
    </div>
  );
}

export interface InlineMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  intent?: Tone;
  children: ReactNode;
}

/** One-line icon + text message next to a control or inside a form. */
export function InlineMessage({ intent = 'neutral', className, children, ...rest }: InlineMessageProps) {
  return (
    <p className={cn('dv-inline-message', className)} data-intent={intent} {...rest}>
      <Icon name={ICONS[intent]} size={14} />
      <span>{children}</span>
    </p>
  );
}
