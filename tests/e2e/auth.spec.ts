import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Autenticação
 *
 * NOTA: Estes testes verificam o fluxo de redirecionamento.
 * Para testes completos de autenticação, seria necessário:
 * - Mock do Clerk ou conta de teste
 * - Configuração de ambiente de teste isolado
 */

test.describe('Autenticação', () => {
  test('deve acessar página de sign-up', async ({ page }) => {
    await page.goto('/sign-up');

    // Verificar que chegou na página de sign-up
    await expect(page).toHaveURL(/\/sign-up/);

    // Verificar que componente do Clerk está carregado
    // (O Clerk renderiza iframe, então verificamos presença de elementos)
    await expect(page.locator('[data-clerk-id]').first()).toBeVisible({ timeout: 10000 });
  });

  test('deve acessar página de sign-in', async ({ page }) => {
    await page.goto('/sign-in');

    // Verificar que chegou na página de sign-in
    await expect(page).toHaveURL(/\/sign-in/);

    // Verificar que componente do Clerk está carregado
    await expect(page.locator('[data-clerk-id]').first()).toBeVisible({ timeout: 10000 });
  });

  test('deve ter botão de voltar na página de auth', async ({ page }) => {
    await page.goto('/sign-in');

    // Verificar link de voltar
    const backLink = page.getByText('← Voltar');
    await expect(backLink).toBeVisible();
  });

  test('deve redirecionar para sign-in ao acessar rota protegida sem autenticação', async ({ page }) => {
    // Tentar acessar dashboard sem autenticação
    await page.goto('/dashboard');

    // Deve redirecionar para sign-in
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10000 });
  });

  test('deve redirecionar para sign-in ao acessar /accounts sem autenticação', async ({ page }) => {
    await page.goto('/accounts');

    // Deve redirecionar para sign-in
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10000 });
  });

  test('deve redirecionar para sign-in ao acessar /transactions sem autenticação', async ({ page }) => {
    await page.goto('/transactions');

    // Deve redirecionar para sign-in
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10000 });
  });
});
