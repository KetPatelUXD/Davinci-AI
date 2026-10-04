import { defineConfig, devices } from '@playwright/test';

/**
 * Visual tests run against the *built* Storybook (apps/storybook/storybook-static) served statically.
 *   pnpm build-storybook && pnpm test:screens
 * Chromium (≈ Chrome and Edge, same engine) runs everything; Firefox and WebKit (Safari) run the cross-browser smoke spec.
 */
export default defineConfig({
  testDir: './tests/visual',
  timeout: 90_000,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:6007', viewport: { width: 1512, height: 982 }, reducedMotion: 'reduce', colorScheme: 'dark', deviceScaleFactor: 1 },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1512, height: 982 } }, testIgnore: /cross-browser/ },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1512, height: 982 } }, testMatch: /cross-browser/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1512, height: 982 } }, testMatch: /cross-browser/ },
  ],
  webServer: { command: 'npx http-server apps/storybook/storybook-static -p 6007 -s -c-1 --silent', url: 'http://127.0.0.1:6007/iframe.html', reuseExistingServer: true, timeout: 60_000 },
});
