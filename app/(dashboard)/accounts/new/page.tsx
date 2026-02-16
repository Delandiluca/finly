'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const accountTypes = [
  { value: 'CHECKING', label: 'Conta Corrente', icon: '🏦' },
  { value: 'SAVINGS', label: 'Poupança', icon: '💰' },
  { value: 'INVESTMENT', label: 'Investimento', icon: '📈' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'CASH', label: 'Dinheiro', icon: '💵' },
];

export default function NewAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'CHECKING',
    balance: '0',
    currency: 'BRL',
    institution: '',
    color: '#3b82f6',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Converter balance para centavos
      const balanceInCents = Math.round(parseFloat(formData.balance || '0') * 100);

      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          initialBalance: balanceInCents,
          currency: formData.currency,
          institution: formData.institution || undefined,
          color: formData.color || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao criar conta');
      }

      router.push('/accounts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="space-y-2">
        <Link
          href="/accounts"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
        >
          ← Voltar para Contas
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Nova Conta
        </h1>
        <p className="text-muted-foreground">
          Adicione uma nova conta bancária, cartão ou investimento
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-card p-6 space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome da Conta *
            </label>
            <input
              id="name"
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Nubank, Bradesco, Carteira"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tipo de Conta *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {accountTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    formData.type === type.value
                      ? 'border-primary bg-primary/10 ring-2 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{type.label}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Saldo Inicial */}
          <div className="space-y-2">
            <label htmlFor="balance" className="text-sm font-medium">
              Saldo Inicial
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <input
                id="balance"
                type="number"
                step="0.01"
                className="w-full pl-12 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0,00"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Digite o saldo atual da conta
            </p>
          </div>

          {/* Instituição (Opcional) */}
          <div className="space-y-2">
            <label htmlFor="institution" className="text-sm font-medium">
              Instituição Financeira (Opcional)
            </label>
            <input
              id="institution"
              type="text"
              className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Nubank, Inter, Bradesco"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            />
          </div>

          {/* Cor (Opcional) */}
          <div className="space-y-2">
            <label htmlFor="color" className="text-sm font-medium">
              Cor da Conta (Opcional)
            </label>
            <div className="flex items-center space-x-4">
              <input
                id="color"
                type="color"
                className="h-10 w-20 rounded-lg border cursor-pointer"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
              <span className="text-sm text-muted-foreground">
                Escolha uma cor para identificar facilmente
              </span>
            </div>
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
            href="/accounts"
            className="px-6 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </div>
      </form>
    </div>
  );
}
