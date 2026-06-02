/**
 * Inventory List Page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Upload,
  Download,
  Package,
  AlertTriangle,
  TrendingDown,
  Calendar,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useInventoryList, useInventorySummary } from '@/hooks/operations';
import { formatNumber, formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { InventoryParams } from '@/types/operations';

export default function InventoryList() {
  const [filters, setFilters] = useState<InventoryParams>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useInventoryList(filters);
  const { data: summaryData } = useInventorySummary();

  const handleFilterChange = (key: keyof InventoryParams, value: string | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">
            Monitor inventory levels at customer locations
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/operations/inventory/snapshots">
            <Button variant="outline">
              <History className="mr-2 h-4 w-4" />
              View History
            </Button>
          </Link>
          <Link to="/operations/inventory/import">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </Link>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link to="/operations/inventory/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Snapshot
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={summaryData?.summary?.totalValue || 0} size="md" />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(summaryData?.summary?.totalItems || 0)} total items
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatNumber(summaryData?.summary?.lowStockItems || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatNumber(summaryData?.summary?.outOfStockItems || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Near Expiry</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatNumber(summaryData?.summary?.nearExpiryItems || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Expiring within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OK">OK</SelectItem>
                <SelectItem value="LOW">Low Stock</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                <SelectItem value="OVERSTOCK">Overstock</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="lowStock"
                checked={!!filters.lowStock}
                onChange={(e) => handleFilterChange('lowStock', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="lowStock" className="text-sm">
                Low Stock Only
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="nearExpiry"
                checked={!!filters.nearExpiry}
                onChange={(e) => handleFilterChange('nearExpiry', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="nearExpiry" className="text-sm">
                Near Expiry Only
              </label>
            </div>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No inventory records found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.snapshotDate)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.customer?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {record.customer?.code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.product?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {record.product?.code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{record.location || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(record.quantity)}
                      </TableCell>
                      <TableCell className="text-right">
                        <CurrencyDisplay amount={record.value} size="sm" />
                      </TableCell>
                      <TableCell>
                        {record.expiryDate ? (
                          <span
                            className={
                              new Date(record.expiryDate) < new Date()
                                ? 'text-red-600 dark:text-red-400'
                                : new Date(record.expiryDate) <
                                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                ? 'text-orange-600'
                                : ''
                            }
                          >
                            {formatDate(record.expiryDate)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Link to={`/operations/inventory/${record.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
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
            Showing {(data.pagination.page - 1) * data.pagination.limit + 1} to{' '}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total} records
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.pagination.page <= 1}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.pagination.page >= data.pagination.totalPages}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
