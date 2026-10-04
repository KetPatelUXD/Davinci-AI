'use client';
import { forwardRef, type ReactNode } from 'react';
import { Button as RACButton, type ButtonProps as RACButtonProps } from 'react-aria-components';
import { renderIcon, type IconRef } from '../../foundations/Icon';
import { Spinner } from '../display/Spinner';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'solid' | 'subtle' | 'ghost';
export type ButtonIntent = 'primary' | 'brand' | 'positive' | 'negative' | 'destructive' | 'neutral';
export type ControlSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<RACButtonProps, 'children' | 'className' | 'isPending'> {
  /**
   * `solid` filled · `subtle` quiet panel fill with a hairline (e.g. "Filters") · `ghost` text only.
   * @default 'solid'
   */
  variant?: ButtonVariant;
  /**
   * Colour meaning. `primary` is the neutral `on` fill (white in dark, ink in light) – the default call to action.
   * `brand` violet · `positive` Buy/Long · `negative` Sell/Short · `destructive` irreversible actions.
   * Subtle/ghost buttons default to `neutral`.
   */
  intent?: ButtonIntent;
  /** @default 'md' (38px comfortable / 32px compact). `xl` is the primary CTA, e.g. "Place buy order". */
  size?: ControlSize;
  /** Shows a spinner, keeps focus, and blocks presses (`aria-busy`). */
  isLoading?: boolean;
  /** Icon before the label: kebab-case name, Font Awesome definition or `<Icon />`. */
  iconStart?: IconRef;
  /** Icon after the label. */
  iconEnd?: IconRef;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Pill button.
 * @when Any action. Use one `solid primary` per view; `subtle` for secondary tools; `ghost` for tertiary.
 * @whenNot Navigation to another page (use `Link`) or icon-only actions (use `IconButton`, which requires a label).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'solid', intent, size = 'md', isLoading, iconStart, iconEnd, fullWidth, className, children, ...rest },
  ref,
) {
  const resolvedIntent = intent ?? (variant === 'solid' ? 'primary' : 'neutral');
  return (
    <RACButton
      ref={ref}
      {...rest}
      isPending={isLoading}
      data-variant={variant}
      data-intent={resolvedIntent}
      data-size={size}
      data-full={fullWidth || undefined}
      className={cn('dv-btn', className)}
    >
      {({ isPending }) => (
        <>
          {isPending ? <Spinner size="sm" /> : renderIcon(iconStart)}
          {children != null && <span className="dv-btn__label">{children}</span>}
          {!isPending && renderIcon(iconEnd)}
        </>
      )}
    </RACButton>
  );
});
