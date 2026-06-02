/**
 * Budget Reallocation Page
 * Request and approve budget reallocations between promotions/channels
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowRight,
  ArrowLeftRight,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  Eye,
  Send,
} from 'lucide-react';
import { CurrencyDisplay, formatCurrencyCompact } from '@/components/ui/currency-display';

// Types
interface ReallocationRequest {
  id: string;
  requestCode: string;
  fromSource: string;
  fromType: 'PROMOTION' | 'CHANNEL' | 'REGION';
  toTarget: string;
  toType: 'PROMOTION' | 'CHANNEL' | 'REGION';
  amount: number;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approver?: string;
  approvedAt?: string;
  comment?: string;
}

// Mock data
const mockRequests: ReallocationRequest[] = [
  {
    id: '1',
    requestCode: 'REAL-2026-001',
    fromSource: 'MT Channel Budget',
    fromType: 'CHANNEL',
    toTarget: 'GT Channel Budget',
    toType: 'CHANNEL',
    amount: 500000000,
    reason: 'MT underspend due to delayed Tet campaign. GT showing higher demand.',
    requestedBy: 'Minh Trần',
    requestedAt: '2026-01-25T09:00:00',
    status: 'PENDING',
  },
  {
    id: '2',
    requestCode: 'REAL-2026-002',
    fromSource: 'Pepsi Bundle Promo',
    fromType: 'PROMOTION',
    toTarget: 'Aquafina Summer Promo',
    toType: 'PROMOTION',
    amount: 300000000,
    reason: 'Pepsi Bundle completed under budget. Shift to Aquafina for summer push.',
    requestedBy: 'Lan Phạm',
    requestedAt: '2026-01-24T14:30:00',
    status: 'APPROVED',
    approver: 'Quỳnh Nguyễn',
    approvedAt: '2026-01-25T10:00:00',
    comment: 'Approved. Good resource optimization.',
  },
  {
    id: '3',
    requestCode: 'REAL-2026-003',
    fromSource: 'Miền Bắc Region',
    fromType: 'REGION',
    toTarget: 'Miền Nam Region',
    toType: 'REGION',
    amount: 800000000,
    reason: 'Miền Nam Tet demand exceeding expectations. Need additional budget.',
    requestedBy: 'Hà Nguyễn',
    requestedAt: '2026-01-23T11:00:00',
    status: 'REJECTED',
    approver: 'Quỳnh Nguyễn',
    approvedAt: '2026-01-24T09:00:00',
    comment: 'Rejected. Miền Bắc budget is already committed.',
  },
];

const availableSources = [
  { id: '1', name: 'MT Channel Budget', type: 'CHANNEL', available: 1500000000 },
  { id: '2', name: 'GT Channel Budget', type: 'CHANNEL', available: 800000000 },
  { id: '3', name: 'E-commerce Budget', type: 'CHANNEL', available: 600000000 },
  { id: '4', name: 'Pepsi Bundle Promo', type: 'PROMOTION', available: 300000000 },
  { id: '5', name: 'Miền Bắc Region', type: 'REGION', available: 2000000000 },
  { id: '6', name: 'Miền Nam Region', type: 'REGION', available: 500000000 },
];

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusBadge = (status: ReallocationRequest['status']) => {
  const config = {
    PENDING: { label: 'Pending', variant: 'warning' as const, icon: Clock },
    APPROVED: { label: 'Approved', variant: 'success' as const, icon: CheckCircle },
    REJECTED: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
    CANCELLED: { label: 'Cancelled', variant: 'secondary' as const, icon: XCircle },
  };
  const { label, variant, icon: Icon } = config[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

const getTypeBadge = (type: ReallocationRequest['fromType']) => {
  const config = {
    PROMOTION: { label: 'Promotion', variant: 'default' as const },
    CHANNEL: { label: 'Channel', variant: 'secondary' as const },
    REGION: { label: 'Region', variant: 'outline' as const },
  };
  return <Badge variant={config[type].variant}>{config[type].label}</Badge>;
};

export default function ReallocationPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ReallocationRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    fromSource: '',
    toTarget: '',
    amount: '',
    reason: '',
  });

  // Stats
  const stats = {
    pending: mockRequests.filter((r) => r.status === 'PENDING').length,
    approved: mockRequests.filter((r) => r.status === 'APPROVED').length,
    totalPending: mockRequests
      .filter((r) => r.status === 'PENDING')
      .reduce((sum, r) => sum + r.amount, 0),
    totalApproved: mockRequests
      .filter((r) => r.status === 'APPROVED')
      .reduce((sum, r) => sum + r.amount, 0),
  };

  const handleCreateRequest = () => {
    // Handle request creation
    setIsCreateDialogOpen(false);
    setNewRequest({ fromSource: '', toTarget: '', amount: '', reason: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Reallocation</h1>
          <p className="text-muted-foreground mt-1">
            Request and manage budget transfers between sources
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Reallocation Request</DialogTitle>
              <DialogDescription>
                Request budget transfer between promotions, channels, or regions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Transfer From</Label>
                <Select
                  value={newRequest.fromSource}
                  onValueChange={(v) => setNewRequest({ ...newRequest, fromSource: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{source.name}</span>
                          <span className="text-muted-foreground ml-2">
                            ({formatCurrencyCompact(source.available, 'VND')} available)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <Label>Transfer To</Label>
                <Select
                  value={newRequest.toTarget}
                  onValueChange={(v) => setNewRequest({ ...newRequest, toTarget: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSources
                      .filter((s) => s.id !== newRequest.fromSource)
                      .map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount (VND)</Label>
                <Input
                  type="number"
                  placeholder="500000000"
                  value={newRequest.amount}
                  onChange={(e) => setNewRequest({ ...newRequest, amount: e.target.value })}
                />
                {newRequest.amount && (
                  <p className="text-xs text-muted-foreground">
                    {formatCurrencyCompact(Number(newRequest.amount), 'VND')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Reason for Reallocation</Label>
                <Textarea
                  placeholder="Explain why this reallocation is needed..."
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRequest}>
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CurrencyDisplay amount={stats.totalPending} size="lg" /></div>
            <p className="text-xs text-muted-foreground">To be approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved (MTD)</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Amount</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <CurrencyDisplay amount={stats.totalApproved} size="lg" showToggle={false} />
            </div>
            <p className="text-xs text-muted-foreground">Transferred MTD</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reallocation Requests</CardTitle>
          <CardDescription>View and manage budget reallocation requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead></TableHead>
                  <TableHead>To</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium">{request.requestCode}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {request.reason}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{request.fromSource}</span>
                        {getTypeBadge(request.fromType)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{request.toTarget}</span>
                        {getTypeBadge(request.toType)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      <CurrencyDisplay amount={request.amount} size="sm" />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{request.requestedBy}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(request.requestedAt)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>{selectedRequest?.requestCode}</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              {/* Transfer Info */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="font-medium">{selectedRequest.fromSource}</p>
                    {getTypeBadge(selectedRequest.fromType)}
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground mx-4" />
                  <div className="text-center flex-1">
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="font-medium">{selectedRequest.toTarget}</p>
                    {getTypeBadge(selectedRequest.toType)}
                  </div>
                </div>
                <div className="text-center mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <div className="text-2xl font-bold"><CurrencyDisplay amount={selectedRequest.amount} size="lg" /></div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <Label className="text-muted-foreground">Reason</Label>
                <p className="text-sm mt-1">{selectedRequest.reason}</p>
              </div>

              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Requested By</Label>
                  <p>{selectedRequest.requestedBy}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Requested At</Label>
                  <p>{formatDate(selectedRequest.requestedAt)}</p>
                </div>
              </div>

              {/* Approval Info */}
              {selectedRequest.status !== 'PENDING' && (
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(selectedRequest.status)}
                    {selectedRequest.approver && (
                      <span className="text-sm text-muted-foreground">
                        by {selectedRequest.approver}
                      </span>
                    )}
                  </div>
                  {selectedRequest.comment && (
                    <p className="text-sm">{selectedRequest.comment}</p>
                  )}
                  {selectedRequest.approvedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(selectedRequest.approvedAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Warning for pending */}
              {selectedRequest.status === 'PENDING' && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Pending Approval
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      This request is awaiting approval from the budget manager.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
            {selectedRequest?.status === 'PENDING' && (
              <>
                <Button variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
