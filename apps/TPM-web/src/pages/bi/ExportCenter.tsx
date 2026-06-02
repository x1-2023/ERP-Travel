/**
 * Export Center Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useExport } from '@/hooks/bi';
import { useToast } from '@/hooks/useToast';
import type { ExportRequest } from '@/types/advanced';

const EXPORT_TYPES: { value: ExportRequest['type']; label: string; description: string }[] = [
  {
    value: 'PROMOTIONS',
    label: 'Promotions',
    description: 'Export all promotions with status, budget, and metrics',
  },
  {
    value: 'CLAIMS',
    label: 'Claims',
    description: 'Export claims with approval status and amounts',
  },
  {
    value: 'CUSTOMERS',
    label: 'Customers',
    description: 'Export customer data and performance metrics',
  },
  {
    value: 'PRODUCTS',
    label: 'Products',
    description: 'Export product catalog and promotion history',
  },
];

const COLUMN_OPTIONS: Record<ExportRequest['type'], { value: string; label: string }[]> = {
  PROMOTIONS: [
    { value: 'code', label: 'Code' },
    { value: 'name', label: 'Name' },
    { value: 'type', label: 'Type' },
    { value: 'status', label: 'Status' },
    { value: 'budget', label: 'Budget' },
    { value: 'spentAmount', label: 'Spent Amount' },
    { value: 'startDate', label: 'Start Date' },
    { value: 'endDate', label: 'End Date' },
    { value: 'customerName', label: 'Customer' },
  ],
  CLAIMS: [
    { value: 'code', label: 'Code' },
    { value: 'promotionCode', label: 'Promotion' },
    { value: 'customerName', label: 'Customer' },
    { value: 'amount', label: 'Amount' },
    { value: 'status', label: 'Status' },
    { value: 'submittedAt', label: 'Submitted At' },
    { value: 'approvedAt', label: 'Approved At' },
  ],
  CUSTOMERS: [
    { value: 'code', label: 'Code' },
    { value: 'name', label: 'Name' },
    { value: 'type', label: 'Type' },
    { value: 'region', label: 'Region' },
    { value: 'totalPromotions', label: 'Total Promotions' },
    { value: 'totalClaims', label: 'Total Claims' },
  ],
  PRODUCTS: [
    { value: 'sku', label: 'SKU' },
    { value: 'name', label: 'Name' },
    { value: 'category', label: 'Category' },
    { value: 'brand', label: 'Brand' },
    { value: 'price', label: 'Price' },
  ],
  REPORT: [],
};

export default function ExportCenter() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [exportType, setExportType] = useState<ExportRequest['type']>('PROMOTIONS');
  const [format, setFormat] = useState<'EXCEL' | 'CSV' | 'PDF'>('EXCEL');
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(today.toISOString().split('T')[0]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    COLUMN_OPTIONS.PROMOTIONS.map((c) => c.value)
  );

  const exportMutation = useExport();

  const handleTypeChange = (type: ExportRequest['type']) => {
    setExportType(type);
    setSelectedColumns(COLUMN_OPTIONS[type].map((c) => c.value));
  };

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
    );
  };

  const handleExport = async () => {
    try {
      const result = await exportMutation.mutateAsync({
        type: exportType,
        format,
        columns: selectedColumns,
        dateRange: { from: dateFrom, to: dateTo },
      });

      if (result.url) {
        const link = document.createElement('a');
        link.href = result.url;
        link.download = result.filename || `export.${format.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (result.url.startsWith('blob:')) {
          URL.revokeObjectURL(result.url);
        }

        toast({
          title: 'Export Successful',
          description: `Data exported as ${format}`,
        });
      }
    } catch {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  const columns = COLUMN_OPTIONS[exportType] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/bi')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Export Center</h1>
            <p className="text-muted-foreground">
              Download data in various formats
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Export Type Selection */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Select Data to Export</CardTitle>
            <CardDescription>Choose what data you want to export</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {EXPORT_TYPES.map((type) => (
                <div
                  key={type.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    exportType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground'
                  }`}
                  onClick={() => handleTypeChange(type.value)}
                >
                  <p className="font-medium">{type.label}</p>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXCEL">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="CSV">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      CSV (.csv)
                    </div>
                  </SelectItem>
                  <SelectItem value="PDF">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF (.pdf)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleExport}
              disabled={exportMutation.isPending || selectedColumns.length === 0}
            >
              {exportMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export {exportType}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Column Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Columns</CardTitle>
          <CardDescription>
            Choose which columns to include in the export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            {columns.map((column) => (
              <div key={column.value} className="flex items-center space-x-2">
                <Checkbox
                  id={column.value}
                  checked={selectedColumns.includes(column.value)}
                  onCheckedChange={() => handleColumnToggle(column.value)}
                />
                <label
                  htmlFor={column.value}
                  className="text-sm cursor-pointer"
                >
                  {column.label}
                </label>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedColumns(columns.map((c) => c.value))}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedColumns([])}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
