/**
 * Operations Stats Component
 * Shared statistics cards for operations modules
 */

import {
  Package,
  Truck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  DollarSign,
  Calendar,
  Target,
} from 'lucide-react';
import { formatNumber, formatPercent } from '@/lib/utils';
import { formatCurrencyCompact } from '@/components/ui/currency-display';
import { StatCard, StatCardGroup } from '@/components/ui/stat-card';

export { StatCard } from '@/components/ui/stat-card';

interface DeliveryStatsProps {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  onTimeRate: number;
}

export function DeliveryStats({
  total,
  pending,
  inTransit,
  delivered,
  onTimeRate,
}: DeliveryStatsProps) {
  return (
    <StatCardGroup cols={5}>
      <StatCard
        title="Total Orders"
        value={formatNumber(total)}
        icon={Package}
        color="primary"
      />
      <StatCard
        title="Pending"
        value={formatNumber(pending)}
        icon={Clock}
        color="warning"
      />
      <StatCard
        title="In Transit"
        value={formatNumber(inTransit)}
        icon={Truck}
        color="info"
      />
      <StatCard
        title="Delivered"
        value={formatNumber(delivered)}
        icon={CheckCircle}
        color="success"
      />
      <StatCard
        title="On-Time Rate"
        value={formatPercent(onTimeRate)}
        icon={Target}
        color={onTimeRate >= 90 ? 'success' : onTimeRate >= 70 ? 'warning' : 'danger'}
      />
    </StatCardGroup>
  );
}

interface SellTrackingStatsProps {
  totalSellIn: number;
  totalSellOut: number;
  totalStock: number;
  sellThroughRate: number;
  avgDaysOfStock?: number;
}

export function SellTrackingStats({
  totalSellIn,
  totalSellOut,
  totalStock,
  sellThroughRate,
  avgDaysOfStock,
}: SellTrackingStatsProps) {
  return (
    <StatCardGroup cols={5}>
      <StatCard
        title="Total Sell-In"
        value={formatNumber(totalSellIn)}
        subtitle="Units shipped"
        icon={TrendingUp}
        color="primary"
      />
      <StatCard
        title="Total Sell-Out"
        value={formatNumber(totalSellOut)}
        subtitle="Units sold"
        icon={TrendingDown}
        color="info"
      />
      <StatCard
        title="Current Stock"
        value={formatNumber(totalStock)}
        subtitle="At customer locations"
        icon={Package}
        color="purple"
      />
      <StatCard
        title="Sell-Through"
        value={formatPercent(sellThroughRate)}
        icon={BarChart3}
        color={sellThroughRate >= 70 ? 'success' : sellThroughRate >= 50 ? 'warning' : 'danger'}
      />
      {avgDaysOfStock !== undefined && (
        <StatCard
          title="Days of Stock"
          value={avgDaysOfStock}
          subtitle="Average coverage"
          icon={Calendar}
          color={avgDaysOfStock > 60 ? 'warning' : avgDaysOfStock < 14 ? 'danger' : 'default'}
        />
      )}
    </StatCardGroup>
  );
}

interface InventoryStatsProps {
  totalValue: number;
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  nearExpiryItems: number;
  avgStockCoverage?: number;
}

export function InventoryStats({
  totalValue,
  totalItems,
  lowStockItems,
  outOfStockItems,
  nearExpiryItems,
  avgStockCoverage,
}: InventoryStatsProps) {
  return (
    <StatCardGroup cols={5}>
      <StatCard
        title="Total Value"
        value={formatCurrencyCompact(totalValue, 'VND')}
        icon={DollarSign}
        color="success"
      />
      <StatCard
        title="Total Items"
        value={formatNumber(totalItems)}
        icon={Package}
        color="primary"
      />
      <StatCard
        title="Low Stock"
        value={formatNumber(lowStockItems)}
        icon={AlertTriangle}
        color={lowStockItems > 0 ? 'warning' : 'default'}
      />
      <StatCard
        title="Out of Stock"
        value={formatNumber(outOfStockItems)}
        icon={AlertTriangle}
        color={outOfStockItems > 0 ? 'danger' : 'default'}
      />
      <StatCard
        title="Near Expiry"
        value={formatNumber(nearExpiryItems)}
        icon={Clock}
        color={nearExpiryItems > 0 ? 'warning' : 'default'}
      />
      {avgStockCoverage !== undefined && (
        <StatCard
          title="Avg Coverage"
          value={`${avgStockCoverage.toFixed(1)} mo`}
          icon={Calendar}
          color={avgStockCoverage < 1 ? 'danger' : avgStockCoverage > 6 ? 'warning' : 'default'}
        />
      )}
    </StatCardGroup>
  );
}
