'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MonthData {
  month: string;
  income: number;
  expense: number;
}

interface Props {
  data: MonthData[];
}

export function IncomeVsExpenseChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Sem dados de receitas/despesas</p>
      </div>
    );
  }

  // Formatar valor para tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            {payload[0].payload.month}
          </p>
          <p className="text-sm text-green-600 font-semibold">
            Receitas: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-red-600 font-semibold">
            Despesas: {formatCurrency(payload[1].value)}
          </p>
          <p className="text-sm text-primary font-semibold border-t pt-1">
            Balanço: {formatCurrency(payload[0].value - payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Formatar eixo Y
  const formatYAxis = (value: number) => {
    const formatted = value / 100;
    if (formatted >= 1000) {
      return `R$ ${(formatted / 1000).toFixed(1)}k`;
    }
    return `R$ ${formatted.toFixed(0)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          className="text-xs"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'currentColor' }}
          tickFormatter={formatYAxis}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="income" fill="#10b981" name="Receitas" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" fill="#ef4444" name="Despesas" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
