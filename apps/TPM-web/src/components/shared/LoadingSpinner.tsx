/**
 * LoadingSpinner Component - Industrial Design System
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  text,
  className
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <span className="text-sm text-foreground-muted">{text}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <PageLoading />
      </div>
    );
  }

  return spinner;
}

// Full page loading - Industrial style
export function PageLoading() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="h-12 w-12 rounded border-2 border-surface-border" />
        <div className="absolute inset-0 h-12 w-12 animate-spin rounded border-2 border-transparent border-t-primary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Loading</p>
        <p className="text-2xs text-foreground-muted mt-1">Fetching data...</p>
      </div>
    </div>
  );
}

// Skeleton card
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded border border-surface-border bg-card p-4', className)}>
      <div className="space-y-3">
        <div className="h-3 w-20 rounded bg-surface-hover animate-pulse" />
        <div className="h-6 w-32 rounded bg-surface-hover animate-pulse" />
        <div className="h-3 w-24 rounded bg-surface-hover animate-pulse" />
      </div>
    </div>
  );
}
