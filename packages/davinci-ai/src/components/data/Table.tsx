'use client';
import { useMemo, type ReactNode } from 'react';
import {
  Table as RACTable, TableHeader, TableBody, Column, Row, Cell, Button as RACButton,
  type Key, type SortDescriptor, type Selection,
} from 'react-aria-components';
import { Icon, renderIcon, type IconRef } from '../../foundations/Icon';
import { Checkbox } from '../inputs/Checkbox';
import { Menu, type MenuEntry } from '../navigation/Menu';
import { Skeleton } from '../display/Skeleton';
import { EmptyState } from '../display/EmptyState';
import { cn } from '../../utils/cn';

export interface TableColumn<T> {
  id: string;
  header: ReactNode;
  /** Plain-text header for assistive tech when `header` is rich. */
  textValue?: string;
  /** Property of the row, or a function returning the cell content. */
  cell: keyof T | ((row: T) => ReactNode);
  /** `end` right-aligns (use for numbers; applies tabular figures). */
  align?: 'start' | 'end';
  allowsSorting?: boolean;
  width?: number | string;
  isRowHeader?: boolean;
  /** Treat as numeric – right aligned with tabular figures. */
  numeric?: boolean;
}

export interface TableProps<T extends { id: Key }> {
  /** Required: names the table. */
  'aria-label': string;
  columns: TableColumn<T>[];
  rows: T[];
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
  sortDescriptor?: SortDescriptor;
  onSortChange?: (d: SortDescriptor) => void;
  onRowAction?: (id: Key) => void;
  /** `compact` rows are 40px; `comfortable` 64px (two-line cells). Inherits the ambient density when omitted. */
  density?: 'comfortable' | 'compact';
  zebra?: boolean;
  stickyHeader?: boolean;
  /** Max height in px before the body scrolls (needed for sticky header). */
  maxHeight?: number;
  isLoading?: boolean;
  /** Shown when `rows` is empty. */
  emptyState?: ReactNode;
  /** Toolbar row above the header (see `TableToolbar`). */
  toolbar?: ReactNode;
  className?: string;
}

/**
 * Data table styled like the Graphite reference: toolbar, `panel` header, 1px `line` row dividers, soft row hover,
 * right-aligned tabular numbers. Full keyboard navigation (arrows, Space to select, Enter for row action) via React Aria.
 * @when Comparing many rows across attributes. @whenNot Few rows with rich content (use `List`/`Watchlist`).
 */
export function Table<T extends { id: Key }>({
  columns, rows, selectionMode = 'none', selectedKeys, onSelectionChange, sortDescriptor, onSortChange, onRowAction, density, zebra, stickyHeader, maxHeight, isLoading, emptyState, toolbar, className, ...rest
}: TableProps<T>) {
  const skeletonRows = useMemo(() => Array.from({ length: 5 }, (_, i) => ({ id: `sk-${i}` })), []);
  return (
    <div className={cn('dv-table', className)} aria-busy={isLoading || undefined} data-density={density} data-zebra={zebra || undefined} data-sticky={stickyHeader || undefined}>
      {toolbar}
      <div className="dv-table__scroll" style={maxHeight ? { maxHeight } : undefined}>
        <div className="dv-table__container">
          <RACTable
            aria-label={rest['aria-label']}
            selectionMode={selectionMode}
            selectedKeys={selectedKeys}
            onSelectionChange={onSelectionChange}
            sortDescriptor={sortDescriptor}
            onSortChange={onSortChange}
            onRowAction={onRowAction}
            className="dv-table__el"
          >
            <TableHeader className="dv-table__head">
              {selectionMode !== 'none' && (
                <Column width={44} textValue="Selection" className="dv-table__th dv-table__th--select">{selectionMode === 'multiple' ? <Checkbox slot="selection" aria-label="Select all rows" /> : <span className="dv:sr-only">Select</span>}</Column>
              )}
              {columns.map((c) => (
                <Column key={c.id} id={c.id} isRowHeader={c.isRowHeader} allowsSorting={c.allowsSorting} width={c.width as never} textValue={c.textValue} className="dv-table__th" data-align={c.align ?? (c.numeric ? 'end' : 'start')}>
                  {({ allowsSorting, sortDirection }) => (
                    <span className="dv-table__thin">
                      {c.header}
                      {allowsSorting && (
                        <Icon name={sortDirection === 'ascending' ? 'arrow-up-wide-short' : sortDirection === 'descending' ? 'arrow-down-wide-short' : 'arrows-up-down'} size={12} className={cn('dv-table__sort', sortDirection && 'dv-table__sort--on')} />
                      )}
                    </span>
                  )}
                </Column>
              ))}
            </TableHeader>
            <TableBody
              items={(isLoading ? skeletonRows : rows) as T[]}
              renderEmptyState={() => emptyState ?? <EmptyState title="No results" description="Try changing your filters or search." />}
            >
              {(row) => (
                <Row id={row.id} className="dv-table__row">
                  {selectionMode !== 'none' && <Cell className="dv-table__td dv-table__td--select">{isLoading ? null : <Checkbox slot="selection" aria-label="Select row" />}</Cell>}
                  {columns.map((c) => (
                    <Cell key={c.id} className={cn('dv-table__td', c.numeric && 'dv:tabular-nums')} data-align={c.align ?? (c.numeric ? 'end' : 'start')}>
                      {isLoading ? <Skeleton height={14} width={c.numeric ? 64 : '70%'} /> : typeof c.cell === 'function' ? c.cell(row) : (row[c.cell] as ReactNode)}
                    </Cell>
                  ))}
                </Row>
              )}
            </TableBody>
          </RACTable>
        </div>
      </div>
    </div>
  );
}

export interface TableToolbarProps {
  /** Left: typically a view `SegmentedControl`. */
  children?: ReactNode;
  /** Right: `SearchField` + filter `IconButton`. */
  end?: ReactNode;
  className?: string;
}

/** Toolbar row of a `Table` (padding 18×20×16). */
export function TableToolbar({ children, end, className }: TableToolbarProps) {
  return (
    <div className={cn('dv-table__toolbar', className)}>
      {children}
      <span className="dv:flex-1" />
      {end}
    </div>
  );
}

export interface AssetCellProps {
  name: string;
  category?: string;
  /** Icon in the 38px circular well. */
  icon?: IconRef;
}
/** Two-line primary cell: icon well + name (13.5/500) + muted category. */
export function AssetCell({ name, category, icon = 'chart-line' }: AssetCellProps) {
  return (
    <div className="dv-asset">
      <span className="dv-asset__icon">{renderIcon(icon, 16)}</span>
      <div className="dv-asset__text">
        <b>{name}</b>
        {category && <small>{category}</small>}
      </div>
    </div>
  );
}

export interface RowActionsProps {
  /** Row name, used in the accessible label "Actions for {name}". */
  name: string;
  items: MenuEntry[];
}
/** Kebab menu for row actions (progressive disclosure of secondary actions). */
export function RowActions({ name, items }: RowActionsProps) {
  return (
    <Menu
      aria-label={`Actions for ${name}`}
      placement="bottom end"
      items={items}
      trigger={
        <RACButton className="dv-kebab" aria-label={`Actions for ${name}`}>
          <Icon name="ellipsis-vertical" size={16} />
        </RACButton>
      }
    />
  );
}
