'use client';
import { Button as RACButton } from 'react-aria-components';
import { Icon } from '../../foundations/Icon';
import { cn } from '../../utils/cn';

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Pages shown on each side of the current page. */
  siblings?: number;
  className?: string;
  'aria-label'?: string;
}

function range(page: number, count: number, siblings: number): (number | '…')[] {
  const total = siblings * 2 + 5;
  if (count <= total) return Array.from({ length: count }, (_, i) => i + 1);
  const l = Math.max(page - siblings, 2), r = Math.min(page + siblings, count - 1);
  const out: (number | '…')[] = [1];
  if (l > 2) out.push('…');
  for (let i = l; i <= r; i++) out.push(i);
  if (r < count - 1) out.push('…');
  out.push(count);
  return out;
}

/** Page navigation with previous/next and numbered pages (`aria-current="page"`). */
export function Pagination({ page, pageCount, onPageChange, siblings = 1, className, 'aria-label': label = 'Pagination' }: PaginationProps) {
  return (
    <nav aria-label={label} className={cn('dv-pagination', className)}>
      <RACButton className="dv-iconbtn" data-size="sm" aria-label="Previous page" isDisabled={page <= 1} onPress={() => onPageChange(page - 1)}><Icon name="chevron-left" size={14} /></RACButton>
      <ul className="dv-pagination__list">
        {range(page, pageCount, siblings).map((p, i) => (
          <li key={`${p}-${i}`}>
            {p === '…' ? <span className="dv-pagination__gap" aria-hidden="true">…</span> : (
              <RACButton className="dv-pagination__page dv:tabular-nums" aria-label={`Page ${p}`} aria-current={p === page ? 'page' : undefined} data-current={p === page || undefined} onPress={() => onPageChange(p)}>{p}</RACButton>
            )}
          </li>
        ))}
      </ul>
      <RACButton className="dv-iconbtn" data-size="sm" aria-label="Next page" isDisabled={page >= pageCount} onPress={() => onPageChange(page + 1)}><Icon name="chevron-right" size={14} /></RACButton>
    </nav>
  );
}
