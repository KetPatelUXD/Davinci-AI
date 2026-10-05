import type { HTMLAttributes, ReactNode } from 'react';
import { renderIcon, type IconRef } from '../../foundations/Icon';
import { cn } from '../../utils/cn';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: IconRef;
  title: ReactNode;
  description?: ReactNode;
  /** Primary next step (a Button). */
  action?: ReactNode;
}

/** Zero-data state: explain what is missing and offer the next step. */
export function EmptyState({ icon = 'magnifying-glass', title, description, action, className, ...rest }: EmptyStateProps) {
  return (
    <div className={cn('dv-empty-state', className)} {...rest}>
      <span className="dv-empty-state__icon-well">{renderIcon(icon, 20)}</span>
      <p className="dv-empty-state__title">{title}</p>
      {description && <p className="dv-empty-state__description">{description}</p>}
      {action}
    </div>
  );
}
