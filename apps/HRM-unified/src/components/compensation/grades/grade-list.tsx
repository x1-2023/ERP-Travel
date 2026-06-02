'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SalaryRangeBar } from '../common/salary-range-bar';
import { formatCurrency } from '@/lib/compensation/utils';
import { SalaryGrade } from '@/types/compensation';

interface GradeListProps { grades: SalaryGrade[]; }

export function GradeList({ grades }: GradeListProps) {
  return (
    <div className="space-y-3">
      {grades.map((grade) => (
        <Card key={grade.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{grade.code}</Badge>
                <span className="font-medium text-sm">{grade.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">Level {grade.level}</span>
            </div>
            <SalaryRangeBar min={grade.minSalary} mid={grade.midSalary} max={grade.maxSalary} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
