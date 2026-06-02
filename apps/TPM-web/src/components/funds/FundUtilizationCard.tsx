/**
 * Fund Utilization Card Component
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { Fund } from '@/types';

interface FundUtilizationCardProps {
  fund: Fund;
}

export function FundUtilizationCard({ fund }: FundUtilizationCardProps) {
  const utilizationPercent = fund.totalBudget > 0
    ? Math.round((fund.utilizedBudget / fund.totalBudget) * 100)
    : 0;

  const allocatedPercent = fund.totalBudget > 0
    ? Math.round((fund.allocatedBudget / fund.totalBudget) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Budget Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Allocated</span>
            <span className="font-medium">{allocatedPercent}%</span>
          </div>
          <Progress value={allocatedPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <CurrencyDisplay amount={fund.allocatedBudget} size="sm" showToggle={false} />
            <CurrencyDisplay amount={fund.totalBudget} size="sm" showToggle={false} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Utilized</span>
            <span className="font-medium">{utilizationPercent}%</span>
          </div>
          <Progress value={utilizationPercent} className="h-2 [&>div]:bg-green-500" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <CurrencyDisplay amount={fund.utilizedBudget} size="sm" showToggle={false} />
            <CurrencyDisplay amount={fund.totalBudget} size="sm" showToggle={false} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Available</p>
            <div className="text-emerald-600 dark:text-emerald-400">
              <CurrencyDisplay amount={fund.availableBudget} size="md" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <CurrencyDisplay amount={fund.totalBudget} size="md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
