/**
 * Analytics Page
 */

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { AreaChart } from '@/components/charts/AreaChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyCompact } from '@/components/ui/currency-display';
import { safeDivide } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  Target,
  Percent,
} from 'lucide-react';

// Demo data
const monthlyData = [
  { month: 'Jan', revenue: 1200000000, spend: 320000000, roi: 275 },
  { month: 'Feb', revenue: 1350000000, spend: 380000000, roi: 255 },
  { month: 'Mar', revenue: 1500000000, spend: 450000000, roi: 233 },
  { month: 'Apr', revenue: 1680000000, spend: 520000000, roi: 223 },
  { month: 'May', revenue: 1850000000, spend: 580000000, roi: 219 },
  { month: 'Jun', revenue: 2100000000, spend: 650000000, roi: 223 },
];

const categoryData = [
  { name: 'Beverages', spend: 850000000 },
  { name: 'Dairy', spend: 620000000 },
  { name: 'Snacks', spend: 480000000 },
  { name: 'Personal Care', spend: 350000000 },
  { name: 'Home Care', spend: 280000000 },
];

const channelData = [
  { name: 'Modern Trade', value: 45, color: '#3b82f6' },
  { name: 'General Trade', value: 30, color: '#22c55e' },
  { name: 'E-commerce', value: 15, color: '#f59e0b' },
  { name: 'Wholesale', value: 10, color: '#8b5cf6' },
];

const regionData = [
  { name: 'South', value: 40, color: '#3b82f6' },
  { name: 'North', value: 30, color: '#22c55e' },
  { name: 'Central', value: 20, color: '#f59e0b' },
  { name: 'Mekong', value: 10, color: '#ef4444' },
];

const promotionTypeData = [
  { name: 'Discount', spend: 950000000, count: 35 },
  { name: 'Rebate', spend: 720000000, count: 28 },
  { name: 'Display', spend: 450000000, count: 42 },
  { name: 'COOP', spend: 380000000, count: 18 },
];

export default function Analytics() {
  const [year, setYear] = useState('2026');
  const [period, setPeriod] = useState('monthly');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            In-depth analysis of promotion performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Summary */}
      <StatCardGroup cols={4}>
        <StatCard
          title="Total Revenue"
          value=""
          amount={9680000000}
          icon={DollarSign}
          trend={{ value: 18.5, label: 'YoY' }}
          color="success"
        />
        <StatCard
          title="Total Spend"
          value=""
          amount={2900000000}
          icon={TrendingUp}
          trend={{ value: 12.3, label: 'YoY' }}
          color="primary"
        />
        <StatCard
          title="Average ROI"
          value="234%"
          icon={Percent}
          trend={{ value: 5.2, label: 'YoY' }}
          color="purple"
        />
        <StatCard
          title="Target Achievement"
          value="92.5%"
          icon={Target}
          trend={{ value: 8.1, label: 'vs plan' }}
          color="cyan"
        />
      </StatCardGroup>

      {/* Main Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <AreaChart
              title="Revenue vs Spend"
              description="Monthly performance comparison"
              data={monthlyData}
              dataKeys={[
                { key: 'revenue', color: '#22c55e', name: 'Revenue' },
                { key: 'spend', color: '#3b82f6', name: 'Spend' },
              ]}
              xAxisKey="month"
              formatValue="currency"
              height={350}
            />
            <LineChart
              title="ROI Trend"
              description="Return on investment over time"
              data={monthlyData}
              dataKey="roi"
              xAxisKey="month"
              formatValue="percent"
              stroke="#8b5cf6"
              height={350}
            />
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <PieChart
              title="Spend by Channel"
              description="Distribution across sales channels"
              data={channelData}
              formatValue="percent"
              height={350}
              innerRadius={70}
              outerRadius={120}
            />
            <PieChart
              title="Spend by Region"
              description="Geographic distribution"
              data={regionData}
              formatValue="percent"
              height={350}
              innerRadius={70}
              outerRadius={120}
            />
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <BarChart
            title="Spend by Category"
            description="Top product categories"
            data={categoryData}
            dataKey="spend"
            xAxisKey="name"
            formatValue="currency"
            height={400}
          />
        </TabsContent>

        <TabsContent value="promotions" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <BarChart
              title="Spend by Promotion Type"
              description="Budget allocation by type"
              data={promotionTypeData}
              dataKey="spend"
              xAxisKey="name"
              formatValue="currency"
              height={350}
            />
            <BarChart
              title="Promotion Count by Type"
              description="Number of promotions"
              data={promotionTypeData}
              dataKey="count"
              xAxisKey="name"
              formatValue="number"
              height={350}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Month</th>
                  <th className="text-right py-3 px-4 font-medium">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium">Spend</th>
                  <th className="text-right py-3 px-4 font-medium">ROI</th>
                  <th className="text-right py-3 px-4 font-medium">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row) => (
                  <tr key={row.month} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{row.month}</td>
                    <td className="py-3 px-4 text-right">{formatCurrencyCompact(row.revenue, 'VND')}</td>
                    <td className="py-3 px-4 text-right">{formatCurrencyCompact(row.spend, 'VND')}</td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">{row.roi}%</td>
                    <td className="py-3 px-4 text-right">
                      {(safeDivide(row.revenue, row.spend) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
