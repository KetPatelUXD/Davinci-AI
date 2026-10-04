'use client';
import { useState } from 'react';
import { Link as RACLink, Button as RACButton, TooltipTrigger, Tooltip as RACTooltip } from 'react-aria-components';
import { Icon, renderIcon, type IconRef } from '../../foundations/Icon';
import { useThemeAttributes } from '../../foundations/ThemeProvider';
import { cn } from '../../utils/cn';

export interface SideNavItem {
  id: string;
  label: string;
  icon: IconRef;
  href?: string;
  badge?: string;
}

export interface SideNavProps {
  'aria-label'?: string;
  items: SideNavItem[];
  currentId?: string;
  onNavigate?: (id: string) => void;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

/** Optional left rail that collapses to icons. Collapsed items keep their accessible name and show a tooltip. */
export function SideNav({ items, currentId, onNavigate, collapsed, defaultCollapsed = false, onCollapsedChange, className, 'aria-label': label = 'Sidebar' }: SideNavProps) {
  const [own, setOwn] = useState(defaultCollapsed);
  const isCollapsed = collapsed ?? own;
  const { className: root, ...attrs } = useThemeAttributes();
  const set = (c: boolean) => { setOwn(c); onCollapsedChange?.(c); };
  return (
    <nav aria-label={label} className={cn('dv-sidenav', className)} data-collapsed={isCollapsed || undefined}>
      <ul className="dv-sidenav__list">
        {items.map((it) => {
          const current = it.id === currentId;
          const content = (<>{renderIcon(it.icon, 18)}<span className={isCollapsed ? 'dv:sr-only' : 'dv-sidenav__label'}>{it.label}</span>{!isCollapsed && it.badge && <span className="dv-sidenav__badge dv:tabular-nums">{it.badge}</span>}</>);
          const common = { 'aria-current': current ? ('page' as const) : undefined, onPress: () => onNavigate?.(it.id), className: 'dv-sidenav__item', 'data-current': current || undefined };
          const el = it.href ? <RACLink href={it.href} {...common}>{content}</RACLink> : <RACButton {...common}>{content}</RACButton>;
          return (
            <li key={it.id}>
              {isCollapsed ? (
                <TooltipTrigger delay={200}>{el}<RACTooltip placement="right" offset={8} {...attrs} className={cn(root, 'dv-tooltip')}>{it.label}</RACTooltip></TooltipTrigger>
              ) : el}
            </li>
          );
        })}
      </ul>
      <RACButton className="dv-sidenav__toggle" aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!isCollapsed} onPress={() => set(!isCollapsed)}>
        <Icon name={isCollapsed ? 'chevron-right' : 'chevron-left'} size={16} />
      </RACButton>
    </nav>
  );
}
