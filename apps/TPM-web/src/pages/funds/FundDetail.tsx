/**
 * Fund Detail Page - Full Implementation
 */

import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Wallet,
  Tag,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
import { PromotionStatusBadge } from '@/components/promotions/PromotionStatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useFund, useDeleteFund } from '@/hooks/useFunds';
import { useToast } from '@/hooks/useToast';
import { formatDate, safePercentageNumber } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { Fund, Promotion, FundType } from '@/types';

// Demo data
const demoFund: Fund = {
  id: '1',
  code: 'FUND-2026-001',
  name: 'Trade Fund Q1',
  fundType: 'TRADE_FUND',
  totalBudget: 2000000000,
  allocatedBudget: 1200000000,
  utilizedBudget: 800000000,
  availableBudget: 800000000,
  startDate: '2026-01-01',
  endDate: '2026-03-31',
  description: 'Q1 2026 Trade Promotion Fund for modern trade and key account channels. Includes display allowances, volume rebates, and promotional support.',
  createdAt: '2025-12-01',
  updatedAt: '2026-01-15',
};

const demoPromotions: Promotion[] = [
  {
    id: '1',
    code: 'PROMO-2026-001',
    name: 'Summer Sale Campaign',
    status: 'ACTIVE',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    budget: 500000000,
    actualSpend: 320000000,
    promotionType: 'TRADE_PROMOTION',
    customer: { id: '1', code: 'CUST-001', name: 'Customer A', channel: 'MODERN_TRADE', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    fund: demoFund,
    createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
    createdAt: '2025-12-01',
    updatedAt: '2025-12-15',
  },
  {
    id: '2',
    code: 'PROMO-2026-002',
    name: 'Q1 Trade Deal',
    status: 'PENDING_APPROVAL',
    startDate: '2026-02-01',
    endDate: '2026-04-30',
    budget: 300000000,
    actualSpend: 0,
    promotionType: 'TRADE_PROMOTION',
    customer: { id: '2', code: 'CUST-002', name: 'Customer B', channel: 'KEY_ACCOUNT', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    fund: demoFund,
    createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
    createdAt: '2025-12-10',
    updatedAt: '2025-12-20',
  },
];

const fundTypeLabels: Record<FundType, string> = {
  TRADE_FUND: 'Trade Fund',
  MARKETING_FUND: 'Marketing Fund',
  PROMOTIONAL_FUND: 'Promotional Fund',
  CO_OP_FUND: 'Co-Op Fund',
};

export default function FundDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch fund
  const { data: fund, isLoading } = useFund(id || '');
  const deleteFund = useDeleteFund();
  const { toast } = useToast();

  // Use API data or demo data
  const fundData = fund || demoFund;
  const promotions = demoPromotions; // Would be fetched from API

  const utilizationPercent = fundData.totalBudget > 0
    ? Math.round((fundData.utilizedBudget / fundData.totalBudget) * 100)
    : 0;

  const allocatedPercent = fundData.totalBudget > 0
    ? Math.round((fundData.allocatedBudget / fundData.totalBudget) * 100)
    : 0;

  const handleDelete = async () => {
    try {
      await deleteFund.mutateAsync(id!);
      toast({ title: 'Thành công', description: 'Đã xóa quỹ' });
      navigate('/funds');
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể xóa quỹ', variant: 'destructive' });
    }
  };

  const getUtilizationColor = (percent: number) => {
    if (percent >= 90) return 'text-red-500';
    if (percent >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading fund..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/funds">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{fundData.code}</h1>
              <Badge variant="outline">{fundTypeLabels[fundData.fundType]}</Badge>
            </div>
            <p className="text-muted-foreground">{fundData.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={`/funds/${id}/edit`}>
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
                <AlertDialogTitle>Delete Fund</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this fund? This action cannot be undone.
                  All associated promotions must be reassigned first.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay amount={fundData.totalBudget} size="lg" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Allocated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay amount={fundData.allocatedBudget} size="lg" />
            <p className="text-sm text-muted-foreground">{allocatedPercent}% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Utilized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={getUtilizationColor(utilizationPercent)}>
              <CurrencyDisplay amount={fundData.utilizedBudget} size="lg" />
            </div>
            <p className="text-sm text-muted-foreground">{utilizationPercent}% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-emerald-600 dark:text-emerald-400">
              <CurrencyDisplay amount={fundData.availableBudget} size="lg" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Utilization</CardTitle>
          <CardDescription>Visual breakdown of fund allocation and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Allocated</span>
              <span className="font-medium">{allocatedPercent}%</span>
            </div>
            <Progress value={allocatedPercent} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <CurrencyDisplay amount={fundData.allocatedBudget} size="sm" showToggle={false} />
              <CurrencyDisplay amount={fundData.totalBudget} size="sm" showToggle={false} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Utilized</span>
              <span className={`font-medium ${getUtilizationColor(utilizationPercent)}`}>
                {utilizationPercent}%
              </span>
            </div>
            <Progress value={utilizationPercent} className="h-3 [&>div]:bg-green-500" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <CurrencyDisplay amount={fundData.utilizedBudget} size="sm" showToggle={false} />
              <CurrencyDisplay amount={fundData.totalBudget} size="sm" showToggle={false} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fund Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Tag className="h-4 w-4" /> Fund Code
                </p>
                <p className="font-medium">{fundData.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Wallet className="h-4 w-4" /> Fund Type
                </p>
                <p className="font-medium">{fundTypeLabels[fundData.fundType]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Start Date
                </p>
                <p className="font-medium">{formatDate(fundData.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> End Date
                </p>
                <p className="font-medium">{formatDate(fundData.endDate)}</p>
              </div>
            </div>

            <Separator />

            {fundData.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{fundData.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-xs text-muted-foreground">{formatDate(fundData.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-xs text-muted-foreground">{formatDate(fundData.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Associated Promotions</CardTitle>
                <CardDescription>Promotions using this fund</CardDescription>
              </div>
              <Button asChild>
                <Link to={`/promotions/new?fundId=${id}`}>
                  Create Promotion
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {promotions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No promotions associated yet
              </p>
            ) : (
              <div className="space-y-4">
                {promotions.map((promo) => (
                  <Link
                    key={promo.id}
                    to={`/promotions/${promo.id}`}
                    className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{promo.code}</p>
                        <p className="text-sm text-muted-foreground">{promo.name}</p>
                      </div>
                      <div className="text-right">
                        <CurrencyDisplay amount={promo.budget} size="sm" />
                        <PromotionStatusBadge status={promo.status} />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(safePercentageNumber(promo.actualSpend, promo.budget))}% utilized
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
