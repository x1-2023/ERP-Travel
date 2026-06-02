/**
 * Dashboard Page - Command Center Layout
 * Industrial Design System
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  RefreshCw,
  Calendar,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard, StatCardCompact, StatCardGroup } from '@/components/ui/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { PageLoading } from '@/components/shared/LoadingSpinner';
import { useDashboardStats, useSpendTrend, useStatusDistribution, useTopCustomers } from '@/hooks/useDashboard';
import { formatRelativeTime, safePercentageNumber } from '@/lib/utils';
import { formatCurrencyCompact } from '@/components/ui/currency-display';
import { cn } from '@/lib/utils';

// Status colors for charts
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'hsl(215, 15%, 45%)',
  PENDING: 'hsl(38, 92%, 50%)',
  APPROVED: 'hsl(217, 91%, 60%)',
  ACTIVE: 'hsl(160, 84%, 39%)',
  COMPLETED: 'hsl(188, 94%, 43%)',
  CANCELLED: 'hsl(0, 84%, 60%)',
  REJECTED: 'hsl(0, 72%, 50%)',
  Active: 'hsl(160, 84%, 39%)',
  Pending: 'hsl(38, 92%, 50%)',
  Draft: 'hsl(215, 15%, 45%)',
  Completed: 'hsl(188, 94%, 43%)',
  Cancelled: 'hsl(0, 84%, 60%)',
};

// Demo fallback data
const demoSpendTrend = [
  { month: 'Jan', budget: 1200000000, actual: 980000000 },
  { month: 'Feb', budget: 1200000000, actual: 1050000000 },
  { month: 'Mar', budget: 1400000000, actual: 1180000000 },
  { month: 'Apr', budget: 1300000000, actual: 1120000000 },
  { month: 'May', budget: 1500000000, actual: 1350000000 },
  { month: 'Jun', budget: 1400000000, actual: 1280000000 },
];

const demoStatusDistribution = [
  { name: 'Active', value: 24, color: STATUS_COLORS.Active },
  { name: 'Pending', value: 12, color: STATUS_COLORS.Pending },
  { name: 'Draft', value: 8, color: STATUS_COLORS.Draft },
  { name: 'Completed', value: 45, color: STATUS_COLORS.Completed },
];

const demoTopCustomers = [
  { name: 'Big C', value: 1500000000 },
  { name: 'Coopmart', value: 1200000000 },
  { name: 'Lotte Mart', value: 980000000 },
  { name: 'Aeon', value: 850000000 },
  { name: 'Vinmart', value: 720000000 },
];

const demoClaimsByStatus = [
  { name: 'Pending', value: 850000000, color: STATUS_COLORS.PENDING },
  { name: 'Approved', value: 3200000000, color: STATUS_COLORS.APPROVED },
  { name: 'Paid', value: 2800000000, color: STATUS_COLORS.ACTIVE },
];

const demoRecentActivity = [
  { type: 'PROMOTION_APPROVED', title: 'PROMO-2026-001 approved', description: 'Budget: 500M VND', timestamp: new Date().toISOString() },
  { type: 'CLAIM_SUBMITTED', title: 'Claim #CLM-0042 submitted', description: 'Big C - 75M VND', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { type: 'BUDGET_ALERT', title: 'Fund TRD-2026 at 85% utilization', description: 'Consider reallocation', timestamp: new Date(Date.now() - 7200000).toISOString() },
];

export default function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: spendTrendData, refetch: refetchSpendTrend } = useSpendTrend();
  const { data: statusDistributionData, refetch: refetchStatus } = useStatusDistribution();
  const { data: topCustomersData, refetch: refetchCustomers } = useTopCustomers();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchStats(), refetchSpendTrend(), refetchStatus(), refetchCustomers()]);
    setIsRefreshing(false);
  };

  // Fallback data
  const dashboardStats = stats || {
    totalBudget: 15000000000,
    utilizedBudget: 9750000000,
    utilizationRate: 65,
    activePromotions: 24,
    pendingClaims: 12,
    totalClaims: 156,
    overduePromotions: 3,
    atRiskPromotions: 5,
  };

  // Transform data for charts
  const spendTrend = spendTrendData?.length ? spendTrendData.map((item: any) => ({
    month: item.month || item.name,
    budget: item.budget || 0,
    actual: item.spend || item.actual || 0,
  })) : demoSpendTrend;

  const statusDistribution = statusDistributionData?.length
    ? statusDistributionData.map((item: any) => ({
        name: item.name || item.status,
        value: item.value || item.count,
        color: STATUS_COLORS[item.name || item.status] || STATUS_COLORS.DRAFT,
      }))
    : demoStatusDistribution;

  const topCustomers = topCustomersData?.length
    ? topCustomersData.map((item: any) => ({
        name: item.name,
        value: item.spend || item.promotions || item.value || 0,
      }))
    : demoTopCustomers;

  // Calculate metrics
  const utilizationPercent = safePercentageNumber(dashboardStats.utilizedBudget, dashboardStats.totalBudget).toFixed(1);
  const remaining = dashboardStats.totalBudget - dashboardStats.utilizedBudget;

  if (statsLoading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Header with real-time indicator */}
      <PageHeader
        title="Command Center"
        description={`Last updated: ${format(new Date(), 'HH:mm:ss')} • ${format(new Date(), 'dd MMM yyyy')}`}
        status={{
          label: 'Live',
          variant: 'success',
        }}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
            <Button asChild>
              <Link to="/promotions/new">
                <Zap className="h-4 w-4 mr-2" />
                New Promotion
              </Link>
            </Button>
          </div>
        }
      />

      {/* Alert Banner - if any issues */}
      {((dashboardStats as any).overduePromotions > 0 || (dashboardStats as any).atRiskPromotions > 0) && (
        <div className="flex items-center gap-4 p-3 rounded border border-warning/30 bg-warning-muted">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-medium text-warning">Attention Required</span>
            <span className="text-sm text-foreground-muted ml-2">
              {(dashboardStats as any).overduePromotions > 0 && `${(dashboardStats as any).overduePromotions} overdue promotions`}
              {(dashboardStats as any).overduePromotions > 0 && (dashboardStats as any).atRiskPromotions > 0 && ' • '}
              {(dashboardStats as any).atRiskPromotions > 0 && `${(dashboardStats as any).atRiskPromotions} at risk`}
            </span>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <Link to="/promotions?status=OVERDUE">Review</Link>
          </Button>
        </div>
      )}

      {/* KPI Strip - Primary Metrics */}
      <StatCardGroup cols={4}>
        <StatCard
          title="Total Budget"
          value=""
          amount={dashboardStats.totalBudget}
          trend={{ value: 12, label: 'vs last year' }}
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Total Spend"
          value=""
          amount={dashboardStats.utilizedBudget}
          subtitle={`${utilizationPercent}% utilized`}
          icon={TrendingUp}
          color={Number(utilizationPercent) > 80 ? 'warning' : 'success'}
        />
        <StatCard
          title="Active Promotions"
          value={dashboardStats.activePromotions}
          trend={{ value: 8, label: 'this month' }}
          icon={FileText}
          color="primary"
        />
        <StatCard
          title="Pending Claims"
          value={dashboardStats.pendingClaims}
          subtitle={`${dashboardStats.totalClaims} total`}
          icon={Clock}
          color={dashboardStats.pendingClaims > 10 ? 'warning' : 'default'}
        />
      </StatCardGroup>

      {/* Secondary Metrics Strip */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCardCompact
          title="Remaining Budget"
          value=""
          amount={remaining}
        />
        <StatCardCompact
          title="Avg. Claim Value"
          value=""
          amount={850000000 / Math.max(dashboardStats.pendingClaims, 1)}
        />
        <StatCardCompact
          title="Claims MTD"
          value="156 claims"
          color="success"
        />
        <StatCardCompact
          title="Approval Rate"
          value="94.2%"
          color="success"
        />
        <StatCardCompact
          title="Avg. Processing"
          value="2.4 days"
          color="success"
        />
        <StatCardCompact
          title="ROI"
          value="127%"
          color="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Spend Trend - Large */}
        <div className="col-span-12 lg:col-span-8">
          <AreaChart
            title="Budget vs Actual Spend"
            data={spendTrend}
            dataKeys={[
              { key: 'budget', name: 'Budget', color: 'hsl(217, 91%, 60%)' },
              { key: 'actual', name: 'Actual', color: 'hsl(160, 84%, 39%)' },
            ]}
            xAxisKey="month"
            height={300}
          />
        </div>

        {/* Promotions by Status */}
        <div className="col-span-12 lg:col-span-4">
          <PieChart
            title="Promotions by Status"
            data={statusDistribution}
            height={300}
            donut
          />
        </div>

        {/* Claims by Status */}
        <div className="col-span-12 lg:col-span-6">
          <BarChart
            title="Claims by Status"
            data={demoClaimsByStatus}
            dataKey="value"
            formatValue={(v) => formatCurrencyCompact(v)}
            height={250}
          />
        </div>

        {/* Top Customers */}
        <div className="col-span-12 lg:col-span-6">
          <BarChart
            title="Top Customers by Spend"
            data={topCustomers}
            dataKey="value"
            formatValue={(v) => formatCurrencyCompact(v)}
            height={250}
          />
        </div>
      </div>

      {/* Bottom Section - Activity & Quick Actions */}
      <div className="grid grid-cols-12 gap-4">
        {/* Recent Activity */}
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded border border-surface-border bg-card">
            <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-foreground-subtle" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Recent Activity
                </h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <Link to="/activity">View All</Link>
              </Button>
            </div>
            <div className="divide-y divide-surface-border">
              {demoRecentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 px-4 py-3 hover:bg-surface-hover transition-colors">
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded',
                    activity.type === 'PROMOTION_APPROVED' && 'bg-emerald-600 text-white dark:bg-emerald-500',
                    activity.type === 'CLAIM_SUBMITTED' && 'bg-amber-500 text-white dark:bg-amber-600',
                    activity.type === 'BUDGET_ALERT' && 'bg-red-500 text-white dark:bg-red-600',
                  )}>
                    {activity.type === 'PROMOTION_APPROVED' && <CheckCircle className="h-4 w-4" />}
                    {activity.type === 'CLAIM_SUBMITTED' && <FileText className="h-4 w-4" />}
                    {activity.type === 'BUDGET_ALERT' && <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.title}
                    </p>
                    <p className="text-2xs text-foreground-muted">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-2xs text-foreground-subtle font-mono shrink-0">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded border border-surface-border bg-card">
            <div className="px-4 py-3 border-b border-surface-border">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Quick Actions
              </h3>
            </div>
            <div className="p-4 space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/promotions/new">
                  <Zap className="h-4 w-4 mr-2 text-primary" />
                  Create New Promotion
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/claims/new">
                  <FileText className="h-4 w-4 mr-2 text-warning" />
                  Submit New Claim
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/claims?status=PENDING">
                  <Clock className="h-4 w-4 mr-2 text-accent" />
                  Review Pending Claims
                  <Badge variant="warning" size="sm" className="ml-auto">
                    {dashboardStats.pendingClaims}
                  </Badge>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/analytics">
                  <TrendingUp className="h-4 w-4 mr-2 text-success" />
                  View Analytics
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/calendar">
                  <Calendar className="h-4 w-4 mr-2 text-foreground-muted" />
                  Promotion Calendar
                </Link>
              </Button>
            </div>
          </div>

          {/* System Health */}
          <div className="mt-4 rounded border border-surface-border bg-card">
            <div className="px-4 py-3 border-b border-surface-border">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                System Health
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">API Status</span>
                <div className="flex items-center gap-2">
                  <div className="status-dot status-dot-success" />
                  <span className="text-xs text-success font-medium">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Database</span>
                <div className="flex items-center gap-2">
                  <div className="status-dot status-dot-success" />
                  <span className="text-xs text-success font-medium">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Sync Status</span>
                <div className="flex items-center gap-2">
                  <div className="status-dot status-dot-success" />
                  <span className="text-xs text-success font-medium">Up to date</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Last Backup</span>
                <span className="text-xs text-foreground-muted font-mono">2h ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
