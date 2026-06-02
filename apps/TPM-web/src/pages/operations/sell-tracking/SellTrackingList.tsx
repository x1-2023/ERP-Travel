/**
 * Sell Tracking List Page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Upload, Download, TrendingUp, TrendingDown, BarChart3, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useSellTrackingList, useSellTrackingSummary } from '@/hooks/operations';
import { formatNumber, formatPercent } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { SellTrackingParams } from '@/types/operations';

export default function SellTrackingList() {
  const [filters, setFilters] = useState<SellTrackingParams>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useSellTrackingList(filters);
  const { data: summaryData } = useSellTrackingSummary();

  const handleFilterChange = (key: keyof SellTrackingParams, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const getSellThroughBadge = (rate: number) => {
    if (rate >= 80) {
      return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">Excellent</Badge>;
    } else if (rate >= 60) {
      return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20">Good</Badge>;
    } else if (rate >= 40) {
      return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20">Average</Badge>;
    } else {
      return <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sell Tracking</h1>
          <p className="text-muted-foreground">Track sell-in, sell-out, and inventory at customer locations</p>
        </div>
        <div className="flex gap-2">
          <Link to="/operations/sell-tracking/sell-in">
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Sell-In
            </Button>
          </Link>
          <Link to="/operations/sell-tracking/sell-out">
            <Button variant="outline">
              <TrendingDown className="mr-2 h-4 w-4" />
              Sell-Out
            </Button>
          </Link>
          <Link to="/operations/sell-tracking/import">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </Link>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link to="/operations/sell-tracking/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sell-In</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(summaryData?.summary?.totalSellIn || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Units shipped to customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sell-Out</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(summaryData?.summary?.totalSellOut || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Units sold by customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(summaryData?.summary?.totalStock || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Units at customer locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sell-Through Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent(summaryData?.summary?.sellThroughRate || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search by period..."
              value={filters.period || ''}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="w-48"
            />
            <Input
              type="month"
              placeholder="From period"
              value={filters.periodFrom || ''}
              onChange={(e) => handleFilterChange('periodFrom', e.target.value)}
              className="w-40"
            />
            <Input
              type="month"
              placeholder="To period"
              value={filters.periodTo || ''}
              onChange={(e) => handleFilterChange('periodTo', e.target.value)}
              className="w-40"
            />
            <Select
              value={String(filters.limit || 20)}
              onValueChange={(value) => handleFilterChange('limit', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Sell-In</TableHead>
                  <TableHead className="text-right">Sell-Out</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Sell-Through</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No sell tracking records found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.period}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.customer?.name}</div>
                          <div className="text-xs text-muted-foreground">{record.customer?.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.product?.name}</div>
                          <div className="text-xs text-muted-foreground">{record.product?.code}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>{formatNumber(record.sellInQty)}</div>
                        <div className="text-xs text-muted-foreground">
                          <CurrencyDisplay amount={record.sellInValue} size="sm" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>{formatNumber(record.sellOutQty)}</div>
                        <div className="text-xs text-muted-foreground">
                          <CurrencyDisplay amount={record.sellOutValue} size="sm" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>{formatNumber(record.stockQty)}</div>
                        <div className="text-xs text-muted-foreground">
                          <CurrencyDisplay amount={record.stockValue} size="sm" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPercent(record.sellThroughRate)}
                      </TableCell>
                      <TableCell>{getSellThroughBadge(record.sellThroughRate)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total} records
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.pagination.page <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.pagination.page >= data.pagination.totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
