import { test, expect } from '@playwright/test';
import { join } from 'node:path';
import { SCREENS, settle, storyUrl } from './helpers';

/** Smoke test in Firefox and WebKit (Safari): key stories render, nothing throws, layout holds, focus ring shows. */
const STORIES = ['examples-markets-dashboard--dark', 'examples-markets-dashboard--light', 'components-actions-button--variants', 'components-data-table--default', 'components-chat-composer--with-suggestions', 'components-finance-charts--hero'];

for (const id of STORIES) {
  test(`renders ${id}`, async ({ page, browserName }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(storyUrl(id, id.endsWith('light') ? 'light' : 'dark'), { waitUntil: 'load' });
    await page.waitForSelector('.dv-theme-provider');
    await settle(page);
    expect(errors, errors.join('\n')).toEqual([]);
    // no horizontal page overflow
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
    // gradients, masks and backdrop-filter are supported (card spotlight + glass)
    const support = await page.evaluate(() => ({ mask: CSS.supports('mask-composite', 'exclude') || CSS.supports('-webkit-mask-composite', 'xor'), blur: CSS.supports('backdrop-filter', 'blur(4px)') || CSS.supports('-webkit-backdrop-filter', 'blur(4px)') }));
    expect(support).toEqual({ mask: true, blur: true });
    await page.screenshot({ path: join(SCREENS, `${browserName}.${id}.png`) });
  });
}

test('keyboard focus ring is visible', async ({ page, browserName }) => {
  await page.goto(storyUrl('components-actions-button--default', 'dark'), { waitUntil: 'load' });
  await page.waitForSelector('.dv-button');
  await page.keyboard.press('Tab');
  const outline = await page.locator('.dv-button').evaluate((el) => getComputedStyle(el).outlineStyle + ' ' + getComputedStyle(el).outlineWidth);
  expect(outline, browserName).toMatch(/solid 2px/);
});

test('card spotlight follows the pointer', async ({ page }) => {
  await page.goto(storyUrl('components-layout-card--default', 'dark'), { waitUntil: 'load' });
  const card = page.locator('.dv-card').first();
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + 60, box.y + 30);
  await expect.poll(() => card.evaluate((el) => (el as HTMLElement).style.getPropertyValue('--mx'))).toBe('60px');
});
