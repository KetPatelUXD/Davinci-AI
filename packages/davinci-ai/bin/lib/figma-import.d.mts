import type { ResolvedTokens, ThemeFile } from './theme-core.mjs';
export interface FigmaImportReport { matched: number; changed: number; unmatched: string[]; notes: string[] }
export function importFigma(json: unknown, resolved: ResolvedTokens, library: { collections: Record<string, { modes: string[]; variables: Array<Record<string, unknown>> }> }): { theme: ThemeFile; report: FigmaImportReport };
