import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

// Função helper para formatar saldo
function formatCurrency(value: bigint | number, currency: string = 'BRL'): string {
  const numValue = typeof value === 'bigint' ? Number(value) / 100 : value / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(numValue);
}

// Função helper para traduzir tipo de conta
function translateAccountType(type: string): string {
  const types: Record<string, string> = {
    CHECKING: 'Conta Corrente',
    SAVINGS: 'Poupança',
    INVESTMENT: 'Investimento',
    CREDIT_CARD: 'Cartão de Crédito',
    CASH: 'Dinheiro',
  };
  return types[type] || type;
}

// Ícone por tipo de conta
function getAccountIcon(type: string): string {
  const icons: Record<string, string> = {
    CHECKING: '🏦',
    SAVINGS: '💰',
    INVESTMENT: '📈',
    CREDIT_CARD: '💳',
    CASH: '💵',
  };
  return icons[type] || '💼';
}

export default async function AccountsPage() {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    redirect('/sign-in');
  }

  // Buscar contas da organização
  const accounts = await prisma.account.findMany({
    where: {
      organizationId: orgId,
    },
    orderBy: [
      { isActive: 'desc' },
      { name: 'asc' },
    ],
  });

  // Calcular total
  const totalBalance = accounts
    .filter(acc => acc.isActive)
    .reduce((sum, acc) => sum + Number(acc.balance), 0);

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Contas Bancárias
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas contas, cartões e investimentos
          </p>
        </div>

        <Link
          href="/accounts/new"
          className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Nova Conta
        </Link>
      </div>

      {/* Card de Saldo Total */}
      <div className="rounded-lg border bg-gradient-to-br from-primary/10 to-primary/5 p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Saldo Total
          </p>
          <p className="text-4xl font-bold">
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-sm text-muted-foreground">
            {accounts.filter(a => a.isActive).length} conta(s) ativa(s)
          </p>
        </div>
      </div>

      {/* Lista de Contas */}
      {accounts.length === 0 ? (
        // Empty State
        <div className="rounded-lg border bg-card p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-3xl">
              🏦
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Nenhuma conta cadastrada</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Adicione sua primeira conta bancária, cartão de crédito ou investimento para começar
              </p>
            </div>
            <Link
              href="/accounts/new"
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Adicionar Primeira Conta
            </Link>
          </div>
        </div>
      ) : (
        // Grid de Contas
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Link
              key={account.id}
              href={`/accounts/${account.id}`}
              className="group rounded-lg border bg-card p-6 hover:shadow-md transition-all hover:border-primary/50"
            >
              <div className="space-y-4">
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-2xl">
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {account.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {translateAccountType(account.type)}
                      </p>
                    </div>
                  </div>
                  {!account.isActive && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      Inativa
                    </span>
                  )}
                </div>

                {/* Saldo */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Saldo</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                </div>

                {/* Instituição (se houver) */}
                {account.institution && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      {account.institution}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
