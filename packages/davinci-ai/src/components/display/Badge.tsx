import type { HTMLAttributes, ReactNode } from 'react';
import { renderIcon, type IconRef } from '../../foundations/Icon';
import { cn } from '../../utils/cn';

export type Tone = 'neutral' | 'brand' | 'positive' | 'negative' | 'warning' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Colour meaning. Always keep a text label – colour never carries the meaning alone. */
  tone?: Tone;
  /** `subtle` wash (default) · `solid` filled · `outline` hairline. */
  variant?: 'subtle' | 'solid' | 'outline';
  size?: 'sm' | 'md';
  /** Small status dot before the label. */
  dot?: boolean;
  icon?: IconRef;
  children: ReactNode;
}

/** Compact status or count label. Not interactive. */
export function Badge({ tone = 'neutral', variant = 'subtle', size = 'md', dot, icon, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cn('dv-badge', className)} data-tone={tone} data-variant={variant} data-size={size} {...rest}>
      {dot && <i className="dv-badge__dot" aria-hidden="true" />}
      {renderIcon(icon, 12)}
      {children}
    </span>
  );
}
