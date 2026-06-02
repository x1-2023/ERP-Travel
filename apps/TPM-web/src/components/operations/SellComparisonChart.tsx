/**
 * Sell Comparison Chart Component
 * Displays sell-in vs sell-out comparison over time
 */

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { formatCurrencyCompact } from '@/components/ui/currency-display';

interface ComparisonDataPoint {
  period: string;
  sellIn: { qty: number; value: number };
  sellOut: { qty: number; value: number };
  stock: { qty: number; value: number };
  sellThroughRate: number;
}

interface SellComparisonChartProps {
  data: ComparisonDataPoint[];
  viewMode?: 'quantity' | 'value';
  showStock?: boolean;
  title?: string;
}

export function SellComparisonChart({
  data,
  viewMode = 'quantity',
  showStock = true,
  title = 'Sell-in vs Sell-out Trend',
}: SellComparisonChartProps) {
  const chartData = data.map((d) => ({
    period: d.period,
    'Sell-in': viewMode === 'quantity' ? d.sellIn.qty : d.sellIn.value,
    'Sell-out': viewMode === 'quantity' ? d.sellOut.qty : d.sellOut.value,
    Stock: viewMode === 'quantity' ? d.stock.qty : d.stock.value,
    'Sell-through %': d.sellThroughRate,
  }));

  const formatValue = (value: number) => {
    if (viewMode === 'value') {
      return formatCurrencyCompact(value, 'VND');
    }
    return formatNumber(value);
  };

  const formatCompactNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={formatCompactNumber}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: any, name: string) => {
                if (value === undefined || value === null) return ['-', name];
                if (name === 'Sell-through %') return [`${value}%`, name];
                return [formatValue(value), name];
              }) as any}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="Sell-in"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              yAxisId="left"
              dataKey="Sell-out"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            {showStock && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Stock"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2 }}
              />
            )}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Sell-through %"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
