/**
 * Stock Distribution Chart Component
 * Displays stock distribution by status, category, or customer
 */

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatNumber } from '@/lib/utils';
import { formatCurrencyCompact } from '@/components/ui/currency-display';
import type { StockStatus } from '@/types/operations';

interface StockByStatus {
  status: StockStatus;
  count: number;
  value: number;
}

interface StockByCategory {
  category: string;
  quantity: number;
  value: number;
}

interface StockByCustomer {
  customerId: string;
  customerName: string;
  quantity: number;
  value: number;
}

interface StockDistributionChartProps {
  byStatus?: StockByStatus[];
  byCategory?: StockByCategory[];
  byCustomer?: StockByCustomer[];
  title?: string;
}

const STATUS_COLORS: Record<StockStatus, string> = {
  OK: '#22c55e',
  LOW: '#f59e0b',
  OUT_OF_STOCK: '#ef4444',
  OVERSTOCK: '#3b82f6',
};

const CATEGORY_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

export function StockDistributionChart({
  byStatus,
  byCategory,
  byCustomer,
  title = 'Stock Distribution',
}: StockDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status">
          <TabsList className="mb-4">
            {byStatus && <TabsTrigger value="status">By Status</TabsTrigger>}
            {byCategory && <TabsTrigger value="category">By Category</TabsTrigger>}
            {byCustomer && <TabsTrigger value="customer">By Customer</TabsTrigger>}
          </TabsList>

          {/* By Status - Pie Chart */}
          {byStatus && (
            <TabsContent value="status">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={byStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      name && percent ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                  >
                    {byStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
                    ))}
                  </Pie>
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={((value: any, name: string) => [
                      value !== undefined && value !== null ? formatNumber(value) : '-',
                      name === 'count' ? 'Items' : name,
                    ]) as any}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
          )}

          {/* By Category - Bar Chart */}
          {byCategory && (
            <TabsContent value="category">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={byCategory.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => formatCurrencyCompact(v, 'VND')} />
                  <YAxis dataKey="category" type="category" width={90} />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip formatter={((value: any) => value !== undefined && value !== null ? formatCurrencyCompact(value, 'VND') : '-') as any} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    {byCategory.slice(0, 8).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          )}

          {/* By Customer - Bar Chart */}
          {byCustomer && (
            <TabsContent value="customer">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={byCustomer.slice(0, 10)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="customerName"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tickFormatter={(v) => formatCurrencyCompact(v, 'VND')} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={((value: any, name: string) => [
                      value !== undefined && value !== null
                        ? name === 'value' ? formatCurrencyCompact(value, 'VND') : formatNumber(value)
                        : '-',
                      name === 'value' ? 'Value' : 'Quantity',
                    ]) as any}
                  />
                  <Legend />
                  <Bar dataKey="value" name="Value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface StockValueChartProps {
  data: Array<{
    date: string;
    totalQuantity: number;
    totalValue: number;
  }>;
  title?: string;
}

export function StockValueChart({ data, title = 'Stock Value Over Time' }: StockValueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tickFormatter={(v) => formatNumber(v)} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: any, name: string) => [
                value !== undefined && value !== null
                  ? name === 'totalValue' ? formatCurrencyCompact(value, 'VND') : formatNumber(value)
                  : '-',
                name === 'totalValue' ? 'Value' : 'Quantity',
              ]) as any}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="totalQuantity"
              name="Quantity"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="totalValue"
              name="Value"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
