'use client';
import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { Button as RACButton, Disclosure, DisclosurePanel, Heading, Link as RACLink } from 'react-aria-components';
import { Icon } from '../../foundations/Icon';
import { Spinner } from '../display/Spinner';
import { Tooltip } from '../display/Tooltip';
import { IconButton } from '../actions/IconButton';
import { cn } from '../../utils/cn';

/** Styles rich assistant text: headings, lists, tables, blockquotes and inline code. */
export function Prose({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('dv-prose', className)} {...rest} />;
}

export interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

/** Code block with a copy button (announces "Copied"). */
export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  return (
    <figure className={cn('dv-code-block', className)}>
      <figcaption className="dv-code-block__header">
        <span>{language ?? 'code'}</span>
        <IconButton
          label={copied ? 'Copied' : `Copy ${language ?? 'code'}`}
          icon={copied ? 'check' : 'copy'}
          size="sm"
          variant="ghost"
          onPress={async () => { try { await navigator.clipboard?.writeText(code); } catch { /* unavailable */ } setCopied(true); setTimeout(() => setCopied(false), 1800); }}
        />
      </figcaption>
      <pre tabIndex={0}><code>{code}</code></pre>
      <span className="dv:sr-only" role="status">{copied ? 'Code copied' : ''}</span>
    </figure>
  );
}

interface TraceProps {
  /** One-line collapsed summary. */
  summary?: ReactNode;
  children?: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

function Trace({ summary, children, defaultExpanded, icon, status, className }: TraceProps & { icon: ReactNode; status?: ReactNode }) {
  return (
    <Disclosure defaultExpanded={defaultExpanded} className={cn('dv-tool-use-block', className)}>
      <Heading level={3} className="dv-tool-use-block__header">
        <RACButton slot="trigger" className="dv-tool-use-block__trigger">
          {icon}
          <span className="dv-tool-use-block__summary">{summary}</span>
          {status}
          <Icon name="chevron-right" size={12} className="dv-tool-use-block__chevron" />
        </RACButton>
      </Heading>
      <DisclosurePanel className="dv-tool-use-block__panel">{children}</DisclosurePanel>
    </Disclosure>
  );
}

export interface ReasoningBlockProps extends TraceProps {
  /** Still thinking: shows a spinner and "Thinking…" semantics. */
  isStreaming?: boolean;
}

/** Collapsed one-line "Thought for 4 s" that expands to the model's reasoning (progressive disclosure). */
export function ReasoningBlock({ summary, isStreaming, children, ...rest }: ReasoningBlockProps) {
  return (
    <Trace {...rest} summary={isStreaming ? 'Thinking…' : summary} icon={isStreaming ? <Spinner size="sm" /> : <Icon name="sparkles" size={14} />}>
      {children}
    </Trace>
  );
}

export interface ToolUseBlockProps extends TraceProps {
  /** Tool name, e.g. "Search assessments". */
  name: string;
  status?: 'running' | 'success' | 'error';
}

/** Collapsed one-line tool call ("Searched assessments · done") that expands to inputs and outputs. */
export function ToolUseBlock({ name, status = 'success', summary, children, ...rest }: ToolUseBlockProps) {
  const label = status === 'running' ? 'running' : status === 'error' ? 'failed' : 'done';
  return (
    <Trace
      {...rest}
      summary={<>{name}{summary && <span className="dv-tool-use-block__description"> · {summary}</span>}</>}
      icon={status === 'running' ? <Spinner size="sm" /> : <Icon name="gear" size={14} />}
      status={<span className="dv-tool-use-block__status" data-status={status}><Icon name={status === 'error' ? 'circle-xmark' : status === 'success' ? 'circle-check' : 'clock'} size={12} />{label}</span>}
    >
      {children}
    </Trace>
  );
}

export interface CitationChipProps {
  /** Source number shown in the chip. */
  n: number;
  /** Source title (tooltip + accessible name). */
  title: string;
  href?: string;
  onPress?: () => void;
}

/** Inline numbered source marker, e.g. "[1]". Named "Source 1: {title}". */
export function CitationChip({ n, title, href, onPress }: CitationChipProps) {
  return (
    <Tooltip content={title} delay={150}>
      <RACLink href={href} onPress={onPress} aria-label={`Source ${n}: ${title}`} className="dv-citation-chip" {...(href ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{n}</RACLink>
    </Tooltip>
  );
}

export interface ArtifactPanelProps {
  title: string;
  /** Kind label, e.g. "Table", "Report". */
  type?: string;
  onClose?: () => void;
  /** Extra header actions (copy, download…). */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Side panel for larger outputs (reports, tables, code). A labelled complementary region with its own scroll. */
export function ArtifactPanel({ title, type, onClose, actions, children, className }: ArtifactPanelProps) {
  return (
    <aside aria-label={title} className={cn('dv-artifact-panel dv-card', className)} data-border="none">
      <header className="dv-artifact-panel__header">
        <div className="dv-artifact-panel__titles"><h2 className="dv-artifact-panel__title">{title}</h2>{type && <span className="dv-artifact-panel__kind">{type}</span>}</div>
        {actions}
        {onClose && <IconButton label="Close panel" icon="xmark" variant="ghost" size="sm" onPress={onClose} />}
      </header>
      <div className="dv-artifact-panel__body" tabIndex={0} role="region" aria-label={`${title} content`}>{children}</div>
    </aside>
  );
}
