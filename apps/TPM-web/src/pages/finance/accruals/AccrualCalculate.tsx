/**
 * Accrual Calculate Page
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Eye, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { usePreviewAccruals, useCalculateAccruals } from '@/hooks/useAccruals';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { useToast } from '@/hooks/useToast';

type CalculationMethod = 'PERCENTAGE' | 'PRO_RATA';

interface PreviewEntry {
  promotionId: string;
  promotion: {
    id: string;
    code: string;
    name: string;
    budget: number;
    spentAmount: number;
  };
  period: string;
  amount: number;
  status: string;
}

// Generate period options (current month + next 3 months)
function generatePeriodOptions(): { value: string; label: string }[] {
  const periods: { value: string; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i <= 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const value = `${year}-${month}`;
    const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    periods.push({ value, label });
  }

  return periods;
}

// Get current period
function getCurrentPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export default function AccrualCalculatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [method, setMethod] = useState<CalculationMethod>('PERCENTAGE');
  const [preview, setPreview] = useState<PreviewEntry[]>([]);
  const [hasPreview, setHasPreview] = useState(false);

  // Mutations
  const previewMutation = usePreviewAccruals();
  const calculateMutation = useCalculateAccruals();

  const periodOptions = useMemo(() => generatePeriodOptions(), []);

  const totalAmount = useMemo(() => {
    return preview.reduce((sum, entry) => sum + entry.amount, 0);
  }, [preview]);

  const handlePreview = async () => {
    try {
      const result = await previewMutation.mutateAsync({
        period,
        method,
      });
      setPreview(result.data?.entries || []);
      setHasPreview(true);

      if (!result.data?.entries?.length) {
        toast({
          title: 'No Accruals',
          description: 'No active promotions found for the selected period.',
          variant: 'default',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to preview accruals',
        variant: 'destructive',
      });
    }
  };

  const handleCalculate = async () => {
    try {
      const result = await calculateMutation.mutateAsync({
        period,
        method,
      });
      toast({
        title: 'Success',
        description: `${result.data?.calculated || 0} accruals calculated successfully`,
      });
      navigate('/finance/accruals');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to calculate accruals',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/finance/accruals')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Calculate Accruals</h1>
          <p className="text-muted-foreground">
            Calculate accruals for active promotions in a period
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Step 1: Period */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Step 1: Select Period</CardTitle>
              <CardDescription>
                Choose the accounting period for accrual calculation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Step 2: Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Step 2: Calculation Method</CardTitle>
              <CardDescription>
                Choose how to calculate accrual amounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={method} onValueChange={(v) => setMethod(v as CalculationMethod)}>
                <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                  <RadioGroupItem value="PERCENTAGE" id="percentage" />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="percentage" className="font-medium cursor-pointer">
                      Percentage of Completion
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Based on time elapsed vs total promotion duration
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                  <RadioGroupItem value="PRO_RATA" id="prorata" />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="prorata" className="font-medium cursor-pointer">
                      Pro-Rata (Time-based)
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Even distribution based on days in period
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Step 3: Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Step 3: Review & Calculate</CardTitle>
              <CardDescription>
                Preview before saving accruals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={handlePreview}
                disabled={previewMutation.isPending}
              >
                <Eye className="mr-2 h-4 w-4" />
                {previewMutation.isPending ? 'Loading...' : 'Preview Accruals'}
              </Button>
              {hasPreview && preview.length > 0 && (
                <Button
                  className="w-full"
                  onClick={handleCalculate}
                  disabled={calculateMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {calculateMutation.isPending ? 'Saving...' : 'Calculate & Save'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Results */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Preview Results
              </CardTitle>
              <CardDescription>
                {hasPreview
                  ? `${preview.length} promotion(s) found for ${period}`
                  : 'Click "Preview Accruals" to see calculated amounts'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewMutation.isPending ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : !hasPreview ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Calculator className="h-12 w-12 mb-4" />
                  <p>Select a period and method, then click Preview</p>
                </div>
              ) : preview.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Active Promotions</AlertTitle>
                  <AlertDescription>
                    There are no active promotions in the selected period, or accruals have already been calculated.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Promotion</TableHead>
                      <TableHead className="text-right">Budget</TableHead>
                      <TableHead className="text-right">Spent</TableHead>
                      <TableHead className="text-right">Accrual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((entry) => (
                      <TableRow key={entry.promotionId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{entry.promotion.code}</div>
                            <div className="text-sm text-muted-foreground">
                              {entry.promotion.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={entry.promotion.budget} size="sm" />
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={entry.promotion.spentAmount} size="sm" />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <CurrencyDisplay amount={entry.amount} size="sm" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="font-medium">
                        Total Accrual Amount
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        <CurrencyDisplay amount={totalAmount} size="sm" />
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </CardContent>
            {hasPreview && preview.length > 0 && (
              <CardFooter className="flex justify-between border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  {preview.length} accrual entries will be created
                </p>
                <Button onClick={handleCalculate} disabled={calculateMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {calculateMutation.isPending ? 'Saving...' : 'Confirm & Save'}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
