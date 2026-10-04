import { createElement, forwardRef, type ElementType, type HTMLAttributes, type LabelHTMLAttributes, type ReactNode } from 'react';
import { VisuallyHidden as RACVisuallyHidden } from 'react-aria-components';
import { cn } from '../utils/cn';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingVariant = 'title' | 'section' | 'card' | 'h24' | 'h32';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic level (document outline). Independent of the visual `variant`. */
  level?: HeadingLevel;
  /** `title` page title 20/600 · `section` 15/600 · `card` quiet card title 16/400 secondary · `h24`/`h32` marketing-scale. */
  variant?: HeadingVariant;
}

/** Heading with visual variants decoupled from semantic level. Use `card` for the quiet title inside a Card. */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading({ level = 2, variant = 'section', className, ...rest }, ref) {
  return createElement(`h${level}`, { ref, className: cn('dv-heading', `dv-heading--${variant}`, className), ...rest });
});

export type TextVariant = 'base' | 'small' | 'overline' | 'comfortable' | 'body-lg';
export type TextTone = 'default' | 'secondary' | 'muted' | 'positive' | 'negative' | 'brand';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: TextVariant;
  tone?: TextTone;
  weight?: 'regular' | 'medium' | 'semibold';
  /** Tabular figures – always on for numbers; set for any text that sits in a numeric column. */
  tabular?: boolean;
  truncate?: boolean;
}

/** Body text on the Graphite type scale (13 base for dense UI). */
export function Text({ as = 'span', variant = 'base', tone = 'default', weight, tabular, truncate, className, ...rest }: TextProps) {
  return createElement(as, {
    className: cn('dv-text', `dv-text--${variant}`, `dv-tone--${tone}`, weight && `dv-weight--${weight}`, tabular && 'dv:tabular-nums', truncate && 'dv:truncate dv:min-w-0', className),
    ...rest,
  });
}

/** Form label. Pair with `htmlFor`; fields in the library render their own labels via `FormField`. */
export function Label({ className, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  return <label className={cn('dv-label', className)} {...rest} />;
}

export interface NumberTextProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  /** Use the medium weight value style (e.g. last price). */
  strong?: boolean;
}
/** Tabular-figure numeric text (`Mono` value style). */
export function NumberText({ strong, className, ...rest }: NumberTextProps) {
  return <span className={cn('dv:tabular-nums', strong && 'dv-weight--medium', className)} {...rest} />;
}
export const Mono = NumberText;

export interface DisplayNumberProps extends HTMLAttributes<HTMLDivElement> {
  /** Pre-formatted value (e.g. "84.62"). */
  value: ReactNode;
  /** Small muted suffix such as "USD". */
  unit?: ReactNode;
  size?: 42 | 48 | 64;
}
/** Thin (300) large numeral with a small muted unit – the signature figure of the style. */
export function DisplayNumber({ value, unit, size = 42, className, ...rest }: DisplayNumberProps) {
  return (
    <div className={cn('dv-display dv:tabular-nums', `dv-display--${size}`, className)} {...rest}>
      <span>{value}</span>
      {unit != null && <small>{unit}</small>}
    </div>
  );
}

/** Hides content visually while keeping it available to assistive technology. */
export const VisuallyHidden = RACVisuallyHidden;
