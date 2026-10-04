import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Person or entity name – used for initials and the accessible name. */
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Hide from assistive tech when the name is shown next to it. */
  decorative?: boolean;
}

const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');

/** Circular avatar with image or initials on a neutral gradient. */
export function Avatar({ name, src, size = 'md', decorative, className, ...rest }: AvatarProps) {
  return (
    <span className={cn('dv-avatar', className)} data-size={size} {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': name })} {...rest}>
      {src ? <img src={src} alt="" /> : initials(name)}
    </span>
  );
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  people: { name: string; src?: string }[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

/** Overlapping avatars with a "+N" overflow. */
export function AvatarGroup({ people, max = 4, size = 'md', className, ...rest }: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div role="group" aria-label={`${people.length} people`} className={cn('dv-avatars', className)} {...rest}>
      {shown.map((p) => <Avatar key={p.name} {...p} size={size} />)}
      {extra > 0 && <span className="dv-avatar" data-size={size} data-more="true" aria-label={`${extra} more`} role="img">+{extra}</span>}
    </div>
  );
}
