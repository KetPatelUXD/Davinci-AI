'use client';
import { createContext, isValidElement, useContext, useMemo, type ReactElement, type ReactNode, type SVGProps } from 'react';
import { BUILTIN_ICONS } from './icons/builtin';
import { cn } from '../utils/cn';

/** Minimal structural type of a Font Awesome `IconDefinition` so FA stays an optional peer dependency. */
export interface FontAwesomeIconDefinition {
  prefix?: string;
  iconName: string;
  icon: [number, number, unknown[], string, string | string[]];
}

/** Anything the adapter can draw: a Font Awesome definition, or a React node of SVG children (24×24 stroke icon). */
export type IconSource = FontAwesomeIconDefinition | ReactNode;
export type IconStyle = 'light' | 'regular' | 'solid';
export type IconSize = 12 | 14 | 16 | 18 | 20 | 24 | (number & {});

interface IconContextValue {
  icons: Record<string, IconSource>;
  defaultStyle: IconStyle;
}
const IconContext = createContext<IconContextValue>({ icons: BUILTIN_ICONS, defaultStyle: 'light' });

export interface IconProviderProps {
  /** Map of kebab-case icon name → icon. Merged over the built-in set so a project can swap its icon set without touching components. */
  icons?: Record<string, IconSource>;
  /** Default Font Awesome style used when an icon map has several styles. Figma parity: `light`. */
  defaultStyle?: IconStyle;
  children: ReactNode;
}

/** Registers icons by name for every `<Icon name="…" />` below it. */
export function IconProvider({ icons, defaultStyle = 'light', children }: IconProviderProps) {
  const parent = useContext(IconContext);
  const value = useMemo(() => ({ icons: { ...parent.icons, ...icons }, defaultStyle }), [parent.icons, icons, defaultStyle]);
  return <IconContext.Provider value={value}>{children}</IconContext.Provider>;
}

/** Builds an icon map from Font Awesome definitions, keyed by their kebab-case `iconName`. */
export function createIconMap(definitions: FontAwesomeIconDefinition[]): Record<string, IconSource> {
  return Object.fromEntries(definitions.map((d) => [d.iconName, d]));
}

const isFa = (v: unknown): v is FontAwesomeIconDefinition =>
  !!v && typeof v === 'object' && 'iconName' in (v as object) && Array.isArray((v as FontAwesomeIconDefinition).icon);

type IconBaseProps = Omit<SVGProps<SVGSVGElement>, 'name' | 'ref'>;

export type IconProps = IconBaseProps & {
  /** Kebab-case icon name, identical to the Figma `Icon` component's `name` property, e.g. `chart-line`. */
  name?: string;
  /** Font Awesome definition (or any {@link IconSource}) – alternative to `name`. */
  icon?: IconSource;
  /** Pixel size; Figma sizes are 12 / 14 / 16 / 18. Defaults to the surrounding control's icon size, else 16. */
  size?: IconSize;
  /** Accessible name. Omit for decorative icons (they are `aria-hidden`). */
  label?: string;
};

/**
 * Renders an icon by name or Font Awesome definition. Decorative by default (`aria-hidden`); pass `label`
 * only when the icon carries meaning on its own. Icon-only *buttons* must label the button, not the icon.
 */
export function Icon({ name, icon, size, label, className, style, strokeWidth, ...rest }: IconProps) {
  const ctx = useContext(IconContext);
  const source: IconSource = icon ?? (name ? ctx.icons[name] ?? BUILTIN_ICONS[name] : undefined);
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const, focusable: false as const };
  const dim = {};
  const cls = cn('dv-icon', className);
  const st = { ...style, ...(size ? ({ '--dv-icon-size': `${size}px` } as object) : {}), ...(strokeWidth ? { strokeWidth } : {}) };
  if (!source) {
    if ((globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== 'production') console.warn(`[davinci] Unknown icon "${name}". Register it with <IconProvider icons={…}>.`);
    return <svg className={cls} viewBox="0 0 24 24" {...dim} {...a11y} {...rest} />;
  }
  if (isFa(source)) {
    const [w, h, , , path] = source.icon;
    return (
      <svg className={cls} data-fill viewBox={`0 0 ${w} ${h}`} {...dim} {...a11y} style={st} data-icon={source.iconName} {...rest}>
        {Array.isArray(path) ? (<><path d={path[0]} opacity={0.4} /><path d={path[1]} /></>) : <path d={path} />}
      </svg>
    );
  }
  return (
    <svg className={cls} viewBox="0 0 24 24" {...dim} {...a11y} style={st} data-icon={name} {...rest}>
      {source as ReactNode}
    </svg>
  );
}

/** What a component accepts for an icon slot: a kebab-case name, a Font Awesome definition, or a ready `<Icon />` element. */
export type IconRef = string | FontAwesomeIconDefinition | ReactElement;

/** Renders an {@link IconRef} (decorative). Returns null for empty values. */
export function renderIcon(ref: IconRef | null | undefined | false, size?: IconSize): ReactNode {
  if (ref == null || ref === false) return null;
  if (typeof ref === 'string') return <Icon name={ref} size={size} />;
  if (isValidElement(ref)) return ref;
  return <Icon icon={ref} size={size} />;
}
