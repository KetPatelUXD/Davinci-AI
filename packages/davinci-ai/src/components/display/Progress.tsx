'use client';
import { useId } from 'react';
import { ProgressBar as RACProgressBar, Label, type ProgressBarProps as RACProgressBarProps } from 'react-aria-components';
import { cn } from '../../utils/cn';
import type { Tone } from './Badge';

export interface ProgressBarProps extends Omit<RACProgressBarProps, 'className' | 'children'> {
  label?: string;
  /** Show the formatted value to the right of the label. */
  showValue?: boolean;
  tone?: Tone;
  className?: string;
}

/** Determinate or indeterminate (`isIndeterminate`) progress bar. */
export function ProgressBar({ label, showValue, tone = 'neutral', className, ...rest }: ProgressBarProps) {
  return (
    <RACProgressBar {...rest} className={cn('dv-progress', className)} data-tone={tone}>
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          {(label || showValue) && (
            <div className="dv-progress__head">
              {label && <Label className="dv-field__label">{label}</Label>}
              {showValue && !isIndeterminate && <span className="dv:tabular-nums dv-progress__val">{valueText}</span>}
            </div>
          )}
          <div className="dv-progress__track"><div className="dv-progress__fill" style={isIndeterminate ? undefined : { width: `${percentage}%` }} /></div>
        </>
      )}
    </RACProgressBar>
  );
}

export interface ProgressCircleProps extends Omit<RACProgressBarProps, 'className' | 'children'> {
  size?: number;
  tone?: Tone;
  className?: string;
}

/** Circular progress. Needs `aria-label` (no visible label). */
export function ProgressCircle({ size = 40, tone = 'neutral', className, ...rest }: ProgressCircleProps) {
  const r = 16, c = 2 * Math.PI * r;
  return (
    <RACProgressBar {...rest} className={cn('dv-progresscircle', className)} data-tone={tone} style={{ width: size, height: size }}>
      {({ percentage, isIndeterminate }) => (
        <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" className={isIndeterminate ? 'dv-progresscircle__spin' : undefined}>
          <circle cx="20" cy="20" r={r} fill="none" strokeWidth="4" className="dv-progresscircle__track" />
          <circle cx="20" cy="20" r={r} fill="none" strokeWidth="4" strokeLinecap="round" className="dv-progresscircle__fill" strokeDasharray={c} strokeDashoffset={isIndeterminate ? c * 0.75 : c * (1 - (percentage ?? 0) / 100)} transform="rotate(-90 20 20)" />
        </svg>
      )}
    </RACProgressBar>
  );
}

export interface MeterProps {
  /** Required: visible `label` or `aria-label`. */
  label?: string;
  'aria-label'?: string;
  value: number;
  minValue?: number;
  maxValue?: number;
  /** Text equivalent of the value, e.g. "72% of limit". Defaults to a percentage. */
  valueText?: string;
  showValue?: boolean;
  /** Fixed tone, or leave unset to derive from `warnAt` / `criticalAt` (fractions of the range). */
  tone?: Tone;
  warnAt?: number;
  criticalAt?: number;
  className?: string;
}

/** A value within a known range (limit usage, exposure). Unlike progress it is not a task. Uses `role="meter"`. */
export function Meter({ label, value, minValue = 0, maxValue = 100, valueText, showValue, tone, warnAt, criticalAt, className, ...rest }: MeterProps) {
  const id = useId();
  const f = Math.min(1, Math.max(0, (value - minValue) / (maxValue - minValue || 1)));
  const t: Tone = tone ?? (criticalAt != null && f >= criticalAt ? 'negative' : warnAt != null && f >= warnAt ? 'warning' : 'positive');
  const text = valueText ?? `${Math.round(f * 100)}%`;
  return (
    <div className={cn('dv-progress', className)} data-tone={t}>
      {(label || showValue) && (
        <div className="dv-progress__head">
          {label && <span id={id} className="dv-field__label">{label}</span>}
          {showValue && <span className="dv:tabular-nums dv-progress__val" aria-hidden="true">{text}</span>}
        </div>
      )}
      <div role="meter" aria-labelledby={label ? id : undefined} aria-label={label ? undefined : rest['aria-label']} aria-valuemin={minValue} aria-valuemax={maxValue} aria-valuenow={value} aria-valuetext={text} className="dv-progress__track">
        <div className="dv-progress__fill" style={{ width: `${f * 100}%` }} />
      </div>
    </div>
  );
}
