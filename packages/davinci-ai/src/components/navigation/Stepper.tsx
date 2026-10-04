import type { ReactNode } from 'react';
import { Icon } from '../../foundations/Icon';
import { cn } from '../../utils/cn';

export interface Step {
  id: string;
  label: ReactNode;
  description?: ReactNode;
}

export interface StepperProps {
  steps: Step[];
  /** Zero-based index of the current step. Earlier steps are complete. */
  current: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  'aria-label'?: string;
}

/** Progress through a multi-step flow. Each state is conveyed by icon/number **and** a visually hidden status. */
export function Stepper({ steps, current, orientation = 'horizontal', className, 'aria-label': label = 'Progress' }: StepperProps) {
  return (
    <ol aria-label={label} className={cn('dv-stepper', className)} data-orientation={orientation}>
      {steps.map((s, i) => {
        const state = i < current ? 'complete' : i === current ? 'current' : 'upcoming';
        return (
          <li key={s.id} className="dv-stepper__step" data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="dv-stepper__dot" aria-hidden="true">{state === 'complete' ? <Icon name="check" size={12} strokeWidth={2.4} /> : i + 1}</span>
            <span className="dv-stepper__text">
              <span className="dv-stepper__label">{s.label}<span className="dv:sr-only">{state === 'complete' ? ' (completed)' : state === 'current' ? ' (current step)' : ' (not started)'}</span></span>
              {s.description && <span className="dv-field__hint">{s.description}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
