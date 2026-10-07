'use client';
import { useId, type ReactNode } from 'react';
import { Button } from '../actions/Button';
import { Badge } from '../display/Badge';
import { Prose } from '../chat/Blocks';
import { cn } from '../../utils/cn';

export interface ArticleViewProps {
  title: string;
  /** Returns to the list the reader came from. Renders the Back button. */
  onBack: () => void;
  /** Text of the Back button, e.g. "Back to news". */
  backLabel?: string;
  source?: string;
  /** Pre-formatted publication time. */
  time?: string;
  tags?: string[];
  /** Short introduction under the title. */
  standfirst?: ReactNode;
  /** Article body (paragraphs, headings, lists). Styled with `Prose`. */
  children: ReactNode;
  className?: string;
}

/**
 * Full page for one story, reached from a `NewsList` headline. Has a Back button, title, source/time/tags, an optional standfirst
 * and the body text.
 * @when Showing the whole of one article after the reader opened it from a list.
 * @whenNot Previewing a headline in a list – use NewsList.
 */
export function ArticleView({ title, onBack, backLabel = 'Back', source, time, tags, standfirst, children, className }: ArticleViewProps) {
  const titleId = useId();
  return (
    <article className={cn('dv-article-view', className)} aria-labelledby={titleId}>
      <Button variant="ghost" size="sm" iconStart="arrow-left" className="dv-article-view__back" onPress={onBack}>{backLabel}</Button>
      <header className="dv-article-view__header">
        {tags && tags.length > 0 && <div className="dv-article-view__tags">{tags.map((t) => <Badge key={t} size="sm">{t}</Badge>)}</div>}
        <h1 id={titleId} className="dv-article-view__title">{title}</h1>
        {(source || time) && (
          <div className="dv-article-view__meta">
            {source && <span>{source}</span>}
            {source && time && <span aria-hidden="true">·</span>}
            {time && <time className="dv:tabular-nums">{time}</time>}
          </div>
        )}
      </header>
      {standfirst && <p className="dv-article-view__standfirst">{standfirst}</p>}
      <Prose className="dv-article-view__body">{children}</Prose>
    </article>
  );
}
