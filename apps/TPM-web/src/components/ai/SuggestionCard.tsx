import { Sparkles, ThumbsUp, ThumbsDown, Play, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfidenceBadge } from './ConfidenceBadge';
import { cn } from '@/lib/utils';

interface SuggestionCardProps {
  suggestion: {
    id: string;
    type: string;
    status: string;
    priority: number;
    title: string;
    description: string;
    confidence: number;
    impactEstimate?: {
      estimatedROI?: number;
      incrementalVolume?: number;
      estimatedCost?: number;
    } | null;
    customer?: { name: string; code: string } | null;
    createdAt: string;
  };
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onApply?: (id: string) => void;
  onClick?: () => void;
}

const typeLabels: Record<string, string> = {
  PROMOTION: 'New Promotion',
  REALLOCATION: 'Budget Reallocation',
  BASELINE_UPDATE: 'Baseline Update',
  MECHANIC_CHANGE: 'Mechanic Change',
  TIMING_CHANGE: 'Timing Adjustment',
};

const statusStyles: Record<string, string> = {
  PENDING: 'text-yellow-700 bg-yellow-100',
  REVIEWING: 'text-blue-700 bg-blue-100',
  APPROVED: 'text-green-700 bg-green-100',
  REJECTED: 'text-red-700 bg-red-100',
  APPLIED: 'text-purple-700 bg-purple-100',
  EXPIRED: 'text-foreground-muted bg-muted',
};

export default function SuggestionCard({ suggestion, onApprove, onReject, onApply, onClick }: SuggestionCardProps) {
  const impact = suggestion.impactEstimate as Record<string, number> | null;

  return (
    <Card className={cn('transition-all hover:shadow-md', onClick && 'cursor-pointer')} onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <CardTitle className="text-sm">{suggestion.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ConfidenceBadge confidence={suggestion.confidence} />
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusStyles[suggestion.status] || '')}>
              {suggestion.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-1.5 py-0.5 rounded bg-muted font-medium">
            {typeLabels[suggestion.type] || suggestion.type}
          </span>
          {suggestion.customer && (
            <span>{suggestion.customer.name}</span>
          )}
          <Clock className="h-3 w-3 ml-auto" />
          <span>{new Date(suggestion.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2">{suggestion.description}</p>

        {impact && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            {impact.estimatedROI !== undefined && (
              <div className="bg-muted/50 rounded p-2 text-center">
                <p className="text-muted-foreground">ROI</p>
                <p className="font-semibold text-green-600">{impact.estimatedROI}x</p>
              </div>
            )}
            {impact.incrementalVolume !== undefined && (
              <div className="bg-muted/50 rounded p-2 text-center">
                <p className="text-muted-foreground">Volume</p>
                <p className="font-semibold">+{impact.incrementalVolume.toLocaleString()}</p>
              </div>
            )}
            {impact.estimatedCost !== undefined && (
              <div className="bg-muted/50 rounded p-2 text-center">
                <p className="text-muted-foreground">Cost</p>
                <p className="font-semibold">{(impact.estimatedCost / 1000000).toFixed(0)}M</p>
              </div>
            )}
          </div>
        )}

        {suggestion.status === 'PENDING' && (onApprove || onReject) && (
          <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
            {onApprove && (
              <Button size="sm" variant="success" onClick={() => onApprove(suggestion.id)} className="flex-1">
                <ThumbsUp className="h-3.5 w-3.5 mr-1" /> Approve
              </Button>
            )}
            {onReject && (
              <Button size="sm" variant="outline" onClick={() => onReject(suggestion.id)} className="flex-1">
                <ThumbsDown className="h-3.5 w-3.5 mr-1" /> Reject
              </Button>
            )}
          </div>
        )}

        {suggestion.status === 'APPROVED' && onApply && (
          <div onClick={(e) => e.stopPropagation()}>
            <Button size="sm" className="w-full" onClick={() => onApply(suggestion.id)}>
              <Play className="h-3.5 w-3.5 mr-1" /> Apply Suggestion
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
