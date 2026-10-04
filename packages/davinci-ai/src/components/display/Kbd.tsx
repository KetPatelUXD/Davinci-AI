import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

/** Keyboard shortcut hint, e.g. `<Kbd>⌘L</Kbd>`. */
export function Kbd({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <kbd className={cn('dv-kbd', className)} {...rest} />;
}
