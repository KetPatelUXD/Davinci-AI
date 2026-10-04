'use client';
import { useState } from 'react';
import { ToggleButton, Toolbar } from 'react-aria-components';
import { Button } from '../actions/Button';
import { Menu, type MenuEntry } from '../navigation/Menu';
import { cn } from '../../utils/cn';

export interface FilterOption {
  id: string;
  label: string;
}

export interface SavedView {
  id: string;
  label: string;
}

export interface FilterBarProps {
  'aria-label'?: string;
  filters: FilterOption[];
  /** Selected filter ids. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (ids: string[]) => void;
  savedViews?: SavedView[];
  onApplyView?: (id: string) => void;
  onSaveView?: () => void;
  className?: string;
}

/** Toggle chips for common filters plus a "Saved views" menu and a Clear action. Selected chips use the `on` fill. */
export function FilterBar({ filters, value, defaultValue, onChange, savedViews, onApplyView, onSaveView, className, 'aria-label': label = 'Filters' }: FilterBarProps) {
  const [own, setOwn] = useState<string[]>(defaultValue ?? []);
  const selected = value ?? own;
  const set = (ids: string[]) => { setOwn(ids); onChange?.(ids); };
  const viewItems: MenuEntry[] = [
    ...(savedViews ?? []).map((v) => ({ id: v.id, label: v.label, onAction: () => onApplyView?.(v.id) })),
    ...(onSaveView ? [{ id: 'sep', type: 'separator' as const }, { id: 'save', label: 'Save current view…', icon: 'bookmark', onAction: onSaveView }] : []),
  ];
  return (
    <Toolbar aria-label={label} className={cn('dv-filterbar', className)}>
      <div role="group" aria-label="Quick filters" className="dv-filterbar__chips">
        {filters.map((f) => (
          <ToggleButton key={f.id} isSelected={selected.includes(f.id)} onChange={(on) => set(on ? [...selected, f.id] : selected.filter((x) => x !== f.id))} className="dv-filterchip">{f.label}</ToggleButton>
        ))}
      </div>
      {viewItems.length > 0 && <Menu trigger={<Button variant="subtle" size="sm" iconEnd="chevron-down" iconStart="bookmark">Saved views</Button>} items={viewItems} />}
      {selected.length > 0 && <Button variant="ghost" size="sm" onPress={() => set([])}>Clear</Button>}
    </Toolbar>
  );
}
