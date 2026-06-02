/**
 * Fund Health Score Widget
 * Displays health score gauge with breakdown (Aforza-style)
 */

import { useFundHealthScore, type HealthScoreResponse } from '@/hooks/useBudgets';
import { ErrorState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Target,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FundHealthScoreProps {
  budgetId: string;
  compact?: boolean;
}

export function FundHealthScore({ budgetId, compact = false }: FundHealthScoreProps) {
  const { data, isLoading, error, refetch } = useFundHealthScore(budgetId);

  if (!budgetId) return null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ErrorState message="Failed to load health score" onRetry={refetch} />
        </CardContent>
      </Card>
    );
  }

  const healthData = data as HealthScoreResponse;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
        return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
      case 'GOOD':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'WARNING':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      case 'CRITICAL':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return '[&>div]:bg-emerald-500';
    if (score >= 60) return '[&>div]:bg-blue-500';
    if (score >= 40) return '[&>div]:bg-amber-500';
    return '[&>div]:bg-red-500';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
        <div className={cn('p-2 rounded-full', getStatusColor(healthData.status))}>
          {healthData.status === 'EXCELLENT' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : healthData.status === 'GOOD' ? (
            <TrendingUp className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Health Score</span>
            <span className={cn('text-lg font-bold', getScoreColor(healthData.healthScore))}>
              {healthData.healthScore}/100
            </span>
          </div>
          <Progress
            value={healthData.healthScore}
            className={cn('h-1.5 mt-1', getProgressColor(healthData.healthScore))}
          />
        </div>
        <Badge variant="outline" className={getStatusColor(healthData.status)}>
          {healthData.status}
        </Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Fund Health Score
          </CardTitle>
          <Badge className={getStatusColor(healthData.status)}>
            {healthData.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Score */}
        <div className="flex items-center justify-center py-4">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={`${(healthData.healthScore / 100) * 352} 352`}
                strokeLinecap="round"
                className={getScoreColor(healthData.healthScore)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className={cn('text-3xl font-bold', getScoreColor(healthData.healthScore))}>
                  {healthData.healthScore}
                </span>
                <span className="text-sm text-muted-foreground block">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>Utilization</span>
              <span className="text-xs text-muted-foreground">({healthData.breakdown.utilization.weight})</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress
                value={healthData.breakdown.utilization.score}
                className="w-16 h-1.5"
              />
              <span className="font-medium w-8 text-right">{healthData.breakdown.utilization.score}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Timeliness</span>
              <span className="text-xs text-muted-foreground">({healthData.breakdown.timeliness.weight})</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress
                value={healthData.breakdown.timeliness.score}
                className="w-16 h-1.5"
              />
              <span className="font-medium w-8 text-right">{healthData.breakdown.timeliness.score}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>ROI</span>
              <span className="text-xs text-muted-foreground">({healthData.breakdown.roi.weight})</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress
                value={healthData.breakdown.roi.score}
                className="w-16 h-1.5"
              />
              <span className="font-medium w-8 text-right">{healthData.breakdown.roi.score}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span>Coverage</span>
              <span className="text-xs text-muted-foreground">({healthData.breakdown.coverage.weight})</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress
                value={healthData.breakdown.coverage.score}
                className="w-16 h-1.5"
              />
              <span className="font-medium w-8 text-right">{healthData.breakdown.coverage.score}</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {healthData.alerts && healthData.alerts.length > 0 && (
          <div className="pt-3 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Alerts</p>
            {healthData.alerts.slice(0, 3).map((alert, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-start gap-2 p-2 rounded text-xs',
                  alert.severity === 'CRITICAL' && 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300',
                  alert.severity === 'WARNING' && 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
                  alert.severity === 'INFO' && 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                )}
              >
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {healthData.recommendations && healthData.recommendations.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">Recommendations</p>
            <ul className="space-y-1">
              {healthData.recommendations.slice(0, 2).map((rec, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                  <span className="text-primary">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FundHealthScore;
