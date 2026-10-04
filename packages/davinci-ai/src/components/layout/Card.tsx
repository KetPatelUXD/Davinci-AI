'use client';
import { forwardRef, useId, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { useTheme, type CardBorder } from '../../foundations/ThemeProvider';
import { useSpotlight } from '../../utils/hooks';
import { cn } from '../../utils/cn';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Quiet 16/400 secondary title. When set the card is a labelled `<section>` landmark-free region. */
  title?: ReactNode;
  /** Muted unit after the title (e.g. "· $/bbl"). */
  unit?: ReactNode;
  /** Heading level of the title (document outline). */
  titleLevel?: 2 | 3 | 4 | 5 | 6;
  /** Right-aligned header actions. */
  actions?: ReactNode;
  /** Apply the 22×24 content padding (default true). Disable for edge-to-edge content such as tables. */
  padded?: boolean;
  /** Override the theme's card border: `spotlight` (default), `none`, `1px`. */
  border?: CardBorder;
  /** Rise-in on mount (12px, 700ms). A number staggers by `n × 40ms`. */
  rise?: boolean | number;
  /** Cursor spotlight. Default on when `border` is `spotlight`. */
  spotlight?: boolean;
  as?: 'section' | 'div' | 'article' | 'aside';
}

/**
 * Graphite card: lit-corner gradient, borderless at rest, radius 26. On hover **and** keyboard focus a 1px edge is lit
 * near the cursor (spotlight). Everything quiet; content decides the hierarchy.
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { title, unit, titleLevel = 2, actions, padded = true, border, rise, spotlight = true, as: As = 'section', className, style, children, ...rest },
  ref,
) {
  const { cardBorder } = useTheme();
  const eff = border ?? cardBorder;
  const id = useId();
  const sp = useSpotlight<HTMLElement>();
  const H = `h${titleLevel}` as 'h2';
  const st = rise ? ({ ...style, ['--dv-rise-delay' as string]: `${typeof rise === 'number' ? rise * 0.04 : 0}s` } as CSSProperties) : style;
  return (
    <As
      {...rest}
      ref={(el: HTMLElement | null) => { sp.ref.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }}
      {...(spotlight && eff === 'spotlight' ? { onPointerMove: sp.onPointerMove, onFocus: sp.onFocus } : {})}
      aria-labelledby={title ? id : rest['aria-labelledby']}
      data-border={eff}
      data-rise={rise ? '' : undefined}
      className={cn('dv-card', padded && 'dv-card__pad', className)}
      style={st}
    >
      {(title || actions) && (
        <header className="dv-card__head">
          {title && <H id={id} className="dv-card__title">{title}{unit && <> <span className="dv-card__unit">{unit}</span></>}</H>}
          {actions && <div className="dv-card__actions">{actions}</div>}
        </header>
      )}
      {children}
    </As>
  );
});
