'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const accountTypes = [
  { value: 'CHECKING', label: 'Conta Corrente', icon: '🏦' },
  { value: 'SAVINGS', label: 'Poupança', icon: '💰' },
  { value: 'INVESTMENT', label: 'Investimento', icon: '📈' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'CASH', label: 'Dinheiro', icon: '💵' },
];

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  institution?: string;
  color?: string;
  isActive: boolean;
}

export default function AccountDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'CHECKING',
    balance: '0',
    institution: '',
    color: '#3b82f6',
    isActive: true,
  });

  useEffect(() => {
    fetchAccount();
  }, [params.id]);

  const fetchAccount = async () => {
    try {
      const response = await fetch(`/api/accounts/${params.id}`);
      if (!response.ok) throw new Error('Conta não encontrada');

      const data = await response.json();
      setAccount(data.account);

      // Preencher formulário
      setFormData({
        name: data.account.name,
        type: data.account.type,
        balance: (data.account.balance / 100).toFixed(2),
        institution: data.account.institution || '',
        color: data.account.color || '#3b82f6',
        isActive: data.account.isActive,
      });

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar conta');
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const balanceInCents = Math.round(parseFloat(formData.balance || '0') * 100);

      const response = await fetch(`/api/accounts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          balance: balanceInCents,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao atualizar conta');
      }

      setIsEditing(false);
      fetchAccount();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar conta');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja desativar esta conta?')) return;

    try {
      const response = await fetch(`/api/accounts/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao desativar conta');

      router.push('/accounts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desativar conta');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error && !account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <Link href="/accounts" className="text-sm text-primary hover:underline">
            ← Voltar para Contas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Link
            href="/accounts"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
          >
            ← Voltar para Contas
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {account?.name}
          </h1>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            Editar
          </button>
        )}
      </div>

      {/* Formulário */}
      <form onSubmit={handleUpdate} className="space-y-6">
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
              disabled={!isEditing}
              className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Conta *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {accountTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  disabled={!isEditing}
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`p-4 rounded-lg border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.type === type.value
                      ? 'border-primary bg-primary/10 ring-2 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{type.icon}</span>
                    <p className="text-sm font-medium">{type.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Saldo */}
          <div className="space-y-2">
            <label htmlFor="balance" className="text-sm font-medium">
              Saldo Atual
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <input
                id="balance"
                type="number"
                step="0.01"
                disabled={!isEditing}
                className="w-full pl-12 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              />
            </div>
          </div>

          {/* Instituição */}
          <div className="space-y-2">
            <label htmlFor="institution" className="text-sm font-medium">
              Instituição Financeira (Opcional)
            </label>
            <input
              id="institution"
              type="text"
              disabled={!isEditing}
              className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                type="checkbox"
                disabled={!isEditing}
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
              />
              <label htmlFor="isActive" className="text-sm text-muted-foreground">
                Conta ativa
              </label>
            </div>
          </div>
        </div>

        {/* Erro */}
        {error && account && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Botões */}
        {isEditing && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
            >
              Desativar Conta
            </button>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  fetchAccount();
                }}
                className="px-6 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
