'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { Autocomplete, Dialog, Header, Input, Menu as RACMenu, MenuItem, MenuSection, Modal, ModalOverlay, SearchField, useFilter, Keyboard, type Key } from 'react-aria-components';
import { Icon, renderIcon, type IconRef } from '../../foundations/Icon';
import { useThemeAttributes } from '../../foundations/ThemeProvider';
import { cn } from '../../utils/cn';

export interface Command {
  id: string;
  label: string;
  group?: string;
  icon?: IconRef;
  shortcut?: string;
  keywords?: string;
}

export interface CommandPaletteProps {
  commands: Command[];
  onRun: (id: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Register ⌘K / Ctrl+K to toggle the palette. Default true. */
  hotkey?: boolean;
  placeholder?: string;
  children?: ReactNode;
}

/** ⌘K / Ctrl+K command search. Type to filter, arrows to move, Enter to run, Esc to close. */
export function CommandPalette({ commands, onRun, isOpen, onOpenChange, hotkey = true, placeholder = 'Type a command or search…' }: CommandPaletteProps) {
  const [own, setOwn] = useState(false);
  const open = isOpen ?? own;
  const set = (o: boolean) => { setOwn(o); onOpenChange?.(o); };
  const { contains } = useFilter({ sensitivity: 'base' });
  const { className: root, ...attrs } = useThemeAttributes();
  useEffect(() => {
    if (!hotkey) return;
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); set(!open); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotkey, open]);
  const groups = Array.from(new Set(commands.map((c) => c.group ?? 'Commands')));
  const run = (id: Key) => { set(false); onRun(String(id)); };
  return (
    <ModalOverlay isOpen={open} onOpenChange={set} isDismissable {...attrs} className={cn(root, 'dv-overlay')} data-placement="top">
      <Modal className="dv-dialog__modal dv-glass" data-variant="palette">
        <Dialog aria-label="Command palette" className="dv-command-palette">
          <Autocomplete filter={contains}>
            <SearchField autoFocus aria-label="Search commands" className="dv-command-palette__search">
              <Icon name="magnifying-glass" />
              <Input placeholder={placeholder} className="dv-command-palette__input" />
              <Keyboard className="dv-kbd">Esc</Keyboard>
            </SearchField>
            <RACMenu className="dv-menu dv-command-palette__list" onAction={run} renderEmptyState={() => <div className="dv-listbox__empty">No matching commands</div>}>
              {groups.map((g) => (
                <MenuSection key={g} className="dv-menu__section">
                  <Header className="dv-menu__heading">{g}</Header>
                  {commands.filter((c) => (c.group ?? 'Commands') === g).map((c) => (
                    <MenuItem key={c.id} id={c.id} textValue={`${c.label} ${c.keywords ?? ''}`} className="dv-menu__item">
                      {renderIcon(c.icon)}
                      <span className="dv-menu__item-label">{c.label}</span>
                      {c.shortcut && <Keyboard className="dv-menu__item-shortcut">{c.shortcut}</Keyboard>}
                    </MenuItem>
                  ))}
                </MenuSection>
              ))}
            </RACMenu>
          </Autocomplete>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
