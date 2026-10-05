'use client';
import { useState } from 'react';
import { ToggleButton } from 'react-aria-components';
import { IconButton } from '../actions/IconButton';
import { Icon } from '../../foundations/Icon';
import { cn } from '../../utils/cn';

export interface MessageActionsProps {
  /** Text copied by the Copy action. */
  copyText?: string;
  onCopy?: () => void;
  onRetry?: () => void;
  /** Feedback: `up`, `down` or null. */
  feedback?: 'up' | 'down' | null;
  onFeedback?: (value: 'up' | 'down' | null) => void;
  className?: string;
}

/** Copy, retry and thumbs up/down. Revealed on hover **and** focus-within (always visible on touch). */
export function MessageActions({ copyText, onCopy, onRetry, feedback, onFeedback, className }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [own, setOwn] = useState<'up' | 'down' | null>(null);
  const fb = feedback ?? own;
  const setFb = (v: 'up' | 'down' | null) => { setOwn(v); onFeedback?.(v); };
  return (
    <div role="toolbar" aria-label="Message actions" className={cn('dv-message-actions', className)}>
      <IconButton
        label={copied ? 'Copied' : 'Copy message'}
        icon={copied ? 'check' : 'copy'}
        size="sm"
        variant="ghost"
        onPress={async () => {
          try { if (copyText != null) await navigator.clipboard?.writeText(copyText); } catch { /* clipboard unavailable */ }
          onCopy?.();
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
      />
      {onRetry && <IconButton label="Retry" icon="rotate-right" size="sm" variant="ghost" onPress={onRetry} />}
      <ToggleButton aria-label="Good response" isSelected={fb === 'up'} onChange={(s) => setFb(s ? 'up' : null)} className="dv-icon-button" data-variant="ghost" data-size="sm"><Icon name="thumbs-up" size={14} /></ToggleButton>
      <ToggleButton aria-label="Poor response" isSelected={fb === 'down'} onChange={(s) => setFb(s ? 'down' : null)} className="dv-icon-button" data-variant="ghost" data-size="sm"><Icon name="thumbs-down" size={14} /></ToggleButton>
      <span className="dv:sr-only" role="status">{copied ? 'Message copied' : ''}</span>
    </div>
  );
}
