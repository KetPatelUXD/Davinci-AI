'use client';
import type { ReactNode } from 'react';
import { Link as RACLink, Button as RACButton } from 'react-aria-components';
import { DaVinciLogo } from '../../foundations/DaVinciLogo';
import { Icon } from '../../foundations/Icon';
import { Avatar } from '../display/Avatar';
import { cn } from '../../utils/cn';

export interface NavItem {
  id: string;
  label: string;
  href?: string;
}

export interface AppHeaderProps {
  /** Wordmark text next to the logo tile. */
  brand?: ReactNode;
  /** Replace the default logo tile. */
  logo?: ReactNode;
  /** Centre pill navigation. */
  nav?: NavItem[];
  currentId?: string;
  onNavigate?: (id: string) => void;
  /** Right-hand actions: `IconButton`s and a `UserChip`. */
  actions?: ReactNode;
  'aria-label'?: string;
  className?: string;
}

/**
 * Top bar: logo tile + wordmark (left), centred pill navigation with a white active tab, circle actions and user chip (right).
 * The nav is a landmark (`<nav>`) and the active item uses `aria-current="page"`.
 */
export function AppHeader({ brand = 'DaVinci.AI', logo, nav, currentId, onNavigate, actions, 'aria-label': navLabel = 'Primary', className }: AppHeaderProps) {
  return (
    <header className={cn('dv-appheader', className)}>
      <div className="dv-appheader__brand">
        <span className="dv-appheader__logo">{logo ?? <DaVinciLogo decorative size={22} />}</span>
        {brand}
      </div>
      {nav && (
        <nav aria-label={navLabel} className="dv-pillnav">
          {nav.map((n) => {
            const current = n.id === currentId;
            return n.href ? (
              <RACLink key={n.id} href={n.href} aria-current={current ? 'page' : undefined} onPress={() => onNavigate?.(n.id)} className="dv-pillnav__item" data-current={current || undefined}>{n.label}</RACLink>
            ) : (
              <RACButton key={n.id} aria-current={current ? 'page' : undefined} onPress={() => onNavigate?.(n.id)} className="dv-pillnav__item" data-current={current || undefined}>{n.label}</RACButton>
            );
          })}
        </nav>
      )}
      <div className="dv-appheader__actions">{actions}</div>
    </header>
  );
}

export interface UserChipProps {
  name: string;
  subtitle?: string;
  src?: string;
  /** Opens a menu: wrap in `<Menu trigger={<UserChip …/>} …/>`. */
  onPress?: () => void;
  className?: string;
}

/** Pill with avatar, name, role and chevron. A button – typically the trigger of an account `Menu`. */
export function UserChip({ name, subtitle, src, onPress, className }: UserChipProps) {
  return (
    <RACButton onPress={onPress} className={cn('dv-userchip', className)} aria-label={`${name}${subtitle ? `, ${subtitle}` : ''}. Account menu`}>
      <Avatar name={name} src={src} size="md" decorative />
      <span className="dv-userchip__text"><b>{name}</b>{subtitle && <small>{subtitle}</small>}</span>
      <Icon name="chevron-down" size={16} />
    </RACButton>
  );
}
