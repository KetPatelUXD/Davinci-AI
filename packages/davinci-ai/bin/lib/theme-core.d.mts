export type Mode = 'dark' | 'light';
export type ThemeValue<T = string> = T | { $type?: string; $value: T };
export interface ThemeFile {
  $schema?: string;
  $description?: string;
  $extensions?: { davinci?: { unsafe?: boolean } };
  /** Brand colour: a preset name (`teal`) or a hex. Dark/light text, fill, wash and focus are derived and contrast-checked. */
  brand?: ThemeValue;
  /** Preset (`$value`) plus optional per-role radii, e.g. `{ "$value": "soft", "card": { "$value": 24 } }`. */
  radius?: ({ $value?: 'sharp' | 'balanced' | 'soft' } & { [role: string]: unknown }) | 'sharp' | 'balanced' | 'soft';
  /** Component size/padding overrides per density, keyed by CSS name without `--dv-` (e.g. `button-height-md`). */
  size?: { comfortable?: Record<string, ThemeValue<string | number>>; compact?: Record<string, ThemeValue<string | number>> };
  density?: ThemeValue<'small' | 'medium' | 'large'>;
  mode?: ThemeValue<'dark' | 'light' | 'system'>;
  font?: { sans?: ThemeValue; mono?: ThemeValue };
  /** Per-mode overrides of semantic colour roles, keyed by CSS name without `--dv-` (e.g. `bg`, `text-secondary`). */
  color?: { dark?: Record<string, ThemeValue>; light?: Record<string, ThemeValue> };
}
export interface ResolvedTokens { dark: Record<string, string>; light: Record<string, string>; component?: { comfortable: Record<string, string>; compact: Record<string, string> }; [k: string]: unknown }
export interface ContrastReport { fillWhite: number; darkText: number; lightText: number; darkFocus: number; lightFocus: number }
export interface CompileResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  css: string;
  json: Record<string, unknown>;
  ts: string;
  report?: ContrastReport;
  /** Short content hash, usable as a scope id. */
  id: string;
}
export const PRESETS: Record<string, string>;
export const RADIUS: Record<string, Record<string, string>>;
export const DENSITY: Record<string, { defaultDensity: 'compact' | 'comfortable'; css: Record<string, string> }>;
export function propose(text: string): { primary: string; density: string; radius: string; mode: string };
export function toLength(v: unknown): string | null;
export function radiusRoles(resolved: ResolvedTokens): string[];
export function sizeRoles(resolved: ResolvedTokens): string[];
export function colourRoles(resolved: ResolvedTokens): string[];
export function brandTokens(hex: string, resolved: ResolvedTokens): { dark: Record<string, string>; light: Record<string, string>; report: ContrastReport };
export function normalizeTheme(input: unknown): Record<string, unknown>;
export function checkContrast(merged: { dark: Record<string, string>; light: Record<string, string> }): string[];
export function compileTheme(input: ThemeFile | Record<string, unknown>, resolved: ResolvedTokens, opts?: { scope?: string }): CompileResult;
export function validateTheme(input: unknown, resolved: ResolvedTokens): { ok: boolean; errors: string[]; warnings: string[]; report?: ContrastReport };
export function sampleTheme(brand?: string): ThemeFile;
export function themeSchema(resolved: ResolvedTokens): Record<string, unknown>;
