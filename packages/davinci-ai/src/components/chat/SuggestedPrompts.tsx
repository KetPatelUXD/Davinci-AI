'use client';
import { Button as RACButton } from 'react-aria-components';
import { cn } from '../../utils/cn';

export interface SuggestedPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  /** Float above a composer (glass chips; visible while the composer is focused or hovered). */
  floating?: boolean;
  className?: string;
}

/** Quick-start question chips. Use on empty chat states, or floating above the `Composer`. */
export function SuggestedPrompts({ prompts, onSelect, floating, className }: SuggestedPromptsProps) {
  return (
    <div role="group" aria-label="Suggested questions" className={cn('dv-suggested-prompts', className)} data-floating={floating || undefined}>
      {prompts.map((p) => (
        <RACButton key={p} className={cn('dv-suggested-prompts__prompt', floating && 'dv-glass')} onPress={() => onSelect(p)}>{p}</RACButton>
      ))}
    </div>
  );
}
