import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId, orgId } = await auth();

  // Proteção: redirecionar se não estiver autenticado
  if (!userId) {
    redirect('/sign-in');
  }

  // Proteção: redirecionar se não tiver organização
  if (!orgId) {
    redirect('/select-organization');
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Visão geral das suas finanças
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card: Saldo Total */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Saldo Total
            </h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground">
              Nenhuma conta cadastrada
            </p>
          </div>
        </div>

        {/* Card: Receitas */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Receitas (Mês)
            </h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-green-600"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">R$ 0,00</div>
            <p className="text-xs text-muted-foreground">
              Sem transações
            </p>
          </div>
        </div>

        {/* Card: Despesas */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Despesas (Mês)
            </h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-red-600"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-600">R$ 0,00</div>
            <p className="text-xs text-muted-foreground">
              Sem transações
            </p>
          </div>
        </div>

        {/* Card: Orçamento */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Orçamento Usado
            </h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              Nenhum orçamento definido
            </p>
          </div>
        </div>
      </div>

      {/* Seção: Primeiros Passos */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">🚀 Comece Agora</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Ação: Adicionar Conta */}
          <div className="flex flex-col space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-6 w-6 text-primary"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
            <h3 className="font-semibold">1. Adicione uma Conta</h3>
            <p className="text-sm text-muted-foreground">
              Cadastre suas contas bancárias, carteiras digitais ou dinheiro em espécie
            </p>
            <button className="mt-auto w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Adicionar Conta
            </button>
          </div>

          {/* Ação: Registrar Transação */}
          <div className="flex flex-col space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-6 w-6 text-primary"
              >
                <line x1="12" x2="12" y1="5" y2="19" />
                <line x1="5" x2="19" y1="12" y2="12" />
              </svg>
            </div>
            <h3 className="font-semibold">2. Registre Transações</h3>
            <p className="text-sm text-muted-foreground">
              Adicione receitas, despesas e transferências para acompanhar seu fluxo de caixa
            </p>
            <button className="mt-auto w-full rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
              Nova Transação
            </button>
          </div>

          {/* Ação: Definir Orçamento */}
          <div className="flex flex-col space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-6 w-6 text-primary"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </div>
            <h3 className="font-semibold">3. Defina Orçamentos</h3>
            <p className="text-sm text-muted-foreground">
              Crie metas de gastos por categoria e acompanhe seu planejamento 50/30/20
            </p>
            <button className="mt-auto w-full rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
              Criar Orçamento
            </button>
          </div>
        </div>
      </div>

      {/* Seção: Transações Recentes (Empty State) */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Transações Recentes</h2>
          <button className="text-sm text-primary hover:underline">
            Ver todas
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-12 w-12 text-muted-foreground mb-4"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Nenhuma transação ainda</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Comece adicionando sua primeira conta e registrando transações
          </p>
        </div>
      </div>
    </div>
  );
}
