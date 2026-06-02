/**
 * Cheque Card Component
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChequeStatusBadge } from './ChequeStatusBadge';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { CreditCard, Eye, CheckCircle, XCircle } from 'lucide-react';
import type { Cheque } from '@/hooks/useCheques';

interface ChequeCardProps {
  cheque: Cheque;
  onView?: (id: string) => void;
  onClear?: (id: string) => void;
  onVoid?: (id: string) => void;
}

export function ChequeCard({ cheque, onView, onClear, onVoid }: ChequeCardProps) {
  const isIssued = cheque.status === 'ISSUED';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {cheque.chequeNumber}
          </CardTitle>
          <ChequeStatusBadge status={cheque.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Date:</span>
            <div className="font-medium">{formatDate(cheque.chequeDate)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Bank:</span>
            <div className="font-medium">{cheque.bankName || '-'}</div>
          </div>
        </div>

        {cheque.customer && (
          <div className="text-sm">
            <span className="text-muted-foreground">Payee:</span>
            <div className="font-medium">{cheque.payee || cheque.customer.name}</div>
          </div>
        )}

        {cheque.claim && (
          <div className="text-sm">
            <span className="text-muted-foreground">Claim:</span>
            <div className="font-medium">{cheque.claim.code}</div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <div className="text-xs text-muted-foreground">Amount</div>
            <div className="font-semibold text-lg"><CurrencyDisplay amount={cheque.amount} size="sm" /></div>
          </div>
          <div className="flex gap-1">
            {onView && (
              <Button size="sm" variant="ghost" onClick={() => onView(cheque.id)}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {isIssued && onClear && (
              <Button size="sm" variant="outline" onClick={() => onClear(cheque.id)}>
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            {isIssued && onVoid && (
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => onVoid(cheque.id)}>
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChequeCard;
