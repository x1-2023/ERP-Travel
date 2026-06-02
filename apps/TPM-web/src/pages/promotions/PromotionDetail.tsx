/**
 * Promotion Detail Page - Full Implementation
 */

import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Users,
  Tag,
  FileText,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { PromotionStatusBadge } from '@/components/promotions/PromotionStatusBadge';
import { ClaimStatusBadge } from '@/components/claims/ClaimStatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  usePromotion,
  useDeletePromotion,
  useSubmitPromotion,
  useApprovePromotion,
  useRejectPromotion,
} from '@/hooks/usePromotions';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { Promotion, Claim } from '@/types';

// Demo data
const demoPromotion: Promotion = {
  id: '1',
  code: 'PROMO-2026-001',
  name: 'Summer Sale Campaign',
  description: 'Comprehensive summer promotional campaign targeting Q2 sales growth across all modern trade channels. Includes discount mechanics and display allowances.',
  status: 'ACTIVE',
  startDate: '2026-01-01',
  endDate: '2026-03-31',
  budget: 500000000,
  actualSpend: 320000000,
  promotionType: 'TRADE_PROMOTION',
  mechanicType: 'DISCOUNT',
  customer: { id: '1', code: 'CUST-001', name: 'Customer A', channel: 'MODERN_TRADE', status: 'ACTIVE', createdAt: '', updatedAt: '' },
  fund: { id: '1', code: 'FUND-001', name: 'Trade Fund Q1', fundType: 'TRADE_FUND', totalBudget: 1000000000, allocatedBudget: 500000000, utilizedBudget: 320000000, availableBudget: 180000000, startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '', updatedAt: '' },
  createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
  createdAt: '2025-12-01',
  updatedAt: '2025-12-15',
};

const demoClaims: Claim[] = [
  {
    id: '1',
    code: 'CLM-2026-001',
    status: 'SUBMITTED',
    claimDate: '2026-01-15',
    claimAmount: 50000000,
    description: 'Q1 rebate claim',
    promotion: demoPromotion,
    createdBy: demoPromotion.createdBy,
    createdAt: '2026-01-15',
    updatedAt: '2026-01-15',
  },
  {
    id: '2',
    code: 'CLM-2026-002',
    status: 'PAID',
    claimDate: '2026-01-10',
    claimAmount: 75000000,
    approvedAmount: 72000000,
    paidAmount: 72000000,
    description: 'Display allowance settlement',
    promotion: demoPromotion,
    createdBy: demoPromotion.createdBy,
    createdAt: '2026-01-10',
    updatedAt: '2026-01-12',
  },
];

export default function PromotionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch promotion
  const { data: promotion, isLoading } = usePromotion(id || '');
  const deletePromotion = useDeletePromotion();
  const submitPromotion = useSubmitPromotion();
  const approvePromotion = useApprovePromotion();
  const rejectPromotion = useRejectPromotion();

  // Use API data or demo data
  const promo = promotion || demoPromotion;
  const claims = demoClaims; // Would be fetched from API

  const utilizationPercent = promo.budget > 0
    ? Math.round((promo.actualSpend / promo.budget) * 100)
    : 0;

  const handleDelete = async () => {
    await deletePromotion.mutateAsync(id!);
    navigate('/promotions');
  };

  const handleSubmit = async () => {
    await submitPromotion.mutateAsync(id!);
  };

  const handleApprove = async () => {
    await approvePromotion.mutateAsync({ id: id! });
  };

  const handleReject = async () => {
    await rejectPromotion.mutateAsync({ id: id!, reason: 'Rejected by manager' });
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading promotion..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/promotions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{promo.code}</h1>
              <PromotionStatusBadge status={promo.status} />
            </div>
            <p className="text-muted-foreground">{promo.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Workflow Actions */}
          {promo.status === 'DRAFT' && (
            <Button onClick={handleSubmit} disabled={submitPromotion.isPending}>
              <Send className="mr-2 h-4 w-4" />
              Submit for Approval
            </Button>
          )}

          {promo.status === 'PENDING_APPROVAL' && (
            <>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={rejectPromotion.isPending}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={approvePromotion.isPending}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </>
          )}

          {/* Edit/Delete */}
          {['DRAFT', 'REJECTED'].includes(promo.status) && (
            <>
              <Button variant="outline" asChild>
                <Link to={`/promotions/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this promotion? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="claims">Claims ({claims.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={promo.budget} size="lg" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Actual Spend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={promo.actualSpend} size="lg" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Remaining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-emerald-600 dark:text-emerald-400">
                  <CurrencyDisplay amount={promo.budget - promo.actualSpend} size="lg" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{utilizationPercent}%</div>
                <Progress value={utilizationPercent} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Details Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Tag className="h-4 w-4" /> Promotion Code
                    </p>
                    <p className="font-medium">{promo.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Type
                    </p>
                    <p className="font-medium">{promo.promotionType.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-4 w-4" /> Mechanic
                    </p>
                    <p className="font-medium">{promo.mechanicType?.replace(/_/g, ' ') || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Status
                    </p>
                    <PromotionStatusBadge status={promo.status} />
                  </div>
                </div>

                <Separator />

                {promo.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{promo.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline & Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> Start Date
                    </p>
                    <p className="font-medium">{formatDate(promo.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> End Date
                    </p>
                    <p className="font-medium">{formatDate(promo.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" /> Customer
                    </p>
                    <Link
                      to={`/customers/${promo.customer?.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {promo.customer?.name}
                    </Link>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-4 w-4" /> Fund
                    </p>
                    <Link
                      to={`/funds/${promo.fund?.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {promo.fund?.name}
                    </Link>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Created By</p>
                    <p className="font-medium">{promo.createdBy?.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(promo.createdAt)}</p>
                  </div>
                  {promo.approvedBy && (
                    <div>
                      <p className="text-sm text-muted-foreground">Approved By</p>
                      <p className="font-medium">{promo.approvedBy.name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="claims" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Related Claims</CardTitle>
                  <CardDescription>Claims submitted for this promotion</CardDescription>
                </div>
                <Button asChild>
                  <Link to={`/claims/new?promotionId=${id}`}>
                    Create Claim
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {claims.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No claims submitted yet
                </p>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <Link
                      key={claim.id}
                      to={`/claims/${claim.id}`}
                      className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{claim.code}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(claim.claimDate)} - {claim.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <CurrencyDisplay amount={claim.claimAmount} size="sm" />
                          <ClaimStatusBadge status={claim.status} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>Timeline of changes and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium">Promotion created</p>
                    <p className="text-sm text-muted-foreground">
                      by {promo.createdBy?.name} on {formatDate(promo.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="font-medium">Promotion updated</p>
                    <p className="text-sm text-muted-foreground">
                      Last modified on {formatDate(promo.updatedAt)}
                    </p>
                  </div>
                </div>
                {promo.status === 'ACTIVE' && (
                  <div className="flex gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-purple-500" />
                    <div>
                      <p className="font-medium">Promotion activated</p>
                      <p className="text-sm text-muted-foreground">
                        Started on {formatDate(promo.startDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
