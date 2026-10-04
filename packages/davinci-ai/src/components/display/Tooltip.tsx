'use client';
import type { ReactNode } from 'react';
import { OverlayArrow, Tooltip as RACTooltip, TooltipTrigger, type TooltipProps as RACTooltipProps } from 'react-aria-components';
import { useThemeAttributes } from '../../foundations/ThemeProvider';
import { cn } from '../../utils/cn';

export interface TooltipProps extends Omit<RACTooltipProps, 'children' | 'className'> {
  /** Short text only (≤ 80 chars). Don't put essential or interactive content here. */
  content: ReactNode;
  /** The focusable trigger. Tooltips show on hover **and** keyboard focus and dismiss with Esc. */
  children: ReactNode;
  delay?: number;
  closeDelay?: number;
  className?: string;
}

/** Brief, non-interactive description for a control. Not a substitute for a visible label. */
export function Tooltip({ content, children, delay = 300, closeDelay = 100, className, placement = 'top', ...rest }: TooltipProps) {
  const { className: root, ...attrs } = useThemeAttributes();
  return (
    <TooltipTrigger delay={delay} closeDelay={closeDelay}>
      {children}
      <RACTooltip {...rest} {...attrs} placement={placement} offset={8} className={cn(root, 'dv-tooltip', className)}>
        {content}
      </RACTooltip>
    </TooltipTrigger>
  );
}
export { OverlayArrow };
