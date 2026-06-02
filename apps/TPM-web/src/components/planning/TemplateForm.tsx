/**
 * Template Form Component - For Create/Edit
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PromotionTemplate, TemplateMechanics, TemplateEligibility } from '@/types/planning';

interface TemplateFormProps {
  template?: PromotionTemplate;
  onSubmit: (data: TemplateFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface TemplateFormData {
  code: string;
  name: string;
  description: string;
  type: string;
  category: string;
  defaultDuration: number | null;
  defaultBudget: number | null;
  mechanics: TemplateMechanics;
  eligibility: TemplateEligibility;
  isActive: boolean;
}

const PROMOTION_TYPES = [
  { value: 'DISCOUNT', label: 'Discount' },
  { value: 'REBATE', label: 'Rebate' },
  { value: 'COUPON', label: 'Coupon' },
  { value: 'BUNDLE', label: 'Bundle' },
  { value: 'BOGO', label: 'Buy One Get One' },
  { value: 'FREE_GOODS', label: 'Free Goods' },
  { value: 'LOYALTY', label: 'Loyalty' },
];

const DISCOUNT_TYPES = [
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'FIXED', label: 'Fixed Amount' },
  { value: 'BOGO', label: 'Buy One Get One' },
];

const CATEGORIES = [
  { value: 'SEASONAL', label: 'Seasonal' },
  { value: 'CLEARANCE', label: 'Clearance' },
  { value: 'NEW_PRODUCT', label: 'New Product Launch' },
  { value: 'LOYALTY', label: 'Loyalty Program' },
  { value: 'TRADE', label: 'Trade Promotion' },
  { value: 'CONSUMER', label: 'Consumer Promotion' },
];

const CUSTOMER_TYPES = [
  { value: 'MT', label: 'Modern Trade' },
  { value: 'GT', label: 'General Trade' },
  { value: 'HORECA', label: 'HORECA' },
  { value: 'ECOM', label: 'E-Commerce' },
];

export function TemplateForm({ template, onSubmit, onCancel, isLoading }: TemplateFormProps) {
  const [formData, setFormData] = useState<TemplateFormData>({
    code: '',
    name: '',
    description: '',
    type: 'DISCOUNT',
    category: '',
    defaultDuration: null,
    defaultBudget: null,
    mechanics: {
      discountType: 'PERCENTAGE',
      discountValue: undefined,
      minPurchase: undefined,
      maxDiscount: undefined,
      stackable: false,
    },
    eligibility: {
      customerTypes: [],
      regions: [],
      productCategories: [],
      minOrderValue: undefined,
    },
    isActive: true,
  });

  useEffect(() => {
    if (template) {
      setFormData({
        code: template.code,
        name: template.name,
        description: template.description || '',
        type: template.type,
        category: template.category || '',
        defaultDuration: template.defaultDuration || null,
        defaultBudget: template.defaultBudget || null,
        mechanics: template.mechanics || {
          discountType: 'PERCENTAGE',
          stackable: false,
        },
        eligibility: template.eligibility || {
          customerTypes: [],
        },
        isActive: template.isActive,
      });
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateMechanics = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      mechanics: { ...prev.mechanics, [key]: value },
    }));
  };

  const updateEligibility = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      eligibility: { ...prev.eligibility, [key]: value },
    }));
  };

  const toggleCustomerType = (type: string) => {
    const current = formData.eligibility.customerTypes || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    updateEligibility('customerTypes', updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Template identification and type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Template Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="TPL-001"
                disabled={!!template}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Promotion Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROMOTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Summer Sale Template"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the template purpose..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Default Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Default Settings</CardTitle>
          <CardDescription>Default values when applying template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Default Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.defaultDuration || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultDuration: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Default Budget</Label>
              <Input
                id="budget"
                type="number"
                value={formData.defaultBudget || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultBudget: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="10000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mechanics */}
      <Card>
        <CardHeader>
          <CardTitle>Promotion Mechanics</CardTitle>
          <CardDescription>How the promotion works</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select
                value={formData.mechanics.discountType || 'PERCENTAGE'}
                onValueChange={(v) => updateMechanics('discountType', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discount Value</Label>
              <Input
                type="number"
                value={formData.mechanics.discountValue || ''}
                onChange={(e) =>
                  updateMechanics('discountValue', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder={formData.mechanics.discountType === 'PERCENTAGE' ? '10' : '5000'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Purchase Amount</Label>
              <Input
                type="number"
                value={formData.mechanics.minPurchase || ''}
                onChange={(e) =>
                  updateMechanics('minPurchase', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="50000"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Discount</Label>
              <Input
                type="number"
                value={formData.mechanics.maxDiscount || ''}
                onChange={(e) =>
                  updateMechanics('maxDiscount', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="100000"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="stackable"
              checked={formData.mechanics.stackable || false}
              onCheckedChange={(v) => updateMechanics('stackable', v)}
            />
            <Label htmlFor="stackable">Allow stacking with other promotions</Label>
          </div>
        </CardContent>
      </Card>

      {/* Eligibility */}
      <Card>
        <CardHeader>
          <CardTitle>Eligibility Criteria</CardTitle>
          <CardDescription>Who can use this promotion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Customer Types</Label>
            <div className="flex flex-wrap gap-2">
              {CUSTOMER_TYPES.map((ct) => (
                <Button
                  key={ct.value}
                  type="button"
                  variant={formData.eligibility.customerTypes?.includes(ct.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleCustomerType(ct.value)}
                >
                  {ct.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Min Order Value</Label>
            <Input
              type="number"
              value={formData.eligibility.minOrderValue || ''}
              onChange={(e) =>
                updateEligibility('minOrderValue', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              placeholder="100000"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Inactive templates cannot be applied
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
}

export default TemplateForm;
