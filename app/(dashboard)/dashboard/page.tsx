import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

// Helper para formatar moeda
function formatCurrency(value: bigint | number): string {
  const numValue = typeof value === 'bigint' ? Number(value) / 100 : value / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

// Helper para formatar data
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export default async function DashboardPage() {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    redirect('/sign-in');
  }

  // Buscar dados em paralelo
  const [accounts, recentTransactions, monthStats] = await Promise.all([
    // Buscar contas ativas
    prisma.account.findMany({
      where: {
        organizationId: orgId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        balance: true,
      },
    }),

    // Buscar últimas 5 transações
    prisma.transaction.findMany({
      where: { organizationId: orgId },
      include: {
        account: { select: { name: true } },
        category: { select: { name: true, icon: true } },
      },
      orderBy: { date: 'desc' },
      take: 5,
    }),

    // Estatísticas do mês atual
    (async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const transactions = await prisma.transaction.findMany({
        where: {
          organizationId: orgId,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: {
          type: true,
          amountCents: true,
        },
      });

      const income = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amountCents), 0);

      const expense = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amountCents), 0);

      return { income, expense };
    })(),
  ]);

  // Calcular saldo total
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  // Verificar se tem dados
  const hasAccounts = accounts.length > 0;
  const hasTransactions = recentTransactions.length > 0;

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
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {accounts.length} conta(s) ativa(s)
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
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(monthStats.income)}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
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
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(monthStats.expense)}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Card: Balanço */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Balanço do Mês
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
            <div className={`text-2xl font-bold ${monthStats.income - monthStats.expense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(monthStats.income - monthStats.expense)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas - Despesas
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      {!hasAccounts ? (
        // Empty State: Sem contas
        <div className="rounded-lg border bg-card p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-3xl">
              🚀
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Comece sua jornada financeira!</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Para começar a usar o Finly, siga estes passos simples:
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3 max-w-3xl w-full pt-4">
              <div className="p-4 rounded-lg border bg-background">
                <div className="text-3xl mb-2">🏦</div>
                <h4 className="font-semibold mb-1">1. Adicione uma Conta</h4>
                <p className="text-xs text-muted-foreground">
                  Cadastre suas contas bancárias e cartões
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-background">
                <div className="text-3xl mb-2">📊</div>
                <h4 className="font-semibold mb-1">2. Crie Categorias</h4>
                <p className="text-xs text-muted-foreground">
                  Organize suas finanças com categorias
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-background">
                <div className="text-3xl mb-2">💰</div>
                <h4 className="font-semibold mb-1">3. Registre Transações</h4>
                <p className="text-xs text-muted-foreground">
                  Acompanhe receitas e despesas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <Link
                href="/accounts/new"
                className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Adicionar Primeira Conta
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // Grid com Contas e Transações
        <div className="grid gap-6 md:grid-cols-2">
          {/* Contas */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Minhas Contas</h2>
              <Link href="/accounts" className="text-sm text-primary hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="space-y-3">
              {accounts.slice(0, 4).map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{account.name}</span>
                  <span className="text-sm font-semibold">
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              ))}
              {accounts.length > 4 && (
                <Link
                  href="/accounts"
                  className="block text-center text-sm text-muted-foreground hover:text-foreground pt-2"
                >
                  + {accounts.length - 4} contas
                </Link>
              )}
            </div>
          </div>

          {/* Transações Recentes */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Transações Recentes</h2>
              <Link href="/transactions" className="text-sm text-primary hover:underline">
                Ver todas
              </Link>
            </div>
            {hasTransactions ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">
                        {transaction.category?.icon || (transaction.type === 'INCOME' ? '💰' : '💸')}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {transaction.description || transaction.category?.name || 'Sem descrição'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)} • {transaction.account.name}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(transaction.amountCents)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-2">💸</div>
                <p className="text-sm text-muted-foreground">
                  Nenhuma transação ainda
                </p>
                <Link
                  href="/transactions/new"
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  Adicionar primeira transação
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
