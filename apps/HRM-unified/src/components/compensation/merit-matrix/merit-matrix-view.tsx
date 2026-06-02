'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PERFORMANCE_RATING_LABELS, COMPA_RATIO_RANGES } from '@/lib/compensation/constants';
import { MeritMatrix } from '@/types/compensation';

interface MeritMatrixViewProps { data: MeritMatrix[]; }

export function MeritMatrixView({ data }: MeritMatrixViewProps) {
  const ratings = [1, 2, 3, 4, 5];
  const ranges = COMPA_RATIO_RANGES;
  const getValue = (rating: number, rangeIdx: number) => {
    const range = ranges[rangeIdx];
    const entry = data.find(d => d.performanceRating === rating && Number(d.compaRatioMin) >= range.min - 0.01 && Number(d.compaRatioMax) <= range.max + 0.01);
    return entry ? Number(entry.meritIncreasePercent) : 0;
  };
  const getCellColor = (value: number) => {
    if (value === 0) return 'bg-muted/50';
    if (value <= 3) return 'bg-yellow-50 dark:bg-yellow-900/20';
    if (value <= 7) return 'bg-green-50 dark:bg-green-900/20';
    if (value <= 10) return 'bg-blue-50 dark:bg-blue-900/20';
    return 'bg-purple-50 dark:bg-purple-900/20';
  };
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Ma trận Merit (5x5)</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-muted text-left text-xs">Hiệu suất \ Compa-ratio</th>
                {ranges.map((r, i) => (<th key={i} className="border p-2 bg-muted text-center text-xs">{r.label}<br/><span className="text-muted-foreground">{r.min}-{r.max === 999 ? '∞' : r.max}</span></th>))}
              </tr>
            </thead>
            <tbody>
              {ratings.map((rating) => (
                <tr key={rating}>
                  <td className="border p-2 font-medium text-xs">{rating} - {PERFORMANCE_RATING_LABELS[rating]}</td>
                  {ranges.map((_, rangeIdx) => {
                    const value = getValue(rating, rangeIdx);
                    return <td key={rangeIdx} className={`border p-2 text-center font-medium ${getCellColor(value)}`}>{value > 0 ? `${value}%` : '-'}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
