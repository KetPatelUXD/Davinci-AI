'use client';
import { forwardRef } from 'react';
import { Button as RACButton, type ButtonProps as RACButtonProps } from 'react-aria-components';
import { renderIcon, type IconRef } from '../../foundations/Icon';
import { cn } from '../../utils/cn';

export interface IconButtonProps extends Omit<RACButtonProps, 'children' | 'className' | 'aria-label'> {
  /** Accessible name – **required**. Describes the action ("Refresh"), not the icon ("Arrow"). */
  label: string;
  /** Icon: kebab-case name, Font Awesome definition or `<Icon />`. */
  icon: IconRef;
  /** `subtle` panel circle (default) · `ghost` no fill · `solid` neutral `on` circle (e.g. send). */
  variant?: 'subtle' | 'ghost' | 'solid';
  /** sm 30 · md 38 · lg 42 px (compact 24 / 32 / 36). */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Circular icon-only button. The accessible `label` is enforced by TypeScript. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, variant = 'subtle', size = 'md', className, ...rest },
  ref,
) {
  return (
    <RACButton ref={ref} {...rest} aria-label={label} data-variant={variant} data-size={size} className={cn('dv-iconbtn', className)}>
      {renderIcon(icon)}
    </RACButton>
  );
});
