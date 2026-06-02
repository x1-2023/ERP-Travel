'use client';

import { Badge } from '@/components/ui/badge';
import { ENROLLMENT_STATUS } from '@/lib/learning/constants';
import { cn } from '@/lib/utils';

interface EnrollmentStatusBadgeProps {
  status: string;
  className?: string;
}

export function EnrollmentStatusBadge({ status, className }: EnrollmentStatusBadgeProps) {
  const statusConfig = ENROLLMENT_STATUS[status as keyof typeof ENROLLMENT_STATUS];

  const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    ENROLLED: 'secondary',
    IN_PROGRESS: 'default',
    COMPLETED: 'default',
    FAILED: 'destructive',
    CANCELLED: 'outline',
    EXPIRED: 'destructive',
  };

  return (
    <Badge
      variant={variantMap[status] || 'outline'}
      className={cn('text-xs', className)}
    >
      {statusConfig?.label || status}
    </Badge>
  );
}
