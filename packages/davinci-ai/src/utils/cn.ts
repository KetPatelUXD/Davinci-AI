import { clsx, type ClassValue } from 'clsx';

/** Join class names. Library classes are plain `dv-*` CSS classes, so no Tailwind merging is needed. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
