/**
 * Matching Suggestion Card Component
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchingSuggestion {
  claimId: string;
  claim: {
    id: string;
    code: string;
    amount: number;
    claimDate: Date | string;
    status: string;
    promotion: {
      id: string;
      code: string;
      name: string;
    };
  };
  confidence: number;
  matchReasons: string[];
}

interface MatchingSuggestionCardProps {
  suggestion: MatchingSuggestion;
  selected?: boolean;
  onSelect?: (claimId: string) => void;
  onMatch?: (claimId: string) => void;
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'bg-green-500';
  if (confidence >= 0.6) return 'bg-yellow-500';
  if (confidence >= 0.4) return 'bg-orange-500';
  return 'bg-red-500';
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.6) return 'Medium';
  if (confidence >= 0.4) return 'Low';
  return 'Very Low';
}

export function MatchingSuggestionCard({
  suggestion,
  selected,
  onSelect,
  onMatch,
}: MatchingSuggestionCardProps) {
  const confidencePercent = Math.round(suggestion.confidence * 100);

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        selected && 'ring-2 ring-primary border-primary'
      )}
      onClick={() => onSelect?.(suggestion.claimId)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{suggestion.claim.code}</span>
              {selected && <Check className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground">
              {suggestion.claim.promotion.name}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold"><CurrencyDisplay amount={suggestion.claim.amount} size="sm" /></p>
            <div className="flex items-center gap-1 mt-1">
              <div
                className={cn('h-2 w-2 rounded-full', getConfidenceColor(suggestion.confidence))}
              />
              <span className="text-xs text-muted-foreground">
                {confidencePercent}% {getConfidenceLabel(suggestion.confidence)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Claim Date: {formatDate(suggestion.claim.claimDate)}</span>
        </div>

        {/* Match Reasons */}
        <div className="mt-3 flex flex-wrap gap-1">
          {suggestion.matchReasons.map((reason, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {reason}
            </Badge>
          ))}
        </div>

        {/* Match Button */}
        {selected && onMatch && (
          <div className="mt-4 pt-3 border-t">
            <Button
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onMatch(suggestion.claimId);
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Match This Claim
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MatchingSuggestionCard;
