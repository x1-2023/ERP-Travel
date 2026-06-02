/**
 * New Baseline Page
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateBaseline } from '@/hooks/useBaselines';
import { useToast } from '@/hooks/useToast';

export default function BaselineNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createBaseline = useCreateBaseline();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    year: new Date().getFullYear(),
    period: '' as 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | '',
    periodValue: '',
    baselineType: '',
    baselineValue: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createBaseline.mutateAsync({
        code: formData.code,
        name: formData.name,
        year: formData.year,
        period: formData.period as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
        periodValue: Number(formData.periodValue),
        baselineType: formData.baselineType as 'REVENUE' | 'VOLUME' | 'PRICE' | 'COST',
        baselineValue: Number(formData.baselineValue),
        notes: formData.notes || undefined,
      });
      toast({
        title: 'Success',
        description: 'Baseline created successfully',
      });
      navigate('/baselines');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create baseline',
        variant: 'destructive',
      });
    }
  };

  const getPeriodValueOptions = () => {
    switch (formData.period) {
      case 'MONTHLY':
        return [...Array(12)].map((_, i) => ({
          value: String(i + 1),
          label: new Date(2026, i).toLocaleString('default', { month: 'long' }),
        }));
      case 'QUARTERLY':
        return [
          { value: '1', label: 'Q1' },
          { value: '2', label: 'Q2' },
          { value: '3', label: 'Q3' },
          { value: '4', label: 'Q4' },
        ];
      case 'YEARLY':
        return [{ value: '1', label: 'Full Year' }];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/baselines">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Baseline</h1>
          <p className="text-muted-foreground">Create a new baseline for ROI calculations</p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Baseline Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Baseline Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="BL-2026-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Select
                  value={String(formData.year)}
                  onValueChange={(value) => setFormData({ ...formData, year: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Baseline Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Q1 Revenue Baseline"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="baselineType">Baseline Type *</Label>
                <Select
                  value={formData.baselineType}
                  onValueChange={(value) => setFormData({ ...formData, baselineType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REVENUE">Revenue</SelectItem>
                    <SelectItem value="VOLUME">Volume</SelectItem>
                    <SelectItem value="PRICE">Price</SelectItem>
                    <SelectItem value="COST">Cost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="baselineValue">Baseline Value *</Label>
                <Input
                  id="baselineValue"
                  type="number"
                  value={formData.baselineValue}
                  onChange={(e) => setFormData({ ...formData, baselineValue: e.target.value })}
                  placeholder="4500000000"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="period">Period *</Label>
                <Select
                  value={formData.period}
                  onValueChange={(value) => setFormData({ ...formData, period: value as 'MONTHLY' | 'QUARTERLY' | 'YEARLY', periodValue: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.period && (
                <div className="space-y-2">
                  <Label htmlFor="periodValue">Period Value *</Label>
                  <Select
                    value={formData.periodValue}
                    onValueChange={(value) => setFormData({ ...formData, periodValue: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period value" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPeriodValueOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={createBaseline.isPending}>
                {createBaseline.isPending ? 'Creating...' : 'Create Baseline'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/baselines">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
