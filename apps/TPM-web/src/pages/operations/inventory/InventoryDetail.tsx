/**
 * Inventory Detail Page
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Package, Calendar, MapPin, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useInventorySnapshot, useDeleteInventorySnapshot, useInventoryHistory } from '@/hooks/operations';
import { useToast } from '@/hooks/useToast';
import { formatNumber, formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';

export default function InventoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: snapshot, isLoading } = useInventorySnapshot(id);
  const deleteMutation = useDeleteInventorySnapshot();

  // Get history for the same customer/product
  const { data: historyData } = useInventoryHistory({
    customerId: snapshot?.customerId,
    productId: snapshot?.productId,
    days: 90,
  });

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Deleted',
        description: 'Inventory snapshot deleted successfully',
      });
      navigate('/operations/inventory');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete snapshot',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Snapshot not found</h2>
        <Link to="/operations/inventory">
          <Button className="mt-4">Back to list</Button>
        </Link>
      </div>
    );
  }

  const isExpired = snapshot.expiryDate && new Date(snapshot.expiryDate) < new Date();
  const isNearExpiry =
    snapshot.expiryDate &&
    new Date(snapshot.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Inventory Snapshot</h1>
            <p className="text-muted-foreground">
              {snapshot.customer?.name} - {snapshot.product?.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Snapshot</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this inventory snapshot? This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Snapshot Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Snapshot Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Snapshot Date</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(snapshot.snapshotDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {snapshot.location || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="text-2xl font-bold">{formatNumber(snapshot.quantity)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Value</p>
                <p className="text-2xl font-bold"><CurrencyDisplay amount={snapshot.value} size="md" /></p>
              </div>
            </div>

            {snapshot.batchNumber && (
              <div>
                <p className="text-sm text-muted-foreground">Batch Number</p>
                <p className="font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {snapshot.batchNumber}
                </p>
              </div>
            )}

            {snapshot.expiryDate && (
              <div>
                <p className="text-sm text-muted-foreground">Expiry Date</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatDate(snapshot.expiryDate)}</span>
                  {isExpired ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : isNearExpiry ? (
                    <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20">
                      Near Expiry
                    </Badge>
                  ) : null}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer & Product Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer & Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium text-lg">{snapshot.customer?.name}</p>
              <p className="text-sm text-muted-foreground">{snapshot.customer?.code}</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Product</p>
              <p className="font-medium text-lg">{snapshot.product?.name}</p>
              <p className="text-sm text-muted-foreground">{snapshot.product?.code}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Chart */}
      {historyData && historyData.timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory History (Last 90 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">
                  {historyData.timeline.length} data points
                </p>
                {historyData.overallTrend && (
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Quantity Growth: </span>
                      <span
                        className={
                          historyData.overallTrend.quantityGrowth >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }
                      >
                        {historyData.overallTrend.quantityGrowth > 0 ? '+' : ''}
                        {historyData.overallTrend.quantityGrowth}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Value Growth: </span>
                      <span
                        className={
                          historyData.overallTrend.valueGrowth >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }
                      >
                        {historyData.overallTrend.valueGrowth > 0 ? '+' : ''}
                        {historyData.overallTrend.valueGrowth}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Created: {formatDate(snapshot.createdAt)}</span>
            <span>ID: {snapshot.id}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
