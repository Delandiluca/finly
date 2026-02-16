import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function CategoriesPage() {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    redirect('/sign-in');
  }

  // Buscar categorias
  const categories = await prisma.category.findMany({
    where: {
      organizationId: orgId,
    },
    orderBy: [
      { type: 'asc' }, // EXPENSE primeiro, depois INCOME
      { name: 'asc' },
    ],
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  const incomeCategories = categories.filter((c) => c.type === 'INCOME');
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  const hasCategories = categories.length > 0;

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Categorias
          </h1>
          <p className="text-muted-foreground">
            Organize suas transações com categorias personalizadas
          </p>
        </div>
      </div>

      {/* Empty State ou Conteúdo */}
      {!hasCategories ? (
        <div className="rounded-lg border bg-card p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-3xl">
              📊
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Nenhuma categoria criada</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                As categorias ajudam a organizar suas transações. Comece criando categorias padrão.
              </p>
            </div>
            <form action="/api/categories/seed" method="POST">
              <button
                type="submit"
                className="mt-4 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Criar Categorias Padrão
              </button>
            </form>
            <p className="text-xs text-muted-foreground">
              Isso criará 15 categorias prontas para uso (10 despesas + 5 receitas)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Botão de Seed (caso queira recriar) */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 Dica: Categorias Padrão
                </h3>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Se você ainda não tem todas as categorias que precisa, pode criar as categorias padrão do sistema.
                </p>
              </div>
              <form action="/api/categories/seed" method="POST">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Categorias Padrão
                </button>
              </form>
            </div>
          </div>

          {/* Categorias de Despesas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Categorias de Despesas ({expenseCategories.length})
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {category.icon && (
                        <span className="text-2xl">{category.icon}</span>
                      )}
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {category._count.transactions} transação(ões)
                        </p>
                      </div>
                    </div>
                    {category.color && (
                      <div
                        className="h-6 w-6 rounded-full border"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {expenseCategories.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma categoria de despesa encontrada
                </p>
              </div>
            )}
          </div>

          {/* Categorias de Receitas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Categorias de Receitas ({incomeCategories.length})
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {category.icon && (
                        <span className="text-2xl">{category.icon}</span>
                      )}
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {category._count.transactions} transação(ões)
                        </p>
                      </div>
                    </div>
                    {category.color && (
                      <div
                        className="h-6 w-6 rounded-full border"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {incomeCategories.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma categoria de receita encontrada
                </p>
              </div>
            )}
          </div>

          {/* Informação */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> As categorias ajudam a organizar e analisar suas finanças.
              Você pode criar transações usando essas categorias ao registrar receitas e despesas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
