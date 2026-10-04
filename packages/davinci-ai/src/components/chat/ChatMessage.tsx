'use client';
import { useState, type ReactNode } from 'react';
import { Button } from '../actions/Button';
import { IconButton } from '../actions/IconButton';
import { TextArea } from '../inputs/TextField';
import { LeoMark } from '../../foundations/DaVinciLogo';
import { cn } from '../../utils/cn';

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  /** Message body. For assistant messages pass rich content (wrap in `Prose`). */
  children: ReactNode;
  /** User messages only: plain text enabling Edit → Save & resend. */
  text?: string;
  onEdit?: (text: string) => void;
  /** Assistant messages: `MessageActions` shown on hover **and** focus. */
  actions?: ReactNode;
  /** Assistant messages: reasoning/tool blocks above the answer. */
  trace?: ReactNode;
  className?: string;
}

/**
 * Chat turn. **User**: subtle rounded bubble, right-aligned, editable. **Assistant**: no bubble, full-width rich text
 * with an optional trace (reasoning / tools) above and actions below.
 */
export function ChatMessage({ role, children, text, onEdit, actions, trace, className }: ChatMessageProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text ?? '');
  if (role === 'user') {
    return (
      <article aria-label="Your message" className={cn('dv-msg dv-msg--user', className)}>
        {editing ? (
          <form className="dv-msg__edit" onSubmit={(e) => { e.preventDefault(); onEdit?.(draft); setEditing(false); }}>
            <TextArea aria-label="Edit your message" value={draft} onChange={setDraft} rows={3} autoFocus />
            <div className="dv-msg__editbtns">
              <Button variant="ghost" size="sm" onPress={() => { setDraft(text ?? ''); setEditing(false); }}>Cancel</Button>
              <Button size="sm" type="submit" isDisabled={!draft.trim()}>Save &amp; resend</Button>
            </div>
          </form>
        ) : (
          <>
            <div className="dv-msg__bubble">{children}</div>
            {onEdit && text !== undefined && <IconButton label="Edit message" icon="pen" size="sm" variant="ghost" className="dv-msg__edit-btn" onPress={() => { setDraft(text); setEditing(true); }} />}
          </>
        )}
      </article>
    );
  }
  return (
    <article aria-label="LEO's reply" className={cn('dv-msg dv-msg--assistant', className)}>
      <LeoMark size={22} className="dv-msg__avatar" />
      <div className="dv-msg__main">
        {trace}
        <div className="dv-msg__body">{children}</div>
        {actions && <div className="dv-msg__actions">{actions}</div>}
      </div>
    </article>
  );
}
