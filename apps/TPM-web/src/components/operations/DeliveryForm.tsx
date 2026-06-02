/**
 * Delivery Form Component
 */

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Plus, Trash2, Loader2 } from 'lucide-react';
import type { CreateDeliveryRequest } from '@/types/operations';

interface DeliveryFormProps {
  customers: Array<{ id: string; code: string; name: string; address?: string }>;
  products: Array<{ id: string; code: string; name: string }>;
  promotions?: Array<{ id: string; code: string; name: string }>;
  onSubmit: (data: CreateDeliveryRequest) => void;
  isLoading?: boolean;
}

interface FormData {
  customerId: string;
  promotionId: string;
  scheduledDate: string;
  deliveryAddress: string;
  contactPerson: string;
  contactPhone: string;
  notes: string;
  lines: Array<{
    productId: string;
    quantity: number;
    notes: string;
  }>;
}

export function DeliveryForm({
  customers,
  products,
  promotions = [],
  onSubmit,
  isLoading,
}: DeliveryFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      customerId: '',
      promotionId: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      deliveryAddress: '',
      contactPerson: '',
      contactPhone: '',
      notes: '',
      lines: [{ productId: '', quantity: 1, notes: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId);
    setValue('customerId', customerId);

    // Auto-fill address
    const customer = customers.find((c) => c.id === customerId);
    if (customer?.address) {
      setValue('deliveryAddress', customer.address);
    }
  };

  const handleFormSubmit = (data: FormData) => {
    // Filter out empty lines
    const validLines = data.lines.filter((line) => line.productId && line.quantity > 0);

    if (validLines.length === 0) {
      return;
    }

    onSubmit({
      ...data,
      promotionId: data.promotionId || undefined,
      lines: validLines,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Customer & Promotion */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer *</Label>
              <Select
                value={selectedCustomer}
                onValueChange={handleCustomerChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && (
                <p className="text-sm text-destructive">Customer is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotionId">Promotion (Optional)</Label>
              <Select
                value={watch('promotionId') || '__none__'}
                onValueChange={(v) => setValue('promotionId', v === '__none__' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select promotion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No promotion</SelectItem>
                  {promotions.map((promo) => (
                    <SelectItem key={promo.id} value={promo.id}>
                      {promo.name} ({promo.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Scheduled Date *</Label>
            <Input
              id="scheduledDate"
              type="date"
              {...register('scheduledDate', { required: true })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Textarea
              id="deliveryAddress"
              {...register('deliveryAddress')}
              placeholder="Enter delivery address"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                {...register('contactPerson')}
                placeholder="Contact name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                {...register('contactPhone')}
                placeholder="Phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Any special instructions..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Line Items</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: '', quantity: 1, notes: '' })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start">
                <div className="flex-1">
                  <Label className="sr-only">Product</Label>
                  <Select
                    value={watch(`lines.${index}.productId`)}
                    onValueChange={(v) => setValue(`lines.${index}.productId`, v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label className="sr-only">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    {...register(`lines.${index}.quantity`, {
                      valueAsNumber: true,
                      min: 1,
                    })}
                    placeholder="Qty"
                  />
                </div>
                <div className="flex-1">
                  <Label className="sr-only">Notes</Label>
                  <Input
                    {...register(`lines.${index}.notes`)}
                    placeholder="Line notes (optional)"
                  />
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create Delivery Order
        </Button>
      </div>
    </form>
  );
}
