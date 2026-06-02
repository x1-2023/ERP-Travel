/**
 * Create Delivery Order Page
 */

import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { DeliveryForm } from '@/components/operations';
import { useToast } from '@/hooks/useToast';
import { useCreateDelivery } from '@/hooks/operations/useDelivery';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { usePromotions } from '@/hooks/usePromotions';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function DeliveryNew() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: customersData, isLoading: customersLoading } = useCustomers({ limit: 100 });
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 100 });
  const { data: promotionsData, isLoading: promotionsLoading } = usePromotions({
    limit: 100,
    status: 'ACTIVE',
  });

  const createMutation = useCreateDelivery();

  const handleSubmit = async (data: any) => {
    try {
      const order = await createMutation.mutateAsync(data);
      toast({
        title: 'Order Created',
        description: `Delivery order ${order.orderNumber} has been created.`,
      });
      navigate(`/operations/delivery/${order.id}`);
    } catch (err: any) {
      toast({
        title: 'Create Failed',
        description: err.message || 'Failed to create delivery order',
        variant: 'destructive',
      });
    }
  };

  if (customersLoading || productsLoading || promotionsLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const customers = customersData?.customers || [];
  const products = productsData?.products || [];
  const promotions = promotionsData?.promotions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/operations/delivery">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Delivery Order</h1>
          <p className="text-muted-foreground">
            Create a new delivery order for a customer
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <DeliveryForm
          customers={customers}
          products={products}
          promotions={promotions}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  );
}
