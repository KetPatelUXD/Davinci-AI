'use client';
import type { ReactNode } from 'react';
import { GridList, GridListItem, Tree, TreeItem, TreeItemContent, Button as RACButton, type Key, type Selection } from 'react-aria-components';
import { Icon, renderIcon, type IconRef } from '../../foundations/Icon';
import { cn } from '../../utils/cn';

export interface ListEntry {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: IconRef;
  /** Right-aligned content (value, badge, actions). Keep non-interactive or use `onAction` for the row. */
  trailing?: ReactNode;
  textValue?: string;
  isDisabled?: boolean;
}

export interface ListProps {
  'aria-label': string;
  items: ListEntry[];
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: Selection;
  defaultSelectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
  /** Row activation (Enter / click) when not selecting. */
  onAction?: (id: Key) => void;
  dense?: boolean;
  emptyState?: ReactNode;
  className?: string;
}

/** Keyboard-navigable list with optional selection. Rows are 1px-divided; selected rows use the hover fill. */
export function List({ items, dense, emptyState, className, ...rest }: ListProps) {
  return (
    <GridList {...rest} items={items} renderEmptyState={() => emptyState ?? <div className="dv-listbox__empty">Nothing here yet</div>} className={cn('dv-list', className)} data-dense={dense || undefined}>
      {(it) => (
        <GridListItem id={it.id} textValue={it.textValue ?? (typeof it.title === 'string' ? it.title : it.id)} isDisabled={it.isDisabled} className="dv-list__item">
          {renderIcon(it.icon, 18)}
          <span className="dv-list__text"><span className="dv-list__title">{it.title}</span>{it.description && <span className="dv-list__desc">{it.description}</span>}</span>
          {it.trailing}
        </GridListItem>
      )}
    </GridList>
  );
}

export interface TreeNode {
  id: string;
  label: string;
  icon?: IconRef;
  children?: TreeNode[];
}

export interface TreeViewProps {
  'aria-label': string;
  nodes: TreeNode[];
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: Selection;
  defaultExpandedKeys?: Iterable<Key>;
  onSelectionChange?: (keys: Selection) => void;
  onAction?: (id: Key) => void;
  className?: string;
}

function renderNode(n: TreeNode): ReactNode {
  return (
    <TreeItem key={n.id} id={n.id} textValue={n.label} className="dv-tree-view__item">
      <TreeItemContent>
        {({ hasChildItems }) => (
          <span className="dv-tree-view__row">
            {hasChildItems ? (
              <RACButton slot="chevron" className="dv-tree-view__chevron"><Icon name="chevron-right" size={14} /></RACButton>
            ) : <span className="dv-tree-view__chevron" data-empty />}
            {renderIcon(n.icon, 16)}
            <span>{n.label}</span>
          </span>
        )}
      </TreeItemContent>
      {n.children?.map(renderNode)}
    </TreeItem>
  );
}

/** Hierarchical list: ←/→ collapse/expand, ↑/↓ move, type-ahead. */
export function TreeView({ nodes, className, ...rest }: TreeViewProps) {
  return <Tree {...rest} className={cn('dv-tree-view', className)}>{nodes.map(renderNode)}</Tree>;
}

export interface DescriptionItem {
  term: ReactNode;
  details: ReactNode;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /** `inline` puts term and details on one row; `stacked` puts the term above. */
  layout?: 'inline' | 'stacked';
  className?: string;
}

/** Key–value pairs (`<dl>`), e.g. notional / fees. Numeric details use tabular figures. */
export function DescriptionList({ items, layout = 'inline', className }: DescriptionListProps) {
  return (
    <dl className={cn('dv-description-list', className)} data-layout={layout}>
      {items.map((it, i) => (
        <div key={i} className="dv-description-list__row">
          <dt>{it.term}</dt>
          <dd className="dv:tabular-nums">{it.details}</dd>
        </div>
      ))}
    </dl>
  );
}
