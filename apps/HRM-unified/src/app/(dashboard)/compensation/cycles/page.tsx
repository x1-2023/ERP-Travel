'use client';

import { useCompensationCycles } from '@/hooks/use-compensation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { COMPENSATION_CYCLE_STATUS } from '@/lib/compensation/constants';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function CyclesPage() {
  const { data: cycles, isLoading } = useCompensationCycles();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chu kỳ đãi ngộ</h1>
        <Link href="/compensation/cycles/new"><Button size="sm"><Plus className="w-4 h-4 mr-1" />Tạo chu kỳ</Button></Link>
      </div>
      {isLoading ? <p className="text-muted-foreground">Đang tải...</p> : (
        <div className="space-y-3">
          {cycles?.map((cycle: any) => {
            const statusConfig = COMPENSATION_CYCLE_STATUS[cycle.status];
            return (
              <Link key={cycle.id} href={`/compensation/cycles/${cycle.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer mb-3">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div><p className="font-medium">{cycle.name}</p><p className="text-sm text-muted-foreground">{cycle.year} | {cycle._count?.reviews || 0} đánh giá</p></div>
                    <Badge variant="outline">{statusConfig?.label}</Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
