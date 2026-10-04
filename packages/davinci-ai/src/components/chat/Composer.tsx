'use client';
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '../actions/Button';
import { IconButton } from '../actions/IconButton';
import { Menu } from '../navigation/Menu';
import { Kbd } from '../display/Kbd';
import { Icon } from '../../foundations/Icon';
import { LeoMark } from '../../foundations/DaVinciLogo';
import { cn } from '../../utils/cn';
import { SuggestedPrompts } from './SuggestedPrompts';

export interface ComposerContext {
  id: string;
  /** e.g. "NSC1" */
  label: string;
}

export interface ComposerMode {
  id: string;
  label: string;
}

export interface ComposerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Called on Enter (or the send button) with the trimmed text. The field clears and keeps focus. */
  onSubmit: (text: string) => void;
  isStreaming?: boolean;
  /** Stop generating (the send button turns into a stop button while streaming). */
  onStop?: () => void;
  placeholder?: string;
  contexts?: ComposerContext[];
  onRemoveContext?: (id: string) => void;
  modes?: ComposerMode[];
  mode?: string;
  onModeChange?: (id: string) => void;
  onAttach?: () => void;
  onTools?: () => void;
  /** Prompts floating above the composer while it is focused. */
  suggestions?: string[];
  /** Pin to the bottom centre of the viewport (min(720px, 100vw − 48px)). */
  docked?: boolean;
  /** ⌘L / Ctrl+L focuses the composer. Default true. */
  hotkey?: boolean;
  className?: string;
}

/**
 * Ask LEO composer – two rows on floating glass (radius 26). Row 1: LEO mark + auto-growing input. Row 2: attach, tools,
 * removable context chip, mode menu, ⌘L hint and a round send/stop button. Enter sends, Shift+Enter adds a line.
 */
export function Composer({
  value, defaultValue = '', onChange, onSubmit, isStreaming, onStop, placeholder = 'Ask LEO about prices, spreads or news…', contexts = [], onRemoveContext,
  modes = [{ id: 'markets', label: 'Markets' }], mode, onModeChange, onAttach, onTools, suggestions, docked, hotkey = true, className,
}: ComposerProps) {
  const [own, setOwn] = useState(defaultValue);
  const text = value ?? own;
  const ref = useRef<HTMLTextAreaElement>(null);
  const id = useId();
  const [modeId, setModeId] = useState(mode ?? modes[0]!.id);
  const currentMode = modes.find((m) => m.id === (mode ?? modeId)) ?? modes[0]!;
  const set = (v: string) => { setOwn(v); onChange?.(v); };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [text]);
  useEffect(() => {
    if (!hotkey) return;
    const h = (e: globalThis.KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l') { e.preventDefault(); ref.current?.focus(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [hotkey]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t) { ref.current?.focus(); return; }
    if (isStreaming) return;
    onSubmit(t);
    set('');
    requestAnimationFrame(() => ref.current?.focus());
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); }
  };

  return (
    <div className={cn('dv-composer-wrap', className)} data-docked={docked || undefined}>
      {suggestions && suggestions.length > 0 && (
        <SuggestedPrompts floating prompts={suggestions} onSelect={(p) => { set(p); ref.current?.focus(); }} />
      )}
      <form className="dv-composer dv-glass" aria-label="Ask LEO" onSubmit={submit}>
        <div className="dv-composer__r1">
          <LeoMark size={24} />
          <label htmlFor={id} className="dv:sr-only">Ask LEO</label>
          <textarea id={id} ref={ref} rows={1} value={text} placeholder={placeholder} autoComplete="off" className="dv-composer__input" onChange={(e) => set(e.target.value)} onKeyDown={onKeyDown} />
        </div>
        <div className="dv-composer__r2">
          <IconButton label="Add files or context" icon="plus" variant="ghost" size="sm" className="dv-composer__act" onPress={onAttach} />
          <IconButton label="Tools" icon="sliders" variant="ghost" size="sm" className="dv-composer__act" onPress={onTools} />
          {contexts.map((c) => (
            <span key={c.id} className="dv-composer__ctx">
              <Icon name="droplet" size={14} />
              <span>{c.label} <b>· in context</b></span>
              <IconButton label={`Remove ${c.label} from context`} icon="xmark" variant="ghost" size="sm" className="dv-composer__ctxx" onPress={() => onRemoveContext?.(c.id)} />
            </span>
          ))}
          <span className="dv:flex-1" />
          <Menu
            aria-label="LEO mode"
            placement="top end"
            items={modes.map((m) => ({ id: m.id, label: m.label, onAction: () => { setModeId(m.id); onModeChange?.(m.id); } }))}
            trigger={<Button variant="ghost" size="sm" iconEnd="chevron-down">LEO · {currentMode.label}</Button>}
          />
          <Kbd aria-label="Command L" className="dv-composer__kbd">⌘L</Kbd>
          {isStreaming ? (
            <IconButton label="Stop generating" icon="stop" variant="solid" size="md" className="dv-composer__send" onPress={onStop} />
          ) : (
            <IconButton label="Send message" icon="arrow-up" variant="solid" size="md" className="dv-composer__send" type="submit" />
          )}
        </div>
      </form>
    </div>
  );
}
