'use client';
import { forwardRef, useRef, type ReactNode } from 'react';
import { RadioGroup, Radio } from 'react-aria-components';
import { renderIcon, type IconRef } from '../../foundations/Icon';
import { useSlidingThumb, SlidingThumb } from '../../utils/useSlidingThumb';
import { cn } from '../../utils/cn';

export interface SegmentOption {
  id: string;
  label: ReactNode;
  icon?: IconRef;
  /** Small coloured dot before the label (used by SideToggle). */
  dot?: 'positive' | 'negative';
  isDisabled?: boolean;
  /** Accessible name when `label` is not plain text. */
  'aria-label'?: string;
}

export interface SegmentedControlProps {
  /** Required: names the group ("Time range"). */
  'aria-label': string;
  options: SegmentOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** sm 30 · md 38 · lg 44 px (compact 24 / 32 / 40). */
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isDisabled?: boolean;
  className?: string;
}

/**
 * Pill track with a sliding white (`on`) thumb. Single choice that is always set – radio-group semantics.
 * @when Time ranges, view switches, the order side toggle. @whenNot Switching page content that has panels (use `PillTabs`).
 */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(function SegmentedControl(
  { options, value, defaultValue, onChange, size = 'md', fullWidth, isDisabled, className, 'aria-label': ariaLabel },
  ref,
) {
  const inner = useRef<HTMLDivElement>(null);
  const first = options[0]?.id;
  const selected = value ?? undefined;
  const { box, ready } = useSlidingThumb(inner, value ?? defaultValue);
  return (
    <div ref={ref} className={cn('dv-segmented-control', className)} data-size={size} data-full-width={fullWidth || undefined} data-ready={ready || undefined}>
      <RadioGroup
        ref={inner}
        aria-label={ariaLabel}
        orientation="horizontal"
        isDisabled={isDisabled}
        {...(selected !== undefined ? { value: selected } : { defaultValue: defaultValue ?? first ?? '' })}
        onChange={(k) => onChange?.(k)}
        className="dv-segmented-control__track"
      >
        <SlidingThumb box={box} ready={ready} />
        {options.map((o) => (
          <Radio key={o.id} value={o.id} isDisabled={o.isDisabled} aria-label={o['aria-label']} className="dv-segmented-control__option">
            {o.dot && <i className="dv-segmented-control__dot" data-dot={o.dot} aria-hidden="true" />}
            {renderIcon(o.icon)}
            <span>{o.label}</span>
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
});
