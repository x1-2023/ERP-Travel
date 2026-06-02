'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { ENROLLMENT_STATUS } from '@/lib/learning/constants';
import { Enrollment, CourseModule } from '@/types/learning';
import { cn } from '@/lib/utils';

interface EnrollmentProgressProps {
  enrollment: Enrollment;
  showModules?: boolean;
}

export function EnrollmentProgress({ enrollment, showModules = true }: EnrollmentProgressProps) {
  const statusConfig = ENROLLMENT_STATUS[enrollment.status as keyof typeof ENROLLMENT_STATUS];
  const completedModuleIds = new Set(enrollment.moduleCompletions?.map((mc) => mc.moduleId) || []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Tien do</p>
          <p className="text-2xl font-bold">{enrollment.progress}%</p>
        </div>
        <Badge variant="outline">{statusConfig?.label}</Badge>
      </div>
      <Progress value={enrollment.progress} className="h-2" />
      {showModules && enrollment.course?.modules && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Noi dung khoa hoc</p>
          {enrollment.course.modules.map((module: CourseModule, index: number) => {
            const isCompleted = completedModuleIds.has(module.id);
            return (
              <div key={module.id} className={cn('flex items-center gap-3 p-2 rounded-sm', isCompleted ? 'bg-green-500/10' : 'bg-muted/50')}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /> : <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', isCompleted && 'line-through opacity-70')}>{index + 1}. {module.title}</p>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{module.durationMinutes}m</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
