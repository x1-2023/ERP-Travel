/**
 * AI Insight Card Component
 */

import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AIInsight, InsightType, Severity } from '@/types/advanced';

interface InsightCardProps {
  insight: AIInsight;
  onDismiss?: () => void;
  onAction?: () => void;
  compact?: boolean;
}

const insightTypeIcons: Record<InsightType, React.ElementType> = {
  ANOMALY: AlertTriangle,
  TREND: TrendingUp,
  OPPORTUNITY: Lightbulb,
  RISK: AlertCircle,
};

const severityStyles: Record<Severity, string> = {
  CRITICAL: 'border-l-red-500 bg-red-50 dark:bg-red-950/30',
  WARNING: 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/30',
  INFO: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/30',
};

const severityBadgeVariant: Record<Severity, 'destructive' | 'secondary' | 'outline'> = {
  CRITICAL: 'destructive',
  WARNING: 'secondary',
  INFO: 'outline',
};

export function InsightCard({ insight, onDismiss, onAction, compact = false }: InsightCardProps) {
  const Icon = insightTypeIcons[insight.type];

  return (
    <Card className={cn('border-l-4', severityStyles[insight.severity])}>
      <CardContent className={cn('p-4', compact && 'p-3')}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Icon className={cn('h-4 w-4 shrink-0', compact && 'h-3 w-3')} />
              <span className={cn('font-medium truncate', compact && 'text-sm')}>
                {insight.title}
              </span>
              <Badge variant={severityBadgeVariant[insight.severity]} className="shrink-0">
                {insight.severity}
              </Badge>
              <Badge variant="outline" className="shrink-0">
                {(insight.confidence * 100).toFixed(0)}%
              </Badge>
            </div>

            {!compact && (
              <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
            )}

            {insight.entityType && insight.entityId && (
              <Link
                to={`/${insight.entityType.toLowerCase()}s/${insight.entityId}`}
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                View {insight.entityType}
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          <div className="flex gap-1 shrink-0">
            {insight.actionRequired && !insight.actionTaken && onAction && (
              <Button size="sm" onClick={onAction}>
                Take Action
              </Button>
            )}
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InsightTypeIcon({ type }: { type: InsightType }) {
  const Icon = insightTypeIcons[type];
  return <Icon className="h-4 w-4" />;
}
