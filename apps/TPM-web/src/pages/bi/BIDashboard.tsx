/**
 * BI Dashboard Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, FileText, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { ChartWidget, ExportButton } from '@/components/bi';
import { useDashboard } from '@/hooks/bi';
import type { DashboardParams, KPI } from '@/types/advanced';

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

export default function BIDashboard() {
  const navigate = useNavigate();

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [dateRange, setDateRange] = useState<DashboardParams>({
    dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
    dateTo: today.toISOString().split('T')[0],
  });

  const { data: dashboard, isLoading, refetch } = useDashboard(dateRange);

  const kpis = dashboard?.kpis || [];
  const charts = dashboard?.charts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Business Intelligence</h1>
          <p className="text-muted-foreground">
            Analytics, reports, and insights
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="outline" onClick={() => navigate('/bi/reports')}>
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <ExportButton type="PROMOTIONS" />
        </div>
      </div>

      {/* Date Range */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
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
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
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
                <StatCard title="Total Promotions" value="0" subtitle="This period" color="primary" />
                <StatCard title="Active Budget" value="0 ₫" subtitle="Allocated" color="success" />
                <StatCard title="Claims Processed" value="0" subtitle="This period" color="info" />
                <StatCard title="Avg ROI" value="0%" subtitle="Return on investment" color="purple" />
              </>
            )}
          </StatCardGroup>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {charts.length > 0 ? (
              charts.map((chart) => (
                <Card key={chart.id}>
                  <CardHeader>
                    <CardTitle>{chart.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartWidget type={chart.type} data={chart.data} height={300} />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Promotions by Type</CardTitle>
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
                      height={300}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Spend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartWidget
                      type="BAR"
                      data={[
                        { label: 'Jan', value: 120000000 },
                        { label: 'Feb', value: 150000000 },
                        { label: 'Mar', value: 180000000 },
                        { label: 'Apr', value: 140000000 },
                      ]}
                      height={300}
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Quick Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Reports</CardTitle>
              <CardDescription>Pre-built reports for common analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-start"
                  onClick={() => navigate('/bi/reports?preset=promotion-summary')}
                >
                  <span className="font-medium">Promotion Summary</span>
                  <span className="text-xs text-muted-foreground">
                    All promotions with status and spend
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-start"
                  onClick={() => navigate('/bi/reports?preset=claim-analysis')}
                >
                  <span className="font-medium">Claim Analysis</span>
                  <span className="text-xs text-muted-foreground">
                    Claims by status and amount
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-start"
                  onClick={() => navigate('/bi/reports?preset=customer-performance')}
                >
                  <span className="font-medium">Customer Performance</span>
                  <span className="text-xs text-muted-foreground">
                    Top customers by promotion value
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-start"
                  onClick={() => navigate('/bi/reports?preset=roi-report')}
                >
                  <span className="font-medium">ROI Report</span>
                  <span className="text-xs text-muted-foreground">
                    ROI by promotion type and period
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate('/bi/reports')}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Report Builder</p>
                    <p className="text-sm text-muted-foreground">
                      Create custom reports
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate('/bi/analytics')}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-sm text-muted-foreground">
                      Deep dive into data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate('/bi/export')}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Download className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Export Center</p>
                    <p className="text-sm text-muted-foreground">
                      Download data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
