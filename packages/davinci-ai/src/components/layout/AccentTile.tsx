'use client';
import type { ReactNode } from 'react';
import { Button as RACButton } from 'react-aria-components';
import { cn } from '../../utils/cn';

export interface AccentTileProps {
  label: ReactNode;
  /** Value text, e.g. "+1.42%". Include the sign: colour alone is never the signal. */
  value?: ReactNode;
  /** Colours the 3px accent bar and the value. `neutral` uses the text colour. */
  intent?: 'positive' | 'negative' | 'neutral' | 'brand' | 'warning' | 'info';
  /** Makes the tile a button. */
  onPress?: () => void;
  className?: string;
}

/** Tile with a 3px coloured left accent bar (name + signed change). Interactive when `onPress` is set. */
export function AccentTile({ label, value, intent = 'neutral', onPress, className }: AccentTileProps) {
  const inner = (<><span className="dv-accent-tile__label">{label}</span>{value != null && <b className="dv-accent-tile__value dv:tabular-nums">{value}</b>}</>);
  return onPress ? (
    <RACButton onPress={onPress} className={cn('dv-accent-tile', className)} data-intent={intent}>{inner}</RACButton>
  ) : (
    <div className={cn('dv-accent-tile', className)} data-intent={intent}>{inner}</div>
  );
}
