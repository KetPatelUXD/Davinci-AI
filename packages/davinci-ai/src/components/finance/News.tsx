'use client';
import { useId, useState, type ReactNode } from 'react';
import { Icon } from '../../foundations/Icon';
import { Badge } from '../display/Badge';
import { cn } from '../../utils/cn';

export interface NewsEntry {
  id: string;
  /** Pre-formatted time, e.g. "09:42". */
  time: string;
  headline: string;
  source?: string;
  tags?: string[];
  unread?: boolean;
  /** Longer text revealed on demand. */
  summary?: ReactNode;
  href?: string;
}

export interface NewsItemProps {
  item: NewsEntry;
  onRead?: (id: string) => void;
}

/** News row: time, headline, source/tags, unread marker; the summary opens on demand (progressive disclosure). */
export function NewsItem({ item, onRead }: NewsItemProps) {
  const [open, setOpen] = useState(false);
  const panel = useId();
  const expandable = item.summary != null;
  const head = (
    <>
      <time className="dv-news-list__time dv:tabular-nums">{item.time}</time>
      <span className="dv-news-list__headline">{item.headline}</span>
      {expandable && <Icon name="chevron-down" size={14} className="dv-news-list__chevron" />}
    </>
  );
  return (
    <article className="dv-news-list__item" data-unread={item.unread || undefined}>
      {item.unread && <i className="dv-news-list__dot" aria-hidden="true" />}
      <h3 className="dv-news-list__headline">
        {expandable ? (
          <button type="button" className="dv-news-list__button" aria-expanded={open} aria-controls={panel} onClick={() => { setOpen((o) => !o); if (!open) onRead?.(item.id); }}>{head}</button>
        ) : item.href ? (
          <a href={item.href} className="dv-news-list__button" onClick={() => onRead?.(item.id)}>{head}</a>
        ) : <span className="dv-news-list__button">{head}</span>}
        {item.unread && <span className="dv:sr-only"> (unread)</span>}
      </h3>
      <div className="dv-news-list__meta">
        {item.source && <span>{item.source}</span>}
        {item.tags?.map((t) => <Badge key={t} size="sm">{t}</Badge>)}
      </div>
      {expandable && <div id={panel} role="region" aria-label="Summary" hidden={!open} className="dv-news-list__summary">{item.summary}</div>}
    </article>
  );
}

export interface NewsListProps {
  'aria-label': string;
  items: NewsEntry[];
  onRead?: (id: string) => void;
  className?: string;
}

export function NewsList({ items, onRead, className, ...rest }: NewsListProps) {
  return (
    <ul aria-label={rest['aria-label']} className={cn('dv-news-list', className)}>
      {items.map((it) => <li key={it.id}><NewsItem item={it} onRead={onRead} /></li>)}
    </ul>
  );
}
