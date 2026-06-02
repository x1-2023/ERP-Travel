/**
 * AI Recommendation Card Component
 */

import { Link } from 'react-router-dom';
import {
  Lightbulb,
  TrendingUp,
  Users,
  Clock,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AIRecommendation } from '@/types/advanced';

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onAccept?: () => void;
  onReject?: () => void;
  compact?: boolean;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

const recommendationTypeIcons: Record<string, React.ElementType> = {
  PROMOTION_OPTIMIZATION: TrendingUp,
  BUDGET_ALLOCATION: Lightbulb,
  BUDGET_OPTIMIZATION: Lightbulb,
  CUSTOMER_TARGETING: Users,
  TIMING_SUGGESTION: Clock,
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-500 text-white dark:bg-amber-600',
  ACCEPTED: 'bg-emerald-600 text-white dark:bg-emerald-500',
  REJECTED: 'bg-red-500 text-white dark:bg-red-600',
  EXPIRED: 'bg-slate-500 text-white dark:bg-slate-600',
};

export function RecommendationCard({
  recommendation,
  onAccept,
  onReject,
  compact = false,
  isAccepting = false,
  isRejecting = false,
}: RecommendationCardProps) {
  const Icon = recommendationTypeIcons[recommendation.type] || Lightbulb;

  return (
    <Card>
      <CardContent className={cn('pt-4', compact && 'pt-3 pb-3')}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={cn('font-medium', compact && 'text-sm')}>
                {recommendation.title}
              </span>
              <Badge className={cn('shrink-0', statusColors[recommendation.status] || 'bg-surface-hover text-foreground-muted')}>
                {recommendation.status}
              </Badge>
            </div>

            {!compact && (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  {recommendation.description}
                </p>

                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Confidence:{' '}
                    <span className="font-medium text-foreground">
                      {(recommendation.confidence * 100).toFixed(0)}%
                    </span>
                  </span>
                  {recommendation.impact.uplift !== undefined && (
                    <span className="text-muted-foreground">
                      Potential uplift:{' '}
                      <span className="font-medium text-green-600">
                        +{recommendation.impact.uplift.toFixed(1)}%
                      </span>
                    </span>
                  )}
                </div>

                {recommendation.reasoning && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    "{recommendation.reasoning}"
                  </p>
                )}

                {recommendation.entityType && recommendation.entityId && (
                  <Link
                    to={`/${recommendation.entityType.toLowerCase()}s/${recommendation.entityId}`}
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    View {recommendation.entityType}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>

      {recommendation.status === 'PENDING' && (onAccept || onReject) && (
        <CardFooter className={cn('pt-0 gap-2', compact && 'pb-3')}>
          {onAccept && (
            <Button
              size="sm"
              onClick={onAccept}
              disabled={isAccepting || isRejecting}
              className="flex-1"
            >
              <Check className="mr-1 h-4 w-4" />
              {isAccepting ? 'Accepting...' : 'Accept'}
            </Button>
          )}
          {onReject && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              disabled={isAccepting || isRejecting}
              className="flex-1"
            >
              <X className="mr-1 h-4 w-4" />
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
