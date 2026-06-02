'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

export function Alert({
  className,
  variant = 'default',
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4 flex items-start gap-3',
        variant === 'destructive'
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-gray-200 bg-gray-50 text-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
