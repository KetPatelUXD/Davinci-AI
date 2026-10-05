'use client';
import type { ReactNode } from 'react';
import { Dialog as RACDialog, DialogTrigger, Heading, Modal, ModalOverlay, type ModalOverlayProps } from 'react-aria-components';
import { IconButton } from '../actions/IconButton';
import { Button } from '../actions/Button';
import { useThemeAttributes } from '../../foundations/ThemeProvider';
import { cn } from '../../utils/cn';

export interface DialogProps extends Pick<ModalOverlayProps, 'isOpen' | 'defaultOpen' | 'onOpenChange' | 'isDismissable' | 'isKeyboardDismissDisabled'> {
  /** Optional trigger (a `Button`). Omit for controlled usage via `isOpen`. */
  trigger?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Buttons, right-aligned. Put the primary action last. */
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** `alertdialog` for destructive confirmations (cannot be dismissed by clicking outside). */
  role?: 'dialog' | 'alertdialog';
  className?: string;
}

/**
 * Modal dialog: focus is trapped and restored, Esc closes, the page behind is inert. Radius 26, glass surface.
 * @when A decision or short task that must be completed before continuing. @whenNot Supplementary info (use `Popover`/`Drawer`).
 */
export function Dialog({ trigger, title, description, children, footer, size = 'md', role = 'dialog', isDismissable = true, className, ...rest }: DialogProps) {
  const { className: root, ...attrs } = useThemeAttributes();
  const modal = (
    <ModalOverlay {...rest} isDismissable={role === 'dialog' && isDismissable} {...attrs} className={cn(root, 'dv-overlay')}>
      <Modal className={cn('dv-dialog__modal dv-glass', className)} data-size={size}>
        <RACDialog role={role} className="dv-dialog">
          {({ close }) => (
            <>
              <header className="dv-dialog__header">
                <Heading slot="title" className="dv-dialog__title">{title}</Heading>
                {role === 'dialog' && <IconButton label="Close dialog" icon="xmark" variant="ghost" size="sm" onPress={close} />}
              </header>
              {description && <p className="dv-dialog__description">{description}</p>}
              {children && <div className="dv-dialog__body">{children}</div>}
              {footer && <footer className="dv-dialog__footer">{footer}</footer>}
            </>
          )}
        </RACDialog>
      </Modal>
    </ModalOverlay>
  );
  return trigger ? <DialogTrigger>{trigger}{modal}</DialogTrigger> : modal;
}

export interface ConfirmDialogProps extends Pick<DialogProps, 'isOpen' | 'onOpenChange' | 'trigger' | 'title' | 'description' | 'children'> {
  confirmLabel?: string;
  cancelLabel?: string;
  /** `destructive` renders a negative confirm button and uses `alertdialog`. */
  intent?: 'primary' | 'destructive';
  onConfirm: () => void;
  onCancel?: () => void;
}

/** Yes/no confirmation. Default focus lands on Cancel for destructive actions. */
export function ConfirmDialog({ confirmLabel = 'Confirm', cancelLabel = 'Cancel', intent = 'primary', onConfirm, onCancel, onOpenChange, ...rest }: ConfirmDialogProps) {
  const destructive = intent === 'destructive';
  return (
    <Dialog
      {...rest}
      onOpenChange={onOpenChange}
      size="sm"
      role={destructive ? 'alertdialog' : 'dialog'}
      footer={
        <>
          <Button variant="subtle" autoFocus={destructive} slot="close" onPress={onCancel}>{cancelLabel}</Button>
          <Button intent={destructive ? 'destructive' : 'primary'} slot="close" onPress={onConfirm}>{confirmLabel}</Button>
        </>
      }
    />
  );
}
