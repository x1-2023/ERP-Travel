/**
 * EmptyState Component - Industrial Design System
 */

import { ReactNode } from 'react';
import { FileX2, Search, Plus, AlertCircle, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode | LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode | {
    label: string;
    onClick: () => void;
  };
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  // Render icon - handle both ReactNode and LucideIcon
  const renderIcon = () => {
    if (!icon) return <FileX2 className="h-5 w-5 text-foreground-subtle" />;
    if (typeof icon === 'function') {
      const IconComponent = icon as LucideIcon;
      return <IconComponent className="h-5 w-5 text-foreground-subtle" />;
    }
    return icon;
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 text-center',
      'border border-dashed border-surface-border rounded',
      'bg-surface/30',
      className
    )}>
      <div className="flex h-12 w-12 items-center justify-center rounded border border-surface-border bg-surface mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-xs text-foreground-muted mt-1 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        typeof action === 'object' && 'label' in action && 'onClick' in action ? (
          <Button onClick={action.onClick} size="sm" className="mt-4">
            <Plus className="mr-2 h-3.5 w-3.5" />
            {action.label}
          </Button>
        ) : (
          <div className="mt-4">{action}</div>
        )
      )}
      {!action && actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-4">
          <Plus className="mr-2 h-3.5 w-3.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// No search results
export function NoSearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<Search className="h-5 w-5 text-foreground-subtle" />}
      title="No results found"
      description={
        query
          ? `No results for "${query}". Try different keywords.`
          : 'No items match your filters.'
      }
    />
  );
}

// Error state
export function ErrorState({
  message = 'Failed to load data',
  onRetry
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded border border-danger/30 bg-danger-muted mb-4">
        <AlertCircle className="h-5 w-5 text-danger" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">Error</h3>
      <p className="text-xs text-foreground-muted mt-1">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-4">
          Try Again
        </Button>
      )}
    </div>
  );
}
