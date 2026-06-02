/**
 * Budget Comparison Widget
 * Displays period-over-period comparison with trending (Aforza-style)
 */

import { useBudgetComparison, type BudgetComparisonResponse } from '@/hooks/useBudgets';
import { ErrorState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrencyDisplay, formatCurrencyCompact } from '@/components/ui/currency-display';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetComparisonProps {
  budgetId: string;
  showTrending?: boolean;
  showRegions?: boolean;
}

export function BudgetComparison({
  budgetId,
  showTrending = true,
  showRegions = true,
}: BudgetComparisonProps) {
  const { data, isLoading, error, refetch } = useBudgetComparison(budgetId);

  if (!budgetId) return null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ErrorState message="Failed to load budget comparison" onRetry={refetch} />
        </CardContent>
      </Card>
    );
  }

  const comparisonData = data as BudgetComparisonResponse;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'INCREASING':
        return <TrendingUp className="h-4 w-4 text-emerald-600" />;
      case 'DECREASING':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'INCREASING':
        return <Badge className="bg-emerald-500/15 text-emerald-700">Increasing</Badge>;
      case 'DECREASING':
        return <Badge className="bg-red-500/15 text-red-700">Decreasing</Badge>;
      default:
        return <Badge variant="outline">Stable</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Period Comparison
          </CardTitle>
          {getTrendBadge(comparisonData.changes.trend)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Period Comparison */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current Period */}
          <div className="p-3 rounded-lg border bg-primary/5">
            <p className="text-xs text-muted-foreground mb-1">Current Period</p>
            <p className="font-medium">{comparisonData.current.period}</p>
            <CurrencyDisplay
              amount={comparisonData.current.totalAmount}
              size="lg"
              valueClassName="text-primary"
            />
            <div className="mt-2 flex items-center gap-2">
              <Progress value={comparisonData.current.utilization} className="flex-1 h-1.5" />
              <span className="text-xs">{comparisonData.current.utilization}%</span>
            </div>
          </div>

          {/* Previous Period */}
          {comparisonData.previous ? (
            <div className="p-3 rounded-lg border bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Previous Period</p>
              <p className="font-medium">{comparisonData.previous.period}</p>
              <CurrencyDisplay
                amount={comparisonData.previous.totalAmount}
                size="lg"
              />
              <div className="mt-2 flex items-center gap-2">
                <Progress value={comparisonData.previous.utilization} className="flex-1 h-1.5" />
                <span className="text-xs">{comparisonData.previous.utilization}%</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg border bg-muted/30 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No previous data</p>
            </div>
          )}
        </div>

        {/* Changes */}
        {comparisonData.changes.amount !== null && (
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              {getTrendIcon(comparisonData.changes.trend)}
              <span className="text-sm">Budget Change</span>
            </div>
            <div className="text-right">
              <span className={cn(
                'font-medium',
                comparisonData.changes.amount > 0 ? 'text-emerald-600' : 'text-red-600'
              )}>
                {comparisonData.changes.amount > 0 ? '+' : ''}
                {formatCurrencyCompact(comparisonData.changes.amount)}
              </span>
              {comparisonData.changes.amountPercent !== null && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({comparisonData.changes.amountPercent > 0 ? '+' : ''}
                  {comparisonData.changes.amountPercent}%)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Regional Comparison */}
        {showRegions && comparisonData.byRegion && comparisonData.byRegion.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-3">By Region</p>
            <div className="space-y-2">
              {comparisonData.byRegion.slice(0, 5).map((region) => (
                <div key={region.code} className="flex items-center justify-between text-sm">
                  <span>{region.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {formatCurrencyCompact(region.previous)}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">
                      {formatCurrencyCompact(region.current)}
                    </span>
                    {region.changePercent !== null && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          region.change > 0 && 'text-emerald-600 border-emerald-200',
                          region.change < 0 && 'text-red-600 border-red-200'
                        )}
                      >
                        {region.change > 0 ? '+' : ''}{region.changePercent}%
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Chart */}
        {showTrending && comparisonData.trending && comparisonData.trending.length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Utilization Trend</p>
            </div>
            <div className="flex items-end justify-between gap-1 h-16">
              {comparisonData.trending.map((period, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className={cn(
                      'w-full rounded-t transition-all',
                      idx === comparisonData.trending.length - 1
                        ? 'bg-primary'
                        : 'bg-muted-foreground/30'
                    )}
                    style={{ height: `${Math.max(4, period.utilization * 0.6)}px` }}
                  />
                  <span className="text-[9px] text-muted-foreground truncate">
                    {period.period.replace(' ', '\n')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BudgetComparison;
