/**
 * Scenario Form Component
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import type { ScenarioParameters, ScenarioAssumptions } from '@/hooks/planning/useScenarios';

interface ScenarioFormData {
  name: string;
  description: string;
  baselineId: string;
  parameters: ScenarioParameters;
  assumptions: ScenarioAssumptions;
}

interface ScenarioFormProps {
  initialData?: Partial<ScenarioFormData>;
  baselines?: Array<{ id: string; code: string; name: string }>;
  onSubmit: (data: ScenarioFormData) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const PROMOTION_TYPES = [
  { value: 'DISCOUNT', label: 'Discount' },
  { value: 'BOGO', label: 'Buy One Get One' },
  { value: 'BUNDLE', label: 'Bundle Deal' },
  { value: 'REBATE', label: 'Rebate' },
  { value: 'LOYALTY', label: 'Loyalty Points' },
  { value: 'FREE_SHIPPING', label: 'Free Shipping' },
];

const defaultAssumptions: ScenarioAssumptions = {
  baselineSalesPerDay: 10000,
  averageOrderValue: 50,
  marginPercent: 30,
  cannibalizedPercent: 0,
  haloEffectPercent: 0,
};

const defaultParameters: ScenarioParameters = {
  promotionType: 'DISCOUNT',
  discountPercent: 10,
  budget: 50000,
  duration: 14,
  targetCustomers: [],
  targetProducts: [],
  startDate: new Date().toISOString().split('T')[0],
  expectedLiftPercent: 20,
  redemptionRatePercent: 15,
};

export function ScenarioForm({
  initialData,
  baselines = [],
  onSubmit,
  isLoading,
  submitLabel = 'Create Scenario',
}: ScenarioFormProps) {
  const [activeTab, setActiveTab] = useState('basic');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ScenarioFormData>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      baselineId: initialData?.baselineId || '',
      parameters: { ...defaultParameters, ...initialData?.parameters },
      assumptions: { ...defaultAssumptions, ...initialData?.assumptions },
    },
  });

  const promotionType = watch('parameters.promotionType');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Details</CardTitle>
              <CardDescription>
                Basic information about this scenario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Scenario Name *</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="e.g., Summer Sale 2025 - High Discount"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe the scenario objectives and strategy..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baselineId">Baseline (Optional)</Label>
                <Select
                  value={watch('baselineId') || '__none__'}
                  onValueChange={(value) => setValue('baselineId', value === '__none__' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a baseline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No baseline</SelectItem>
                    {baselines.map((baseline) => (
                      <SelectItem key={baseline.id} value={baseline.id}>
                        {baseline.name} ({baseline.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parameters Tab */}
        <TabsContent value="parameters">
          <Card>
            <CardHeader>
              <CardTitle>Promotion Parameters</CardTitle>
              <CardDescription>
                Configure the promotion mechanics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Promotion Type *</Label>
                  <Select
                    value={promotionType}
                    onValueChange={(value) =>
                      setValue('parameters.promotionType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMOTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {promotionType === 'DISCOUNT' && (
                  <div className="space-y-2">
                    <Label htmlFor="discountPercent">Discount %</Label>
                    <Input
                      id="discountPercent"
                      type="number"
                      min="0"
                      max="100"
                      {...register('parameters.discountPercent', {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget ($) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    {...register('parameters.budget', {
                      required: 'Budget is required',
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="365"
                    {...register('parameters.duration', {
                      required: 'Duration is required',
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register('parameters.startDate', {
                      required: 'Start date is required',
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedLiftPercent">Expected Lift % *</Label>
                  <Input
                    id="expectedLiftPercent"
                    type="number"
                    min="0"
                    {...register('parameters.expectedLiftPercent', {
                      required: 'Expected lift is required',
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="redemptionRatePercent">
                  Redemption Rate % *
                </Label>
                <Input
                  id="redemptionRatePercent"
                  type="number"
                  min="0"
                  max="100"
                  {...register('parameters.redemptionRatePercent', {
                    required: 'Redemption rate is required',
                    valueAsNumber: true,
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Percentage of transactions that will use the promotion
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assumptions Tab */}
        <TabsContent value="assumptions">
          <Card>
            <CardHeader>
              <CardTitle>Business Assumptions</CardTitle>
              <CardDescription>
                Configure baseline assumptions for the simulation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baselineSalesPerDay">
                    Baseline Sales/Day ($)
                  </Label>
                  <Input
                    id="baselineSalesPerDay"
                    type="number"
                    min="0"
                    {...register('assumptions.baselineSalesPerDay', {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="averageOrderValue">
                    Average Order Value ($)
                  </Label>
                  <Input
                    id="averageOrderValue"
                    type="number"
                    min="0"
                    {...register('assumptions.averageOrderValue', {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marginPercent">Margin %</Label>
                <Input
                  id="marginPercent"
                  type="number"
                  min="0"
                  max="100"
                  {...register('assumptions.marginPercent', {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cannibalizedPercent">Cannibalization %</Label>
                  <Input
                    id="cannibalizedPercent"
                    type="number"
                    min="0"
                    max="100"
                    {...register('assumptions.cannibalizedPercent', {
                      valueAsNumber: true,
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    % of lift that would have happened anyway
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="haloEffectPercent">Halo Effect %</Label>
                  <Input
                    id="haloEffectPercent"
                    type="number"
                    min="0"
                    {...register('assumptions.haloEffectPercent', {
                      valueAsNumber: true,
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Additional lift from brand awareness
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
