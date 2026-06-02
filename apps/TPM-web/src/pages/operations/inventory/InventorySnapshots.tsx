/**
 * Inventory Snapshots Page
 * Historical inventory snapshot viewer
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Calendar, BarChart3 } from 'lucide-react';
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
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SnapshotImportDialog } from '@/components/operations/SnapshotImportDialog';
import { StockValueChart } from '@/components/operations/StockDistributionChart';
import { formatNumber } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function InventorySnapshots() {
  const [filters, setFilters] = useState({
    customerId: '',
    productId: '',
    dateFrom: '',
    dateTo: '',
    groupBy: '' as '' | 'date' | 'customer' | 'product',
  });
  const [showImport, setShowImport] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-snapshots', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.customerId) params.set('customerId', filters.customerId);
      if (filters.productId) params.set('productId', filters.productId);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      if (filters.groupBy) params.set('groupBy', filters.groupBy);
      params.set('limit', '100');

      const res = await api.get(`/operations/inventory/snapshots?${params.toString()}`);
      return res.data;
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/operations/inventory">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Inventory Snapshots</h1>
            <p className="text-muted-foreground">
              View historical inventory data over time
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Snapshots</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data?.timeline?.length || 0} unique dates
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data?.totals?.quantity || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={data?.totals?.value || 0} size="md" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {data?.timeline?.length > 0 ? (
                <>
                  {data.timeline[0]} - {data.timeline[data.timeline.length - 1]}
                </>
              ) : (
                'No data'
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Input
              type="date"
              placeholder="From date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-40"
            />
            <Input
              type="date"
              placeholder="To date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-40"
            />
            <Select
              value={filters.groupBy || 'none'}
              onValueChange={(v) => handleFilterChange('groupBy', v === 'none' ? '' : v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Group by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No grouping</SelectItem>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="customer">By Customer</SelectItem>
                <SelectItem value="product">By Product</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Chart - Only show when grouped by date */}
          {filters.groupBy === 'date' && data?.groupedData && (
            <StockValueChart
              data={data.groupedData}
              title="Inventory Value Over Time"
            />
          )}

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {filters.groupBy
                  ? `Snapshots by ${filters.groupBy.charAt(0).toUpperCase() + filters.groupBy.slice(1)}`
                  : 'Snapshot Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filters.groupBy && data?.groupedData ? (
                // Grouped view
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {filters.groupBy === 'date'
                          ? 'Date'
                          : filters.groupBy === 'customer'
                          ? 'Customer'
                          : 'Product'}
                      </TableHead>
                      <TableHead className="text-right">Total Quantity</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                      <TableHead className="text-right">Snapshots</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.groupedData.map((row: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {row.date || row.customerName || row.productName}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(row.totalQuantity)}
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={row.totalValue} size="sm" />
                        </TableCell>
                        <TableCell className="text-right">{row.snapshotCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                // Detail view
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data?.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No snapshots found
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.data?.map((snapshot: any) => (
                        <TableRow key={snapshot.id}>
                          <TableCell>{snapshot.snapshotDate}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{snapshot.customer?.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {snapshot.customer?.code}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{snapshot.product?.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {snapshot.product?.sku}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{snapshot.location || '-'}</TableCell>
                          <TableCell className="text-right">
                            {formatNumber(snapshot.quantity)}
                          </TableCell>
                          <TableCell className="text-right">
                            <CurrencyDisplay amount={snapshot.value} size="sm" />
                          </TableCell>
                          <TableCell>{snapshot.expiryDate || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Import Dialog */}
      <SnapshotImportDialog open={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
}
