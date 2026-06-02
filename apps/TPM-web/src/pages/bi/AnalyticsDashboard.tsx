/**
 * Analytics Dashboard Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { ChartWidget } from '@/components/bi';
import { useDashboard, useTrends } from '@/hooks/bi';
import type { DashboardParams, KPI } from '@/types/advanced';

const METRICS = [
  { value: 'promotions', label: 'Promotions' },
  { value: 'claims', label: 'Claims' },
  { value: 'spend', label: 'Spend' },
  { value: 'roi', label: 'ROI' },
];

function formatKPIValue(kpi: KPI): string {
  switch (kpi.format) {
    case 'CURRENCY':
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(kpi.value);
    case 'PERCENTAGE':
      return `${kpi.value.toFixed(1)}%`;
    default:
      return new Intl.NumberFormat('vi-VN').format(kpi.value);
  }
}

export default function AnalyticsDashboard() {
  const navigate = useNavigate();

  const today = new Date();
  const sixMonthsAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);

  const [dateRange, setDateRange] = useState<DashboardParams>({
    dateFrom: sixMonthsAgo.toISOString().split('T')[0],
    dateTo: today.toISOString().split('T')[0],
  });
  const [selectedMetric, setSelectedMetric] = useState('promotions');

  const { data: dashboard, isLoading: dashboardLoading, refetch } = useDashboard(dateRange);
  const { data: trendsData, isLoading: trendsLoading } = useTrends({
    ...dateRange,
    metric: selectedMetric,
  });

  const kpis = dashboard?.kpis || [];
  const trends = trendsData?.data || [];

  const isLoading = dashboardLoading || trendsLoading;

  // Convert trends to chart data
  const trendChartData = trends.map((t) => ({
    label: t.period,
    value: t.value,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate('/bi')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Deep dive into your data
            </p>
          </div>
        </div>
        <Button variant="outline" className="shrink-0 self-start sm:self-auto" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="dateFrom">From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateRange.dateFrom || ''}
                onChange={(e) => setDateRange((prev) => ({ ...prev, dateFrom: e.target.value }))}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="dateTo">To</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateRange.dateTo || ''}
                onChange={(e) => setDateRange((prev) => ({ ...prev, dateTo: e.target.value }))}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="metric">Metric</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger id="metric" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRICS.map((metric) => (
                    <SelectItem key={metric.value} value={metric.value}>
                      {metric.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <StatCardGroup cols={4}>
            {kpis.length > 0 ? (
              kpis.map((kpi: KPI, index: number) => (
                <StatCard
                  key={index}
                  title={kpi.name}
                  value={formatKPIValue(kpi)}
                  subtitle={kpi.subtitle}
                  trend={kpi.change !== undefined ? { value: kpi.change } : undefined}
                  color={kpi.trend === 'UP' ? 'success' : kpi.trend === 'DOWN' ? 'danger' : 'default'}
                />
              ))
            ) : (
              <>
                <StatCard title="Total Promotions" value="156" trend={{ value: 12.5 }} color="success" />
                <StatCard title="Active Budget" value="2.500.000.000 ₫" trend={{ value: -5.2 }} color="danger" />
                <StatCard title="Claims Processed" value="423" trend={{ value: 8.3 }} color="success" />
                <StatCard title="Avg ROI" value="24.5%" trend={{ value: 3.2 }} color="success" />
              </>
            )}
          </StatCardGroup>

          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                {METRICS.find((m) => m.value === selectedMetric)?.label} Trend
              </CardTitle>
              <CardDescription>
                Performance over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendChartData.length > 0 ? (
                <ChartWidget type="LINE" data={trendChartData} height={300} />
              ) : (
                <ChartWidget
                  type="BAR"
                  data={[
                    { label: 'Jan', value: 45 },
                    { label: 'Feb', value: 52 },
                    { label: 'Mar', value: 48 },
                    { label: 'Apr', value: 61 },
                    { label: 'May', value: 55 },
                    { label: 'Jun', value: 67 },
                  ]}
                  height={300}
                />
              )}
            </CardContent>
          </Card>

          {/* Comparison Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Period Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This Period</span>
                    <span className="font-medium">156 promotions</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Previous Period</span>
                    <span className="font-medium">139 promotions</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Change</span>
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <TrendingUp className="h-4 w-4" />
                      +12.2%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Discount Promotions', value: '+28%' },
                    { name: 'Customer ABC Corp', value: '+22%' },
                    { name: 'Product Category A', value: '+18%' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium text-green-600">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>By Promotion Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartWidget
                  type="PIE"
                  data={[
                    { label: 'Discount', value: 45 },
                    { label: 'Bundle', value: 25 },
                    { label: 'Gift', value: 20 },
                    { label: 'Rebate', value: 10 },
                  ]}
                  height={250}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By Region</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartWidget
                  type="BAR"
                  data={[
                    { label: 'North', value: 35 },
                    { label: 'South', value: 28 },
                    { label: 'East', value: 22 },
                    { label: 'West', value: 15 },
                  ]}
                  height={250}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
