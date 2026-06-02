'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Target } from 'lucide-react';
import Link from 'next/link';

interface LearningPath {
  id: string;
  title: string;
  description?: string;
  totalCourses?: number;
  totalDurationHours?: number;
  level?: string;
  targetRole?: string;
  enrollmentCount?: number;
}

interface LearningPathCardProps {
  path: LearningPath;
}

export function LearningPathCard({ path }: LearningPathCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          {path.level && <Badge variant="outline" className="text-xs">{path.level}</Badge>}
          {path.targetRole && (
            <Badge variant="secondary" className="text-xs">
              <Target className="w-3 h-3 mr-1" />{path.targetRole}
            </Badge>
          )}
        </div>
        <h3 className="font-semibold mb-1 line-clamp-2">{path.title}</h3>
        {path.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{path.description}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {path.totalCourses !== undefined && (
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{path.totalCourses} khoa hoc</span>
          )}
          {path.totalDurationHours !== undefined && (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{path.totalDurationHours}h</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/learning/paths/${path.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full">Xem lo trinh</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
