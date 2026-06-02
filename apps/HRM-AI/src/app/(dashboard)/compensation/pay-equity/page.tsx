'use client';

import { usePayEquity } from '@/hooks/use-compensation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/compensation/utils';
import { Scale } from 'lucide-react';

export default function PayEquityPage() {
  const { data: analyses, isLoading, mutate } = usePayEquity();

  const handleRunAnalysis = async () => {
    await fetch('/api/compensation/pay-equity/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    mutate();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Công bằng lương</h1>
        <Button onClick={handleRunAnalysis} size="sm"><Scale className="w-4 h-4 mr-1" />Chạy phân tích</Button>
      </div>
      {isLoading ? <p className="text-muted-foreground">Đang tải...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analyses?.map((analysis: any) => (
            <Card key={analysis.id}>
              <CardHeader><CardTitle className="text-sm">{analysis.department?.name || 'Toàn công ty'}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Chênh lệch giới tính:</span><span className="font-medium font-mono">{analysis.genderGap ? `${Number(analysis.genderGap).toFixed(1)}%` : 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Lương TB Nam:</span><span className="font-mono">{analysis.avgMaleSalary ? formatCurrency(Number(analysis.avgMaleSalary)) : 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Lương TB Nữ:</span><span className="font-mono">{analysis.avgFemaleSalary ? formatCurrency(Number(analysis.avgFemaleSalary)) : 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Số nhân viên:</span><span className="font-mono">{analysis.headcount}</span></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
