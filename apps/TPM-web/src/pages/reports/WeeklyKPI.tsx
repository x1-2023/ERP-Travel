/**
 * Weekly KPI Report Page
 */

import { useState } from 'react';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { CalendarIcon, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { Progress } from '@/components/ui/progress';
import { CurrencyDisplay, formatCurrencyCompact } from '@/components/ui/currency-display';
import { safePercentageNumber } from '@/lib/utils';
import {
  DollarSign,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

// Demo data
const weeklyTrend = [
  { day: 'Mon', actual: 45000000, target: 50000000 },
  { day: 'Tue', actual: 52000000, target: 50000000 },
  { day: 'Wed', actual: 48000000, target: 50000000 },
  { day: 'Thu', actual: 55000000, target: 50000000 },
  { day: 'Fri', actual: 62000000, target: 50000000 },
  { day: 'Sat', actual: 38000000, target: 30000000 },
  { day: 'Sun', actual: 25000000, target: 20000000 },
];

const topPromotions = [
  { name: 'PROMO-2026-001', spend: 85000000, target: 100000000 },
  { name: 'PROMO-2026-002', spend: 72000000, target: 80000000 },
  { name: 'PROMO-2026-003', spend: 58000000, target: 60000000 },
  { name: 'PROMO-2026-004', spend: 45000000, target: 50000000 },
];

const claimsSummary = [
  { status: 'Approved', count: 24, amount: 180000000 },
  { status: 'Pending', count: 12, amount: 95000000 },
  { status: 'Rejected', count: 3, amount: 25000000 },
];

export default function WeeklyKPI() {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000));

  const totalActual = weeklyTrend.reduce((sum, d) => sum + d.actual, 0);
  const totalTarget = weeklyTrend.reduce((sum, d) => sum + d.target, 0);
  const achievementRate = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weekly KPI Report</h1>
          <p className="text-muted-foreground">
            Performance metrics for the selected week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-background">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </span>
          </div>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <StatCardGroup cols={4}>
        <StatCard
          title="Total Spend"
          value=""
          amount={totalActual}
          subtitle={`Target: ${formatCurrencyCompact(totalTarget)}`}
          icon={DollarSign}
          trend={{ value: 8.5, label: 'vs last week' }}
          color="success"
        />
        <StatCard
          title="Achievement Rate"
          value={`${achievementRate.toFixed(1)}%`}
          subtitle={achievementRate >= 100 ? 'Target exceeded!' : 'On track'}
          icon={Target}
          trend={{ value: achievementRate >= 100 ? 5.2 : -2.1 }}
          color={achievementRate >= 100 ? 'success' : 'warning'}
        />
        <StatCard
          title="Claims Processed"
          value="39"
          subtitle="24 approved, 12 pending"
          icon={CheckCircle}
          trend={{ value: 15.3, label: 'vs last week' }}
          color="primary"
        />
        <StatCard
          title="Active Promotions"
          value="18"
          subtitle="4 ending this week"
          icon={Clock}
          color="purple"
        />
      </StatCardGroup>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart
          title="Daily Performance"
          description="Spend by day of week"
          data={weeklyTrend}
          dataKey="actual"
          xAxisKey="day"
          formatValue="currency"
          height={300}
        />
        <LineChart
          title="Actual vs Target"
          description="Daily spend vs target"
          data={weeklyTrend}
          dataKey="actual"
          xAxisKey="day"
          formatValue="currency"
          stroke="#22c55e"
          height={300}
        />
      </div>

      {/* Promotion Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Promotions This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPromotions.map((promo) => {
              const progress = safePercentageNumber(promo.spend, promo.target);
              return (
                <div key={promo.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{promo.name}</span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <CurrencyDisplay amount={promo.spend} size="sm" showToggle={false} /> / <CurrencyDisplay amount={promo.target} size="sm" showToggle={false} />
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={Math.min(progress, 100)} className="flex-1" />
                    <span className={`text-sm font-medium ${progress >= 100 ? 'text-emerald-600 dark:text-emerald-400' : progress >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Claims Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Claims Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {claimsSummary.map((item) => (
              <div
                key={item.status}
                className={`rounded-lg border p-4 ${
                  item.status === 'Approved'
                    ? 'border-green-200 bg-green-50'
                    : item.status === 'Pending'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.status === 'Approved' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {item.status === 'Pending' && <Clock className="h-5 w-5 text-yellow-600" />}
                  {item.status === 'Rejected' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                  <span className="font-medium">{item.status}</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{item.count}</p>
                <div className="text-sm text-muted-foreground">
                  <CurrencyDisplay amount={item.amount} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
