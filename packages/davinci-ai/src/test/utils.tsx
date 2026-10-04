import type { ReactElement } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ThemeProvider, ToastProvider, type ThemeName } from '../index';

export function renderThemed(ui: ReactElement, theme: ThemeName = 'dark', density: 'comfortable' | 'compact' = 'comfortable'): RenderResult {
  return render(<ThemeProvider theme={theme} density={density}><ToastProvider>{ui}</ToastProvider></ThemeProvider>);
}

/** axe config: colour contrast is covered by the token contrast tests (jsdom has no layout/paint). */
export async function expectNoA11yViolations(container: HTMLElement) {
  const results = await axe(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  expect(results).toHaveNoViolations();
}
