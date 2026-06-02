'use client';

import { useBenchmarks } from '@/hooks/use-compensation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/compensation/utils';

export default function BenchmarksPage() {
  const { data: benchmarks, isLoading } = useBenchmarks();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Benchmarking lương</h1>
      {isLoading ? <p className="text-muted-foreground">Đang tải...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b">
              <th className="text-left p-3">Vị trí</th><th className="text-right p-3">P25</th><th className="text-right p-3">P50</th><th className="text-right p-3">P75</th><th className="text-right p-3">P90</th><th className="text-left p-3">Nguồn</th>
            </tr></thead>
            <tbody>
              {benchmarks?.map((b: any) => (
                <tr key={b.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">{b.positionTitle}</td>
                  <td className="p-3 text-right font-mono">{b.percentile25 ? formatCurrency(Number(b.percentile25)) : '-'}</td>
                  <td className="p-3 text-right font-mono">{b.percentile50 ? formatCurrency(Number(b.percentile50)) : '-'}</td>
                  <td className="p-3 text-right font-mono">{b.percentile75 ? formatCurrency(Number(b.percentile75)) : '-'}</td>
                  <td className="p-3 text-right font-mono">{b.percentile90 ? formatCurrency(Number(b.percentile90)) : '-'}</td>
                  <td className="p-3 text-muted-foreground">{b.surveySource || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
