'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
}

interface BudgetOverviewProps {
  totalBudget: number;
  totalSpent: number;
  categories?: BudgetCategory[];
  period?: string;
}

export function BudgetOverview({ totalBudget, totalSpent, categories = [], period }: BudgetOverviewProps) {
  const spentPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Ngan sach dao tao
          </CardTitle>
          {period && <Badge variant="outline" className="text-xs">{period}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Tong ngan sach</p>
            <p className="text-lg font-bold">{formatCurrency(totalBudget)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Da su dung</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(totalSpent)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Con lai</p>
            <p className={cn('text-lg font-bold', isOverBudget ? 'text-red-600' : 'text-green-600')}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Ty le su dung</span>
            <span className={cn('font-medium', spentPercentage > 90 ? 'text-red-600' : spentPercentage > 70 ? 'text-yellow-600' : 'text-green-600')}>
              {spentPercentage}%
            </span>
          </div>
          <Progress value={Math.min(spentPercentage, 100)} className="h-2" />
        </div>

        {categories.length > 0 && (
          <div className="space-y-3 pt-2 border-t">
            <p className="text-sm font-medium">Chi tiet theo danh muc</p>
            {categories.map((category) => {
              const catPercentage = category.allocated > 0 ? Math.round((category.spent / category.allocated) * 100) : 0;
              return (
                <div key={category.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>{category.name}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(category.spent)} / {formatCurrency(category.allocated)}
                    </span>
                  </div>
                  <Progress value={Math.min(catPercentage, 100)} className="h-1.5" />
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t">
          {spentPercentage <= 70 ? (
            <>
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">Ngan sach on dinh</span>
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 text-yellow-600" />
              <span className="text-xs text-yellow-600">Can theo doi chi tieu</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
