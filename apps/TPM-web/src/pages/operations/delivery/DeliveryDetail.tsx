/**
 * Delivery Detail Page
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Phone,
  Package,
  Truck,
  ArrowRight,
  Trash2,
  Loader2,
  DollarSign,
} from 'lucide-react';
import { DeliveryStatusBadge, DeliveryTimeline } from '@/components/operations';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import {
  useDeliveryOrder,
  useDeliveryTracking,
  useUpdateDeliveryStatus,
  useDeleteDelivery,
} from '@/hooks/operations/useDelivery';
import { DELIVERY_STATUS_TRANSITIONS, type DeliveryStatus } from '@/types/operations';

export default function DeliveryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('details');
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatus | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [deliveredQty, setDeliveredQty] = useState<Record<string, number>>({});
  const [showDelete, setShowDelete] = useState(false);

  const { data: order, isLoading, error } = useDeliveryOrder(id);
  const { data: trackingData } = useDeliveryTracking(id);
  const updateStatusMutation = useUpdateDeliveryStatus();
  const deleteMutation = useDeleteDelivery();

  const handleStatusChange = (status: DeliveryStatus) => {
    setSelectedStatus(status);
    setStatusNotes('');

    // Initialize delivered quantities for DELIVERED/PARTIAL
    if (['DELIVERED', 'PARTIAL'].includes(status) && order?.lines) {
      const initial: Record<string, number> = {};
      order.lines.forEach((line) => {
        initial[line.id] = status === 'DELIVERED' ? line.quantity : 0;
      });
      setDeliveredQty(initial);
    }

    setShowStatusDialog(true);
  };

  const handleStatusUpdate = async () => {
    if (!id || !selectedStatus) return;

    try {
      const deliveredLines = ['DELIVERED', 'PARTIAL'].includes(selectedStatus)
        ? Object.entries(deliveredQty).map(([lineId, qty]) => ({
            lineId,
            deliveredQty: qty,
          }))
        : undefined;

      await updateStatusMutation.mutateAsync({
        id,
        status: selectedStatus,
        notes: statusNotes || undefined,
        deliveredLines,
      });

      toast({
        title: 'Status Updated',
        description: `Order moved to ${selectedStatus.replace('_', ' ')}`,
      });
      setShowStatusDialog(false);
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Order Deleted',
        description: 'The delivery order has been deleted.',
      });
      navigate('/operations/delivery');
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error || !order) {
    return (
      <div className="p-6 text-center py-12">
        <p className="text-destructive mb-4">Order not found</p>
        <Button asChild variant="outline">
          <Link to="/operations/delivery">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const nextStatuses = DELIVERY_STATUS_TRANSITIONS[order.status] || [];
  const timeline = trackingData?.timeline || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/operations/delivery">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
              <DeliveryStatusBadge status={order.status} />
            </div>
            <p className="text-muted-foreground mt-1">
              {order.customer?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {nextStatuses.map((status) => (
            <Button
              key={status}
              variant={status === 'CANCELLED' ? 'outline' : 'default'}
              onClick={() => handleStatusChange(status)}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              {status.replace('_', ' ')}
            </Button>
          ))}
          {order.status === 'PENDING' && (
            <Button variant="destructive" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="font-semibold">{formatDate(order.scheduledDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="font-semibold">
                  {order.totalDelivered || 0} / {order.totalItems} delivered
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="font-semibold"><CurrencyDisplay amount={order.totalValue || 0} size="sm" /></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Delivered At</p>
                <p className="font-semibold">
                  {order.deliveredAt ? formatDate(order.deliveredAt) : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="lines">Line Items ({order.lines?.length || 0})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({timeline.length})</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{order.deliveryAddress || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Person</p>
                    <p className="font-medium">{order.contactPerson || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Phone</p>
                    <p className="font-medium">{order.contactPhone || '-'}</p>
                  </div>
                </div>
                {order.notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="mt-1">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{order.customer?.name}</p>
                  <p className="text-sm text-muted-foreground">{order.customer?.code}</p>
                </div>
                {order.promotion && (
                  <div>
                    <p className="text-sm text-muted-foreground">Promotion</p>
                    <Link
                      to={`/promotions/${order.promotion.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {order.promotion.name}
                    </Link>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-medium">{order.createdBy?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lines Tab */}
        <TabsContent value="lines">
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-right py-3 px-4">Quantity</th>
                    <th className="text-right py-3 px-4">Delivered</th>
                    <th className="text-right py-3 px-4">Damaged</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {order.lines?.map((line) => (
                    <tr key={line.id} className="border-b">
                      <td className="py-3 px-4">
                        <p className="font-medium">{line.product?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {line.product?.code}
                        </p>
                      </td>
                      <td className="text-right py-3 px-4">{line.quantity}</td>
                      <td className="text-right py-3 px-4 text-emerald-600 dark:text-emerald-400">
                        {line.deliveredQty}
                      </td>
                      <td className="text-right py-3 px-4 text-red-600 dark:text-red-400">
                        {line.damagedQty || 0}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            line.status === 'DELIVERED'
                              ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                              : line.status === 'PARTIAL'
                                ? 'bg-amber-500 text-white dark:bg-amber-600'
                                : 'bg-slate-500 text-white dark:bg-slate-600'
                          }`}
                        >
                          {line.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          {timeline.length > 0 ? (
            <DeliveryTimeline timeline={timeline} currentStatus={order.status} />
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No tracking history yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Update Status to {selectedStatus?.replace('_', ' ')}
            </DialogTitle>
            <DialogDescription>
              {['DELIVERED', 'PARTIAL'].includes(selectedStatus || '')
                ? 'Enter the delivered quantities for each item.'
                : 'Add any notes for this status change.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {['DELIVERED', 'PARTIAL'].includes(selectedStatus || '') && (
              <div className="space-y-3">
                {order.lines?.map((line) => (
                  <div key={line.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{line.product?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Ordered: {line.quantity}
                      </p>
                    </div>
                    <div className="w-24">
                      <Label className="sr-only">Delivered</Label>
                      <Input
                        type="number"
                        min="0"
                        max={line.quantity}
                        value={deliveredQty[line.id] || 0}
                        onChange={(e) =>
                          setDeliveredQty({
                            ...deliveredQty,
                            [line.id]: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add notes for this status change..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order {order.orderNumber}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
