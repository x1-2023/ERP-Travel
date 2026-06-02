/**
 * Apply Template Dialog Component
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrencyCompact } from '@/components/ui/currency-display';
import { useCustomers } from '@/hooks/useCustomers';
import { useFunds } from '@/hooks/useFunds';
import type { PromotionTemplate, ApplyTemplateRequest } from '@/types/planning';

interface ApplyTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: PromotionTemplate | null;
  onApply: (data: ApplyTemplateRequest) => void;
  isLoading?: boolean;
}

export function ApplyTemplateDialog({
  open,
  onOpenChange,
  template,
  onApply,
  isLoading,
}: ApplyTemplateDialogProps) {
  const [formData, setFormData] = useState<ApplyTemplateRequest>({
    name: '',
    startDate: '',
    endDate: '',
    budget: undefined,
    customerId: undefined,
    fundId: undefined,
  });

  const { data: customersData } = useCustomers({ limit: 100 });
  const { data: fundsData } = useFunds({ limit: 100 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    onApply({
      ...formData,
      budget: formData.budget || template.defaultBudget || undefined,
    });
  };

  // Calculate end date based on duration
  const handleStartDateChange = (startDate: string) => {
    setFormData((prev) => {
      const newData = { ...prev, startDate };
      if (template?.defaultDuration && startDate) {
        const start = new Date(startDate);
        start.setDate(start.getDate() + template.defaultDuration);
        newData.endDate = start.toISOString().split('T')[0];
      }
      return newData;
    });
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply Template</DialogTitle>
          <DialogDescription>
            Create a new promotion from "{template.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Summary */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{template.code}</span>
              <Badge>{template.type}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Duration:</span>{' '}
                {template.defaultDuration ? `${template.defaultDuration} days` : 'Custom'}
              </div>
              <div>
                <span className="text-muted-foreground">Budget:</span>{' '}
                {template.defaultBudget ? formatCurrencyCompact(template.defaultBudget, 'VND') : 'Custom'}
              </div>
            </div>
          </div>

          <Separator />

          {/* Promotion Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Promotion Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Q1 2024 Summer Sale"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (override)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder={template.defaultBudget?.toString() || 'Enter budget'}
              />
              {template.defaultBudget && (
                <p className="text-xs text-muted-foreground">
                  Default: {formatCurrencyCompact(template.defaultBudget, 'VND')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Customer (optional)</Label>
              <Select
                value={formData.customerId || '__none__'}
                onValueChange={(v) => setFormData({ ...formData, customerId: v === '__none__' ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No specific customer</SelectItem>
                  {customersData?.customers?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fund (optional)</Label>
              <Select
                value={formData.fundId || '__none__'}
                onValueChange={(v) => setFormData({ ...formData, fundId: v === '__none__' ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fund" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No fund allocation</SelectItem>
                  {fundsData?.funds?.map((f: any) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} ({formatCurrencyCompact(f.availableBudget || 0, 'VND')} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Promotion'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ApplyTemplateDialog;
