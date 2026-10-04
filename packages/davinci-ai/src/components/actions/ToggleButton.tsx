'use client';
import { forwardRef, type ReactNode } from 'react';
import { ToggleButton as RACToggleButton, type ToggleButtonProps as RACToggleButtonProps } from 'react-aria-components';
import { renderIcon, type IconRef } from '../../foundations/Icon';
import { cn } from '../../utils/cn';
import type { ControlSize } from './Button';

export interface ToggleButtonProps extends Omit<RACToggleButtonProps, 'className' | 'children'> {
  size?: ControlSize;
  iconStart?: IconRef;
  className?: string;
  children?: ReactNode;
}

/** Pill that toggles on/off (`aria-pressed`). Selected state uses the white/ink `on` fill. */
export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton({ size = 'md', iconStart, className, children, ...rest }, ref) {
  return (
    <RACToggleButton ref={ref} {...rest} data-size={size} data-variant="subtle" className={cn('dv-btn dv-togglebtn', className)}>
      {renderIcon(iconStart)}
      {children != null && <span className="dv-btn__label">{children}</span>}
    </RACToggleButton>
  );
});
