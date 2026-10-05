'use client';
import { useRef, useState, type ReactNode, type KeyboardEvent, type MouseEvent } from 'react';
import { Menu as RACMenu, MenuItem, MenuSection, MenuTrigger, SubmenuTrigger, Header, Separator, Popover as RACPopover, Keyboard, type Key } from 'react-aria-components';
import { Icon, renderIcon, type IconRef } from '../../foundations/Icon';
import { useThemeAttributes } from '../../foundations/ThemeProvider';
import { ThemedPopover } from '../overlays/Popover';
import { cn } from '../../utils/cn';

export interface MenuEntry {
  id: string;
  label?: ReactNode;
  /** Plain-text label for type-ahead and accessible name when `label` is rich. */
  textValue?: string;
  icon?: IconRef;
  /** Shortcut hint, e.g. "⌘C" (display only). */
  shortcut?: string;
  isDisabled?: boolean;
  /** Red text; use for irreversible actions and pair with a confirmation. */
  destructive?: boolean;
  href?: string;
  onAction?: () => void;
  /** Nested items open a submenu. */
  children?: MenuEntry[];
  /** `separator` draws a divider; `section` groups children under `heading`. */
  type?: 'item' | 'separator' | 'section';
  heading?: string;
}

function renderEntry(e: MenuEntry): ReactNode {
  if (e.type === 'separator') return <Separator key={e.id} className="dv-menu__separator" />;
  if (e.type === 'section')
    return (
      <MenuSection key={e.id} className="dv-menu__section">
        {e.heading && <Header className="dv-menu__heading">{e.heading}</Header>}
        {e.children?.map(renderEntry)}
      </MenuSection>
    );
  const item = (
    <MenuItem key={e.id} id={e.id} textValue={e.textValue ?? (typeof e.label === 'string' ? e.label : e.id)} isDisabled={e.isDisabled} href={e.href} onAction={e.onAction} className="dv-menu__item" data-intent={e.destructive ? 'destructive' : undefined}>
      {renderIcon(e.icon)}
      <span className="dv-menu__item-label">{e.label}</span>
      {e.shortcut && <Keyboard className="dv-menu__item-shortcut">{e.shortcut}</Keyboard>}
      {e.children && <Icon name="chevron-right" size={14} className="dv-menu__item-description" />}
    </MenuItem>
  );
  if (e.children?.length) {
    return (
      <SubmenuTrigger key={e.id}>
        {item}
        <ThemedPopover><RACMenu className="dv-menu">{e.children.map(renderEntry)}</RACMenu></ThemedPopover>
      </SubmenuTrigger>
    );
  }
  return item;
}

export interface MenuProps {
  /** Pressable element that opens the menu (`Button`, `IconButton`, `UserChip`). Icon-only triggers need a label. */
  trigger: ReactNode;
  items: MenuEntry[];
  /** Fired for any item that has no own `onAction`. */
  onAction?: (id: Key) => void;
  placement?: 'bottom start' | 'bottom end' | 'bottom' | 'top start' | 'top end' | 'top';
  'aria-label'?: string;
  className?: string;
}

/** Action menu: arrow keys, type-ahead, submenus, Esc to close, focus returns to the trigger. Also exported as `Dropdown`. */
export function Menu({ trigger, items, onAction, placement = 'bottom start', 'aria-label': ariaLabel, className }: MenuProps) {
  return (
    <MenuTrigger>
      {trigger}
      <ThemedPopover placement={placement} className={className}>
        <RACMenu className="dv-menu" aria-label={ariaLabel} onAction={onAction}>{items.map(renderEntry)}</RACMenu>
      </ThemedPopover>
    </MenuTrigger>
  );
}
export const Dropdown = Menu;

export interface ContextMenuProps {
  items: MenuEntry[];
  onAction?: (id: Key) => void;
  children: ReactNode;
  'aria-label'?: string;
  className?: string;
}

/**
 * Menu opened by right-click, long-press, the Menu key or Shift+F10 on the wrapped area. Because right-click is not
 * discoverable, always offer the same actions elsewhere (e.g. a kebab `Menu`).
 */
export function ContextMenu({ items, onAction, children, 'aria-label': ariaLabel = 'Context menu', className }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLSpanElement>(null);
  const { className: root, ...attrs } = useThemeAttributes();
  const openAt = (x: number, y: number) => {
    if (anchor.current) { anchor.current.style.left = `${x}px`; anchor.current.style.top = `${y}px`; }
    setOpen(true);
  };
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- wrapper only listens for the context-menu gesture; the menu itself is a real menu
    <div
      className={cn('dv-context-menu__area', className)}
      onContextMenu={(e: MouseEvent) => { e.preventDefault(); openAt(e.clientX, e.clientY); }}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
          e.preventDefault();
          const r = (e.target as HTMLElement).getBoundingClientRect();
          openAt(r.left + 8, r.bottom);
        }
      }}
    >
      {children}
      <span ref={anchor} className="dv-context-menu__anchor" aria-hidden="true" />
      <RACPopover triggerRef={anchor} isOpen={open} onOpenChange={setOpen} placement="bottom start" {...attrs} className={cn(root, 'dv-popover dv-glass')}>
        <RACMenu className="dv-menu" aria-label={ariaLabel} onAction={(k) => { onAction?.(k); setOpen(false); }}>{items.map(renderEntry)}</RACMenu>
      </RACPopover>
    </div>
  );
}
