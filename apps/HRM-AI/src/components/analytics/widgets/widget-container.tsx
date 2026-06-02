'use client';

import { GripVertical, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WidgetContainerProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onRemove?: (id: string) => void;
  isDragging?: boolean;
  className?: string;
}

export function WidgetContainer({
  id,
  title,
  children,
  onRemove,
  isDragging = false,
  className,
}: WidgetContainerProps) {
  return (
    <Card
      className={cn(
        'relative transition-shadow',
        isDragging && 'shadow-lg ring-2 ring-primary/20 opacity-90',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
            <GripVertical className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        {onRemove && (
          <button
            onClick={() => onRemove(id)}
            className="rounded-sm p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Remove widget"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
