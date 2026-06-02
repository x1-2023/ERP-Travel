import { AlertTriangle, TrendingDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GapAlertProps {
  gap: number;
  requiredMonthlyRun: number;
  avgMonthlyVolume: number;
  projectedAchievement: number;
  riskLevel: string;
}

export default function GapAlert({ gap, requiredMonthlyRun, avgMonthlyVolume, projectedAchievement, riskLevel }: GapAlertProps) {
  if (gap <= 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">Contract is on track or ahead of target</p>
        <p className="text-xs text-green-600 mt-1">Projected year-end achievement: {projectedAchievement.toFixed(1)}%</p>
      </div>
    );
  }

  const runRateGap = requiredMonthlyRun - avgMonthlyVolume;

  return (
    <div className={cn(
      'rounded-lg border p-4',
      riskLevel === 'CRITICAL' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
    )}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={cn(
          'h-5 w-5 flex-shrink-0 mt-0.5',
          riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-yellow-500'
        )} />
        <div className="flex-1 space-y-2">
          <p className={cn(
            'text-sm font-medium',
            riskLevel === 'CRITICAL' ? 'text-red-800' : 'text-yellow-800'
          )}>
            Volume gap of {gap.toLocaleString()} cases to close
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Required monthly run</p>
              <p className="font-medium">{requiredMonthlyRun.toLocaleString()} cases/month</p>
            </div>
            <div>
              <p className="text-muted-foreground">Current avg monthly</p>
              <p className="font-medium">{avgMonthlyVolume.toLocaleString()} cases/month</p>
            </div>
          </div>

          {runRateGap > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              <span className={riskLevel === 'CRITICAL' ? 'text-red-700' : 'text-yellow-700'}>
                Need to increase by {runRateGap.toLocaleString()} cases/month
              </span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-medium">
                Projected: {projectedAchievement.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
