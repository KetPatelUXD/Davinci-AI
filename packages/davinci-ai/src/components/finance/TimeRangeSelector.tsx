'use client';
import { SegmentedControl } from '../actions/SegmentedControl';

export type TimeRange = '1D' | '1W' | '1M' | 'YTD' | '1Y' | 'Custom' | (string & {});

export interface TimeRangeSelectorProps {
  value?: TimeRange;
  defaultValue?: TimeRange;
  onChange?: (range: TimeRange) => void;
  ranges?: TimeRange[];
  /** Adds a "Custom" option; selecting it also calls `onCustom` so you can open a date range picker. */
  allowCustom?: boolean;
  onCustom?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Time range switch (1D / 1W / 1M / YTD / 1Y / custom) built on `SegmentedControl`. */
export function TimeRangeSelector({ value, defaultValue = '1M', onChange, ranges = ['1D', '1W', '1M', 'YTD', '1Y'], allowCustom, onCustom, size = 'md', className }: TimeRangeSelectorProps) {
  const all = allowCustom ? [...ranges, 'Custom'] : ranges;
  return (
    <SegmentedControl
      aria-label="Time range"
      size={size}
      className={className}
      value={value}
      defaultValue={defaultValue}
      onChange={(id) => { onChange?.(id); if (id === 'Custom') onCustom?.(); }}
      options={all.map((r) => ({ id: r, label: r }))}
    />
  );
}
