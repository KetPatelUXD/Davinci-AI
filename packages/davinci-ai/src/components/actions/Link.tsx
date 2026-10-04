'use client';
import { forwardRef, type ReactNode } from 'react';
import { Link as RACLink, type LinkProps as RACLinkProps } from 'react-aria-components';
import { Icon } from '../../foundations/Icon';
import { cn } from '../../utils/cn';

export interface LinkProps extends Omit<RACLinkProps, 'className' | 'children'> {
  /** `brand` coloured (default) · `inherit` keeps surrounding text colour with an underline. */
  tone?: 'brand' | 'inherit';
  /** Adds an external-link glyph and `rel="noopener noreferrer" target="_blank"`. */
  external?: boolean;
  className?: string;
  children?: ReactNode;
}

/** Navigation to another location. Use `Button` for actions that don't navigate. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ tone = 'brand', external, className, children, ...rest }, ref) {
  return (
    <RACLink ref={ref} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest} data-tone={tone} className={cn('dv-link', className)}>
      {children}
      {external && (<><Icon name="up-right-from-square" size={12} /><span className="dv:sr-only"> (opens in a new tab)</span></>)}
    </RACLink>
  );
});
