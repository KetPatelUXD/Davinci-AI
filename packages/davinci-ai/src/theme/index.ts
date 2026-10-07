import { compileTheme as compile, validateTheme as validate, type CompileResult, type ThemeFile } from '../../bin/lib/theme-core.mjs';
import { tokens } from '../generated/tokens';

export type { ThemeFile as ThemeConfig, CompileResult as CompiledTheme } from '../../bin/lib/theme-core.mjs';

/**
 * Compiles a theme file (see `davinci theme --init`) to CSS custom properties, validated against the library's contrast rules.
 * Same compiler as the `davinci` CLI. Pass `scope` (a selector such as `[data-dv-theme='x']`) to limit where it applies.
 */
export function compileTheme(config: ThemeFile, opts?: { scope?: string }): CompileResult {
  return compile(config, tokens as never, opts);
}

/** Checks a theme file without producing CSS: unknown roles, bad colours and contrast failures. */
export function validateTheme(config: ThemeFile): { ok: boolean; errors: string[]; warnings: string[] } {
  return validate(config, tokens as never);
}
