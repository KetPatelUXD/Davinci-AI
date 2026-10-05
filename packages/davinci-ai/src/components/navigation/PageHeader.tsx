import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned actions: Filters, date range, primary button, refresh. */
  actions?: ReactNode;
  /** Breadcrumbs or back link above the title. */
  eyebrow?: ReactNode;
  className?: string;
}

/** Page title (20/600) with a 13/400 secondary subtitle and an action row. Renders the page's `<h1>`. */
export function PageHeader({ title, subtitle, actions, eyebrow, className }: PageHeaderProps) {
  return (
    <div className={cn('dv-page-header', className)}>
      <div className="dv-page-header__text">
        {eyebrow}
        <h1 className="dv-heading" data-variant="title">{title}</h1>
        {subtitle && <p className="dv-page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="dv-page-header__actions">{actions}</div>}
    </div>
  );
}
