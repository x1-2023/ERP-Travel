/**
 * Sell Trend Chart Component
 * Displays sell-in or sell-out trends with moving averages
 */

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { formatNumber } from '@/lib/utils';
import { formatCurrencyCompact } from '@/components/ui/currency-display';

interface TrendDataPoint {
  period: string;
  quantity: number;
  value: number;
  ma3?: number | null;
  growthPercent?: number | null;
}

interface SellTrendChartProps {
  data: TrendDataPoint[];
  type: 'sell-in' | 'sell-out';
  title?: string;
  showMovingAverage?: boolean;
}

export function SellTrendChart({
  data,
  type,
  title,
  showMovingAverage = true,
}: SellTrendChartProps) {
  const [viewMode, setViewMode] = useState<'quantity' | 'value'>('quantity');

  const chartTitle = title || (type === 'sell-in' ? 'Sell-In Trend' : 'Sell-Out Trend');
  const color = type === 'sell-in' ? '#3b82f6' : '#22c55e';
  const gradientId = `gradient-${type}`;

  const chartData = data.map((d) => ({
    period: d.period,
    [type === 'sell-in' ? 'Sell-in' : 'Sell-out']:
      viewMode === 'quantity' ? d.quantity : d.value,
    'Moving Avg': d.ma3 ? (viewMode === 'quantity' ? d.ma3 : d.ma3) : null,
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{chartTitle}</CardTitle>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'quantity' | 'value')}>
          <TabsList>
            <TabsTrigger value="quantity">Quantity</TabsTrigger>
            <TabsTrigger value="value">Value</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatCompactNumber}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: any, name: string) => {
                if (value === null || value === undefined) return ['-', name];
                return [formatValue(value), name];
              }) as any}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey={type === 'sell-in' ? 'Sell-in' : 'Sell-out'}
              stroke={color}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
            />
            {showMovingAverage && (
              <Line
                type="monotone"
                dataKey="Moving Avg"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
