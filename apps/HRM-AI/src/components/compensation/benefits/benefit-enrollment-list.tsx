'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BENEFIT_ENROLLMENT_STATUS } from '@/lib/compensation/constants';
import { formatCurrency } from '@/lib/compensation/utils';
import { BenefitEnrollment } from '@/types/compensation';

interface BenefitEnrollmentListProps { enrollments: BenefitEnrollment[]; }

export function BenefitEnrollmentList({ enrollments }: BenefitEnrollmentListProps) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Phúc lợi đã đăng ký</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {enrollments.length === 0 && <p className="text-sm text-muted-foreground">Chưa đăng ký phúc lợi nào.</p>}
        {enrollments.map((enrollment) => {
          const statusConfig = BENEFIT_ENROLLMENT_STATUS[enrollment.status];
          return (
            <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-md">
              <div><p className="text-sm font-medium">{enrollment.plan?.name}</p>
                <p className="text-xs text-muted-foreground">{enrollment.employerAmount ? `Công ty: ${formatCurrency(enrollment.employerAmount)}` : ''}</p></div>
              <Badge variant="outline" className="text-xs">{statusConfig?.label}</Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
