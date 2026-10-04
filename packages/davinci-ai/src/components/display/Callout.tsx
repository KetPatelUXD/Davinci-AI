import type { HTMLAttributes, ReactNode } from 'react';
import { Icon } from '../../foundations/Icon';
import { cn } from '../../utils/cn';
import type { Tone } from './Badge';

const ICONS: Record<Tone, string> = { neutral: 'circle-info', brand: 'sparkles', positive: 'circle-check', negative: 'circle-xmark', warning: 'triangle-exclamation', info: 'circle-info' };

export interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: Tone;
  title?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}

/** Static, in-flow message block. Use `Alert`/`Banner` for page-level alerts and `Toast` for transient feedback. */
export function Callout({ tone = 'info', title, action, className, children, ...rest }: CalloutProps) {
  return (
    <div role="note" className={cn('dv-callout', className)} data-tone={tone} {...rest}>
      <Icon name={ICONS[tone]} size={16} className="dv-callout__icon" />
      <div className="dv-callout__body">
        {title && <p className="dv-callout__title">{title}</p>}
        {children && <div className="dv-callout__text">{children}</div>}
      </div>
      {action}
    </div>
  );
}
