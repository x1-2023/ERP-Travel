'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Video, BookOpen } from 'lucide-react';
import { CourseModule } from '@/types/learning';
import { cn } from '@/lib/utils';

interface ModuleListProps {
  modules: CourseModule[];
  completedModuleIds?: string[];
}

const MODULE_TYPE_ICONS: Record<string, React.ReactNode> = {
  VIDEO: <Video className="w-4 h-4" />,
  DOCUMENT: <FileText className="w-4 h-4" />,
  QUIZ: <BookOpen className="w-4 h-4" />,
};

export function ModuleList({ modules, completedModuleIds = [] }: ModuleListProps) {
  const completedSet = new Set(completedModuleIds);
  const totalDuration = modules.reduce((sum, m) => sum + (m.durationMinutes || 0), 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Noi dung khoa hoc</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{modules.length} bai hoc</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{totalDuration} phut</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {modules.map((module, index) => {
          const isCompleted = completedSet.has(module.id);
          return (
            <div
              key={module.id}
              className={cn('flex items-center gap-3 p-3 rounded-md border', isCompleted ? 'bg-green-50 border-green-200' : 'bg-background')}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{module.title}</p>
                {module.description && (
                  <p className="text-xs text-muted-foreground truncate">{module.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {module.contentType && MODULE_TYPE_ICONS[module.contentType]}
                <span className="text-xs text-muted-foreground">{module.durationMinutes}m</span>
                {isCompleted && <Badge variant="default" className="text-xs">Hoan thanh</Badge>}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
