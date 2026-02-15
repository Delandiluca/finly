import { test, expect } from '@playwright/test';

/**
 * Testes E2E para a Landing Page
 */

test.describe('Landing Page', () => {
  test('deve carregar a landing page corretamente', async ({ page }) => {
    await page.goto('/');

    // Verificar título
    await expect(page).toHaveTitle(/Finly/);

    // Verificar logo
    await expect(page.getByRole('heading', { name: 'Finly' })).toBeVisible();

    // Verificar subtítulo
    await expect(
      page.getByText('Planejamento Financeiro Inteligente')
    ).toBeVisible();

    // Verificar descrição
    await expect(
      page.getByText('Gerencie suas finanças com IA, automação e estratégias comprovadas')
    ).toBeVisible();
  });

  test('deve exibir botões de ação', async ({ page }) => {
    await page.goto('/');

    // Verificar botão "Começar Grátis"
    const signUpButton = page.getByRole('link', { name: 'Começar Grátis' });
    await expect(signUpButton).toBeVisible();
    await expect(signUpButton).toHaveAttribute('href', '/sign-up');

    // Verificar botão "Já tenho conta"
    const signInButton = page.getByRole('link', { name: 'Já tenho conta' });
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toHaveAttribute('href', '/sign-in');
  });

  test('deve exibir badge de custo', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByText('100% gratuito para começar • Sem cartão de crédito')
    ).toBeVisible();
  });

  test('deve redirecionar para sign-up ao clicar em "Começar Grátis"', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Começar Grátis' }).click();

    // Deve redirecionar para página de sign-up
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test('deve redirecionar para sign-in ao clicar em "Já tenho conta"', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Já tenho conta' }).click();

    // Deve redirecionar para página de sign-in
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('deve ser responsivo no mobile', async ({ page }) => {
    // Simular viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verificar que conteúdo está visível
    await expect(page.getByRole('heading', { name: 'Finly' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Começar Grátis' })).toBeVisible();
  });
});
