/**
 * Sell Comparison Table Component
 * Displays detailed sell-in/sell-out comparison data
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatNumber, formatPercent } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';

interface ComparisonRow {
  groupKey: string;
  groupName: string;
  sellIn: { qty: number; value: number };
  sellOut: { qty: number; value: number };
  stock: { qty: number; value: number };
  sellThroughRate: number;
  growthPercent?: number;
}

interface SellComparisonTableProps {
  data: ComparisonRow[];
  groupBy: 'period' | 'customer' | 'product' | 'category';
  onRowClick?: (row: ComparisonRow) => void;
}

export function SellComparisonTable({
  data,
  groupBy,
  onRowClick,
}: SellComparisonTableProps) {
  const getGroupLabel = () => {
    switch (groupBy) {
      case 'customer':
        return 'Customer';
      case 'product':
        return 'Product';
      case 'category':
        return 'Category';
      default:
        return 'Period';
    }
  };

  const getSellThroughBadge = (rate: number) => {
    if (rate >= 80) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-700">
          {formatPercent(rate)}
        </Badge>
      );
    } else if (rate >= 60) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-700">
          {formatPercent(rate)}
        </Badge>
      );
    } else if (rate >= 40) {
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-700">
          {formatPercent(rate)}
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="bg-red-100 text-red-700">
          {formatPercent(rate)}
        </Badge>
      );
    }
  };

  const getGrowthIndicator = (growth?: number) => {
    if (growth === undefined || growth === null) return null;

    if (growth > 0) {
      return (
        <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{growth.toFixed(1)}%
        </span>
      );
    } else if (growth < 0) {
      return (
        <span className="flex items-center text-red-600 dark:text-red-400 text-sm">
          <TrendingDown className="h-3 w-3 mr-1" />
          {growth.toFixed(1)}%
        </span>
      );
    } else {
      return (
        <span className="flex items-center text-gray-500 text-sm">
          <Minus className="h-3 w-3 mr-1" />
          0%
        </span>
      );
    }
  };

  // Calculate totals
  const totals = data.reduce(
    (acc, row) => ({
      sellInQty: acc.sellInQty + row.sellIn.qty,
      sellInValue: acc.sellInValue + row.sellIn.value,
      sellOutQty: acc.sellOutQty + row.sellOut.qty,
      sellOutValue: acc.sellOutValue + row.sellOut.value,
      stockQty: acc.stockQty + row.stock.qty,
      stockValue: acc.stockValue + row.stock.value,
    }),
    { sellInQty: 0, sellInValue: 0, sellOutQty: 0, sellOutValue: 0, stockQty: 0, stockValue: 0 }
  );

  const avgSellThrough =
    totals.sellInQty > 0 ? (totals.sellOutQty / totals.sellInQty) * 100 : 0;

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{getGroupLabel()}</TableHead>
            <TableHead className="text-right">Sell-In Qty</TableHead>
            <TableHead className="text-right">Sell-In Value</TableHead>
            <TableHead className="text-right">Sell-Out Qty</TableHead>
            <TableHead className="text-right">Sell-Out Value</TableHead>
            <TableHead className="text-right">Stock Qty</TableHead>
            <TableHead className="text-center">Sell-Through</TableHead>
            {groupBy === 'period' && <TableHead className="text-center">Growth</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={groupBy === 'period' ? 8 : 7}
                className="text-center py-8 text-muted-foreground"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            <>
              {data.map((row) => (
                <TableRow
                  key={row.groupKey}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                  onClick={() => onRowClick?.(row)}
                >
                  <TableCell className="font-medium">{row.groupName}</TableCell>
                  <TableCell className="text-right">{formatNumber(row.sellIn.qty)}</TableCell>
                  <TableCell className="text-right"><CurrencyDisplay amount={row.sellIn.value} size="sm" /></TableCell>
                  <TableCell className="text-right">{formatNumber(row.sellOut.qty)}</TableCell>
                  <TableCell className="text-right"><CurrencyDisplay amount={row.sellOut.value} size="sm" /></TableCell>
                  <TableCell className="text-right">{formatNumber(row.stock.qty)}</TableCell>
                  <TableCell className="text-center">
                    {getSellThroughBadge(row.sellThroughRate)}
                  </TableCell>
                  {groupBy === 'period' && (
                    <TableCell className="text-center">
                      {getGrowthIndicator(row.growthPercent)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{formatNumber(totals.sellInQty)}</TableCell>
                <TableCell className="text-right"><CurrencyDisplay amount={totals.sellInValue} size="sm" /></TableCell>
                <TableCell className="text-right">{formatNumber(totals.sellOutQty)}</TableCell>
                <TableCell className="text-right"><CurrencyDisplay amount={totals.sellOutValue} size="sm" /></TableCell>
                <TableCell className="text-right">{formatNumber(totals.stockQty)}</TableCell>
                <TableCell className="text-center">
                  {getSellThroughBadge(avgSellThrough)}
                </TableCell>
                {groupBy === 'period' && <TableCell />}
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
