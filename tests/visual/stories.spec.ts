import { test } from '@playwright/test';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { SCREENS, settle, storyUrl } from './helpers';

/**
 * Visual ground truth: one PNG per story per mode in dist/screens/ (used to compare the Figma kit against code renders).
 * Story ids are stable (title + export name), e.g. components-actions-button--variants.dark.png
 */
async function storyIds(baseURL: string): Promise<string[]> {
  const res = await fetch(`${baseURL}/index.json`);
  const idx = (await res.json()) as { entries: Record<string, { id: string; type: string; tags?: string[] }> };
  return Object.values(idx.entries).filter((e) => e.type === 'story' && !e.id.startsWith('examples-markets')).map((e) => e.id);
}

test.describe('story screenshots', () => {
  test.setTimeout(10 * 60_000);
  test('capture all stories', async ({ browser, baseURL }) => {
    const ids = await storyIds(baseURL!);
    const queue = [...ids];
    const worker = async () => {
      const ctx = await browser.newContext({ viewport: { width: 1000, height: 720 }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      for (let id = queue.shift(); id; id = queue.shift()) {
        for (const mode of ['dark', 'light'] as const) {
          await page.goto(baseURL! + storyUrl(id, mode), { waitUntil: 'load' });
          await settle(page);
          await page.screenshot({ path: join(SCREENS, `${id}.${mode}.png`), fullPage: true });
        }
      }
      await ctx.close();
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    void readFileSync;
  });
});
