import { test, expect } from '@playwright/test';

/**
 * Testes E2E para APIs
 *
 * NOTA: Estes testes verificam que as APIs retornam respostas apropriadas
 * sem autenticação. Para testes completos, seria necessário autenticação.
 */

test.describe('API Endpoints', () => {
  test('API de contas deve retornar 401 sem autenticação', async ({ request }) => {
    const response = await request.get('/api/accounts');

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('API de categorias deve retornar 401 sem autenticação', async ({ request }) => {
    const response = await request.get('/api/categories');

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('API de transações deve retornar 401 sem autenticação', async ({ request }) => {
    const response = await request.get('/api/transactions');

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('POST em API de contas deve retornar 401 sem autenticação', async ({ request }) => {
    const response = await request.post('/api/accounts', {
      data: {
        name: 'Test Account',
        type: 'CHECKING',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('POST em API de categorias deve retornar 401 sem autenticação', async ({ request }) => {
    const response = await request.post('/api/categories', {
      data: {
        name: 'Test Category',
        type: 'EXPENSE',
      },
    });

    expect(response.status()).toBe(401);
  });
});

test.describe('Endpoints de Seed', () => {
  test('Endpoint de seed de categorias deve retornar 401 sem autenticação', async ({ request }) => {
    const response = await request.post('/api/categories/seed');

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });
});
