/**
 * Create Sell Tracking Record Page
 */

import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { useCreateSellTracking } from '@/hooks/operations';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';

interface FormData {
  customerId: string;
  productId: string;
  period: string;
  sellInQty: number;
  sellInValue: number;
  sellOutQty: number;
  sellOutValue: number;
  stockQty: number;
  stockValue: number;
}

export default function SellTrackingNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createMutation = useCreateSellTracking();
  const { data: customers } = useCustomers({ limit: 100 });
  const { data: products } = useProducts({ limit: 100 });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      period: new Date().toISOString().slice(0, 7),
      sellInQty: 0,
      sellInValue: 0,
      sellOutQty: 0,
      sellOutValue: 0,
      stockQty: 0,
      stockValue: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createMutation.mutateAsync({
        customerId: data.customerId,
        productId: data.productId,
        period: data.period,
        sellInQty: Number(data.sellInQty),
        sellInValue: Number(data.sellInValue),
        sellOutQty: Number(data.sellOutQty),
        sellOutValue: Number(data.sellOutValue),
        stockQty: Number(data.stockQty),
        stockValue: Number(data.stockValue),
      });

      toast({
        title: 'Success',
        description: 'Sell tracking record created successfully',
      });

      navigate('/operations/sell-tracking');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create record. Please try again.',
        variant: 'destructive',
      });
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
          <h1 className="text-2xl font-bold">Add Sell Tracking Record</h1>
          <p className="text-muted-foreground">Create a new sell-in/sell-out record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Input
                  id="period"
                  type="month"
                  {...register('period', { required: 'Period is required' })}
                />
                {errors.period && (
                  <p className="text-sm text-red-500">{errors.period.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerId">Customer</Label>
                <Select
                  value={watch('customerId')}
                  onValueChange={(value) => setValue('customerId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.customers?.map((customer: { id: string; name: string; code: string }) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} ({customer.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <p className="text-sm text-red-500">{errors.customerId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="productId">Product</Label>
                <Select
                  value={watch('productId')}
                  onValueChange={(value) => setValue('productId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.products?.map((product: { id: string; name: string; sku: string }) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && (
                  <p className="text-sm text-red-500">{errors.productId.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sell Data */}
          <Card>
            <CardHeader>
              <CardTitle>Sell-In / Sell-Out Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sellInQty">Sell-In Qty</Label>
                  <Input
                    id="sellInQty"
                    type="number"
                    min="0"
                    {...register('sellInQty', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellInValue">Sell-In Value</Label>
                  <Input
                    id="sellInValue"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('sellInValue', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sellOutQty">Sell-Out Qty</Label>
                  <Input
                    id="sellOutQty"
                    type="number"
                    min="0"
                    {...register('sellOutQty', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellOutValue">Sell-Out Value</Label>
                  <Input
                    id="sellOutValue"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('sellOutValue', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stockQty">Stock Qty</Label>
                  <Input
                    id="stockQty"
                    type="number"
                    min="0"
                    {...register('stockQty', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockValue">Stock Value</Label>
                  <Input
                    id="stockValue"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('stockValue', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Record'}
          </Button>
        </div>
      </form>
    </div>
  );
}
