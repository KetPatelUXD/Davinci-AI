'use client';
import { cloneElement, type ReactElement } from 'react';
import { useFocusRing } from 'react-aria';
import { cn } from '../utils/cn';

export interface FocusRingProps {
  /** Single focusable child. */
  children: ReactElement<{ className?: string }>;
  /** Treat focus-within as focus (for composite widgets). */
  within?: boolean;
  /** Also show the ring for pointer focus (text inputs always should). */
  isTextInput?: boolean;
}

/**
 * Adds the library focus ring (`2px solid focus`, 2px offset) to any child on keyboard focus. Components in the
 * library already do this through CSS; use FocusRing for your own interactive elements.
 */
export function FocusRing({ children, within, isTextInput }: FocusRingProps) {
  const { isFocusVisible, focusProps } = useFocusRing({ within, isTextInput });
  return cloneElement(children, {
    ...focusProps,
    className: cn(children.props.className, 'dv-focus-target', isFocusVisible && 'dv-focus-ring'),
  } as object);
}
