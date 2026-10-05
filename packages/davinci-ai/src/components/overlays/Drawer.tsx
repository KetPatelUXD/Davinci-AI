'use client';
import type { ReactNode } from 'react';
import { Dialog as RACDialog, DialogTrigger, Heading, Modal, ModalOverlay, type ModalOverlayProps } from 'react-aria-components';
import { IconButton } from '../actions/IconButton';
import { useThemeAttributes } from '../../foundations/ThemeProvider';
import { cn } from '../../utils/cn';

export interface DrawerProps extends Pick<ModalOverlayProps, 'isOpen' | 'defaultOpen' | 'onOpenChange' | 'isDismissable'> {
  trigger?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  side?: 'right' | 'left' | 'bottom';
  /** Panel width (left/right) or height (bottom) in px. */
  size?: number;
  className?: string;
}

/** Edge-anchored panel for detail or secondary workflows (slides in; instant under reduced motion). Also exported as `Sheet`. */
export function Drawer({ trigger, title, children, footer, side = 'right', size = 420, isDismissable = true, className, ...rest }: DrawerProps) {
  const { className: root, ...attrs } = useThemeAttributes();
  const modal = (
    <ModalOverlay {...rest} isDismissable={isDismissable} {...attrs} className={cn(root, 'dv-overlay')} data-side={side}>
      <Modal className={cn('dv-drawer dv-glass', className)} data-side={side} style={{ ['--dv-drawer-size' as string]: `${size}px` }}>
        <RACDialog className="dv-dialog" data-variant="drawer">
          {({ close }) => (
            <>
              <header className="dv-dialog__header">
                <Heading slot="title" className="dv-dialog__title">{title}</Heading>
                <IconButton label="Close panel" icon="xmark" variant="ghost" size="sm" onPress={close} />
              </header>
              <div className="dv-dialog__body" data-grow>{children}</div>
              {footer && <footer className="dv-dialog__footer">{footer}</footer>}
            </>
          )}
        </RACDialog>
      </Modal>
    </ModalOverlay>
  );
  return trigger ? <DialogTrigger>{trigger}{modal}</DialogTrigger> : modal;
}
export const Sheet = Drawer;
