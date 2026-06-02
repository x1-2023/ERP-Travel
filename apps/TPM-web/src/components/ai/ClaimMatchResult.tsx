import { CheckCircle2, AlertTriangle, XCircle, Eye, Flag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ConfidenceBadge } from './ConfidenceBadge';
import { cn } from '@/lib/utils';

interface ClaimMatchResultProps {
  match: {
    recommendation: string;
    confidence: number;
    matchScore: number;
    matchedAmount?: number;
    variance?: number;
    variancePercent?: number;
    flags: string[];
    reasoning?: string;
  };
}

const recommendationConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  AUTO_APPROVE: { icon: CheckCircle2, color: 'text-green-600', label: 'Auto Approve' },
  APPROVE_WITH_FLAG: { icon: Flag, color: 'text-yellow-600', label: 'Approve with Flag' },
  MANUAL_REVIEW: { icon: Eye, color: 'text-blue-600', label: 'Manual Review' },
  PARTIAL_APPROVE: { icon: AlertTriangle, color: 'text-orange-600', label: 'Partial Approve' },
  REJECT: { icon: XCircle, color: 'text-red-600', label: 'Reject' },
};

export default function ClaimMatchResult({ match }: ClaimMatchResultProps) {
  const config = recommendationConfig[match.recommendation] || recommendationConfig.MANUAL_REVIEW;
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn('h-5 w-5', config.color)} />
            <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
          </div>
          <ConfidenceBadge confidence={match.confidence} size="md" />
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">Match Score</p>
            <p className="font-semibold">{(match.matchScore * 100).toFixed(0)}%</p>
          </div>
          {match.matchedAmount !== undefined && (
            <div>
              <p className="text-muted-foreground">Matched Amount</p>
              <p className="font-semibold">{match.matchedAmount.toLocaleString()} VND</p>
            </div>
          )}
          {match.variancePercent !== undefined && (
            <div>
              <p className="text-muted-foreground">Variance</p>
              <p className={cn('font-semibold', Math.abs(match.variancePercent) > 10 ? 'text-red-600' : 'text-green-600')}>
                {match.variancePercent > 0 ? '+' : ''}{match.variancePercent.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {match.flags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {match.flags.map((flag) => (
              <span key={flag} className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                {flag.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}

        {match.reasoning && (
          <p className="text-xs text-muted-foreground italic">{match.reasoning}</p>
        )}
      </CardContent>
    </Card>
  );
}
