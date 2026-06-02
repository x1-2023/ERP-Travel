/**
 * Claims Settlement Page - Phase 6 Enhanced
 * Settlement process with reconciliation and payment tracking
 * Connected to real API with demo data fallback
 */

import { useState, useMemo } from 'react';
import { useSettlements } from '@/hooks/useSettlements';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileCheck,
  AlertTriangle,
  Search,
  Download,
  Send,
  Eye,
  Receipt,
  CreditCard,
  Building2,
} from 'lucide-react';
import { CurrencyDisplay } from '@/components/ui/currency-display';

// Types
interface ClaimSettlement {
  id: string;
  claimCode: string;
  customerName: string;
  customerCode: string;
  promotionName: string;
  claimAmount: number;
  verifiedAmount: number;
  adjustments: number;
  settlementAmount: number;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'PENDING_SETTLEMENT' | 'SETTLED' | 'REJECTED';
  submittedAt: string;
  verifiedAt?: string;
  settledAt?: string;
  paymentMethod?: 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT_NOTE';
  paymentRef?: string;
}

// Mock data
const mockClaims: ClaimSettlement[] = [
  {
    id: '1',
    claimCode: 'CLM-2026-0001',
    customerName: 'Big C Thăng Long',
    customerCode: 'CUST-001',
    promotionName: 'Tết 2026 Pepsi Bundle',
    claimAmount: 125000000,
    verifiedAmount: 120000000,
    adjustments: -5000000,
    settlementAmount: 120000000,
    status: 'PENDING_SETTLEMENT',
    submittedAt: '2026-01-20T10:00:00',
    verifiedAt: '2026-01-22T14:30:00',
  },
  {
    id: '2',
    claimCode: 'CLM-2026-0002',
    customerName: 'Vinmart Lê Văn Lương',
    customerCode: 'CUST-002',
    promotionName: 'Q1 MT Discount',
    claimAmount: 85000000,
    verifiedAmount: 85000000,
    adjustments: 0,
    settlementAmount: 85000000,
    status: 'SETTLED',
    submittedAt: '2026-01-18T09:00:00',
    verifiedAt: '2026-01-19T11:00:00',
    settledAt: '2026-01-23T10:00:00',
    paymentMethod: 'BANK_TRANSFER',
    paymentRef: 'TXN-2026012300123',
  },
  {
    id: '3',
    claimCode: 'CLM-2026-0003',
    customerName: 'Coopmart Nguyễn Đình Chiểu',
    customerCode: 'CUST-003',
    promotionName: 'Tết 2026 Pepsi Bundle',
    claimAmount: 200000000,
    verifiedAmount: 0,
    adjustments: 0,
    settlementAmount: 0,
    status: 'PENDING_VERIFICATION',
    submittedAt: '2026-01-25T15:00:00',
  },
  {
    id: '4',
    claimCode: 'CLM-2026-0004',
    customerName: 'Lotte Mart Gò Vấp',
    customerCode: 'CUST-004',
    promotionName: 'Aquafina Display',
    claimAmount: 45000000,
    verifiedAmount: 30000000,
    adjustments: -15000000,
    settlementAmount: 30000000,
    status: 'VERIFIED',
    submittedAt: '2026-01-22T08:30:00',
    verifiedAt: '2026-01-24T16:00:00',
  },
  {
    id: '5',
    claimCode: 'CLM-2026-0005',
    customerName: 'MM Mega Market',
    customerCode: 'CUST-005',
    promotionName: 'POSM Campaign',
    claimAmount: 75000000,
    verifiedAmount: 0,
    adjustments: 0,
    settlementAmount: 0,
    status: 'REJECTED',
    submittedAt: '2026-01-15T11:00:00',
    verifiedAt: '2026-01-17T10:00:00',
  },
];

const getStatusBadge = (status: ClaimSettlement['status']) => {
  const config = {
    PENDING_VERIFICATION: { label: 'Pending Verification', variant: 'warning' as const, icon: Clock },
    VERIFIED: { label: 'Verified', variant: 'default' as const, icon: FileCheck },
    PENDING_SETTLEMENT: { label: 'Pending Settlement', variant: 'secondary' as const, icon: DollarSign },
    SETTLED: { label: 'Settled', variant: 'success' as const, icon: CheckCircle },
    REJECTED: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
  };
  const { label, variant, icon: Icon } = config[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

const getPaymentMethodBadge = (method?: ClaimSettlement['paymentMethod']) => {
  if (!method) return null;
  const config = {
    BANK_TRANSFER: { label: 'Bank Transfer', icon: Building2 },
    CHEQUE: { label: 'Cheque', icon: CreditCard },
    CREDIT_NOTE: { label: 'Credit Note', icon: Receipt },
  };
  const { label, icon: Icon } = config[method];
  return (
    <Badge variant="outline" className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export default function ClaimsSettlementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [isSettleDialogOpen, setIsSettleDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedClaimForDetail, setSelectedClaimForDetail] = useState<ClaimSettlement | null>(null);
  const [settlementDetails, setSettlementDetails] = useState({
    paymentMethod: 'BANK_TRANSFER',
    bankAccount: '',
    reference: '',
    notes: '',
  });

  // Real API data
  const { data: settlementData } = useSettlements({});

  const handleViewClaimDetail = (claim: ClaimSettlement) => {
    setSelectedClaimForDetail(claim);
    setIsDetailDialogOpen(true);
  };

  // Use API data mapped to component format, or fallback to mock
  const allClaims = useMemo(() => {
    if (settlementData?.settlements?.length) {
      return settlementData.settlements.map((s: any) => ({
        id: s.id,
        claimCode: s.claim?.code || s.code || s.id.slice(0, 8),
        customerName: s.claim?.customer?.name || 'N/A',
        customerCode: s.claim?.customer?.code || '',
        promotionName: s.claim?.promotion?.name || '',
        claimAmount: Number(s.claim?.amount || s.settledAmount || 0),
        verifiedAmount: Number(s.settledAmount || 0),
        adjustments: Number(s.variance || 0),
        settlementAmount: Number(s.settledAmount || s.amount || 0),
        status: s.status === 'PAID' ? 'SETTLED' : s.status === 'PENDING' ? 'PENDING_SETTLEMENT' : s.status === 'APPROVED' ? 'VERIFIED' : 'PENDING_VERIFICATION',
        submittedAt: s.createdAt,
        verifiedAt: s.approvedAt,
        settledAt: s.paymentDate,
        paymentMethod: s.paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : s.paymentMethod === 'CHECK' ? 'CHEQUE' : s.paymentMethod === 'CREDIT_NOTE' ? 'CREDIT_NOTE' : undefined,
        paymentRef: s.paymentReference,
      })) as ClaimSettlement[];
    }
    return mockClaims;
  }, [settlementData]);

  // Filter claims
  const filteredClaims = allClaims.filter((claim) => {
    const matchesSearch =
      claim.claimCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    pendingVerification: allClaims.filter((c) => c.status === 'PENDING_VERIFICATION').length,
    pendingSettlement: allClaims.filter((c) => c.status === 'PENDING_SETTLEMENT').length,
    totalPendingAmount: allClaims
      .filter((c) => c.status === 'PENDING_SETTLEMENT')
      .reduce((sum, c) => sum + c.settlementAmount, 0),
    settledMTD: allClaims
      .filter((c) => c.status === 'SETTLED')
      .reduce((sum, c) => sum + c.settlementAmount, 0),
  };

  const toggleClaimSelection = (id: string) => {
    setSelectedClaims((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectAllPendingSettlement = () => {
    const pendingIds = filteredClaims
      .filter((c) => c.status === 'PENDING_SETTLEMENT')
      .map((c) => c.id);
    setSelectedClaims(pendingIds);
  };

  const handleBatchSettle = () => {
    setIsSettleDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thanh toán Claims</h1>
          <p className="text-muted-foreground mt-1">
            Xác minh và thanh toán claims khách hàng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            disabled={selectedClaims.length === 0}
            onClick={handleBatchSettle}
          >
            <Send className="mr-2 h-4 w-4" />
            Settle Selected ({selectedClaims.length})
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVerification}</div>
            <p className="text-xs text-muted-foreground">Claims to verify</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Settlement</CardTitle>
            <FileCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSettlement}</div>
            <p className="text-xs text-muted-foreground">Verified, awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CurrencyDisplay amount={stats.totalPendingAmount} size="lg" /></div>
            <p className="text-xs text-muted-foreground">To be settled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settled (MTD)</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <CurrencyDisplay amount={stats.settledMTD} size="lg" showToggle={false} />
            </div>
            <p className="text-xs text-muted-foreground">Paid this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Settlement Queue</CardTitle>
              <CardDescription>Manage claim verification and settlement</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAllPendingSettlement}>
                Select All Ready
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by claim code or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING_VERIFICATION">Pending Verification</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="PENDING_SETTLEMENT">Pending Settlement</SelectItem>
                <SelectItem value="SETTLED">Settled</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Claim</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Claimed</TableHead>
                  <TableHead className="text-right">Verified</TableHead>
                  <TableHead className="text-right">Settlement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedClaims.includes(claim.id)}
                        onCheckedChange={() => toggleClaimSelection(claim.id)}
                        disabled={claim.status !== 'PENDING_SETTLEMENT'}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{claim.claimCode}</div>
                      <div className="text-sm text-muted-foreground">{claim.promotionName}</div>
                    </TableCell>
                    <TableCell>
                      <div>{claim.customerName}</div>
                      <div className="text-xs text-muted-foreground">{claim.customerCode}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <CurrencyDisplay amount={claim.claimAmount} size="sm" />
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {claim.verifiedAmount > 0 ? (
                        <span className={claim.adjustments < 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                          <CurrencyDisplay amount={claim.verifiedAmount} size="sm" showToggle={false} />
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {claim.settlementAmount > 0 ? (
                        <CurrencyDisplay amount={claim.settlementAmount} size="sm" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell>
                      {claim.paymentMethod ? (
                        <div>
                          {getPaymentMethodBadge(claim.paymentMethod)}
                          {claim.paymentRef && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {claim.paymentRef}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewClaimDetail(claim)}
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

      {/* Settlement Dialog */}
      <Dialog open={isSettleDialogOpen} onOpenChange={setIsSettleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Process Settlement</DialogTitle>
            <DialogDescription>
              Settle {selectedClaims.length} selected claim(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Claims</p>
                  <p className="text-lg font-bold">{selectedClaims.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <div className="text-lg font-bold">
                    <CurrencyDisplay
                      amount={mockClaims
                        .filter((c) => selectedClaims.includes(c.id))
                        .reduce((sum, c) => sum + c.settlementAmount, 0)}
                      size="md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={settlementDetails.paymentMethod}
                onValueChange={(v) =>
                  setSettlementDetails({ ...settlementDetails, paymentMethod: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="CREDIT_NOTE">Credit Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settlementDetails.paymentMethod === 'BANK_TRANSFER' && (
              <div className="space-y-2">
                <Label>Bank Account</Label>
                <Input
                  placeholder="Enter bank account number"
                  value={settlementDetails.bankAccount}
                  onChange={(e) =>
                    setSettlementDetails({ ...settlementDetails, bankAccount: e.target.value })
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Payment Reference</Label>
              <Input
                placeholder="Enter payment reference"
                value={settlementDetails.reference}
                onChange={(e) =>
                  setSettlementDetails({ ...settlementDetails, reference: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add settlement notes..."
                value={settlementDetails.notes}
                onChange={(e) =>
                  setSettlementDetails({ ...settlementDetails, notes: e.target.value })
                }
                rows={2}
              />
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Confirm Settlement
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  This action will mark the selected claims as settled and cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsSettleDialogOpen(false)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Process Settlement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Claim Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
            <DialogDescription>
              {selectedClaimForDetail?.claimCode}
            </DialogDescription>
          </DialogHeader>
          {selectedClaimForDetail && (
            <div className="space-y-6 py-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedClaimForDetail.status)}
                {selectedClaimForDetail.settledAt && (
                  <span className="text-xs text-muted-foreground">
                    Settled: {new Date(selectedClaimForDetail.settledAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>

              {/* Customer Information */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Customer Name</p>
                    <p className="font-medium">{selectedClaimForDetail.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Customer Code</p>
                    <p className="font-medium">{selectedClaimForDetail.customerCode}</p>
                  </div>
                </div>
              </div>

              {/* Promotion Details */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Promotion Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Promotion Name</p>
                    <p className="font-medium">{selectedClaimForDetail.promotionName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted Date</p>
                    <p className="font-medium">
                      {new Date(selectedClaimForDetail.submittedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount Information */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Amount Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Claimed Amount</span>
                    <CurrencyDisplay amount={selectedClaimForDetail.claimAmount} size="sm" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Verified Amount</span>
                    <CurrencyDisplay
                      amount={selectedClaimForDetail.verifiedAmount}
                      size="sm"
                      valueClassName={selectedClaimForDetail.verifiedAmount !== selectedClaimForDetail.claimAmount ? 'text-yellow-600' : ''}
                    />
                  </div>
                  {selectedClaimForDetail.adjustments !== 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Adjustments</span>
                      <CurrencyDisplay
                        amount={selectedClaimForDetail.adjustments}
                        size="sm"
                        valueClassName={selectedClaimForDetail.adjustments < 0 ? 'text-red-600' : 'text-green-600'}
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Settlement Amount</span>
                    <CurrencyDisplay
                      amount={selectedClaimForDetail.settlementAmount}
                      size="md"
                      valueClassName="text-primary font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information (if settled) */}
              {selectedClaimForDetail.status === 'SETTLED' && selectedClaimForDetail.paymentMethod && (
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CreditCard className="h-4 w-4" />
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-700 dark:text-green-300">Payment Method</p>
                      <p className="font-medium text-green-800 dark:text-green-200">
                        {selectedClaimForDetail.paymentMethod === 'BANK_TRANSFER' && 'Bank Transfer'}
                        {selectedClaimForDetail.paymentMethod === 'CHEQUE' && 'Cheque'}
                        {selectedClaimForDetail.paymentMethod === 'CREDIT_NOTE' && 'Credit Note'}
                      </p>
                    </div>
                    {selectedClaimForDetail.paymentRef && (
                      <div>
                        <p className="text-green-700 dark:text-green-300">Payment Reference</p>
                        <p className="font-medium text-green-800 dark:text-green-200">
                          {selectedClaimForDetail.paymentRef}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
