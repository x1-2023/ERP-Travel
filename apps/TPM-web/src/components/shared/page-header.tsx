import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  status?: {
    label: string;
    variant: 'success' | 'warning' | 'danger' | 'neutral';
  };
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  status,
}: PageHeaderProps) {
  const statusClasses = {
    success: 'status-dot-success',
    warning: 'status-dot-warning',
    danger: 'status-dot-danger',
    neutral: 'status-dot-neutral',
  };

  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 mb-3 text-2xs text-foreground-subtle">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3 w-3" />}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground-muted">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Header Content */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
            {status && (
              <div className="flex items-center gap-2 px-2 py-1 rounded bg-surface border border-surface-border">
                <div className={`status-dot ${statusClasses[status.variant]}`} />
                <span className="text-2xs font-medium text-foreground-muted uppercase tracking-wide">
                  {status.label}
                </span>
              </div>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-foreground-muted">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>

      {/* Divider */}
      <div className="industrial-line mt-4" />
    </div>
  );
}
