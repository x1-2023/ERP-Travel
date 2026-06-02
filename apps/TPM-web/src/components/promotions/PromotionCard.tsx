/**
 * Promotion Card Component (for Grid View)
 */

import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PromotionStatusBadge } from './PromotionStatusBadge';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { Promotion } from '@/types';

interface PromotionCardProps {
  promotion: Promotion;
}

export function PromotionCard({ promotion }: PromotionCardProps) {
  const utilizationPercent = promotion.budget > 0
    ? Math.round((promotion.actualSpend / promotion.budget) * 100)
    : 0;

  return (
    <Link to={`/promotions/${promotion.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {promotion.code}
              </p>
              <CardTitle className="mt-1 text-lg">{promotion.name}</CardTitle>
            </div>
            <PromotionStatusBadge status={promotion.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{promotion.customer?.name || 'No customer'}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Budget Utilization
                </span>
                <span className="font-medium">{utilizationPercent}%</span>
              </div>
              <Progress value={utilizationPercent} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">Spent: <CurrencyDisplay amount={promotion.actualSpend} size="sm" showToggle={false} /></span>
                <span className="flex items-center gap-1">Budget: <CurrencyDisplay amount={promotion.budget} size="sm" showToggle={false} /></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
