import { test, expect } from '@playwright/test';

/**
 * Testes de Integração - Fluxo Completo
 *
 * ATENÇÃO: Estes testes requerem autenticação real do Clerk.
 * Configure as variáveis de ambiente:
 *   - TEST_USER_EMAIL
 *   - TEST_USER_PASSWORD
 *
 * Ou use Clerk's testing tokens para CI/CD
 */

test.describe.skip('Fluxo Completo - Autenticado', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Implementar autenticação de teste com Clerk
    // await setupAuthenticatedSession(page);
    test.skip(!process.env.TEST_USER_EMAIL, 'Requer credenciais de teste');
  });

  test('deve criar conta com saldo inicial', async ({ page }) => {
    // Navegar para criação de conta
    await page.goto('/accounts/new');

    // Preencher formulário
    await page.fill('input[name="name"]', 'Nubank Teste');
    await page.selectOption('select[name="type"]', 'CHECKING');
    await page.fill('input[name="initialBalance"]', '5000');
    await page.fill('input[name="institution"]', 'Nubank');

    // Submeter
    await page.click('button[type="submit"]');

    // Aguardar sucesso
    await expect(page).toHaveURL('/accounts');

    // Verificar que conta aparece na lista
    await expect(page.locator('text=Nubank Teste')).toBeVisible();
  });

  test('deve criar categorias padrão', async ({ page }) => {
    await page.goto('/categories');

    // Clicar no botão de seed
    await page.click('text=Criar Categorias Padrão');

    // Aguardar sucesso
    await expect(page.locator('text=Alimentação')).toBeVisible();
    await expect(page.locator('text=Transporte')).toBeVisible();
    await expect(page.locator('text=Salário')).toBeVisible();
  });

  test('deve criar transação de receita', async ({ page }) => {
    await page.goto('/transactions/new');

    // Selecionar tipo INCOME
    await page.selectOption('select[name="type"]', 'INCOME');

    // Preencher formulário
    await page.fill('input[name="description"]', 'Salário Janeiro');
    await page.fill('input[name="amount"]', '10000');
    await page.fill('input[name="date"]', '2025-01-01');

    // Selecionar conta
    const accountSelect = page.locator('select[name="accountId"]');
    await accountSelect.selectOption({ index: 0 });

    // Selecionar categoria
    const categorySelect = page.locator('select[name="categoryId"]');
    await categorySelect.selectOption({ index: 0 });

    // Submeter
    await page.click('button[type="submit"]');

    // Aguardar redirecionamento
    await expect(page).toHaveURL('/transactions');

    // Verificar que transação aparece
    await expect(page.locator('text=Salário Janeiro')).toBeVisible();
  });

  test('deve criar transação de despesa', async ({ page }) => {
    await page.goto('/transactions/new');

    // Selecionar tipo EXPENSE
    await page.selectOption('select[name="type"]', 'EXPENSE');

    // Preencher formulário
    await page.fill('input[name="description"]', 'Supermercado');
    await page.fill('input[name="amount"]', '350');
    await page.fill('input[name="date"]', '2025-01-15');

    // Selecionar conta
    const accountSelect = page.locator('select[name="accountId"]');
    await accountSelect.selectOption({ index: 0 });

    // Selecionar categoria
    const categorySelect = page.locator('select[name="categoryId"]');
    await categorySelect.selectOption({ index: 0 });

    // Submeter
    await page.click('button[type="submit"]');

    // Aguardar sucesso
    await expect(page).toHaveURL('/transactions');

    // Verificar que transação aparece
    await expect(page.locator('text=Supermercado')).toBeVisible();
  });

  test('deve listar transações na página', async ({ page }) => {
    await page.goto('/transactions');

    // Verificar cabeçalho
    await expect(page.locator('h1')).toContainText('Transações');

    // Verificar botão de nova transação
    await expect(page.locator('text=Nova Transação')).toBeVisible();
  });

  test('deve visualizar dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar cabeçalho
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Verificar cards de resumo (se houver dados)
    const hasData = await page.locator('[data-testid="summary-card"]').count();
    if (hasData > 0) {
      await expect(page.locator('[data-testid="summary-card"]').first()).toBeVisible();
    }
  });
});

test.describe('Validação de Formulários', () => {
  test.skip('deve validar campos obrigatórios em nova conta', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Requer autenticação');

    await page.goto('/accounts/new');

    // Tentar submeter sem preencher
    await page.click('button[type="submit"]');

    // Deve mostrar erros de validação
    // Nota: Depende de como você implementou validação client-side
  });
});
