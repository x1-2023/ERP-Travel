/**
 * Clash Card Component
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Calendar,
  Users,
  Package,
  ArrowRight,
  DollarSign,
} from 'lucide-react';
import { ClashStatusBadge, ClashSeverityBadge } from './ClashStatusBadge';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { Clash } from '@/hooks/planning/useClashes';

interface ClashCardProps {
  clash: Clash;
  onResolve?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function ClashCard({ clash, onResolve, onDismiss }: ClashCardProps) {
  const isResolved = clash.status === 'RESOLVED' || clash.status === 'DISMISSED';

  return (
    <Card className={`${clash.severity === 'HIGH' && !isResolved ? 'border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-950/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={`h-5 w-5 ${
                clash.severity === 'HIGH'
                  ? 'text-red-500'
                  : clash.severity === 'MEDIUM'
                    ? 'text-yellow-500'
                    : 'text-blue-500'
              }`}
            />
            <div>
              <p className="font-semibold text-sm">
                {clash.clashType.replace('_', ' ')}
              </p>
              <p className="text-xs text-muted-foreground">
                Detected {formatDate(clash.detectedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClashSeverityBadge severity={clash.severity} />
            <ClashStatusBadge status={clash.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Promotions Involved */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex-1 p-2 bg-muted rounded">
            <Link
              to={`/promotions/${clash.promotionA.id}`}
              className="font-medium hover:text-primary"
            >
              {clash.promotionA.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {clash.promotionA.code}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 p-2 bg-muted rounded">
            <Link
              to={`/promotions/${clash.promotionB.id}`}
              className="font-medium hover:text-primary"
            >
              {clash.promotionB.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {clash.promotionB.code}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">{clash.description}</p>

        {/* Overlap Info */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Overlap Period</p>
              <p className="font-medium">
                {formatDate(clash.overlapStart)} - {formatDate(clash.overlapEnd)}
              </p>
            </div>
          </div>
          {clash.affectedCustomers?.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Customers</p>
                <p className="font-medium">{clash.affectedCustomers.length}</p>
              </div>
            </div>
          )}
          {clash.affectedProducts?.length > 0 && (
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Products</p>
                <p className="font-medium">{clash.affectedProducts.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Potential Impact */}
        {clash.potentialImpact > 0 && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800/30">
            <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm flex items-center gap-1">
              Potential Impact:{' '}
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                <CurrencyDisplay amount={clash.potentialImpact} size="sm" />
              </span>
            </span>
          </div>
        )}

        {/* Actions */}
        {!isResolved && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button size="sm" asChild>
              <Link to={`/planning/clashes/${clash.id}`}>View Details</Link>
            </Button>
            {onResolve && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onResolve(clash.id)}
              >
                Resolve
              </Button>
            )}
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismiss(clash.id)}
              >
                Dismiss
              </Button>
            )}
          </div>
        )}

        {/* Resolution Info */}
        {isResolved && clash.resolution && (
          <div className="pt-2 border-t text-sm">
            <p className="text-muted-foreground">
              Resolved: {clash.resolution.replace('_', ' ')}
              {clash.resolvedBy && ` by ${clash.resolvedBy.name}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
