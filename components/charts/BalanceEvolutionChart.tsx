'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface BalancePoint {
  date: string;
  balance: number;
}

interface Props {
  data: BalancePoint[];
}

export function BalanceEvolutionChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Sem dados de evolução</p>
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
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
          <p className="text-sm font-semibold text-primary">
            {formatCurrency(payload[0].value)}
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
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
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
        <Line
          type="monotone"
          dataKey="balance"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))' }}
          name="Saldo"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
