/**
 * Journal Card Component
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JournalStatusBadge } from './JournalStatusBadge';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { FileText, Eye, Send, RotateCcw } from 'lucide-react';
import type { Journal } from '@/hooks/useJournals';

interface JournalCardProps {
  journal: Journal;
  onView?: (id: string) => void;
  onPost?: (id: string) => void;
  onReverse?: (id: string) => void;
}

export function JournalCard({ journal, onView, onPost, onReverse }: JournalCardProps) {
  const isDraft = journal.status === 'DRAFT';
  const isPosted = journal.status === 'POSTED';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {journal.code}
          </CardTitle>
          <JournalStatusBadge status={journal.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Type:</span>
            <div className="font-medium">{journal.journalType}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Date:</span>
            <div className="font-medium">{formatDate(journal.journalDate)}</div>
          </div>
        </div>

        {journal.customer && (
          <div className="text-sm">
            <span className="text-muted-foreground">Customer:</span>
            <div className="font-medium">{journal.customer.name}</div>
          </div>
        )}

        {journal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {journal.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="font-semibold text-lg"><CurrencyDisplay amount={journal.totalDebit} size="sm" /></div>
          </div>
          <div className="flex gap-1">
            {onView && (
              <Button size="sm" variant="ghost" onClick={() => onView(journal.id)}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {isDraft && onPost && (
              <Button size="sm" variant="outline" onClick={() => onPost(journal.id)}>
                <Send className="h-4 w-4" />
              </Button>
            )}
            {isPosted && onReverse && !journal.reversedById && (
              <Button size="sm" variant="outline" onClick={() => onReverse(journal.id)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default JournalCard;
