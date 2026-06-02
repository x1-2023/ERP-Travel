/**
 * Promotion Deployment Page
 * Deployment checklist, budget lock, and DMS export
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Rocket,
  CheckCircle,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  Send,
  Download,
  FileText,
  Package,
  Calendar,
  DollarSign,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { CurrencyDisplay, formatCurrencyCompact } from '@/components/ui/currency-display';
import { safePercentageNumber } from '@/lib/utils';

// Types
interface DeploymentPromotion {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  budgetLocked: boolean;
  channels: string[];
  regions: string[];
  products: number;
  deploymentStatus: 'DRAFT' | 'READY' | 'DEPLOYING' | 'DEPLOYED' | 'FAILED';
  checklistProgress: number;
  dmsExported: boolean;
}

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  required: boolean;
  note?: string;
}

// Mock data
const mockPromotions: DeploymentPromotion[] = [
  {
    id: '1',
    code: 'PROMO-2026-TET-001',
    name: 'Tết 2026 - Pepsi Bundle Campaign',
    startDate: '2026-01-25',
    endDate: '2026-02-15',
    budget: 2500000000,
    budgetLocked: true,
    channels: ['MT', 'GT'],
    regions: ['Miền Bắc', 'Miền Nam'],
    products: 12,
    deploymentStatus: 'DEPLOYED',
    checklistProgress: 100,
    dmsExported: true,
  },
  {
    id: '2',
    code: 'PROMO-2026-Q1-002',
    name: 'Q1 MT Discount Campaign',
    startDate: '2026-02-01',
    endDate: '2026-03-31',
    budget: 1800000000,
    budgetLocked: true,
    channels: ['MT'],
    regions: ['Toàn quốc'],
    products: 8,
    deploymentStatus: 'DEPLOYING',
    checklistProgress: 75,
    dmsExported: false,
  },
  {
    id: '3',
    code: 'PROMO-2026-Q1-003',
    name: 'Aquafina Summer Promo',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    budget: 1200000000,
    budgetLocked: false,
    channels: ['MT', 'GT', 'E-comm'],
    regions: ['Miền Nam', 'Mekong'],
    products: 5,
    deploymentStatus: 'READY',
    checklistProgress: 60,
    dmsExported: false,
  },
  {
    id: '4',
    code: 'PROMO-2026-Q1-004',
    name: 'GT Rebate Program',
    startDate: '2026-02-15',
    endDate: '2026-04-15',
    budget: 800000000,
    budgetLocked: false,
    channels: ['GT'],
    regions: ['Miền Trung'],
    products: 15,
    deploymentStatus: 'DRAFT',
    checklistProgress: 25,
    dmsExported: false,
  },
];

const mockChecklist: ChecklistItem[] = [
  { id: '1', category: 'Budget', item: 'Budget approval received', status: 'COMPLETED', required: true },
  { id: '2', category: 'Budget', item: 'Budget allocation finalized', status: 'COMPLETED', required: true },
  { id: '3', category: 'Budget', item: 'Budget locked', status: 'PENDING', required: true },
  { id: '4', category: 'Products', item: 'Product selection confirmed', status: 'COMPLETED', required: true },
  { id: '5', category: 'Products', item: 'Pricing rules validated', status: 'COMPLETED', required: true },
  { id: '6', category: 'Products', item: 'Stock availability checked', status: 'PENDING', required: true },
  { id: '7', category: 'Channels', item: 'Channel targeting configured', status: 'COMPLETED', required: true },
  { id: '8', category: 'Channels', item: 'Retailer list finalized', status: 'PENDING', required: true },
  { id: '9', category: 'Integration', item: 'DMS integration tested', status: 'PENDING', required: true },
  { id: '10', category: 'Integration', item: 'ERP sync configured', status: 'SKIPPED', required: false },
  { id: '11', category: 'Approval', item: 'Legal compliance reviewed', status: 'COMPLETED', required: true },
  { id: '12', category: 'Approval', item: 'Final approval obtained', status: 'PENDING', required: true },
];

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusBadge = (status: DeploymentPromotion['deploymentStatus']) => {
  const config = {
    DRAFT: { label: 'Draft', variant: 'secondary' as const, icon: FileText },
    READY: { label: 'Ready', variant: 'default' as const, icon: CheckCircle },
    DEPLOYING: { label: 'Deploying', variant: 'warning' as const, icon: RefreshCw },
    DEPLOYED: { label: 'Deployed', variant: 'success' as const, icon: Rocket },
    FAILED: { label: 'Failed', variant: 'destructive' as const, icon: XCircle },
  };
  const { label, variant, icon: Icon } = config[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

const getChecklistStatusIcon = (status: ChecklistItem['status']) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case 'FAILED':
      return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    case 'SKIPPED':
      return <Clock className="h-4 w-4 text-gray-400" />;
    default:
      return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
  }
};

export default function PromotionDeploymentPage() {
  const [selectedPromotion, setSelectedPromotion] = useState<DeploymentPromotion | null>(null);
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
  const [checklist, setChecklist] = useState(mockChecklist);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Stats
  const stats = {
    total: mockPromotions.length,
    deployed: mockPromotions.filter((p) => p.deploymentStatus === 'DEPLOYED').length,
    ready: mockPromotions.filter((p) => p.deploymentStatus === 'READY').length,
    pending: mockPromotions.filter((p) => ['DRAFT', 'DEPLOYING'].includes(p.deploymentStatus)).length,
  };

  // Filter promotions
  const filteredPromotions =
    filterStatus === 'all'
      ? mockPromotions
      : mockPromotions.filter((p) => p.deploymentStatus === filterStatus);

  // Checklist stats
  const checklistCompleted = checklist.filter((c) => c.status === 'COMPLETED').length;
  const checklistTotal = checklist.filter((c) => c.required).length;
  const checklistProgress = safePercentageNumber(checklistCompleted, checklistTotal);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }
          : item
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotion Deployment</h1>
          <p className="text-muted-foreground mt-1">
            Deploy promotions to DMS with budget lock and checklist verification
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Promotions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">In deployment pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed</CardTitle>
            <Rocket className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.deployed}</div>
            <p className="text-xs text-muted-foreground">Live in DMS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.ready}</div>
            <p className="text-xs text-muted-foreground">Awaiting deployment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Preparing or deploying</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Promotion List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Deployment Queue</CardTitle>
                <CardDescription>Select a promotion to view deployment details</CardDescription>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="READY">Ready</SelectItem>
                  <SelectItem value="DEPLOYING">Deploying</SelectItem>
                  <SelectItem value="DEPLOYED">Deployed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredPromotions.map((promo) => (
                <div
                  key={promo.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPromotion?.id === promo.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPromotion(promo)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{promo.name}</span>
                        {getStatusBadge(promo.deploymentStatus)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{promo.code}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrencyCompact(promo.budget, 'VND')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {promo.budgetLocked ? (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Unlock className="h-3 w-3" />
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2">
                        <Progress value={promo.checklistProgress} className="w-24 h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {promo.checklistProgress}% ready
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deployment Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Deployment Checklist</CardTitle>
            <CardDescription>
              {selectedPromotion
                ? selectedPromotion.name
                : 'Select a promotion to view checklist'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPromotion ? (
              <div className="space-y-4">
                {/* Progress */}
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Completion</span>
                    <span className="text-sm">{checklistProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={checklistProgress} className="h-2" />
                </div>

                {/* Checklist Items */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-2 hover:bg-muted rounded"
                    >
                      <Checkbox
                        checked={item.status === 'COMPLETED'}
                        onCheckedChange={() => toggleChecklistItem(item.id)}
                        disabled={item.status === 'SKIPPED'}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm ${
                              item.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {item.item}
                          </span>
                          {item.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      {getChecklistStatusIcon(item.status)}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t">
                  {!selectedPromotion.budgetLocked && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsLockDialogOpen(true)}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Lock Budget
                    </Button>
                  )}
                  <Button
                    className="w-full"
                    disabled={
                      !selectedPromotion.budgetLocked ||
                      selectedPromotion.deploymentStatus === 'DEPLOYED'
                    }
                    onClick={() => setIsDeployDialogOpen(true)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Deploy to DMS
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Export Configuration
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Rocket className="h-12 w-12 mb-4 opacity-50" />
                <p>Select a promotion from the list</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lock Budget Dialog */}
      <Dialog open={isLockDialogOpen} onOpenChange={setIsLockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lock Budget</DialogTitle>
            <DialogDescription>
              Locking the budget will prevent any further changes to the budget allocation.
              This action is required before deployment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedPromotion && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedPromotion.name}</p>
                <p className="text-2xl font-bold mt-2">
                  <CurrencyDisplay amount={selectedPromotion.budget} size="lg" />
                </p>
              </div>
            )}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Warning</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Budget cannot be modified after locking. Make sure all allocations are correct.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsLockDialogOpen(false)}>
              <Lock className="mr-2 h-4 w-4" />
              Confirm Lock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deploy Dialog */}
      <Dialog open={isDeployDialogOpen} onOpenChange={setIsDeployDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy to DMS</DialogTitle>
            <DialogDescription>
              This will send the promotion configuration to the Distribution Management System.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedPromotion && (
              <>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium">{selectedPromotion.name}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Channels:</span>
                      <p>{selectedPromotion.channels.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Regions:</span>
                      <p>{selectedPromotion.regions.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Products:</span>
                      <p>{selectedPromotion.products} SKUs</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Budget:</span>
                      <p>{formatCurrencyCompact(selectedPromotion.budget, 'VND')}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Deployment Notes (Optional)</Label>
                  <Textarea placeholder="Add any notes for the deployment..." rows={3} />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeployDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsDeployDialogOpen(false)}>
              <Rocket className="mr-2 h-4 w-4" />
              Deploy Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
