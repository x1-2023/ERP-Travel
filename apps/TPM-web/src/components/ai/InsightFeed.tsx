/**
 * AI Insight Feed Component
 */

import { InsightCard } from './InsightCard';
import type { AIInsight } from '@/types/advanced';

interface InsightFeedProps {
  insights: AIInsight[];
  onDismiss?: (id: string) => void;
  onAction?: (id: string) => void;
  compact?: boolean;
}

export function InsightFeed({ insights, onDismiss, onAction, compact = false }: InsightFeedProps) {
  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No insights available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight) => (
        <InsightCard
          key={insight.id}
          insight={insight}
          onDismiss={onDismiss ? () => onDismiss(insight.id) : undefined}
          onAction={onAction ? () => onAction(insight.id) : undefined}
          compact={compact}
        />
      ))}
    </div>
  );
}
