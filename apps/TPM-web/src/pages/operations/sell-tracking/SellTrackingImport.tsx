/**
 * Sell Tracking Import Page
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { useImportSellTracking } from '@/hooks/operations';

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

interface ImportResult {
  success: boolean;
  row: number;
  error?: string;
}

export default function SellTrackingImport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const importMutation = useImportSellTracking();

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    summary?: {
      total: number;
      created: number;
      updated: number;
      failed: number;
      successRate: number;
    };
    results: ImportResult[];
  } | null>(null);

  const parseCSV = useCallback((text: string): ParsedRow[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      rows.push({
        customerCode: row['customercode'] || row['customer_code'] || row['customer'],
        productSku: row['productsku'] || row['product_sku'] || row['sku'] || row['product'],
        period: row['period'],
        sellInQty: parseInt(row['sellinqty'] || row['sell_in_qty'] || '0') || 0,
        sellInValue: parseFloat(row['sellinvalue'] || row['sell_in_value'] || '0') || 0,
        sellOutQty: parseInt(row['selloutqty'] || row['sell_out_qty'] || '0') || 0,
        sellOutValue: parseFloat(row['selloutvalue'] || row['sell_out_value'] || '0') || 0,
        stockQty: parseInt(row['stockqty'] || row['stock_qty'] || '0') || 0,
        stockValue: parseFloat(row['stockvalue'] || row['stock_value'] || '0') || 0,
      });
    }

    return rows;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResults(null);

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
        description: 'Please upload a file with data to import',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    try {
      const result = await importMutation.mutateAsync({
        data: parsedData,
        mode: 'upsert',
      });

      setImportResults(result);

      if (result.summary.failed === 0) {
        toast({
          title: 'Import successful',
          description: `${result.summary.created} records created, ${result.summary.updated} updated`,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Import Sell Tracking Data</h1>
          <p className="text-muted-foreground">Upload a CSV file to bulk import records</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Upload a CSV file with sell tracking data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">CSV files only</p>
              </label>
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileText className="h-5 w-5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {parsedData.length} rows parsed
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!file || parsedData.length === 0 || importing}
              className="w-full"
            >
              {importing ? 'Importing...' : 'Start Import'}
            </Button>
          </CardContent>
        </Card>

        {/* Format Guide */}
        <Card>
          <CardHeader>
            <CardTitle>CSV Format</CardTitle>
            <CardDescription>Required columns for import</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Example</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-sm">customerCode</TableCell>
                  <TableCell><Badge>Required</Badge></TableCell>
                  <TableCell>CUST001</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">productSku</TableCell>
                  <TableCell><Badge>Required</Badge></TableCell>
                  <TableCell>SKU-12345</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">period</TableCell>
                  <TableCell><Badge>Required</Badge></TableCell>
                  <TableCell>2024-01</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">sellInQty</TableCell>
                  <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                  <TableCell>100</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">sellInValue</TableCell>
                  <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                  <TableCell>5000.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">sellOutQty</TableCell>
                  <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                  <TableCell>80</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Import Results */}
      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {importResults.summary && (
              <>
                <div className="flex items-center gap-2">
                  <Progress value={importResults.summary.successRate} className="flex-1" />
                  <span className="text-sm font-medium">
                    {importResults.summary.successRate}% success
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{importResults.summary.total}</div>
                    <div className="text-xs text-muted-foreground">Total Rows</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {importResults.summary.created}
                    </div>
                    <div className="text-xs text-muted-foreground">Created</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {importResults.summary.updated}
                    </div>
                    <div className="text-xs text-muted-foreground">Updated</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {importResults.summary.failed}
                    </div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                </div>
              </>
            )}

            {importResults.results.some((r) => !r.success) && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Errors</h4>
                <div className="max-h-48 overflow-auto space-y-2">
                  {importResults.results
                    .filter((r) => !r.success)
                    .map((result, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 bg-red-50 rounded text-sm"
                      >
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span>Row {result.row}: {result.error}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {parsedData.length > 0 && !importResults && (
        <Card>
          <CardHeader>
            <CardTitle>Preview (First 10 rows)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Sell-In Qty</TableHead>
                    <TableHead className="text-right">Sell-Out Qty</TableHead>
                    <TableHead className="text-right">Stock Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 10).map((row, i) => (
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
            {parsedData.length > 10 && (
              <p className="mt-2 text-sm text-muted-foreground text-center">
                ... and {parsedData.length - 10} more rows
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
