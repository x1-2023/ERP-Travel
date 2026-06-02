/**
 * Scenario Results Component
 * Displays simulation results with charts
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  DollarSign,
  Percent,
  Calendar,
  ShoppingCart,
  Target,
  Wallet,
} from 'lucide-react';
import { formatPercent, formatNumber } from '@/lib/utils';
import { formatCurrencyCompact } from '@/components/ui/currency-display';
import type { ScenarioResults as Results } from '@/hooks/planning/useScenarios';

interface ScenarioResultsProps {
  results: Results;
  showDailyChart?: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, subtitle, icon, trend }: MetricCardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : trend === 'down'
        ? 'text-red-600 dark:text-red-400'
        : 'text-muted-foreground';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${trendColor}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="p-2 bg-muted rounded-lg">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScenarioResults({
  results,
  showDailyChart = true,
}: ScenarioResultsProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Key Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="ROI"
            value={formatPercent(results.roi)}
            icon={<Percent className="h-5 w-5" />}
            trend={results.roi >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            title="Net Margin"
            value={formatCurrencyCompact(results.netMargin, 'VND')}
            icon={<DollarSign className="h-5 w-5" />}
            trend={results.netMargin >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            title="Sales Lift"
            value={formatPercent(results.salesLiftPercent)}
            icon={<TrendingUp className="h-5 w-5" />}
            trend="up"
          />
          <MetricCard
            title="Payback Period"
            value={`${results.paybackDays} days`}
            icon={<Calendar className="h-5 w-5" />}
            trend="neutral"
          />
        </div>
      </div>

      {/* Sales Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Baseline Sales</p>
              <p className="text-xl font-semibold">
                {formatCurrencyCompact(results.baselineSales, 'VND')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Projected Sales</p>
              <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrencyCompact(results.projectedSales, 'VND')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Incremental Sales</p>
              <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrencyCompact(results.incrementalSales, 'VND')}
              </p>
              <p className="text-xs text-muted-foreground">
                +{formatPercent(results.salesLiftPercent)} lift
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Cost Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Promotion Cost</p>
              <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                {formatCurrencyCompact(results.promotionCost, 'VND')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Funding Required</p>
              <p className="text-xl font-semibold">
                {formatCurrencyCompact(results.fundingRequired, 'VND')}
              </p>
              <p className="text-xs text-muted-foreground">
                Includes 10% buffer
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cost per Unit</p>
              <p className="text-xl font-semibold">
                {formatCurrencyCompact(results.costPerIncrementalUnit, 'VND')}
              </p>
              <p className="text-xs text-muted-foreground">Per incremental unit</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profitability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Profitability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Gross Margin</p>
              <p className="text-xl font-semibold">
                {formatCurrencyCompact(results.grossMargin, 'VND')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Margin</p>
              <p
                className={`text-xl font-semibold ${results.netMargin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {formatCurrencyCompact(results.netMargin, 'VND')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ROI</p>
              <p
                className={`text-xl font-semibold ${results.roi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {formatPercent(results.roi)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volume */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Projected Units</p>
              <p className="text-xl font-semibold">
                {formatNumber(results.projectedUnits)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Incremental Units</p>
              <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                {formatNumber(results.incrementalUnits)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Redemptions</p>
              <p className="text-xl font-semibold">
                {formatNumber(results.redemptions)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Projections Table */}
      {showDailyChart && results.dailyProjections?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-right py-2 px-3">Day</th>
                    <th className="text-right py-2 px-3">Baseline</th>
                    <th className="text-right py-2 px-3">Projected</th>
                    <th className="text-right py-2 px-3">Promo Cost</th>
                    <th className="text-right py-2 px-3">Cum. ROI</th>
                    <th className="text-right py-2 px-3">Cum. Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {results.dailyProjections.slice(0, 14).map((day) => (
                    <tr key={day.day} className="border-b">
                      <td className="py-2 px-3">{day.date}</td>
                      <td className="text-right py-2 px-3">{day.day}</td>
                      <td className="text-right py-2 px-3">
                        {formatCurrencyCompact(day.baselineSales, 'VND')}
                      </td>
                      <td className="text-right py-2 px-3 text-emerald-600 dark:text-emerald-400">
                        {formatCurrencyCompact(day.projectedSales, 'VND')}
                      </td>
                      <td className="text-right py-2 px-3 text-red-600 dark:text-red-400">
                        {formatCurrencyCompact(day.promotionCost, 'VND')}
                      </td>
                      <td
                        className={`text-right py-2 px-3 ${day.cumulativeROI >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                      >
                        {formatPercent(day.cumulativeROI)}
                      </td>
                      <td
                        className={`text-right py-2 px-3 ${day.cumulativeNetMargin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                      >
                        {formatCurrencyCompact(day.cumulativeNetMargin, 'VND')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {results.dailyProjections.length > 14 && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Showing first 14 of {results.dailyProjections.length} days
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
