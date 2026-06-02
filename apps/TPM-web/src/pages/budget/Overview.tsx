/**
 * Budget Overview Page
 * Hub page for budget management with summary stats and quick navigation
 */

import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign,
  PiggyBank,
  Activity,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { safePercentage, safePercentageNumber } from '@/lib/utils';

// Mock data for overview
const budgetOverviewData = {
  totalBudget: 70000000000,
  allocatedBudget: 50000000000,
  spentBudget: 30000000000,
  remainingBudget: 20000000000,
  utilizationRate: 71.4,
  ytdGrowth: 12.5,
  pendingApprovals: 3,
  activeBudgets: 5,
};

const quickLinks = [
  {
    title: 'Định nghĩa NS',
    description: 'Tạo và quản lý định nghĩa ngân sách',
    href: '/budget/definition',
    icon: DollarSign,
    color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Phân bổ',
    description: 'Phân bổ ngân sách theo kênh/vùng',
    href: '/budget/allocation',
    icon: PiggyBank,
    color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Giám sát',
    description: 'Theo dõi sử dụng ngân sách realtime',
    href: '/budget/monitoring',
    icon: Activity,
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  {
    title: 'Phê duyệt',
    description: 'Xem xét và phê duyệt yêu cầu NS',
    href: '/budget/approval',
    icon: CheckSquare,
    color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    badge: 3,
  },
];

const recentActivity = [
  {
    id: '1',
    action: 'Budget approved',
    target: 'Q1/2026 Trade Budget',
    user: 'Quỳnh Nguyễn',
    time: '2 giờ trước',
    type: 'success',
  },
  {
    id: '2',
    action: 'Allocation request',
    target: '2 tỷ VND cho Miền Nam',
    user: 'Minh Trần',
    time: '5 giờ trước',
    type: 'pending',
  },
  {
    id: '3',
    action: 'Budget created',
    target: 'Q2/2026 Marketing Budget',
    user: 'Lan Phạm',
    time: '1 ngày trước',
    type: 'info',
  },
  {
    id: '4',
    action: 'Overspend alert',
    target: 'HCM Region exceeded 95%',
    user: 'System',
    time: '2 ngày trước',
    type: 'warning',
  },
];

export default function BudgetOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan và quản lý ngân sách khuyến mãi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/budget/monitoring">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Link>
          </Button>
          <Button asChild>
            <Link to="/budget/definition">
              <DollarSign className="mr-2 h-4 w-4" />
              Create Budget
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget FY2026</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={budgetOverviewData.totalBudget} size="lg" />
            </div>
            <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              <TrendingUp className="mr-1 h-3 w-3" />
              +{budgetOverviewData.ytdGrowth}% vs FY2025
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocated</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={budgetOverviewData.allocatedBudget} size="lg" />
            </div>
            <Progress
              value={safePercentageNumber(budgetOverviewData.allocatedBudget, budgetOverviewData.totalBudget)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {safePercentage(budgetOverviewData.allocatedBudget, budgetOverviewData.totalBudget, 0)}% of total budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spent YTD</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={budgetOverviewData.spentBudget} size="lg" />
            </div>
            <Progress
              value={safePercentageNumber(budgetOverviewData.spentBudget, budgetOverviewData.allocatedBudget)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {budgetOverviewData.utilizationRate}% utilization rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <CurrencyDisplay amount={budgetOverviewData.remainingBudget} size="lg" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Available for new allocations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links & Activity */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Navigation */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Budget Functions</CardTitle>
            <CardDescription>Quick access to budget management tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="group flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`rounded-lg p-2 ${link.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{link.title}</h4>
                        {link.badge && (
                          <Badge variant="destructive" className="text-xs">
                            {link.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest budget updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div
                    className={`mt-1 rounded-full p-1 ${
                      activity.type === 'success'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : activity.type === 'warning'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : activity.type === 'pending'
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {activity.type === 'success' ? (
                      <CheckSquare className="h-3 w-3" />
                    ) : activity.type === 'warning' ? (
                      <AlertCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.target}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} · {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link to="/budget/monitoring">View all activity</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Budget Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Status Overview</CardTitle>
          <CardDescription>Current status of all active budgets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{budgetOverviewData.activeBudgets}</p>
                <p className="text-sm text-muted-foreground">Active Budgets</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{budgetOverviewData.pendingApprovals}</p>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/15">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{budgetOverviewData.utilizationRate}%</p>
                <p className="text-sm text-muted-foreground">Avg Utilization</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
