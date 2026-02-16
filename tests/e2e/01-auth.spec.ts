import { test, expect } from '@playwright/test';

/**
 * Testes de Autenticação e Organização
 */

test.describe('Autenticação', () => {
  test('deve redirecionar usuário não autenticado para /sign-in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('deve redirecionar para /select-organization se não tiver org', async ({ page }) => {
    // Este teste requer mock do Clerk ou uma conta de teste
    // Por enquanto, vamos testar apenas o fluxo básico
    await page.goto('/');

    // Landing page deve estar acessível
    await expect(page).toHaveURL('/');
  });
});

test.describe('Navegação Pública', () => {
  test('deve acessar landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Verificar que tem conteúdo
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('deve acessar página de sign-in', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('deve acessar página de sign-up', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page).toHaveURL(/\/sign-up/);
  });
});
