import { defineConfig, devices } from '@playwright/test';

// E2E is NOT a CI gate: the suite needs live Clerk credentials and a seeded database, which CI
// has no way to provide. It is a local gate — run it before shipping anything that touches a
// screen or an API route. See AGENTS.md → "Validation".
//
// Ports follow the repo scheme (5 + service): 5010 app, 5080 report, 5090 UI.
const APP_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5010';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [['html', { port: 5080 }], ['list']],

  use: {
    baseURL: APP_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: 'npm run dev',
    url: APP_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
