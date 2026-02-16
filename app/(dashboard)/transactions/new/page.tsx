'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

interface Account {
  id: string;
  name: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
}

export default function NewTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    type: 'EXPENSE' as TransactionType,
    amount: '',
    accountId: '',
    toAccountId: '', // Para transferências
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Data de hoje
  });

  // Carregar contas e categorias
  useEffect(() => {
    async function loadData() {
      try {
        const [accountsRes, categoriesRes] = await Promise.all([
          fetch('/api/accounts'),
          fetch('/api/categories'),
        ]);

        if (accountsRes.ok) {
          const data = await accountsRes.json();
          setAccounts(data.accounts || []);
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
    }

    loadData();
  }, []);

  // Filtrar categorias baseado no tipo de transação
  useEffect(() => {
    if (formData.type === 'TRANSFER') {
      setFilteredCategories([]);
      setFormData((prev) => ({ ...prev, categoryId: '' }));
    } else {
      const filtered = categories.filter((cat) => cat.type === formData.type);
      setFilteredCategories(filtered);
      // Se a categoria atual não é válida para o novo tipo, limpar
      if (formData.categoryId && !filtered.find((c) => c.id === formData.categoryId)) {
        setFormData((prev) => ({ ...prev, categoryId: '' }));
      }
    }
  }, [formData.type, categories, formData.categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validações
      if (!formData.accountId) {
        throw new Error('Selecione uma conta');
      }

      if (formData.type === 'TRANSFER' && !formData.toAccountId) {
        throw new Error('Selecione a conta de destino para transferência');
      }

      if (formData.type === 'TRANSFER' && formData.accountId === formData.toAccountId) {
        throw new Error('A conta de origem e destino não podem ser iguais');
      }

      if (formData.type !== 'TRANSFER' && !formData.categoryId) {
        throw new Error('Selecione uma categoria');
      }

      // Converter amount para centavos
      const amountInCents = Math.round(parseFloat(formData.amount || '0') * 100);

      if (amountInCents <= 0) {
        throw new Error('O valor deve ser maior que zero');
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          amount: amountInCents,
          accountId: formData.accountId,
          toAccountId: formData.type === 'TRANSFER' ? formData.toAccountId : undefined,
          categoryId: formData.type !== 'TRANSFER' ? formData.categoryId : undefined,
          description: formData.description || undefined,
          date: new Date(formData.date).toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao criar transação');
      }

      router.push('/transactions');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar transação');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="space-y-2">
        <Link
          href="/transactions"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
        >
          ← Voltar para Transações
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Nova Transação
        </h1>
        <p className="text-muted-foreground">
          Registre uma nova receita, despesa ou transferência
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-card p-6 space-y-6">
          {/* Tipo de Transação */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Transação *</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                className={`p-4 rounded-lg border text-left transition-all ${
                  formData.type === 'EXPENSE'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950 ring-2 ring-red-500'
                    : 'border-border hover:border-red-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-2xl">💸</span>
                  <span className="text-sm font-medium">Despesa</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                className={`p-4 rounded-lg border text-left transition-all ${
                  formData.type === 'INCOME'
                    ? 'border-green-500 bg-green-50 dark:bg-green-950 ring-2 ring-green-500'
                    : 'border-border hover:border-green-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-2xl">💰</span>
                  <span className="text-sm font-medium">Receita</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'TRANSFER' })}
                className={`p-4 rounded-lg border text-left transition-all ${
                  formData.type === 'TRANSFER'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-500'
                    : 'border-border hover:border-blue-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-2xl">🔄</span>
                  <span className="text-sm font-medium">Transferência</span>
                </div>
              </button>
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Valor *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <input
                id="amount"
                type="number"
                step="0.01"
                required
                className="w-full pl-12 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          {/* Conta de Origem */}
          <div className="space-y-2">
            <label htmlFor="accountId" className="text-sm font-medium">
              {formData.type === 'TRANSFER' ? 'Conta de Origem *' : 'Conta *'}
            </label>
            <select
              id="accountId"
              required
              className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            >
              <option value="">Selecione uma conta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Conta de Destino (apenas para transferências) */}
          {formData.type === 'TRANSFER' && (
            <div className="space-y-2">
              <label htmlFor="toAccountId" className="text-sm font-medium">
                Conta de Destino *
              </label>
              <select
                id="toAccountId"
                required
                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.toAccountId}
                onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
              >
                <option value="">Selecione a conta de destino</option>
                {accounts
                  .filter((acc) => acc.id !== formData.accountId)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Categoria (não aparece para transferências) */}
          {formData.type !== 'TRANSFER' && (
            <div className="space-y-2">
              <label htmlFor="categoryId" className="text-sm font-medium">
                Categoria *
              </label>
              {filteredCategories.length === 0 ? (
                <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Nenhuma categoria de {formData.type === 'INCOME' ? 'receita' : 'despesa'} encontrada.{' '}
                    <Link href="/api/categories/seed" className="underline font-medium">
                      Criar categorias padrão
                    </Link>
                  </p>
                </div>
              ) : (
                <select
                  id="categoryId"
                  required
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Selecione uma categoria</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon ? `${category.icon} ` : ''}{category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Descrição */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descrição
            </label>
            <input
              id="description"
              type="text"
              className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Compra no supermercado, Salário de Janeiro..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Data */}
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">
              Data *
            </label>
            <input
              id="date"
              type="date"
              required
              className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Botões */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/transactions"
            className="px-6 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando...' : 'Criar Transação'}
          </button>
        </div>
      </form>
    </div>
  );
}
