/**
 * Snapshot Import Dialog Component
 * Dialog for bulk importing inventory snapshots
 */

import { useState, useCallback } from 'react';
import { Upload, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useImportInventory } from '@/hooks/operations';

interface SnapshotImportDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ParsedRow {
  customerCode: string;
  productSku: string;
  snapshotDate: string;
  quantity: number;
  value: number;
  location?: string;
  batchNumber?: string;
  expiryDate?: string;
}

export function SnapshotImportDialog({ open, onClose }: SnapshotImportDialogProps) {
  const { toast } = useToast();
  const importMutation = useImportInventory();

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [snapshotDate, setSnapshotDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [mode, setMode] = useState<'create' | 'replace'>('create');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    total: number;
    created: number;
    updated: number;
    failed: number;
  } | null>(null);

  const parseCSV = useCallback((text: string, defaultDate: string): ParsedRow[] => {
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
        snapshotDate: row['snapshotdate'] || row['date'] || defaultDate,
        quantity: parseInt(row['quantity'] || row['qty'] || '0') || 0,
        value: parseFloat(row['value'] || '0') || 0,
        location: row['location'] || undefined,
        batchNumber: row['batchnumber'] || row['batch'] || undefined,
        expiryDate: row['expirydate'] || row['expiry'] || undefined,
      });
    }

    return rows.filter((r) => r.customerCode && r.productSku);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text, snapshotDate);
      setParsedData(parsed);
    };
    reader.readAsText(selectedFile);
  };

  const handleDateChange = (date: string) => {
    setSnapshotDate(date);
    // Re-parse with new date if file exists
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const parsed = parseCSV(text, date);
        setParsedData(parsed);
      };
      reader.readAsText(file);
    }
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
          description: `${result.summary.created} snapshots created`,
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
          <DialogTitle>Import Inventory Snapshots</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import inventory snapshot data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Snapshot Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Snapshot Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={snapshotDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Default date for rows without date column
              </p>
            </div>

            <div className="space-y-2">
              <Label>Import Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as 'create' | 'replace')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">Create new snapshots</SelectItem>
                  <SelectItem value="replace">Replace existing (same date)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>CSV File</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="snapshot-import-file"
              />
              <label htmlFor="snapshot-import-file" className="cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm">
                  {file ? file.name : 'Click to upload CSV file'}
                </p>
              </label>
            </div>
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
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.customerCode}</TableCell>
                        <TableCell>{row.productSku}</TableCell>
                        <TableCell>{row.snapshotDate}</TableCell>
                        <TableCell className="text-right">{row.quantity}</TableCell>
                        <TableCell className="text-right">{row.value}</TableCell>
                        <TableCell>{row.location || '-'}</TableCell>
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
                  value={((importResult.created) / importResult.total) * 100}
                />
                <span className="text-sm font-medium">
                  {Math.round((importResult.created / importResult.total) * 100)}%
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
              {importing ? 'Importing...' : 'Import Snapshots'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
