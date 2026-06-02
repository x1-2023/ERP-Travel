/**
 * Deduction Card Component - For grid view
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeductionStatusBadge } from './DeductionStatusBadge';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { FileText, Calendar, ArrowRight, Link as LinkIcon } from 'lucide-react';
import type { Deduction } from '@/types/finance';

interface DeductionCardProps {
  deduction: Deduction;
  onMatch?: (id: string) => void;
  onDispute?: (id: string) => void;
}

export function DeductionCard({ deduction, onMatch, onDispute }: DeductionCardProps) {
  const canMatch = deduction.status === 'OPEN';
  const canDispute = deduction.status === 'OPEN';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">
              {deduction.code}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {deduction.customer?.name}
            </p>
          </div>
          <DeductionStatusBadge status={deduction.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Inv: {deduction.invoiceNumber}</span>
          </div>
          <div className="text-right">
            <CurrencyDisplay amount={deduction.amount} size="md" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(deduction.invoiceDate)}</span>
        </div>

        {deduction.matchedClaim && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <LinkIcon className="h-4 w-4" />
            <span>Matched: {deduction.matchedClaim.code}</span>
          </div>
        )}

        {deduction.reason && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {deduction.reason}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-2">
            {canMatch && onMatch && (
              <Button size="sm" variant="outline" onClick={() => onMatch(deduction.id)}>
                Match Claim
              </Button>
            )}
            {canDispute && onDispute && (
              <Button size="sm" variant="destructive" onClick={() => onDispute(deduction.id)}>
                Dispute
              </Button>
            )}
          </div>
          <Link to={`/finance/deductions/${deduction.id}`}>
            <Button size="sm" variant="ghost">
              View <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default DeductionCard;
