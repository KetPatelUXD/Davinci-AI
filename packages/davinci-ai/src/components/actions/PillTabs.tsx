'use client';
import { useRef, type ReactNode } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-aria-components';
import { useSlidingThumb, SlidingThumb } from '../../utils/useSlidingThumb';
import { renderIcon, type IconRef } from '../../foundations/Icon';
import { cn } from '../../utils/cn';

export interface PillTabItem {
  id: string;
  label: ReactNode;
  icon?: IconRef;
  /** Panel content. Omit for tabs that only drive external state. */
  content?: ReactNode;
  isDisabled?: boolean;
}

export interface PillTabsProps {
  'aria-label': string;
  items: PillTabItem[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (id: string) => void;
  size?: 'sm' | 'md' | 'lg';
  /** Roving arrow-key focus + manual activation (`manual`) or follow-focus (`automatic`). */
  keyboardActivation?: 'automatic' | 'manual';
  className?: string;
  panelClassName?: string;
}

/** Tabs rendered as a pill track with a sliding white thumb. Full tab/tabpanel semantics. */
export function PillTabs({ items, selectedKey, defaultSelectedKey, onSelectionChange, size = 'md', keyboardActivation = 'automatic', className, panelClassName, 'aria-label': ariaLabel }: PillTabsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { box, ready } = useSlidingThumb(ref, selectedKey ?? defaultSelectedKey, '[data-selected="true"]');
  return (
    <Tabs selectedKey={selectedKey} defaultSelectedKey={defaultSelectedKey ?? items[0]?.id} onSelectionChange={(k) => onSelectionChange?.(String(k))} keyboardActivation={keyboardActivation} className={cn('dv-pill-tabs', className)}>
      <div className="dv-segmented-control" data-size={size} data-ready={ready || undefined}>
        {/* The thumb lives outside TabList: React Aria's TabList is a collection and only accepts Tab children. */}
        <div ref={ref} className="dv-segmented-control__track">
          <SlidingThumb box={box} ready={ready} />
          <TabList aria-label={ariaLabel} className="dv-pill-tabs__list">
            {items.map((it) => (
              <Tab key={it.id} id={it.id} isDisabled={it.isDisabled} className="dv-segmented-control__option">
                {renderIcon(it.icon)}
                <span>{it.label}</span>
              </Tab>
            ))}
          </TabList>
        </div>
      </div>
      {items.filter((i) => i.content != null).map((it) => (
        <TabPanel key={it.id} id={it.id} className={cn('dv-pill-tabs__panel', panelClassName)}>{it.content}</TabPanel>
      ))}
    </Tabs>
  );
}
