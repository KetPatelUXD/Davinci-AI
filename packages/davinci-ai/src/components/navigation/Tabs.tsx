'use client';
import type { ReactNode } from 'react';
import { Tabs as RACTabs, TabList, Tab, TabPanel } from 'react-aria-components';
import { renderIcon, type IconRef } from '../../foundations/Icon';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: ReactNode;
  icon?: IconRef;
  content: ReactNode;
  isDisabled?: boolean;
}

export interface TabsProps {
  'aria-label': string;
  items: TabItem[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (id: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/** Underline tabs for switching between panels of the same page. For a pill look use `PillTabs`. */
export function Tabs({ items, selectedKey, defaultSelectedKey, onSelectionChange, orientation = 'horizontal', className, 'aria-label': ariaLabel }: TabsProps) {
  return (
    <RACTabs selectedKey={selectedKey} defaultSelectedKey={defaultSelectedKey ?? items[0]?.id} onSelectionChange={(k) => onSelectionChange?.(String(k))} orientation={orientation} className={cn('dv-tabs', className)}>
      <TabList aria-label={ariaLabel} className="dv-tabs__tab-list">
        {items.map((t) => (
          <Tab key={t.id} id={t.id} isDisabled={t.isDisabled} className="dv-tabs__tab">{renderIcon(t.icon)}{t.label}</Tab>
        ))}
      </TabList>
      {items.map((t) => <TabPanel key={t.id} id={t.id} className="dv-tabs__panel">{t.content}</TabPanel>)}
    </RACTabs>
  );
}
