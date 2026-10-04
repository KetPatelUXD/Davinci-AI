'use client';
import type { ReactNode } from 'react';
import { DialogTrigger, Popover as RACPopover, Dialog, OverlayArrow, type PopoverProps as RACPopoverProps } from 'react-aria-components';
import { useThemeAttributes } from '../../foundations/ThemeProvider';
import { cn } from '../../utils/cn';

export interface ThemedPopoverProps extends Omit<RACPopoverProps, 'className' | 'children'> {
  className?: string;
  children: ReactNode;
  /** Match the trigger's width (Select, ComboBox). */
  matchTriggerWidth?: boolean;
}

/**
 * Low-level floating surface used by Select, Menu, ComboBox, DatePicker and Popover. Carries the theme to the portal,
 * uses glass by default, and fades/scales in (opacity only under reduced motion).
 */
export function ThemedPopover({ className, children, matchTriggerWidth, ...rest }: ThemedPopoverProps) {
  const { className: root, ...attrs } = useThemeAttributes();
  return (
    <RACPopover {...rest} {...attrs} data-match-width={matchTriggerWidth || undefined} className={cn(root, 'dv-popover dv-glass', className)}>
      {children}
    </RACPopover>
  );
}

export interface PopoverProps {
  /** The element that opens the popover – a `Button`/`IconButton` (must be a single pressable child). */
  trigger: ReactNode;
  /** Accessible name of the popover dialog. */
  'aria-label': string;
  children: ReactNode;
  placement?: RACPopoverProps['placement'];
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Show a small arrow pointing at the trigger. */
  arrow?: boolean;
  className?: string;
}

/** Non-modal floating panel for supplementary content (progressive disclosure). Esc / outside click closes; focus is managed. */
export function Popover({ trigger, children, placement = 'bottom', arrow, className, isOpen, defaultOpen, onOpenChange, 'aria-label': ariaLabel }: PopoverProps) {
  return (
    <DialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger}
      <ThemedPopover placement={placement} className={className}>
        {arrow && (<OverlayArrow className="dv-popover__arrow"><svg width="12" height="6" viewBox="0 0 12 6" aria-hidden="true"><path d="M0 0l6 6 6-6z" fill="currentColor" /></svg></OverlayArrow>)}
        <Dialog aria-label={ariaLabel} className="dv-popover__dialog">{children}</Dialog>
      </ThemedPopover>
    </DialogTrigger>
  );
}
