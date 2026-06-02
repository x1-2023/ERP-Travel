/**
 * Sell Import Dialog Component
 * Dialog for importing sell-in/sell-out data from CSV
 */

import { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/useToast';
import { useImportSellTracking } from '@/hooks/operations';

interface SellImportDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ParsedRow {
  customerCode: string;
  productSku: string;
  period: string;
  sellInQty: number;
  sellInValue: number;
  sellOutQty: number;
  sellOutValue: number;
  stockQty: number;
  stockValue: number;
}

export function SellImportDialog({ open, onClose }: SellImportDialogProps) {
  const { toast } = useToast();
  const importMutation = useImportSellTracking();

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [mode, setMode] = useState<'create' | 'upsert'>('upsert');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    total: number;
    created: number;
    updated: number;
    failed: number;
  } | null>(null);

  const parseCSV = useCallback((text: string): ParsedRow[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[\s_-]/g, ''));
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      rows.push({
        customerCode: row['customercode'] || row['customer'] || '',
        productSku: row['productsku'] || row['sku'] || row['product'] || '',
        period: row['period'] || '',
        sellInQty: parseInt(row['sellinqty'] || row['sellqty'] || '0') || 0,
        sellInValue: parseFloat(row['sellinvalue'] || '0') || 0,
        sellOutQty: parseInt(row['selloutqty'] || '0') || 0,
        sellOutValue: parseFloat(row['selloutvalue'] || '0') || 0,
        stockQty: parseInt(row['stockqty'] || row['stock'] || '0') || 0,
        stockValue: parseFloat(row['stockvalue'] || '0') || 0,
      });
    }

    return rows.filter((r) => r.customerCode && r.productSku && r.period);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setParsedData(parsed);
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast({
        title: 'No data',
        description: 'Please upload a file with valid data',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    try {
      const result = await importMutation.mutateAsync({
        data: parsedData,
        mode,
      });

      setImportResult(result.summary);

      if (result.summary.failed === 0) {
        toast({
          title: 'Import successful',
          description: `${result.summary.created} created, ${result.summary.updated} updated`,
        });
      } else {
        toast({
          title: 'Import completed with errors',
          description: `${result.summary.failed} records failed`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'An error occurred during import',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setImportResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Sell Tracking Data</DialogTitle>
          <DialogDescription>
            Upload a CSV file with sell-in, sell-out, and stock data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>CSV File</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="sell-import-file"
              />
              <label htmlFor="sell-import-file" className="cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm">
                  {file ? file.name : 'Click to upload CSV file'}
                </p>
              </label>
            </div>
          </div>

          {/* Import Mode */}
          <div className="space-y-2">
            <Label>Import Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as 'create' | 'upsert')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upsert">Update existing or create new</SelectItem>
                <SelectItem value="create">Create new only (skip existing)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {parsedData.length > 0 && !importResult && (
            <div className="space-y-2">
              <Label>Preview ({parsedData.length} rows)</Label>
              <div className="border rounded-lg max-h-48 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Sell-In</TableHead>
                      <TableHead className="text-right">Sell-Out</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.customerCode}</TableCell>
                        <TableCell>{row.productSku}</TableCell>
                        <TableCell>{row.period}</TableCell>
                        <TableCell className="text-right">{row.sellInQty}</TableCell>
                        <TableCell className="text-right">{row.sellOutQty}</TableCell>
                        <TableCell className="text-right">{row.stockQty}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {parsedData.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{parsedData.length - 5} more rows
                </p>
              )}
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Progress
                  value={((importResult.created + importResult.updated) / importResult.total) * 100}
                />
                <span className="text-sm font-medium">
                  {Math.round(
                    ((importResult.created + importResult.updated) / importResult.total) * 100
                  )}
                  %
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{importResult.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{importResult.created}</div>
                  <div className="text-xs text-muted-foreground">Created</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{importResult.updated}</div>
                  <div className="text-xs text-muted-foreground">Updated</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {!importResult && (
            <Button onClick={handleImport} disabled={parsedData.length === 0 || importing}>
              {importing ? 'Importing...' : 'Import Data'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
