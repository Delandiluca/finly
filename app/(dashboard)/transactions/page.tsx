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
    year: 'numeric',
  }).format(date);
}

export default async function TransactionsPage() {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    redirect('/sign-in');
  }

  // Buscar transações, contas e categorias
  const [transactions, accounts] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        organizationId: orgId,
      },
      include: {
        account: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
            icon: true,
            type: true,
          },
        },
        toAccount: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 100, // Limitar a 100 transações por enquanto
    }),
    prisma.account.findMany({
      where: {
        organizationId: orgId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  const hasTransactions = transactions.length > 0;

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Transações
          </h1>
          <p className="text-muted-foreground">
            Histórico completo de receitas, despesas e transferências
          </p>
        </div>
        <Link
          href="/transactions/new"
          className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Nova Transação
        </Link>
      </div>

      {/* Filtros (Futuro) */}
      <div className="rounded-lg border bg-card p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Tipo
            </label>
            <select className="w-full px-3 py-2 rounded-lg border bg-background text-sm">
              <option value="">Todos os tipos</option>
              <option value="INCOME">Receitas</option>
              <option value="EXPENSE">Despesas</option>
              <option value="TRANSFER">Transferências</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Conta
            </label>
            <select className="w-full px-3 py-2 rounded-lg border bg-background text-sm">
              <option value="">Todas as contas</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Data inicial
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Data final
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Lista de Transações */}
      {!hasTransactions ? (
        // Empty State
        <div className="rounded-lg border bg-card p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-3xl">
              💸
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Nenhuma transação ainda</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Comece registrando suas receitas e despesas para ter controle total das suas finanças
              </p>
            </div>
            <Link
              href="/transactions/new"
              className="mt-4 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Adicionar Primeira Transação
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          {/* Cabeçalho da Tabela */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm text-muted-foreground">
            <div className="col-span-3">Descrição</div>
            <div className="col-span-2">Categoria</div>
            <div className="col-span-2">Conta</div>
            <div className="col-span-2">Data</div>
            <div className="col-span-2 text-right">Valor</div>
            <div className="col-span-1 text-right">Ações</div>
          </div>

          {/* Linhas */}
          <div className="divide-y">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                {/* Descrição */}
                <div className="col-span-3 flex items-center space-x-3">
                  <div className="text-2xl">
                    {transaction.category?.icon ||
                     (transaction.type === 'INCOME' ? '💰' :
                      transaction.type === 'TRANSFER' ? '🔄' : '💸')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {transaction.description || 'Sem descrição'}
                    </p>
                    {transaction.type === 'TRANSFER' && transaction.toAccount && (
                      <p className="text-xs text-muted-foreground truncate">
                        → {transaction.toAccount.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Categoria */}
                <div className="col-span-2 flex items-center">
                  <div className="truncate">
                    {transaction.category ? (
                      <div>
                        <p className="text-sm font-medium truncate">
                          {transaction.category.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.category.type === 'INCOME' ? 'Receita' : 'Despesa'}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {transaction.type === 'TRANSFER' ? 'Transferência' : 'Sem categoria'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Conta */}
                <div className="col-span-2 flex items-center">
                  <p className="text-sm truncate">{transaction.account.name}</p>
                </div>

                {/* Data */}
                <div className="col-span-2 flex items-center">
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.date)}
                  </p>
                </div>

                {/* Valor */}
                <div className="col-span-2 flex items-center justify-end">
                  <span
                    className={`text-sm font-semibold ${
                      transaction.type === 'INCOME'
                        ? 'text-green-600'
                        : transaction.type === 'TRANSFER'
                        ? 'text-blue-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : transaction.type === 'TRANSFER' ? '' : '-'}
                    {formatCurrency(transaction.amountCents)}
                  </span>
                </div>

                {/* Ações */}
                <div className="col-span-1 flex items-center justify-end">
                  <Link
                    href={`/transactions/${transaction.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {transactions.length >= 100 && (
            <div className="p-4 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Mostrando as últimas 100 transações
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
