import { Page } from '@playwright/test';

/**
 * Helper para autenticação com Clerk nos testes E2E
 */

export async function setupClerkTestingToken(page: Page) {
  // Clerk fornece um token de teste especial
  // Documentação: https://clerk.com/docs/testing/playwright/overview

  await page.goto('/');

  // Se já estiver autenticado, não fazer nada
  const isAuthenticated = await page.evaluate(() => {
    return window.location.pathname !== '/sign-in';
  });

  if (isAuthenticated) {
    return;
  }
}

export async function signIn(page: Page, email: string, password: string) {
  await page.goto('/sign-in');

  // Preencher formulário de login do Clerk
  await page.fill('input[name="identifier"]', email);
  await page.click('button[type="submit"]');

  // Aguardar campo de senha
  await page.waitForSelector('input[name="password"]', { timeout: 5000 });
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // Aguardar redirecionamento
  await page.waitForURL(/\/(dashboard|select-organization)/, { timeout: 10000 });
}

export async function ensureOrganization(page: Page) {
  // Se estiver na página de seleção de organização, criar/selecionar uma
  if (page.url().includes('/select-organization')) {
    // Tentar selecionar organização existente
    const hasOrg = await page.locator('[data-testid="org-item"]').count();

    if (hasOrg > 0) {
      await page.locator('[data-testid="org-item"]').first().click();
    } else {
      // Criar nova organização
      await page.fill('input[name="name"]', 'Test Organization');
      await page.click('button[type="submit"]');
    }

    await page.waitForURL('/dashboard', { timeout: 10000 });
  }
}

export async function setupAuthenticatedSession(page: Page) {
  // Para testes, você precisa ter uma conta de teste criada
  // ou usar Clerk's testing tokens
  const testEmail = process.env.TEST_USER_EMAIL || 'test@finly.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

  await signIn(page, testEmail, testPassword);
  await ensureOrganization(page);
}
