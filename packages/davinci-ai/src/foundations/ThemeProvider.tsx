'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type HTMLAttributes, type ReactNode } from 'react';
import { I18nProvider } from 'react-aria-components';
import { MotionConfig } from 'motion/react';
import { cn } from '../utils/cn';
import { compileTheme, type ThemeConfig } from '../theme';

export type ThemeName = 'dark' | 'light' | (string & {});
export type StyleName = 'graphite' | (string & {});
export type Density = 'comfortable' | 'compact';
export type CardBorder = 'spotlight' | 'none' | '1px';
export type MarketDirection = 'standard' | 'inverted';

export interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  style: StyleName;
  density: Density;
  cardBorder: CardBorder;
  /** `standard`: green up / red down. `inverted`: red up / green down (e.g. some Asian markets). */
  direction: MarketDirection;
  colorBlindSafe: boolean;
  locale: string;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark', setTheme: () => {}, toggleTheme: () => {}, style: 'graphite', density: 'comfortable', cardBorder: 'spotlight', direction: 'standard', colorBlindSafe: false, locale: 'en-US',
});

export const useTheme = () => useContext(ThemeContext);

export interface ThemeProviderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Controlled theme. Omit to let the provider manage it (see `defaultTheme`). */
  theme?: ThemeName | 'system';
  /** Initial theme when uncontrolled. Dark is the default experience. */
  defaultTheme?: ThemeName | 'system';
  onThemeChange?: (theme: ThemeName) => void;
  /** Visual style. Only `graphite` ships today; the hook exists so more styles can be added later. */
  styleName?: StyleName;
  density?: Density;
  /** Hover treatment for cards. Default `spotlight`: borderless at rest, cursor-lit edge on hover/focus. */
  cardBorder?: CardBorder;
  direction?: MarketDirection;
  /** Colour-blind-safe long/short palette (blue/orange). */
  colorBlindSafe?: boolean;
  /** BCP-47 locale for numbers, currency and dates. Default `en-US`. */
  locale?: string;
  /**
   * A theme file (the JSON written by `npx davinci theme --init`): brand colour, radius, density, fonts and per-mode colour overrides.
   * It is compiled to CSS custom properties, contrast-checked, and scoped to this provider (and `<html>` with `attachToRoot`).
   * An invalid file is ignored (the default theme stays) and the problems are logged in development.
   * For a static stylesheet instead, compile it with the CLI. Changing the object's contents recompiles it.
   */
  themeConfig?: ThemeConfig;
  /** Also write `data-theme` etc. to `<html>` so portalled overlays and the page background follow the theme. */
  attachToRoot?: boolean;
  /** Render without a wrapper box (`display: contents`). Default true. Set false to paint the canvas colour. */
  canvas?: boolean;
  children: ReactNode;
}

/**
 * Sets the theme (`data-theme`), style, density and locale for everything below it. Supports nesting.
 * SSR-safe: renders `dark` on the server and resolves `system` after hydration.
 */
export function ThemeProvider({
  theme: themeProp, defaultTheme = 'dark', onThemeChange, styleName = 'graphite', density = 'comfortable', cardBorder = 'spotlight', direction = 'standard', colorBlindSafe, locale = 'en-US', themeConfig, attachToRoot, canvas, className, children, ...rest
}: ThemeProviderProps) {
  const dev = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';
  const configKey = themeConfig ? JSON.stringify(themeConfig) : '';
  const compiled = useMemo(() => {
    if (!configKey) return null;
    try {
      const probe = compileTheme(JSON.parse(configKey));
      if (!probe.ok) { if (dev) console.error(`[DaVinci.AI] themeConfig ignored:\n${probe.errors.join('\n')}`); return null; }
      return { ...compileTheme(JSON.parse(configKey), { scope: `[data-dv-theme='${probe.id}']` }), id: probe.id };
    } catch (e) {
      if (dev) console.error(`[DaVinci.AI] themeConfig ignored: ${(e as Error).message}`);
      return null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey]);
  const [internal, setInternal] = useState<ThemeName | 'system'>(defaultTheme);
  const requested = themeProp ?? internal;
  const [systemDark, setSystemDark] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const update = () => setSystemDark(!mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  const theme: ThemeName = requested === 'system' ? (systemDark ? 'dark' : 'light') : requested;

  const setTheme = useCallback((t: ThemeName) => { setInternal(t); onThemeChange?.(t); }, [onThemeChange]);
  const toggleTheme = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);

  const attrs = {
    'data-theme': theme, 'data-style': styleName, 'data-density': density, 'data-card-border': cardBorder, 'data-direction': direction,
    ...(colorBlindSafe ? { 'data-cvd': 'true' } : {}),
    ...(compiled ? { 'data-dv-theme': compiled.id } : {}),
  };
  useEffect(() => {
    if (!attachToRoot) return;
    const el = document.documentElement;
    const prev = Object.fromEntries(Object.keys(attrs).map((k) => [k, el.getAttribute(k)]));
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return () => Object.entries(prev).forEach(([k, v]) => (v === null ? el.removeAttribute(k) : el.setAttribute(k, v)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachToRoot, theme, styleName, density, cardBorder, direction, colorBlindSafe, compiled?.id]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme, style: styleName, density, cardBorder, direction, colorBlindSafe: !!colorBlindSafe, locale }),
    [theme, setTheme, toggleTheme, styleName, density, cardBorder, direction, colorBlindSafe, locale],
  );
  return (
    <ThemeContext.Provider value={value}>
      <I18nProvider locale={locale}>
        <MotionConfig reducedMotion="user">
          <div {...rest} {...attrs} className={cn('dv-theme-provider', className)} data-canvas={canvas || undefined}>
            {compiled && <style data-dv-theme-style={compiled.id} dangerouslySetInnerHTML={{ __html: compiled.css }} />}
            {children}
          </div>
        </MotionConfig>
      </I18nProvider>
    </ThemeContext.Provider>
  );
}

export interface DensityProviderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  density: Density;
  children: ReactNode;
}

/** Scopes control sizes/paddings to `compact` or `comfortable` for everything below. */
export function DensityProvider({ density, className, children, ...rest }: DensityProviderProps) {
  const parent = useTheme();
  const value = useMemo(() => ({ ...parent, density }), [parent, density]);
  return (
    <ThemeContext.Provider value={value}>
      <div {...rest} data-density={density} className={cn('dv:contents', className)}>{children}</div>
    </ThemeContext.Provider>
  );
}

/** Attributes to put on portalled overlays (Popover, Modal, Tooltip, Toast) so they inherit theme, density and locale. */
export function useThemeAttributes() {
  const { theme, style, density, direction, cardBorder, colorBlindSafe } = useTheme();
  return { 'data-theme': theme, 'data-style': style, 'data-density': density, 'data-direction': direction, 'data-card-border': cardBorder, ...(colorBlindSafe ? { 'data-cvd': 'true' } : {}), className: 'dv-theme-provider' } as const;
}
