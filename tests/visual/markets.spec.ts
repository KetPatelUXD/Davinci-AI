import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { SCREENS, seedRandom, settle, storyUrl } from './helpers';

/**
 * Markets dashboard story vs. the Graphite reference at 1512×982, dark and light.
 * Writes dist/screens/markets.<mode>.{reference,story,diff}.png and dist/screens/markets-diff.json.
 * The budget is the share of pixels that differ at a perceptual threshold (data series shapes differ by design).
 */
const BUDGET = Number(process.env.VISUAL_MAX_DIFF ?? 0.1);
const referenceUrl = 'file://' + join(process.cwd(), 'reference', 'davinci-ai-reference.html');
const report: Record<string, unknown> = {};

for (const mode of ['dark', 'light'] as const) {
  test(`Markets dashboard matches reference (${mode})`, async ({ page, browser }) => {
    // reference
    await seedRandom(page);
    await page.goto(referenceUrl, { waitUntil: 'networkidle' });
    await page.evaluate((m) => { document.documentElement.dataset.theme = m; }, mode);
    await settle(page);
    const ref = await page.screenshot({ path: join(SCREENS, `markets.${mode}.reference.png`) });
    // story
    const p2 = await browser.newPage({ viewport: { width: 1512, height: 982 }, reducedMotion: 'reduce' });
    await p2.goto(storyUrl(`examples-markets-dashboard--${mode}`, mode), { waitUntil: 'networkidle' });
    await settle(p2);
    const story = await p2.screenshot({ path: join(SCREENS, `markets.${mode}.story.png`) });
    await p2.close();

    const a = PNG.sync.read(ref), b = PNG.sync.read(story);
    expect([a.width, a.height]).toEqual([b.width, b.height]);
    const diff = new PNG({ width: a.width, height: a.height });
    const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.12, includeAA: false, alpha: 0.4 });
    writeFileSync(join(SCREENS, `markets.${mode}.diff.png`), PNG.sync.write(diff));
    const ratio = n / (a.width * a.height);
    report[mode] = { differingPixels: n, ratio: +ratio.toFixed(4), budget: BUDGET };
    writeFileSync(join(SCREENS, 'markets-diff.json'), JSON.stringify({ ...JSON.parse(safeRead()), ...report }, null, 2));
    console.log(`[visual] markets ${mode}: ${(ratio * 100).toFixed(2)}% of pixels differ (budget ${(BUDGET * 100).toFixed(0)}%)`);
    expect(ratio).toBeLessThanOrEqual(BUDGET);
  });
}

function safeRead() {
  try { return readFileSync(join(SCREENS, 'markets-diff.json'), 'utf8'); } catch { return '{}'; }
}
