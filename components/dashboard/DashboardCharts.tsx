'use client';

import { ExpensesByCategoryChart } from '@/components/charts/ExpensesByCategoryChart';
import { IncomeVsExpenseChart } from '@/components/charts/IncomeVsExpenseChart';

interface CategoryData {
  name: string;
  value: number;
  icon?: string;
}

interface MonthData {
  month: string;
  income: number;
  expense: number;
}

interface Props {
  expensesByCategory: CategoryData[];
  incomeVsExpense: MonthData[];
}

export function DashboardCharts({ expensesByCategory, incomeVsExpense }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Despesas por Categoria */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Despesas por Categoria</h2>
          <p className="text-sm text-muted-foreground">
            Distribuição das despesas do mês atual
          </p>
        </div>
        <ExpensesByCategoryChart data={expensesByCategory} />
      </div>

      {/* Receitas vs Despesas */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Receitas vs Despesas</h2>
          <p className="text-sm text-muted-foreground">
            Comparação dos últimos 6 meses
          </p>
        </div>
        <IncomeVsExpenseChart data={incomeVsExpense} />
      </div>
    </div>
  );
}
