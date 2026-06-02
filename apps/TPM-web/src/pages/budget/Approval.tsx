/**
 * Budget Approval Page
 * Workflow phê duyệt ngân sách với multi-level approval (Aforza-style)
 * Connected to real APIs
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Send,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { toast } from '@/hooks/useToast';
import {
  useBudgets,
  useSubmitBudget,
  useReviewBudget,
  useApprovalHistory,
} from '@/hooks/useBudgets';

// Types
type ApprovalStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_NEEDED';
type FundType = 'PROMOTIONAL' | 'TACTICAL' | 'FIXED_INVESTMENT' | 'TRADE_SPEND' | 'LISTING_FEE' | 'DISPLAY';

interface Budget {
  id: string;
  code: string;
  name: string;
  description?: string;
  fundType: FundType;
  year: number;
  quarter?: number;
  totalAmount: number;
  allocatedAmount: number;
  spentAmount: number;
  approvalStatus: ApprovalStatus;
  approvalLevel: number;
  currentLevel: number;
  status: string;
  createdBy?: string;
  createdAt: string;
  utilizationRate: number;
  allocationRate: number;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getApprovalStatusBadge = (status: ApprovalStatus) => {
  const config: Record<ApprovalStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'success'; icon: typeof Clock }> = {
    DRAFT: { label: 'Draft', variant: 'secondary', icon: Clock },
    SUBMITTED: { label: 'Submitted', variant: 'warning', icon: Send },
    UNDER_REVIEW: { label: 'Under Review', variant: 'warning', icon: Clock },
    APPROVED: { label: 'Approved', variant: 'success', icon: CheckCircle },
    REJECTED: { label: 'Rejected', variant: 'destructive', icon: XCircle },
    REVISION_NEEDED: { label: 'Revision Needed', variant: 'outline', icon: RotateCcw },
  };
  const { label, variant, icon: Icon } = config[status] || config.DRAFT;
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

const getFundTypeBadge = (type: FundType) => {
  const config: Record<FundType, { label: string; className: string }> = {
    PROMOTIONAL: { label: 'Promotional', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
    TACTICAL: { label: 'Tactical', className: 'bg-purple-500/15 text-purple-700 dark:text-purple-400' },
    FIXED_INVESTMENT: { label: 'Fixed Investment', className: 'bg-green-500/15 text-green-700 dark:text-green-400' },
    TRADE_SPEND: { label: 'Trade Spend', className: 'bg-orange-500/15 text-orange-700 dark:text-orange-400' },
    LISTING_FEE: { label: 'Listing Fee', className: 'bg-pink-500/15 text-pink-700 dark:text-pink-400' },
    DISPLAY: { label: 'Display', className: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400' },
  };
  const { label, className } = config[type] || config.PROMOTIONAL;
  return <Badge className={className}>{label}</Badge>;
};

// Approval History Dialog Component
function ApprovalHistoryDialog({
  budgetId,
  isOpen,
  onClose,
}: {
  budgetId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: historyData, isLoading } = useApprovalHistory(budgetId);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Approval History</DialogTitle>
          <DialogDescription>
            {historyData?.budget?.code} - {historyData?.budget?.name}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : historyData ? (
          <div className="space-y-4">
            {/* Workflow Progress */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Approval Progress</span>
                <Badge variant="outline">{historyData.workflow.progress}% Complete</Badge>
              </div>
              <div className="flex items-center gap-2">
                {historyData.workflow.levels.map((level: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        level.status === 'APPROVED'
                          ? 'bg-green-500 text-white'
                          : level.status === 'UNDER_REVIEW'
                          ? 'bg-yellow-500 text-white'
                          : level.status === 'REJECTED'
                          ? 'bg-red-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {level.level}
                    </div>
                    {idx < historyData.workflow.levels.length - 1 && (
                      <div className={`h-1 w-8 ${level.status === 'APPROVED' ? 'bg-green-500' : 'bg-border'}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                {historyData.workflow.levels.map((level: any, idx: number) => (
                  <div key={idx} className="text-center" style={{ width: '40px' }}>
                    {level.role.split(' ')[0]}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <Label className="text-muted-foreground">Approval Timeline</Label>
              <div className="mt-2 space-y-3 max-h-[300px] overflow-y-auto">
                {historyData.timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No approval history yet.</p>
                ) : (
                  historyData.timeline.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        item.status === 'APPROVED'
                          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900'
                          : item.status === 'REJECTED'
                          ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900'
                          : item.status === 'UNDER_REVIEW'
                          ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900'
                          : ''
                      }`}
                    >
                      <div
                        className={`mt-0.5 rounded-full p-1 ${
                          item.status === 'APPROVED'
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600'
                            : item.status === 'REJECTED'
                            ? 'bg-red-100 dark:bg-red-900/50 text-red-600'
                            : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600'
                        }`}
                      >
                        {item.status === 'APPROVED' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : item.status === 'REJECTED' ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{item.reviewer || 'Pending'}</span>
                            <span className="text-muted-foreground"> - {item.role}</span>
                          </div>
                          <Badge variant="outline">Level {item.level}</Badge>
                        </div>
                        {item.comments && (
                          <p className="text-sm mt-1">{item.comments}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>Submitted: {formatDate(item.submittedAt)}</span>
                          {item.reviewedAt && (
                            <span>Reviewed: {formatDate(item.reviewedAt)}</span>
                          )}
                          {item.duration !== null && (
                            <span>Duration: {item.duration}h</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{historyData.summary.totalSteps}</div>
                <div className="text-xs text-muted-foreground">Total Steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{historyData.summary.approved}</div>
                <div className="text-xs text-muted-foreground">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{historyData.summary.pending}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">
                  {historyData.summary.avgReviewTimeHours ?? '-'}h
                </div>
                <div className="text-xs text-muted-foreground">Avg Review Time</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>No approval history available</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BudgetApprovalPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [_isDetailOpen, _setIsDetailOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'revision_needed' | 'submit'>('approve');
  const [actionComment, setActionComment] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyBudgetId, setHistoryBudgetId] = useState('');

  // Build filter based on tab
  const getApprovalStatusFilter = () => {
    switch (selectedTab) {
      case 'pending':
        return 'SUBMITTED,UNDER_REVIEW';
      case 'approved':
        return 'APPROVED';
      case 'rejected':
        return 'REJECTED,REVISION_NEEDED';
      default:
        return undefined;
    }
  };

  // Fetch budgets
  const { data, isLoading, refetch } = useBudgets({
    approvalStatus: getApprovalStatusFilter(),
    search: searchQuery || undefined,
    pageSize: 50,
  });

  const budgets = (data?.budgets || []) as Budget[];

  // Mutations
  const submitMutation = useSubmitBudget();
  const reviewMutation = useReviewBudget();

  // Calculate stats
  const allBudgetsQuery = useBudgets({ pageSize: 100 });
  const allBudgets = (allBudgetsQuery.data?.budgets || []) as Budget[];

  const stats = {
    pending: allBudgets.filter((b) => b.approvalStatus === 'SUBMITTED' || b.approvalStatus === 'UNDER_REVIEW').length,
    approved: allBudgets.filter((b) => b.approvalStatus === 'APPROVED').length,
    rejected: allBudgets.filter((b) => b.approvalStatus === 'REJECTED' || b.approvalStatus === 'REVISION_NEEDED').length,
    totalPendingAmount: allBudgets
      .filter((b) => b.approvalStatus === 'SUBMITTED' || b.approvalStatus === 'UNDER_REVIEW')
      .reduce((sum, b) => sum + b.totalAmount, 0),
  };

  // Handlers
  const handleSubmitForApproval = async () => {
    if (!selectedBudget) return;

    try {
      await submitMutation.mutateAsync(selectedBudget.id);
      toast({ title: 'Success', description: 'Budget submitted for approval' });
      setIsActionDialogOpen(false);
      setActionComment('');
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', variant: 'destructive', description: error.response?.data?.error || 'Failed to submit budget' });
    }
  };

  const handleReview = async (action: 'approve' | 'reject' | 'revision_needed') => {
    if (!selectedBudget) return;

    if ((action === 'reject' || action === 'revision_needed') && !actionComment) {
      toast({ title: 'Error', variant: 'destructive', description: 'Please provide a comment' });
      return;
    }

    try {
      await reviewMutation.mutateAsync({
        budgetId: selectedBudget.id,
        action,
        comments: actionComment || undefined,
      });
      toast({
        title: 'Success',
        description: action === 'approve'
          ? 'Budget approved'
          : action === 'reject'
          ? 'Budget rejected'
          : 'Revision requested'
      });
      setIsActionDialogOpen(false);
      setActionComment('');
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', variant: 'destructive', description: error.response?.data?.error || 'Failed to process review' });
    }
  };

  const openActionDialog = (budget: Budget, type: 'approve' | 'reject' | 'revision_needed' | 'submit') => {
    setSelectedBudget(budget);
    setActionType(type);
    setActionComment('');
    setIsActionDialogOpen(true);
  };

  const openHistory = (budgetId: string) => {
    setHistoryBudgetId(budgetId);
    setIsHistoryOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Approval</h1>
          <p className="text-muted-foreground mt-1">
            Multi-level approval workflow (Aforza-style)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">budgets waiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={stats.totalPendingAmount} size="lg" />
            </div>
            <p className="text-xs text-muted-foreground">total value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">this period</p>
          </CardContent>
        </Card>
      </div>

      {/* Approval Queue */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Approval Queue</CardTitle>
              <CardDescription>Review and process budget requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tabs & Search */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-4">
            <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as typeof selectedTab)} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="pending">
                  Pending ({stats.pending})
                </TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search budgets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Budget</TableHead>
                  <TableHead>Fund Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[60px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                    </TableRow>
                  ))
                ) : budgets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No budgets found
                    </TableCell>
                  </TableRow>
                ) : (
                  budgets.map((budget) => (
                    <TableRow key={budget.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{budget.name}</div>
                          <div className="text-sm text-muted-foreground">{budget.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getFundTypeBadge(budget.fundType)}</TableCell>
                      <TableCell className="text-right">
                        <div className="font-mono">
                          <CurrencyDisplay amount={budget.totalAmount} size="sm" />
                        </div>
                      </TableCell>
                      <TableCell>
                        Q{budget.quarter || 'A'}/{budget.year}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: budget.approvalLevel }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-2 w-6 rounded-full ${
                                idx < budget.currentLevel
                                  ? budget.approvalStatus === 'REJECTED'
                                    ? 'bg-red-500'
                                    : 'bg-green-500'
                                  : idx === budget.currentLevel && (budget.approvalStatus === 'SUBMITTED' || budget.approvalStatus === 'UNDER_REVIEW')
                                  ? 'bg-yellow-500'
                                  : 'bg-border'
                              }`}
                              title={`Level ${idx + 1}`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            {budget.currentLevel}/{budget.approvalLevel}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getApprovalStatusBadge(budget.approvalStatus)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openHistory(budget.id)}
                            title="View History"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {budget.approvalStatus === 'DRAFT' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600"
                              onClick={() => openActionDialog(budget, 'submit')}
                              title="Submit for Approval"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}

                          {(budget.approvalStatus === 'SUBMITTED' || budget.approvalStatus === 'UNDER_REVIEW') && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-emerald-600"
                                onClick={() => openActionDialog(budget, 'approve')}
                                title="Approve"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={() => openActionDialog(budget, 'reject')}
                                title="Reject"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-orange-600"
                                onClick={() => openActionDialog(budget, 'revision_needed')}
                                title="Request Revision"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {budget.approvalStatus === 'REVISION_NEEDED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600"
                              onClick={() => openActionDialog(budget, 'submit')}
                              title="Resubmit"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'submit' && 'Submit for Approval'}
              {actionType === 'approve' && 'Approve Budget'}
              {actionType === 'reject' && 'Reject Budget'}
              {actionType === 'revision_needed' && 'Request Revision'}
            </DialogTitle>
            <DialogDescription>
              {selectedBudget?.code} - {selectedBudget?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedBudget && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <div className="font-mono font-medium">
                    <CurrencyDisplay amount={selectedBudget.totalAmount} />
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Approval Level</Label>
                  <div className="font-medium">
                    Level {selectedBudget.currentLevel + 1} of {selectedBudget.approvalLevel}
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="comment">
                Comment {(actionType === 'reject' || actionType === 'revision_needed') && '(Required)'}
              </Label>
              <Textarea
                id="comment"
                placeholder={
                  actionType === 'approve' ? 'Optional approval comment...' :
                  actionType === 'submit' ? 'Optional note for reviewers...' :
                  'Please explain the reason...'
                }
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>

            {actionType === 'submit' && (
              <Button onClick={handleSubmitForApproval} disabled={submitMutation.isPending}>
                {submitMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit
              </Button>
            )}

            {actionType === 'approve' && (
              <Button onClick={() => handleReview('approve')} disabled={reviewMutation.isPending}>
                {reviewMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                Approve
              </Button>
            )}

            {actionType === 'reject' && (
              <Button
                variant="destructive"
                onClick={() => handleReview('reject')}
                disabled={reviewMutation.isPending || !actionComment}
              >
                {reviewMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsDown className="mr-2 h-4 w-4" />}
                Reject
              </Button>
            )}

            {actionType === 'revision_needed' && (
              <Button
                variant="outline"
                onClick={() => handleReview('revision_needed')}
                disabled={reviewMutation.isPending || !actionComment}
              >
                {reviewMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                Request Revision
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval History Dialog */}
      <ApprovalHistoryDialog
        budgetId={historyBudgetId}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
