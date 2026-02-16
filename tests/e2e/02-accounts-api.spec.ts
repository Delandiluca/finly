import { test, expect } from '@playwright/test';

/**
 * Testes de API de Contas (sem autenticação - testa apenas estrutura)
 */

test.describe('API de Contas', () => {
  test('GET /api/accounts deve requerer autenticação', async ({ request }) => {
    const response = await request.get('/api/accounts');

    // Deve redirecionar para sign-in (302) ou retornar 401
    expect([302, 401]).toContain(response.status());
  });

  test('POST /api/accounts deve requerer autenticação', async ({ request }) => {
    const response = await request.post('/api/accounts', {
      data: {
        name: 'Test Account',
        type: 'CHECKING',
        initialBalance: 1000,
      },
    });

    // Deve redirecionar para sign-in (302) ou retornar 401
    expect([302, 401]).toContain(response.status());
  });
});

test.describe('API de Transações', () => {
  test('GET /api/transactions deve requerer autenticação', async ({ request }) => {
    const response = await request.get('/api/transactions');

    expect([302, 401]).toContain(response.status());
  });
});

test.describe('API de Categorias', () => {
  test('POST /api/categories/seed deve requerer autenticação', async ({ request }) => {
    const response = await request.post('/api/categories/seed');

    expect([302, 401]).toContain(response.status());
  });
});
