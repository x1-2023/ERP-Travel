'use client';

import { useTotalRewards } from '@/hooks/use-compensation';
import { TotalRewardsCard } from '@/components/compensation/total-rewards/total-rewards-card';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/compensation/utils';

export default function TotalRewardsPage() {
  const { data: statements, isLoading } = useTotalRewards();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tổng đãi ngộ</h1>
      {isLoading ? <p className="text-muted-foreground">Đang tải...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(statements) && statements.map((stmt: any) => (
            <Card key={stmt.id}>
              <CardContent className="p-4">
                <p className="font-medium text-sm">{stmt.employee?.fullName}</p>
                <p className="text-xs text-muted-foreground mb-2">{stmt.employee?.department?.name}</p>
                <p className="text-lg font-bold font-mono text-primary">{formatCurrency(stmt.totalRewards)}</p>
                <p className="text-xs text-muted-foreground">Năm {stmt.year}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
