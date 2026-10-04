import type { TestRunnerConfig } from '@storybook/test-runner';
import { injectAxe, checkA11y } from 'axe-playwright';

/** Every story must pass axe (WCAG 2.2 AA) in whichever theme it is rendered in. */
const config: TestRunnerConfig = {
  async preVisit(page) { await injectAxe(page); },
  async postVisit(page, ctx) {
    // The cover is a full-screen animated canvas in an iframe: contrast can't be measured and the addon's own run races ours.
    if (ctx.id === 'cover--default') return;
    // SB_THEME=light re-renders the story in the light theme before axe runs.
    if (process.env.SB_THEME === 'light') {
      await page.evaluate(() => (window as unknown as { __STORYBOOK_ADDONS_CHANNEL__: { emit: (e: string, p: unknown) => void } }).__STORYBOOK_ADDONS_CHANNEL__.emit('updateGlobals', { globals: { theme: 'light' } }));
    }
    await page.waitForTimeout(250);
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } },
    }, false, 'v2');
  },
};
export default config;
