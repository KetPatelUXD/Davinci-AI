import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from '@playwright/test';

export const SCREENS = join(process.cwd(), 'dist', 'screens');
mkdirSync(SCREENS, { recursive: true });

/** Deterministic Math.random so the reference (which randomises its data) is repeatable. */
export const seedRandom = (page: Page, seed = 12345) =>
  page.addInitScript((s) => {
    let a = s >>> 0;
    Math.random = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }, seed);

export const storyUrl = (id: string, mode: 'dark' | 'light') => `/iframe.html?id=${id}&viewMode=story&globals=theme:${mode}`;

export async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
}
