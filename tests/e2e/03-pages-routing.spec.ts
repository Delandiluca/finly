import { test, expect } from '@playwright/test';

/**
 * Testes de Roteamento e Páginas
 * Verifica se as páginas existem e redirecionam corretamente
 */

test.describe('Roteamento de Páginas Protegidas', () => {
  test('GET /dashboard deve redirecionar para /sign-in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('GET /accounts deve redirecionar para /sign-in', async ({ page }) => {
    await page.goto('/accounts');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('GET /accounts/new deve redirecionar para /sign-in', async ({ page }) => {
    await page.goto('/accounts/new');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('GET /transactions deve redirecionar para /sign-in', async ({ page }) => {
    await page.goto('/transactions');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('GET /transactions/new deve redirecionar para /sign-in', async ({ page }) => {
    await page.goto('/transactions/new');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('GET /categories deve redirecionar para /sign-in', async ({ page }) => {
    await page.goto('/categories');
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe('Verificação de Rotas 404', () => {
  test('rota inexistente deve retornar 404', async ({ page }) => {
    const response = await page.goto('/rota-que-nao-existe');
    expect(response?.status()).toBe(404);
  });
});
