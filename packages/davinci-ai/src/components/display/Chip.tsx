'use client';
import type { HTMLAttributes, ReactNode } from 'react';
import { renderIcon, type IconRef } from '../../foundations/Icon';
import { IconButton } from '../actions/IconButton';
import { cn } from '../../utils/cn';

export interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> {
  icon?: IconRef;
  /** When set, shows a remove button labelled "Remove {label}". */
  onRemove?: () => void;
  /** Text used to name the remove button when children aren't plain text. */
  removeLabel?: string;
  children: ReactNode;
}

/** Removable tag / filter chip. For *selectable* chips inside a group use `FilterBar`. */
export function Chip({ icon, onRemove, removeLabel, className, children, ...rest }: ChipProps) {
  return (
    <span className={cn('dv-chip', className)} {...rest}>
      {renderIcon(icon, 12)}
      <span>{children}</span>
      {onRemove && <IconButton label={removeLabel ?? `Remove ${typeof children === 'string' ? children : 'item'}`} icon="xmark" variant="ghost" size="sm" className="dv-chip__x" onPress={onRemove} />}
    </span>
  );
}
export const Tag = Chip;
export type TagProps = ChipProps;
