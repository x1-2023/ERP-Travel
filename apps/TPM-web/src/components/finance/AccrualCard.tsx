/**
 * Accrual Card Component - For grid view
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccrualStatusBadge } from './AccrualStatusBadge';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { Calendar, FileText, ArrowRight } from 'lucide-react';
import type { AccrualEntry } from '@/types/finance';

interface AccrualCardProps {
  accrual: AccrualEntry;
  onPost?: (id: string) => void;
  onReverse?: (id: string) => void;
}

export function AccrualCard({ accrual, onPost, onReverse }: AccrualCardProps) {
  const canPost = accrual.status === 'PENDING' || accrual.status === 'CALCULATED';
  const canReverse = accrual.status === 'POSTED';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">
              {accrual.promotion?.code || 'Unknown Promotion'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {accrual.promotion?.name}
            </p>
          </div>
          <AccrualStatusBadge status={accrual.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Period: {accrual.period}</span>
          </div>
          <div className="text-right">
            <CurrencyDisplay amount={accrual.amount} size="md" />
          </div>
        </div>

        {accrual.glJournalId && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>GL Journal: {accrual.glJournalId.slice(0, 8)}...</span>
          </div>
        )}

        {accrual.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {accrual.notes}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-2">
            {canPost && onPost && (
              <Button size="sm" variant="outline" onClick={() => onPost(accrual.id)}>
                Post to GL
              </Button>
            )}
            {canReverse && onReverse && (
              <Button size="sm" variant="destructive" onClick={() => onReverse(accrual.id)}>
                Reverse
              </Button>
            )}
          </div>
          <Link to={`/finance/accruals/${accrual.id}`}>
            <Button size="sm" variant="ghost">
              View <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default AccrualCard;
