'use client';
import type { ReactNode } from 'react';
import { Button as RACButton, Disclosure as RACDisclosure, DisclosureGroup, DisclosurePanel, Heading, type DisclosureProps as RACDisclosureProps } from 'react-aria-components';
import { Icon } from '../../foundations/Icon';
import { cn } from '../../utils/cn';

export interface DisclosureProps extends Omit<RACDisclosureProps, 'className' | 'children'> {
  title: ReactNode;
  /** Muted summary on the right of the header (e.g. "3 selected"). */
  summary?: ReactNode;
  level?: 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
}

/** Show/hide a block of detail (progressive disclosure). The header is a real button with `aria-expanded`. */
export function Disclosure({ title, summary, level = 3, children, className, ...rest }: DisclosureProps) {
  return (
    <RACDisclosure {...rest} className={cn('dv-disclosure', className)}>
      <Heading level={level} className="dv-disclosure__heading">
        <RACButton slot="trigger" className="dv-disclosure__trigger">
          <Icon name="chevron-right" size={14} className="dv-disclosure__chevron" />
          <span className="dv-disclosure__title">{title}</span>
          {summary && <span className="dv-disclosure__summary">{summary}</span>}
        </RACButton>
      </Heading>
      <DisclosurePanel className="dv-disclosure__panel">{children}</DisclosurePanel>
    </RACDisclosure>
  );
}

export interface AccordionItem {
  id: string;
  title: ReactNode;
  summary?: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowsMultipleExpanded?: boolean;
  defaultExpandedKeys?: string[];
  level?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

/** Group of disclosures; one open at a time unless `allowsMultipleExpanded`. */
export function Accordion({ items, allowsMultipleExpanded, defaultExpandedKeys, level = 3, className }: AccordionProps) {
  return (
    <DisclosureGroup allowsMultipleExpanded={allowsMultipleExpanded} defaultExpandedKeys={defaultExpandedKeys} className={cn('dv-accordion', className)}>
      {items.map((it) => <Disclosure key={it.id} id={it.id} title={it.title} summary={it.summary} level={level}>{it.content}</Disclosure>)}
    </DisclosureGroup>
  );
}

/** Section heading that collapses its content; same semantics as `Disclosure` with section styling. */
export function CollapsibleSection({ className, ...props }: DisclosureProps) {
  return <Disclosure {...props} className={cn('dv-collapsible-section', className)} />;
}
