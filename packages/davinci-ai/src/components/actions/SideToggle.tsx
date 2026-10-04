'use client';
import { SegmentedControl } from './SegmentedControl';

export type OrderSide = 'buy' | 'sell';

export interface SideToggleProps {
  value?: OrderSide;
  defaultValue?: OrderSide;
  onChange?: (side: OrderSide) => void;
  buyLabel?: string;
  sellLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Buy/Sell (Long/Short) segmented toggle. Each side carries a coloured dot **and** its text label – never colour alone. */
export function SideToggle({ value, defaultValue = 'buy', onChange, buyLabel = 'Buy · Long', sellLabel = 'Sell · Short', size = 'lg', className }: SideToggleProps) {
  return (
    <SegmentedControl
      aria-label="Side"
      fullWidth
      size={size}
      className={className}
      value={value}
      defaultValue={defaultValue}
      onChange={(id) => onChange?.(id as OrderSide)}
      options={[
        { id: 'buy', label: buyLabel, dot: 'positive' },
        { id: 'sell', label: sellLabel, dot: 'negative' },
      ]}
    />
  );
}
