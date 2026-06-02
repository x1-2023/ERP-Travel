/**
 * Create Inventory Snapshot Page
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
import { useCreateInventorySnapshot } from '@/hooks/operations';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';

interface FormData {
  customerId: string;
  productId: string;
  snapshotDate: string;
  quantity: number;
  value: number;
  location: string;
  batchNumber: string;
  expiryDate: string;
}

export default function InventoryNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createMutation = useCreateInventorySnapshot();
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
      snapshotDate: new Date().toISOString().split('T')[0],
      quantity: 0,
      value: 0,
      location: '',
      batchNumber: '',
      expiryDate: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createMutation.mutateAsync({
        customerId: data.customerId,
        productId: data.productId,
        snapshotDate: data.snapshotDate,
        quantity: Number(data.quantity),
        value: Number(data.value),
        location: data.location || undefined,
        batchNumber: data.batchNumber || undefined,
        expiryDate: data.expiryDate || undefined,
      });

      toast({
        title: 'Success',
        description: 'Inventory snapshot created successfully',
      });

      navigate('/operations/inventory');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create snapshot. Please try again.',
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
          <h1 className="text-2xl font-bold">Add Inventory Snapshot</h1>
          <p className="text-muted-foreground">Record current inventory at a customer location</p>
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
                <Label htmlFor="snapshotDate">Snapshot Date</Label>
                <Input
                  id="snapshotDate"
                  type="date"
                  {...register('snapshotDate', { required: 'Date is required' })}
                />
                {errors.snapshotDate && (
                  <p className="text-sm text-red-500">{errors.snapshotDate.message}</p>
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

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Warehouse A, Store Front"
                  {...register('location')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Inventory Data */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    {...register('quantity', { valueAsNumber: true, required: 'Quantity is required' })}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-500">{errors.quantity.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('value', { valueAsNumber: true, required: 'Value is required' })}
                  />
                  {errors.value && (
                    <p className="text-sm text-red-500">{errors.value.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  placeholder="Optional batch number"
                  {...register('batchNumber')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input id="expiryDate" type="date" {...register('expiryDate')} />
                <p className="text-xs text-muted-foreground">
                  Leave empty if product does not expire
                </p>
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
            {isSubmitting ? 'Creating...' : 'Create Snapshot'}
          </Button>
        </div>
      </form>
    </div>
  );
}
