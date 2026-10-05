'use client';
import { Breadcrumbs as RACBreadcrumbs, Breadcrumb, Link as RACLink } from 'react-aria-components';
import { Icon } from '../../foundations/Icon';
import { cn } from '../../utils/cn';

export interface Crumb {
  id: string;
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: Crumb[];
  onNavigate?: (id: string) => void;
  className?: string;
  'aria-label'?: string;
}

/** Location trail. The last item is the current page (`aria-current="page"`, not a link). */
export function Breadcrumbs({ items, onNavigate, className, 'aria-label': label = 'Breadcrumb' }: BreadcrumbsProps) {
  return (
    <RACBreadcrumbs aria-label={label} className={cn('dv-breadcrumbs', className)}>
      {items.map((c) => (
        <Breadcrumb key={c.id} id={c.id} className="dv-breadcrumbs__item">
          <RACLink href={c.href} onPress={() => onNavigate?.(c.id)} className="dv-breadcrumbs__link">{c.label}</RACLink>
          <Icon name="chevron-right" size={12} className="dv-breadcrumbs__separator" />
        </Breadcrumb>
      ))}
    </RACBreadcrumbs>
  );
}
