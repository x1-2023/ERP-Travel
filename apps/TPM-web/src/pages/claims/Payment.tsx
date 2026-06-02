// ============================================================================
// CLAIMS PAYMENT PAGE - Phase 6 Enhanced
// Payment processing and tracking for approved claims
// Connected to real API with demo data fallback
// ============================================================================

import { useState, useMemo } from 'react';
import { useSettlements } from '@/hooks/useSettlements';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Download,
  MoreHorizontal,
  CreditCard,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Send,
  Printer,
  Eye,
  Edit2,
  Trash2,
  Plus,
  DollarSign,
  ArrowUpRight,
  Receipt,
  Wallet,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';

// ============================================================================
// TYPES
// ============================================================================

interface PaymentItem {
  id: string;
  claimId: string;
  claimCode: string;
  promotionCode: string;
  promotionName: string;
  customerCode: string;
  customerName: string;
  
  // Amounts
  claimAmount: number;
  approvedAmount: number;
  paidAmount: number;
  pendingAmount: number;
  
  // Payment details
  paymentMethod: 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT_NOTE' | 'OFFSET';
  bankAccount?: string;
  bankName?: string;
  chequeNumber?: string;
  
  // Status
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PARTIAL' | 'PAID' | 'FAILED' | 'CANCELLED';
  
  // Dates
  claimDate: string;
  approvedDate: string;
  dueDate: string;
  paidDate?: string;
  
  // Audit
  processedBy?: string;
  notes?: string;
}

interface PaymentSummary {
  totalClaims: number;
  totalAmount: number;
  pendingAmount: number;
  processingAmount: number;
  paidAmount: number;
  overdueCount: number;
  overdueAmount: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockPayments: PaymentItem[] = [
  {
    id: '1',
    claimId: 'CLM001',
    claimCode: 'CLM-2026-0001',
    promotionCode: 'PRO-TET-2026',
    promotionName: 'Khuyến mãi Tết 2026',
    customerCode: 'KH001',
    customerName: 'Siêu thị Big C Thăng Long',
    claimAmount: 125000000,
    approvedAmount: 120000000,
    paidAmount: 0,
    pendingAmount: 120000000,
    paymentMethod: 'BANK_TRANSFER',
    bankAccount: '1234567890',
    bankName: 'Vietcombank',
    paymentStatus: 'PENDING',
    claimDate: '2026-01-15',
    approvedDate: '2026-01-20',
    dueDate: '2026-02-05',
  },
  {
    id: '2',
    claimId: 'CLM002',
    claimCode: 'CLM-2026-0002',
    promotionCode: 'PRO-Q1-2026',
    promotionName: 'Trade Discount Q1 2026',
    customerCode: 'KH002',
    customerName: 'Vinmart Hà Nội',
    claimAmount: 85000000,
    approvedAmount: 85000000,
    paidAmount: 50000000,
    pendingAmount: 35000000,
    paymentMethod: 'BANK_TRANSFER',
    bankAccount: '0987654321',
    bankName: 'Techcombank',
    paymentStatus: 'PARTIAL',
    claimDate: '2026-01-10',
    approvedDate: '2026-01-15',
    dueDate: '2026-01-30',
    paidDate: '2026-01-22',
  },
  {
    id: '3',
    claimId: 'CLM003',
    claimCode: 'CLM-2026-0003',
    promotionCode: 'PRO-DISPLAY-2026',
    promotionName: 'Display Fee 2026',
    customerCode: 'KH003',
    customerName: 'Co.opmart Đà Nẵng',
    claimAmount: 45000000,
    approvedAmount: 45000000,
    paidAmount: 45000000,
    pendingAmount: 0,
    paymentMethod: 'CHEQUE',
    chequeNumber: 'CHQ-001234',
    paymentStatus: 'PAID',
    claimDate: '2026-01-05',
    approvedDate: '2026-01-08',
    dueDate: '2026-01-25',
    paidDate: '2026-01-20',
    processedBy: 'Nguyễn Văn A',
  },
  {
    id: '4',
    claimId: 'CLM004',
    claimCode: 'CLM-2026-0004',
    promotionCode: 'PRO-REBATE-2026',
    promotionName: 'Volume Rebate Q4 2025',
    customerCode: 'KH004',
    customerName: 'Lotte Mart TP.HCM',
    claimAmount: 200000000,
    approvedAmount: 195000000,
    paidAmount: 0,
    pendingAmount: 195000000,
    paymentMethod: 'CREDIT_NOTE',
    paymentStatus: 'PROCESSING',
    claimDate: '2026-01-18',
    approvedDate: '2026-01-23',
    dueDate: '2026-02-10',
  },
  {
    id: '5',
    claimId: 'CLM005',
    claimCode: 'CLM-2026-0005',
    promotionCode: 'PRO-TET-2026',
    promotionName: 'Khuyến mãi Tết 2026',
    customerCode: 'KH005',
    customerName: 'MM Mega Market',
    claimAmount: 150000000,
    approvedAmount: 145000000,
    paidAmount: 0,
    pendingAmount: 145000000,
    paymentMethod: 'BANK_TRANSFER',
    bankAccount: '5555666677',
    bankName: 'BIDV',
    paymentStatus: 'PENDING',
    claimDate: '2026-01-20',
    approvedDate: '2026-01-25',
    dueDate: '2026-01-28',
  },
];

const mockSummary: PaymentSummary = {
  totalClaims: 48,
  totalAmount: 2850000000,
  pendingAmount: 1200000000,
  processingAmount: 450000000,
  paidAmount: 1150000000,
  overdueCount: 5,
  overdueAmount: 320000000,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getPaymentStatusBadge = (status: PaymentItem['paymentStatus']) => {
  switch (status) {
    case 'PENDING':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Chờ xử lý</Badge>;
    case 'PROCESSING':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Đang xử lý</Badge>;
    case 'PARTIAL':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Thanh toán một phần</Badge>;
    case 'PAID':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Đã thanh toán</Badge>;
    case 'FAILED':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Thất bại</Badge>;
    case 'CANCELLED':
      return <Badge variant="outline" className="bg-muted/50 text-foreground-muted border-border">Đã hủy</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPaymentMethodIcon = (method: PaymentItem['paymentMethod']) => {
  switch (method) {
    case 'BANK_TRANSFER':
      return Building2;
    case 'CHEQUE':
      return FileText;
    case 'CREDIT_NOTE':
      return Receipt;
    case 'OFFSET':
      return ArrowUpRight;
    default:
      return CreditCard;
  }
};

const getPaymentMethodLabel = (method: PaymentItem['paymentMethod']) => {
  switch (method) {
    case 'BANK_TRANSFER':
      return 'Chuyển khoản';
    case 'CHEQUE':
      return 'Séc';
    case 'CREDIT_NOTE':
      return 'Credit Note';
    case 'OFFSET':
      return 'Bù trừ';
    default:
      return method;
  }
};

const isOverdue = (dueDate: string, status: PaymentItem['paymentStatus']) => {
  if (status === 'PAID' || status === 'CANCELLED') return false;
  return new Date(dueDate) < new Date();
};

// ============================================================================
// COMPONENTS
// ============================================================================

// Summary Cards
const SummaryCards = ({ summary }: { summary: PaymentSummary }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Tổng claims</p>
              <p className="text-2xl font-bold">{summary.totalClaims}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Tổng giá trị</p>
              <div className="text-lg font-bold"><CurrencyDisplay amount={summary.totalAmount} size="md" /></div>
            </div>
            <Wallet className="h-8 w-8 text-purple-500 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Chờ xử lý</p>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400"><CurrencyDisplay amount={summary.pendingAmount} size="md" showToggle={false} /></div>
            </div>
            <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Đang xử lý</p>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400"><CurrencyDisplay amount={summary.processingAmount} size="md" showToggle={false} /></div>
            </div>
            <RefreshCw className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Đã thanh toán</p>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400"><CurrencyDisplay amount={summary.paidAmount} size="md" showToggle={false} /></div>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-950/30">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 dark:text-red-400">Quá hạn</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">{summary.overdueCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-950/30">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 dark:text-red-400">Giá trị quá hạn</p>
              <div className="text-lg font-bold text-red-600 dark:text-red-400"><CurrencyDisplay amount={summary.overdueAmount} size="md" showToggle={false} /></div>
            </div>
            <XCircle className="h-8 w-8 text-red-500 opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Payment Table Row
const PaymentRow = ({
  item,
  isSelected,
  onSelect,
  onView,
  onProcess,
}: {
  item: PaymentItem;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onView: (item: PaymentItem) => void;
  onProcess: (item: PaymentItem) => void;
}) => {
  const MethodIcon = getPaymentMethodIcon(item.paymentMethod);
  const overdue = isOverdue(item.dueDate, item.paymentStatus);
  
  return (
    <TableRow className={cn(overdue && 'bg-red-50/50')}>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(item.id, checked as boolean)}
          disabled={item.paymentStatus === 'PAID' || item.paymentStatus === 'CANCELLED'}
        />
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium">{item.claimCode}</div>
          <div className="text-xs text-muted-foreground">{item.promotionCode}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium">{item.customerName}</div>
          <div className="text-xs text-muted-foreground">{item.customerCode}</div>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="font-medium"><CurrencyDisplay amount={item.approvedAmount} size="sm" /></div>
        {item.paidAmount > 0 && (
          <div className="text-xs text-emerald-600 dark:text-emerald-400">Đã TT: <CurrencyDisplay amount={item.paidAmount} size="sm" showToggle={false} /></div>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className={cn('font-medium', item.pendingAmount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400')}>
          <CurrencyDisplay amount={item.pendingAmount} size="sm" showToggle={false} />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <MethodIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{getPaymentMethodLabel(item.paymentMethod)}</span>
        </div>
        {item.bankName && (
          <div className="text-xs text-muted-foreground mt-1">{item.bankName}</div>
        )}
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className={cn('text-sm', overdue && 'text-red-600 font-medium')}>
            {formatDate(item.dueDate)}
          </div>
          {overdue && (
            <Badge variant="destructive" className="text-xs">Quá hạn</Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        {getPaymentStatusBadge(item.paymentStatus)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(item)}>
            <Eye className="h-4 w-4" />
          </Button>
          {(item.paymentStatus === 'PENDING' || item.paymentStatus === 'PARTIAL') && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onProcess(item)}>
              <Send className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit2 className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                In phiếu
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Hủy thanh toán
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Process Payment Dialog
const ProcessPaymentDialog = ({
  item,
  open,
  onOpenChange,
  onProcess,
}: {
  item: PaymentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProcess: (data: any) => void;
}) => {
  const [paymentAmount, setPaymentAmount] = useState(item?.pendingAmount || 0);
  const [notes, setNotes] = useState('');

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Xử lý thanh toán</DialogTitle>
          <DialogDescription>
            {item.claimCode} - {item.customerName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Số tiền đã duyệt</p>
              <div className="text-lg font-bold"><CurrencyDisplay amount={item.approvedAmount} size="md" /></div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Còn phải thanh toán</p>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400"><CurrencyDisplay amount={item.pendingAmount} size="md" showToggle={false} /></div>
            </div>
          </div>
          
          {/* Payment Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Số tiền thanh toán</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                className="pl-9"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                max={item.pendingAmount}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount(item.pendingAmount)}
              >
                Toàn bộ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount(item.pendingAmount / 2)}
              >
                50%
              </Button>
            </div>
          </div>
          
          {/* Payment Method Info */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Phương thức thanh toán</label>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = getPaymentMethodIcon(item.paymentMethod);
                  return <Icon className="h-4 w-4" />;
                })()}
                <span>{getPaymentMethodLabel(item.paymentMethod)}</span>
              </div>
              {item.bankAccount && (
                <div className="text-sm text-muted-foreground mt-1">
                  {item.bankName} - {item.bankAccount}
                </div>
              )}
            </div>
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ghi chú</label>
            <Textarea
              placeholder="Nhập ghi chú (nếu có)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={() => onProcess({ amount: paymentAmount, notes })}>
            <Send className="h-4 w-4 mr-2" />
            Xác nhận thanh toán
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ClaimsPaymentPage() {
  // Real API data
  const { data: settlementData } = useSettlements({});

  // Merge API data with mock data
  const apiPayments = useMemo(() => {
    if (settlementData?.settlements?.length) {
      return settlementData.settlements.map((s: any) => ({
        id: s.id,
        claimCode: s.claim?.code || s.code || '',
        claimId: s.claimId || s.claim?.id || '',
        customerName: s.claim?.customer?.name || 'N/A',
        customerCode: s.claim?.customer?.code || '',
        promotionCode: s.claim?.promotion?.code || '',
        promotionName: s.claim?.promotion?.name || '',
        claimAmount: Number(s.claim?.amount || 0),
        approvedAmount: Number(s.settledAmount || 0),
        paidAmount: s.status === 'PAID' ? Number(s.settledAmount || 0) : 0,
        paymentStatus: s.status === 'PAID' ? 'PAID' : s.status === 'PROCESSING' ? 'PROCESSING' : 'PENDING',
        paymentMethod: s.paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : s.paymentMethod === 'CHECK' ? 'CHEQUE' : s.paymentMethod === 'CREDIT_NOTE' ? 'CREDIT_NOTE' : s.paymentMethod === 'OFFSET' ? 'OFFSET' : 'BANK_TRANSFER',
        dueDate: s.claim?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        paymentRef: s.paymentReference || '',
        createdAt: s.createdAt,
      })) as PaymentItem[];
    }
    return mockPayments;
  }, [settlementData]);

  // State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const payments = apiPayments;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('pending');
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  
  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      // Tab filter
      if (activeTab === 'pending' && !['PENDING', 'PARTIAL'].includes(item.paymentStatus)) return false;
      if (activeTab === 'processing' && item.paymentStatus !== 'PROCESSING') return false;
      if (activeTab === 'completed' && item.paymentStatus !== 'PAID') return false;
      if (activeTab === 'overdue' && !isOverdue(item.dueDate, item.paymentStatus)) return false;
      
      // Status filter
      if (statusFilter !== 'all' && item.paymentStatus !== statusFilter) return false;
      
      // Method filter
      if (methodFilter !== 'all' && item.paymentMethod !== methodFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        return (
          item.claimCode.toLowerCase().includes(search) ||
          item.customerName.toLowerCase().includes(search) ||
          item.promotionCode.toLowerCase().includes(search)
        );
      }
      
      return true;
    });
  }, [payments, activeTab, statusFilter, methodFilter, searchQuery]);
  
  // Select handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableIds = filteredPayments
        .filter((p) => p.paymentStatus !== 'PAID' && p.paymentStatus !== 'CANCELLED')
        .map((p) => p.id);
      setSelectedIds(new Set(selectableIds));
    } else {
      setSelectedIds(new Set());
    }
  };
  
  const handleSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };
  
  // Process handlers
  const handleView = (item: PaymentItem) => {
    setSelectedPayment(item);
    setViewDialogOpen(true);
  };
  
  const handleProcess = (item: PaymentItem) => {
    setSelectedPayment(item);
    setProcessDialogOpen(true);
  };
  
  const handleProcessConfirm = (data: any) => {
    console.log('Process:', selectedPayment, data);
    setProcessDialogOpen(false);
    setSelectedPayment(null);
  };
  
  // Batch process
  const handleBatchProcess = () => {
    console.log('Batch process:', Array.from(selectedIds));
  };
  
  // Calculate selected totals
  const selectedTotal = useMemo(() => {
    return payments
      .filter((p) => selectedIds.has(p.id))
      .reduce((sum, p) => sum + p.pendingAmount, 0);
  }, [payments, selectedIds]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Thanh Toán Claims</h1>
          <p className="text-muted-foreground">
            Quản lý và xử lý thanh toán cho các claims đã duyệt
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tạo đợt thanh toán
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <SummaryCards summary={mockSummary} />
      
      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="pending">
                  Chờ xử lý
                  <Badge variant="secondary" className="ml-2">24</Badge>
                </TabsTrigger>
                <TabsTrigger value="processing">
                  Đang xử lý
                  <Badge variant="secondary" className="ml-2">8</Badge>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Hoàn thành
                  <Badge variant="secondary" className="ml-2">16</Badge>
                </TabsTrigger>
                <TabsTrigger value="overdue" className="text-red-600">
                  Quá hạn
                  <Badge variant="destructive" className="ml-2">5</Badge>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                    <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                    <SelectItem value="PARTIAL">Một phần</SelectItem>
                    <SelectItem value="PAID">Đã TT</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Method Filter */}
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Phương thức" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                    <SelectItem value="CHEQUE">Séc</SelectItem>
                    <SelectItem value="CREDIT_NOTE">Credit Note</SelectItem>
                    <SelectItem value="OFFSET">Bù trừ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          {/* Batch Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between p-4 mb-4 bg-primary/5 rounded-lg border">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  Đã chọn {selectedIds.size} claims
                </span>
                <Separator orientation="vertical" className="h-6" />
                <span className="text-muted-foreground">
                  Tổng: <span className="font-bold text-primary"><CurrencyDisplay amount={selectedTotal} size="sm" showToggle={false} /></span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                  Bỏ chọn
                </Button>
                <Button size="sm" onClick={handleBatchProcess}>
                  <Send className="h-4 w-4 mr-2" />
                  Xử lý hàng loạt
                </Button>
              </div>
            </div>
          )}
          
          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.size > 0 && selectedIds.size === filteredPayments.filter(p => p.paymentStatus !== 'PAID' && p.paymentStatus !== 'CANCELLED').length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Claim / Promotion</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead className="text-right">Đã duyệt</TableHead>
                  <TableHead className="text-right">Còn lại</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Hạn TT</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-28">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((item) => (
                    <PaymentRow
                      key={item.id}
                      item={item}
                      isSelected={selectedIds.has(item.id)}
                      onSelect={handleSelect}
                      onView={handleView}
                      onProcess={handleProcess}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredPayments.length} / {payments.length} claims
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Trang 1 / 1</span>
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Process Dialog */}
      <ProcessPaymentDialog
        item={selectedPayment}
        open={processDialogOpen}
        onOpenChange={setProcessDialogOpen}
        onProcess={handleProcessConfirm}
      />

      {/* View Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
            <DialogDescription>
              {selectedPayment?.claimCode}
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6 py-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                {getPaymentStatusBadge(selectedPayment.paymentStatus)}
                {isOverdue(selectedPayment.dueDate, selectedPayment.paymentStatus) && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Quá hạn
                  </Badge>
                )}
              </div>

              {/* Customer Information */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Thông tin khách hàng
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tên khách hàng</p>
                    <p className="font-medium">{selectedPayment.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mã khách hàng</p>
                    <p className="font-medium">{selectedPayment.customerCode}</p>
                  </div>
                </div>
              </div>

              {/* Promotion Details */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Chi tiết chương trình
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Mã CTKM</p>
                    <p className="font-medium">{selectedPayment.promotionCode}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tên CTKM</p>
                    <p className="font-medium">{selectedPayment.promotionName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ngày claim</p>
                    <p className="font-medium">{formatDate(selectedPayment.claimDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ngày duyệt</p>
                    <p className="font-medium">{formatDate(selectedPayment.approvedDate)}</p>
                  </div>
                </div>
              </div>

              {/* Amount Information */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Thông tin số tiền
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Số tiền claim</span>
                    <CurrencyDisplay amount={selectedPayment.claimAmount} size="sm" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Số tiền duyệt</span>
                    <CurrencyDisplay
                      amount={selectedPayment.approvedAmount}
                      size="sm"
                      valueClassName={selectedPayment.approvedAmount !== selectedPayment.claimAmount ? 'text-yellow-600' : ''}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Đã thanh toán</span>
                    <CurrencyDisplay
                      amount={selectedPayment.paidAmount}
                      size="sm"
                      valueClassName="text-green-600"
                    />
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Còn lại</span>
                    <CurrencyDisplay
                      amount={selectedPayment.pendingAmount}
                      size="md"
                      valueClassName="text-primary font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Phương thức thanh toán
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Phương thức</p>
                    <p className="font-medium">
                      {selectedPayment.paymentMethod === 'BANK_TRANSFER' && 'Chuyển khoản'}
                      {selectedPayment.paymentMethod === 'CHEQUE' && 'Séc'}
                      {selectedPayment.paymentMethod === 'CREDIT_NOTE' && 'Credit Note'}
                      {selectedPayment.paymentMethod === 'OFFSET' && 'Bù trừ'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hạn thanh toán</p>
                    <p className="font-medium">{formatDate(selectedPayment.dueDate)}</p>
                  </div>
                  {selectedPayment.bankName && (
                    <div>
                      <p className="text-muted-foreground">Ngân hàng</p>
                      <p className="font-medium">{selectedPayment.bankName}</p>
                    </div>
                  )}
                  {selectedPayment.bankAccount && (
                    <div>
                      <p className="text-muted-foreground">Số tài khoản</p>
                      <p className="font-medium">{selectedPayment.bankAccount}</p>
                    </div>
                  )}
                  {selectedPayment.chequeNumber && (
                    <div>
                      <p className="text-muted-foreground">Số séc</p>
                      <p className="font-medium">{selectedPayment.chequeNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedPayment.notes && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Ghi chú</h4>
                  <p className="text-sm text-muted-foreground">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Đóng
            </Button>
            {selectedPayment && selectedPayment.paymentStatus !== 'PAID' && selectedPayment.paymentStatus !== 'CANCELLED' && (
              <Button onClick={() => {
                setViewDialogOpen(false);
                handleProcess(selectedPayment);
              }}>
                <Send className="h-4 w-4 mr-2" />
                Thanh toán
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
