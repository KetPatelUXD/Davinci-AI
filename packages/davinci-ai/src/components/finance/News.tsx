'use client';
import type { ReactNode } from 'react';
import { Badge } from '../display/Badge';
import { cn } from '../../utils/cn';

export interface NewsEntry {
  id: string;
  /** Pre-formatted time, e.g. "09:42" or "10/05/2026 04:43". */
  time: string;
  headline: string;
  source?: string;
  tags?: string[];
  unread?: boolean;
  /** Standfirst for the full article (`ArticleView`). Not shown in the list. */
  summary?: ReactNode;
  /** Makes the headline a link to the article. Omit it and pass `onOpen` to handle navigation yourself. */
  href?: string;
}

export interface NewsItemProps {
  item: NewsEntry;
  /** Called when the headline is activated. Typically navigates to the full article (`ArticleView`). */
  onOpen?: (id: string) => void;
}

/** News row: time, headline, source/tags and an unread marker. Activating the headline opens the full article. */
export function NewsItem({ item, onOpen }: NewsItemProps) {
  const head = (
    <>
      <time className="dv-news-list__time dv:tabular-nums">{item.time}</time>
      <span className="dv-news-list__headline">{item.headline}</span>
    </>
  );
  return (
    <article className="dv-news-list__item" data-unread={item.unread || undefined}>
      <i className="dv-news-list__dot" aria-hidden="true" />
      <h3 className="dv-news-list__headline">
        {item.href ? (
          <a href={item.href} className="dv-news-list__button" onClick={() => onOpen?.(item.id)}>{head}</a>
        ) : onOpen ? (
          <button type="button" className="dv-news-list__button" onClick={() => onOpen(item.id)}>{head}</button>
        ) : <span className="dv-news-list__button">{head}</span>}
        {item.unread && <span className="dv:sr-only"> (unread)</span>}
      </h3>
      <div className="dv-news-list__meta">
        {item.source && <span>{item.source}</span>}
        {item.tags?.map((t) => <Badge key={t} size="sm">{t}</Badge>)}
      </div>
    </article>
  );
}

export interface NewsListProps {
  'aria-label': string;
  items: NewsEntry[];
  /** Called when a headline is activated. */
  onOpen?: (id: string) => void;
  className?: string;
}

export function NewsList({ items, onOpen, className, ...rest }: NewsListProps) {
  return (
    // Time column is sized to the longest time string so headlines and sources align (e.g. "09:42" or "10/05/2026 04:43").
    <ul aria-label={rest['aria-label']} className={cn('dv-news-list', className)} style={{ ['--dv-news-time-chars' as string]: Math.max(5, ...items.map((i) => i.time.length)) }}>
      {items.map((it) => <li key={it.id}><NewsItem item={it} onOpen={onOpen} /></li>)}
    </ul>
  );
}
