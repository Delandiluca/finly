'use client';

interface Props {
  income: number;
  expenses: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

export function Budget503020({ income, expenses }: Props) {
  // Calcular valores ideais do planejamento 50/30/20
  const needs = income * 0.50; // 50% para necessidades
  const wants = income * 0.30; // 30% para desejos
  const savings = income * 0.20; // 20% para poupança/investimentos

  // Calcular percentual gasto atual
  const expensePercent = income > 0 ? (expenses / income) * 100 : 0;
  const savingsPercent = income > 0 ? ((income - expenses) / income) * 100 : 0;

  // Determinar status
  const getStatus = (percent: number) => {
    if (percent >= 20) return { color: 'text-green-600', bg: 'bg-green-100', label: 'Excelente' };
    if (percent >= 10) return { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Bom' };
    return { color: 'text-red-600', bg: 'bg-red-100', label: 'Atenção' };
  };

  const status = getStatus(savingsPercent);

  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Planejamento 50/30/20</h2>
        <p className="text-sm text-muted-foreground">
          Método de gerenciamento financeiro baseado em porcentagens
        </p>
      </div>

      {/* Status Atual */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Gastos Totais */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Gastos Totais</span>
            <span className="font-semibold">{expensePercent.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${Math.min(expensePercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(expenses)} de {formatCurrency(income)}
          </p>
        </div>

        {/* Poupança Atual */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Poupança</span>
            <span className={`font-semibold ${status.color}`}>
              {savingsPercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                savingsPercent >= 20 ? 'bg-green-500' :
                savingsPercent >= 10 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(savingsPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(income - expenses)} economizados
          </p>
        </div>

        {/* Status */}
        <div className={`rounded-lg p-4 ${status.bg}`}>
          <p className={`text-sm font-semibold ${status.color}`}>
            Status: {status.label}
          </p>
          <p className={`text-xs ${status.color} mt-1`}>
            {savingsPercent >= 20
              ? 'Você está economizando bem!'
              : savingsPercent >= 10
              ? 'Tente poupar mais este mês'
              : 'Reveja seus gastos e tente economizar'}
          </p>
        </div>
      </div>

      {/* Guia do Planejamento */}
      <div className="space-y-3 pt-4 border-t">
        <h3 className="text-sm font-medium">Valores Ideais (Regra 50/30/20)</h3>

        <div className="grid gap-3 md:grid-cols-3">
          {/* 50% Necessidades */}
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-sm font-semibold text-blue-600">
                50%
              </div>
              <div>
                <p className="text-sm font-medium">Necessidades</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(needs)}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Moradia, alimentação, transporte, saúde
            </p>
          </div>

          {/* 30% Desejos */}
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-sm font-semibold text-purple-600">
                30%
              </div>
              <div>
                <p className="text-sm font-medium">Desejos</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(wants)}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Lazer, entretenimento, assinaturas
            </p>
          </div>

          {/* 20% Poupança */}
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center text-sm font-semibold text-green-600">
                20%
              </div>
              <div>
                <p className="text-sm font-medium">Poupança</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(savings)}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Investimentos, reserva de emergência
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
