'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PathCourse {
  id: string;
  title: string;
  order: number;
  isCompleted?: boolean;
  progress?: number;
}

interface PathProgressProps {
  pathTitle: string;
  courses: PathCourse[];
  overallProgress: number;
}

export function PathProgress({ pathTitle, courses, overallProgress }: PathProgressProps) {
  const completedCount = courses.filter((c) => c.isCompleted).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{pathTitle}</CardTitle>
          <Badge variant="outline" className="text-xs">{completedCount}/{courses.length} khoa hoc</Badge>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Tien do tong the</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {courses.sort((a, b) => a.order - b.order).map((course, index) => (
          <div key={course.id} className="flex items-center gap-3">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
              course.isCompleted ? 'bg-green-100' : 'bg-muted'
            )}>
              {course.isCompleted
                ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                : <Circle className="w-4 h-4 text-muted-foreground" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm', course.isCompleted && 'line-through opacity-70')}>{course.title}</p>
              {course.progress !== undefined && !course.isCompleted && course.progress > 0 && (
                <Progress value={course.progress} className="h-1 mt-1" />
              )}
            </div>
            {index < courses.length - 1 && (
              <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
