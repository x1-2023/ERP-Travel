'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, BookOpen } from 'lucide-react';
import { ENROLLMENT_STATUS } from '@/lib/learning/constants';
import { Enrollment } from '@/types/learning';
import Link from 'next/link';

interface EnrollmentCardProps {
  enrollment: Enrollment;
}

export function EnrollmentCard({ enrollment }: EnrollmentCardProps) {
  const statusConfig = ENROLLMENT_STATUS[enrollment.status as keyof typeof ENROLLMENT_STATUS];

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm line-clamp-2">{enrollment.course?.title}</h3>
          <Badge variant="outline" className="text-xs shrink-0">
            {statusConfig?.label}
          </Badge>
        </div>
        <div className="space-y-2 mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Tien do</span>
            <span className="font-medium">{enrollment.progress}%</span>
          </div>
          <Progress value={enrollment.progress} className="h-1.5" />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          {enrollment.course?.durationHours && (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{enrollment.course.durationHours}h</span>
          )}
          {enrollment.course?.modules && (
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{enrollment.course.modules.length} bai hoc</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/learning/enrollments/${enrollment.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full">Tiep tuc hoc</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
