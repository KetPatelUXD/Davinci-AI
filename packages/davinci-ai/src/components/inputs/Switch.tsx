'use client';
import { forwardRef, useId, type ReactNode } from 'react';
import { Switch as RACSwitch, type SwitchProps as RACSwitchProps } from 'react-aria-components';
import { cn } from '../../utils/cn';

export interface SwitchProps extends Omit<RACSwitchProps, 'className' | 'children'> {
  className?: string;
  children?: ReactNode;
}

/** On/off setting that applies immediately (46×26 track, `on` thumb when checked). */
export const Switch = forwardRef<HTMLLabelElement, SwitchProps>(function Switch({ className, children, ...rest }, ref) {
  return (
    <RACSwitch ref={ref} {...rest} className={cn('dv-switch', className)}>
      <span className="dv-switch__track" aria-hidden="true"><span className="dv-switch__thumb" /></span>
      {children && <span className="dv-switch__label">{children}</span>}
    </RACSwitch>
  );
});

export interface SwitchRowProps extends Omit<SwitchProps, 'children' | 'aria-label'> {
  /** Row title (e.g. "Quick ticket · NSC1"). Rendered as a heading-less bold label. */
  title: ReactNode;
  /** Small muted text before the switch (e.g. "GTC"). */
  hint?: ReactNode;
  /** Accessible name of the switch itself ("Good till cancelled"). Required. */
  switchLabel: string;
}

/** Pill row: title, optional hint, switch. The switch is the only interactive element; the title is described-by. */
export function SwitchRow({ title, hint, switchLabel, className, ...rest }: SwitchRowProps) {
  const id = useId();
  return (
    <div className={cn('dv-switch-row', className)}>
      <b id={id} className="dv-switch-row__title">{title}</b>
      {hint && <span className="dv-switch-row__hint">{hint}</span>}
      <Switch aria-label={switchLabel} aria-describedby={id} {...rest} />
    </div>
  );
}
