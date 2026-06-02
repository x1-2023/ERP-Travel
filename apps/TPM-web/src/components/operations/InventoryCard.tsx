/**
 * Inventory Card Component
 * Displays inventory summary in a card format
 */

import { Package, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StockAlertBadge, ExpiryBadge } from './StockAlertBadge';
import { formatNumber } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { StockStatus } from '@/types/operations';

interface InventoryCardProps {
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  productSku?: string;
  quantity: number;
  value: number;
  avgMonthlySales?: number;
  stockCoverage?: number;
  status?: StockStatus;
  expiryDate?: string;
  onClick?: () => void;
}

export function InventoryCard({
  customerName,
  productName,
  productSku,
  quantity,
  value,
  avgMonthlySales,
  stockCoverage,
  status = 'OK',
  expiryDate,
  onClick,
}: InventoryCardProps) {
  // Calculate coverage progress (max 6 months = 100%)
  const coverageProgress = stockCoverage ? Math.min((stockCoverage / 6) * 100, 100) : 0;

  return (
    <Card
      className={`transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base truncate">{productName}</CardTitle>
            <p className="text-sm text-muted-foreground truncate">
              {productSku} | {customerName}
            </p>
          </div>
          <StockAlertBadge status={status} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Quantity and Value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Quantity</p>
            <p className="text-lg font-bold">{formatNumber(quantity)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Value</p>
            <p className="text-lg font-bold"><CurrencyDisplay amount={value} size="sm" /></p>
          </div>
        </div>

        {/* Stock Coverage */}
        {stockCoverage !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Stock Coverage</span>
              <span className="font-medium">{stockCoverage.toFixed(1)} months</span>
            </div>
            <Progress value={coverageProgress} className="h-2" />
          </div>
        )}

        {/* Monthly Sales */}
        {avgMonthlySales !== undefined && avgMonthlySales > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Avg Monthly Sales</span>
            <span className="font-medium">{formatNumber(avgMonthlySales)} units</span>
          </div>
        )}

        {/* Expiry Date */}
        {expiryDate && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Expires: {new Date(expiryDate).toLocaleDateString()}</span>
            </div>
            <ExpiryBadge expiryDate={expiryDate} size="sm" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface InventorySummaryCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function InventorySummaryCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}: InventorySummaryCardProps) {
  const variantStyles = {
    default: '',
    success: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800/30 dark:bg-emerald-950/30',
    warning: 'border-amber-200 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-950/30',
    danger: 'border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-950/30',
  };

  const iconColors = {
    default: 'text-muted-foreground',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  return (
    <Card className={variantStyles[variant]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={iconColors[variant]}>
          {icon || <Package className="h-4 w-4" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div className="flex items-center mt-1">
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400 mr-1" />
            ) : trend < 0 ? (
              <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400 mr-1" />
            ) : null}
            <span
              className={`text-xs ${
                trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : trend < 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
              }`}
            >
              {trend > 0 ? '+' : ''}{trend}% vs last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
