import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E do Finly
 *
 * Documentação: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Timeout para cada teste (30 segundos)
  timeout: 30 * 1000,

  // Configuração de expect
  expect: {
    timeout: 5000,
  },

  // Executar testes em paralelo
  fullyParallel: true,

  // Falhar build se houver testes marcados com .only
  forbidOnly: !!process.env.CI,

  // Retry em CI
  retries: process.env.CI ? 2 : 0,

  // Quantos workers rodar em paralelo
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html'],
    ['list'],
  ],

  // Configurações compartilhadas
  use: {
    // URL base
    baseURL: 'http://localhost:3000',

    // Rastreamento de testes que falharem
    trace: 'on-first-retry',

    // Screenshot apenas ao falhar
    screenshot: 'only-on-failure',

    // Vídeo apenas ao falhar
    video: 'retain-on-failure',
  },

  // Configurar projetos (browsers)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Testes mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Servidor de desenvolvimento
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
