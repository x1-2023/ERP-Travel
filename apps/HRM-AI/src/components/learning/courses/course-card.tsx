'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, BookOpen, Award } from 'lucide-react';
import { COURSE_TYPE, COURSE_LEVEL } from '@/lib/learning/constants';
import { Course } from '@/types/learning';
import Link from 'next/link';

interface CourseCardProps {
  course: Course;
  showEnroll?: boolean;
}

export function CourseCard({ course, showEnroll = true }: CourseCardProps) {
  const courseType = COURSE_TYPE[course.courseType as keyof typeof COURSE_TYPE];
  const courseLevel = COURSE_LEVEL[course.level as keyof typeof COURSE_LEVEL];

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            {courseType?.label}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {courseLevel?.label}
          </Badge>
        </div>
        <h3 className="font-semibold mb-1 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.durationHours}h</span>
          {course._count?.enrollments !== undefined && (
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course._count.enrollments}</span>
          )}
          {course.modules && (
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.modules.length} modules</span>
          )}
        </div>
        {course.isMandatory && (
          <Badge variant="destructive" className="mt-2 text-xs"><Award className="w-3 h-3 mr-1" />Bat buoc</Badge>
        )}
      </CardContent>
      {showEnroll && (
        <CardFooter className="p-4 pt-0">
          <Link href={`/learning/courses/${course.id}`} className="w-full">
            <Button variant="outline" className="w-full">Xem chi tiet</Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
