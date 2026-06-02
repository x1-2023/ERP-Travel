'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercent } from '@/lib/compensation/utils';
import { COMPENSATION_CHANGE_TYPE } from '@/lib/compensation/constants';

export default function CompensationHistoryPage() {
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/compensation/changes').then(r => r.json()).then(data => { setChanges(data.data ?? data); setLoading(false); });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Lịch sử thay đổi lương</h1>
      {loading ? <p className="text-muted-foreground">Đang tải...</p> : (
        <div className="space-y-3">
          {changes.map((change: any) => (
            <Card key={change.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{change.employee?.fullName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{COMPENSATION_CHANGE_TYPE[change.changeType]?.label}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(change.effectiveDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">{formatCurrency(Number(change.previousSalary))} → {formatCurrency(Number(change.newSalary))}</p>
                  <p className="text-xs font-mono text-primary">{formatPercent(Number(change.changePercent))}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
