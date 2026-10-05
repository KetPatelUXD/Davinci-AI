import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

/** Inline 7px-radius chip for symbols, codes and highlighted words ("NSC1"). */
export function CodeChip({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <code className={cn('dv-code-chip', className)} {...rest} />;
}
