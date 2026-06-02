// ============================================================================
// BUDGET ALLOCATION PAGE - P0 CRITICAL
// Tree-based hierarchical budget allocation with drag-drop
// Path: apps/web/src/pages/budget/Allocation.tsx
// ============================================================================

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/useToast';
import {
  useBudgets,
  useBudget,
  useFundHealthScore,
} from '@/hooks/useBudgets';
import {
  useBudgetAllocationTree,
  useCreateBudgetAllocation,
  useUpdateBudgetAllocation,
  useDeleteBudgetAllocation,
  type BudgetAllocation as ApiBudgetAllocation,
} from '@/hooks/useBudgetAllocations';
import { useGeographicUnitsTree } from '@/hooks/useGeographicUnits';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Copy,
  Download,
  RefreshCw,
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  Users,
  Store,
  Wallet,
  PieChart,
  BarChart3,
  GitBranch,
  Lock,
  Unlock,
  Save,
  Calculator,
  Percent,
  DollarSign,
} from 'lucide-react';
import { cn, formatPercent, safePercentageNumber } from '@/lib/utils';
import { CurrencyDisplay, formatCurrencyCompact } from '@/components/ui/currency-display';

// ============================================================================
// TYPES
// ============================================================================

interface AllocationNode {
  id: string;
  code: string;
  name: string;
  type: 'COUNTRY' | 'REGION' | 'PROVINCE' | 'DISTRICT' | 'DEALER';
  parentId: string | null;
  level: number;
  
  // Budget data
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
  
  // Allocation settings
  allocationPercent: number;
  allocationMethod: 'MANUAL' | 'PROPORTIONAL' | 'EQUAL' | 'HISTORICAL';
  isLocked: boolean;
  
  // Status
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'ACTIVE';
  
  // Metadata
  customerCount: number;
  lastYearSpend: number;
  growthTarget: number;
  
  // Children
  children?: AllocationNode[];
  isExpanded?: boolean;
}

interface BudgetSummary {
  totalBudget: number;
  allocated: number;
  unallocated: number;
  spent: number;
  committed: number;
  available: number;
  utilizationRate: number;
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

// Transform API allocation data to UI AllocationNode format
function transformAllocationsToTree(
  allocations: ApiBudgetAllocation[],
  parentId: string | null = null,
  level: number = 0
): AllocationNode[] {
  const children = allocations.filter(a =>
    parentId === null ? !a.parentId : a.parentId === parentId
  );

  return children.map(allocation => {
    const childNodes = transformAllocationsToTree(allocations, allocation.id, level + 1);
    const geoUnit = allocation.geographicUnit;

    return {
      id: allocation.id,
      code: allocation.code,
      name: geoUnit?.name || allocation.code,
      type: (geoUnit?.level || 'REGION') as AllocationNode['type'],
      parentId: allocation.parentId || null,
      level,
      totalBudget: allocation.allocatedAmount,
      allocatedBudget: allocation.childrenAllocated,
      spentBudget: allocation.spentAmount,
      remainingBudget: allocation.allocatedAmount - allocation.spentAmount,
      allocationPercent: 0, // Calculate from parent if needed
      allocationMethod: 'MANUAL' as const,
      isLocked: allocation.status === 'LOCKED',
      status: allocation.status === 'APPROVED' ? 'ACTIVE' :
              allocation.status === 'PENDING_APPROVAL' ? 'PENDING' :
              allocation.status === 'DRAFT' ? 'DRAFT' : 'ACTIVE',
      customerCount: 0,
      lastYearSpend: 0,
      growthTarget: 0,
      children: childNodes.length > 0 ? childNodes : undefined,
      isExpanded: level < 2, // Auto-expand first 2 levels
    } as AllocationNode;
  });
}

// Calculate summary from allocations
function calculateSummary(budget: any, _allocations: AllocationNode[]): BudgetSummary {
  const totalBudget = budget?.totalAmount || 0;
  const allocated = budget?.allocatedAmount || 0;
  const spent = budget?.spentAmount || 0;

  return {
    totalBudget,
    allocated,
    unallocated: totalBudget - allocated,
    spent,
    committed: 0, // Would need activity data
    available: totalBudget - spent,
    utilizationRate: totalBudget > 0 ? (spent / totalBudget) * 100 : 0,
  };
}

// ============================================================================
// MOCK DATA (fallback when no budget selected)
// ============================================================================

const mockAllocationTree: AllocationNode[] = [
  {
    id: 'vn',
    code: 'VN',
    name: 'Vietnam',
    type: 'COUNTRY',
    parentId: null,
    level: 0,
    totalBudget: 50000000000,
    allocatedBudget: 48500000000,
    spentBudget: 32000000000,
    remainingBudget: 16500000000,
    allocationPercent: 100,
    allocationMethod: 'MANUAL',
    isLocked: false,
    status: 'ACTIVE',
    customerCount: 15420,
    lastYearSpend: 45000000000,
    growthTarget: 11.1,
    isExpanded: true,
    children: [
      {
        id: 'north',
        code: 'NORTH',
        name: 'Miền Bắc',
        type: 'REGION',
        parentId: 'vn',
        level: 1,
        totalBudget: 20000000000,
        allocatedBudget: 19500000000,
        spentBudget: 13000000000,
        remainingBudget: 6500000000,
        allocationPercent: 40,
        allocationMethod: 'MANUAL',
        isLocked: false,
        status: 'ACTIVE',
        customerCount: 5840,
        lastYearSpend: 18000000000,
        growthTarget: 11.1,
        isExpanded: true,
        children: [
          {
            id: 'hanoi',
            code: 'HN',
            name: 'Hà Nội',
            type: 'PROVINCE',
            parentId: 'north',
            level: 2,
            totalBudget: 12000000000,
            allocatedBudget: 11800000000,
            spentBudget: 8000000000,
            remainingBudget: 3800000000,
            allocationPercent: 60,
            allocationMethod: 'PROPORTIONAL',
            isLocked: false,
            status: 'ACTIVE',
            customerCount: 3200,
            lastYearSpend: 10500000000,
            growthTarget: 14.3,
            isExpanded: false,
            children: [
              {
                id: 'hoankiem',
                code: 'HK',
                name: 'Hoàn Kiếm',
                type: 'DISTRICT',
                parentId: 'hanoi',
                level: 3,
                totalBudget: 3500000000,
                allocatedBudget: 3500000000,
                spentBudget: 2400000000,
                remainingBudget: 1100000000,
                allocationPercent: 29.2,
                allocationMethod: 'HISTORICAL',
                isLocked: true,
                status: 'APPROVED',
                customerCount: 850,
                lastYearSpend: 3200000000,
                growthTarget: 9.4,
                children: [],
              },
              {
                id: 'badinh',
                code: 'BD',
                name: 'Ba Đình',
                type: 'DISTRICT',
                parentId: 'hanoi',
                level: 3,
                totalBudget: 2800000000,
                allocatedBudget: 2700000000,
                spentBudget: 1800000000,
                remainingBudget: 900000000,
                allocationPercent: 23.3,
                allocationMethod: 'HISTORICAL',
                isLocked: false,
                status: 'ACTIVE',
                customerCount: 620,
                lastYearSpend: 2500000000,
                growthTarget: 12.0,
                children: [],
              },
              {
                id: 'dongda',
                code: 'DD',
                name: 'Đống Đa',
                type: 'DISTRICT',
                parentId: 'hanoi',
                level: 3,
                totalBudget: 2500000000,
                allocatedBudget: 2400000000,
                spentBudget: 1600000000,
                remainingBudget: 800000000,
                allocationPercent: 20.8,
                allocationMethod: 'MANUAL',
                isLocked: false,
                status: 'ACTIVE',
                customerCount: 580,
                lastYearSpend: 2300000000,
                growthTarget: 8.7,
                children: [],
              },
            ],
          },
          {
            id: 'haiphong',
            code: 'HP',
            name: 'Hải Phòng',
            type: 'PROVINCE',
            parentId: 'north',
            level: 2,
            totalBudget: 5000000000,
            allocatedBudget: 4800000000,
            spentBudget: 3200000000,
            remainingBudget: 1600000000,
            allocationPercent: 25,
            allocationMethod: 'PROPORTIONAL',
            isLocked: false,
            status: 'ACTIVE',
            customerCount: 1540,
            lastYearSpend: 4500000000,
            growthTarget: 11.1,
            children: [],
          },
          {
            id: 'quangninh',
            code: 'QN',
            name: 'Quảng Ninh',
            type: 'PROVINCE',
            parentId: 'north',
            level: 2,
            totalBudget: 3000000000,
            allocatedBudget: 2900000000,
            spentBudget: 1800000000,
            remainingBudget: 1100000000,
            allocationPercent: 15,
            allocationMethod: 'EQUAL',
            isLocked: false,
            status: 'PENDING',
            customerCount: 1100,
            lastYearSpend: 2800000000,
            growthTarget: 7.1,
            children: [],
          },
        ],
      },
      {
        id: 'central',
        code: 'CENTRAL',
        name: 'Miền Trung',
        type: 'REGION',
        parentId: 'vn',
        level: 1,
        totalBudget: 12000000000,
        allocatedBudget: 11500000000,
        spentBudget: 7500000000,
        remainingBudget: 4000000000,
        allocationPercent: 24,
        allocationMethod: 'MANUAL',
        isLocked: false,
        status: 'ACTIVE',
        customerCount: 3580,
        lastYearSpend: 11000000000,
        growthTarget: 9.1,
        isExpanded: false,
        children: [
          {
            id: 'danang',
            code: 'DN',
            name: 'Đà Nẵng',
            type: 'PROVINCE',
            parentId: 'central',
            level: 2,
            totalBudget: 6000000000,
            allocatedBudget: 5800000000,
            spentBudget: 3800000000,
            remainingBudget: 2000000000,
            allocationPercent: 50,
            allocationMethod: 'PROPORTIONAL',
            isLocked: false,
            status: 'ACTIVE',
            customerCount: 1800,
            lastYearSpend: 5500000000,
            growthTarget: 9.1,
            children: [],
          },
        ],
      },
      {
        id: 'south',
        code: 'SOUTH',
        name: 'Miền Nam',
        type: 'REGION',
        parentId: 'vn',
        level: 1,
        totalBudget: 18000000000,
        allocatedBudget: 17500000000,
        spentBudget: 11500000000,
        remainingBudget: 6000000000,
        allocationPercent: 36,
        allocationMethod: 'MANUAL',
        isLocked: false,
        status: 'ACTIVE',
        customerCount: 6000,
        lastYearSpend: 16000000000,
        growthTarget: 12.5,
        isExpanded: false,
        children: [
          {
            id: 'hcm',
            code: 'HCM',
            name: 'TP. Hồ Chí Minh',
            type: 'PROVINCE',
            parentId: 'south',
            level: 2,
            totalBudget: 12000000000,
            allocatedBudget: 11800000000,
            spentBudget: 7800000000,
            remainingBudget: 4000000000,
            allocationPercent: 66.7,
            allocationMethod: 'PROPORTIONAL',
            isLocked: false,
            status: 'ACTIVE',
            customerCount: 4200,
            lastYearSpend: 10500000000,
            growthTarget: 14.3,
            children: [],
          },
        ],
      },
    ],
  },
];

const mockBudgetSummary: BudgetSummary = {
  totalBudget: 50000000000,
  allocated: 48500000000,
  unallocated: 1500000000,
  spent: 32000000000,
  committed: 8000000000,
  available: 10000000000,
  utilizationRate: 64,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getTypeIcon = (type: AllocationNode['type']) => {
  switch (type) {
    case 'COUNTRY':
      return Building2;
    case 'REGION':
      return MapPin;
    case 'PROVINCE':
      return MapPin;
    case 'DISTRICT':
      return Store;
    case 'DEALER':
      return Users;
    default:
      return Building2;
  }
};

const getTypeColor = (type: AllocationNode['type']) => {
  switch (type) {
    case 'COUNTRY':
      return 'text-purple-600 bg-purple-50';
    case 'REGION':
      return 'text-blue-600 bg-blue-50';
    case 'PROVINCE':
      return 'text-green-600 bg-green-50';
    case 'DISTRICT':
      return 'text-orange-600 bg-orange-50';
    case 'DEALER':
      return 'text-muted-foreground bg-muted/50';
    default:
      return 'text-muted-foreground bg-muted/50';
  }
};

const getStatusBadge = (status: AllocationNode['status']) => {
  switch (status) {
    case 'DRAFT':
      return <Badge variant="outline">Nháp</Badge>;
    case 'PENDING':
      return <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30 hover:bg-amber-200 dark:hover:bg-amber-900/70">Chờ duyệt</Badge>;
    case 'APPROVED':
      return <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/30 hover:bg-blue-200 dark:hover:bg-blue-900/70">Đã duyệt</Badge>;
    case 'ACTIVE':
      return <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/70">Đang hoạt động</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getMethodLabel = (method: AllocationNode['allocationMethod']) => {
  switch (method) {
    case 'MANUAL':
      return 'Thủ công';
    case 'PROPORTIONAL':
      return 'Theo tỷ lệ';
    case 'EQUAL':
      return 'Chia đều';
    case 'HISTORICAL':
      return 'Theo lịch sử';
    default:
      return method;
  }
};

// ============================================================================
// COMPONENTS
// ============================================================================

// Summary Cards Component
const SummaryCards = ({ summary }: { summary: BudgetSummary }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="relative overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <Wallet className="absolute -right-2 -bottom-2 h-16 w-16 text-blue-500/10" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Tổng ngân sách</p>
          <CurrencyDisplay amount={summary.totalBudget} size="md" />
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <CheckCircle2 className="absolute -right-2 -bottom-2 h-16 w-16 text-emerald-500/10" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Đã phân bổ</p>
          <CurrencyDisplay amount={summary.allocated} size="md" valueClassName="text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs text-muted-foreground mt-1">{formatPercent(summary.allocated / summary.totalBudget * 100)}</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <AlertTriangle className="absolute -right-2 -bottom-2 h-16 w-16 text-amber-500/10" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Chưa phân bổ</p>
          <CurrencyDisplay amount={summary.unallocated} size="md" valueClassName="text-amber-600 dark:text-amber-400" />
          <p className="text-xs text-muted-foreground mt-1">{formatPercent(summary.unallocated / summary.totalBudget * 100)}</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <TrendingUp className="absolute -right-2 -bottom-2 h-16 w-16 text-violet-500/10" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Đã chi tiêu</p>
          <CurrencyDisplay amount={summary.spent} size="md" valueClassName="text-violet-600 dark:text-violet-400" />
          <p className="text-xs text-muted-foreground mt-1">{formatPercent(summary.spent / summary.totalBudget * 100)}</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <Clock className="absolute -right-2 -bottom-2 h-16 w-16 text-orange-500/10" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Cam kết</p>
          <CurrencyDisplay amount={summary.committed} size="md" valueClassName="text-orange-600 dark:text-orange-400" />
          <p className="text-xs text-muted-foreground mt-1">{formatPercent(summary.committed / summary.totalBudget * 100)}</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <DollarSign className="absolute -right-2 -bottom-2 h-16 w-16 text-blue-500/10" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Còn khả dụng</p>
          <CurrencyDisplay amount={summary.available} size="md" valueClassName="text-blue-600 dark:text-blue-400" />
          <p className="text-xs text-muted-foreground mt-1">{formatPercent(summary.available / summary.totalBudget * 100)}</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Tree Node Component
const TreeNode = ({
  node,
  onToggle,
  onEdit,
  onDelete,
  onLockToggle,
  selectedId,
  onSelect,
}: {
  node: AllocationNode;
  onToggle: (id: string) => void;
  onEdit: (node: AllocationNode) => void;
  onDelete: (id: string) => void;
  onLockToggle: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) => {
  const Icon = getTypeIcon(node.type);
  const hasChildren = node.children && node.children.length > 0;
  const utilizationPercent = safePercentageNumber(node.spentBudget, node.totalBudget);
  
  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors',
          'hover:bg-muted',
          selectedId === node.id && 'bg-primary/10 ring-2 ring-primary/20'
        )}
        style={{ paddingLeft: `${node.level * 24 + 12}px` }}
        onClick={() => onSelect(node.id)}
      >
        {/* Expand/Collapse Button */}
        <button
          className={cn(
            'p-0.5 rounded hover:bg-muted transition-colors',
            !hasChildren && 'invisible'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
        >
          {node.isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        
        {/* Type Icon */}
        <div className={cn('p-1.5 rounded', getTypeColor(node.type))}>
          <Icon className="h-4 w-4" />
        </div>
        
        {/* Name & Code */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{node.name}</span>
            <span className="text-xs text-muted-foreground">({node.code})</span>
            {node.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{node.customerCount.toLocaleString()} KH</span>
            <span>•</span>
            <span>{getMethodLabel(node.allocationMethod)}</span>
          </div>
        </div>
        
        {/* Allocation Percent */}
        <div className="text-right w-20">
          <div className="font-semibold text-primary">{formatPercent(node.allocationPercent)}</div>
          <div className="text-xs text-muted-foreground">phân bổ</div>
        </div>
        
        {/* Budget Info */}
        <div className="text-right w-36">
          <CurrencyDisplay amount={node.totalBudget} size="sm" />
          <div className="text-xs text-muted-foreground">
            Chi: {formatCurrencyCompact(node.spentBudget)}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-24">
          <div className="flex items-center gap-1 mb-1">
            <Progress value={utilizationPercent} className="h-2 flex-1" />
            <span className="text-xs font-medium w-10 text-right">
              {utilizationPercent.toFixed(0)}%
            </span>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            sử dụng
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="w-24">
          {getStatusBadge(node.status)}
        </div>
        
        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(node)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLockToggle(node.id)}>
              {node.isLocked ? (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Mở khóa
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Khóa
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" />
              Sao chép
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Calculator className="h-4 w-4 mr-2" />
              Tính lại phân bổ
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(node.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Children */}
      {hasChildren && node.isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onLockToggle={onLockToggle}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Flatten tree for table view
const flattenTree = (nodes: AllocationNode[], result: AllocationNode[] = []): AllocationNode[] => {
  for (const node of nodes) {
    result.push(node);
    if (node.children && node.children.length > 0) {
      flattenTree(node.children, result);
    }
  }
  return result;
};

// Table View Component
const TableView = ({
  data,
  onEdit,
  onDelete,
  onLockToggle,
}: {
  data: AllocationNode[];
  onEdit: (node: AllocationNode) => void;
  onDelete: (id: string) => void;
  onLockToggle: (id: string) => void;
}) => {
  const flatData = useMemo(() => flattenTree(data), [data]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">Cấp</TableHead>
            <TableHead>Tên / Mã</TableHead>
            <TableHead className="text-right">Ngân sách</TableHead>
            <TableHead className="text-right">Đã phân bổ</TableHead>
            <TableHead className="text-right">Đã chi</TableHead>
            <TableHead className="text-right">Còn lại</TableHead>
            <TableHead className="text-center w-28">Sử dụng</TableHead>
            <TableHead className="text-center">Phương thức</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flatData.map((node) => {
            const Icon = getTypeIcon(node.type);
            const utilizationPercent = safePercentageNumber(node.spentBudget, node.totalBudget);

            return (
              <TableRow
                key={node.id}
                className={cn(
                  'hover:bg-muted/50',
                  node.level === 0 && 'bg-muted/30 font-medium',
                  node.level === 1 && 'bg-muted/10'
                )}
              >
                <TableCell>
                  <div className={cn('p-1.5 rounded w-fit', getTypeColor(node.type))}>
                    <Icon className="h-4 w-4" />
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ paddingLeft: `${node.level * 16}px` }}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{node.name}</span>
                      <span className="text-xs text-muted-foreground">({node.code})</span>
                      {node.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {node.customerCount.toLocaleString()} khách hàng
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <CurrencyDisplay amount={node.totalBudget} size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  <CurrencyDisplay amount={node.allocatedBudget} size="sm" valueClassName="text-emerald-600 dark:text-emerald-400" />
                </TableCell>
                <TableCell className="text-right">
                  <CurrencyDisplay amount={node.spentBudget} size="sm" valueClassName="text-violet-600 dark:text-violet-400" />
                </TableCell>
                <TableCell className="text-right">
                  <CurrencyDisplay amount={node.remainingBudget} size="sm" valueClassName="text-blue-600 dark:text-blue-400" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={utilizationPercent}
                      className={cn(
                        'h-2 flex-1',
                        utilizationPercent > 90 && '[&>div]:bg-red-500',
                        utilizationPercent > 75 && utilizationPercent <= 90 && '[&>div]:bg-amber-500'
                      )}
                    />
                    <span className="text-xs font-medium w-10 text-right">
                      {utilizationPercent.toFixed(0)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {getMethodLabel(node.allocationMethod)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(node.status)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(node)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onLockToggle(node.id)}>
                        {node.isLocked ? (
                          <>
                            <Unlock className="h-4 w-4 mr-2" />
                            Mở khóa
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Khóa
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(node.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

// Flow View Component - Budget allocation visualization
const FlowView = ({
  data,
  summary,
}: {
  data: AllocationNode[];
  summary: BudgetSummary;
}) => {
  // Get regions (level 1)
  const regions = data[0]?.children || [];

  // Colors for regions
  const regionColors = [
    { bg: 'bg-blue-500', light: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
    { bg: 'bg-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    { bg: 'bg-violet-500', light: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300' },
    { bg: 'bg-orange-500', light: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Budget Flow Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Budget */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng ngân sách</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay amount={summary.totalBudget} size="lg" />
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Đã phân bổ</span>
                <span className="text-sm font-medium text-emerald-600">{formatPercent(summary.allocated / summary.totalBudget * 100)}</span>
              </div>
              <Progress value={summary.allocated / summary.totalBudget * 100} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Chưa phân bổ</span>
                <CurrencyDisplay amount={summary.unallocated} size="sm" valueClassName="text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Phân bổ theo vùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regions.map((region, index) => {
                const colors = regionColors[index % regionColors.length];
                const percent = safePercentageNumber(region.totalBudget, summary.totalBudget);
                const utilizationPercent = safePercentageNumber(region.spentBudget, region.totalBudget);

                return (
                  <div key={region.id} className={cn('p-4 rounded-lg', colors.light)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-3 h-3 rounded-full', colors.bg)} />
                        <span className={cn('font-medium', colors.text)}>{region.name}</span>
                        <Badge variant="outline" className="text-xs">{formatPercent(percent)}</Badge>
                      </div>
                      <CurrencyDisplay amount={region.totalBudget} size="sm" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Đã chi: </span>
                        <span className="font-medium">{formatCurrencyCompact(region.spentBudget)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Còn lại: </span>
                        <span className="font-medium">{formatCurrencyCompact(region.remainingBudget)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sử dụng: </span>
                        <span className="font-medium">{formatPercent(utilizationPercent)}</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2">
                      <Progress value={utilizationPercent} className="h-1.5" />
                    </div>
                    {/* Sub-regions preview */}
                    {region.children && region.children.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex flex-wrap gap-2">
                          {region.children.slice(0, 4).map((child) => (
                            <Badge key={child.id} variant="secondary" className="text-xs">
                              {child.name}: {formatCurrencyCompact(child.totalBudget)}
                            </Badge>
                          ))}
                          {region.children.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{region.children.length - 4} khác
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đã chi tiêu</p>
                <CurrencyDisplay amount={summary.spent} size="sm" valueClassName="text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cam kết</p>
                <CurrencyDisplay amount={summary.committed} size="sm" valueClassName="text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Khả dụng</p>
                <CurrencyDisplay amount={summary.available} size="sm" valueClassName="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <TrendingUp className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tỷ lệ sử dụng</p>
                <p className="text-lg font-bold text-violet-600">{formatPercent(summary.utilizationRate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Allocation Form Dialog
const AllocationFormDialog = ({
  node,
  open,
  onOpenChange,
  onSave,
}: {
  node: AllocationNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<AllocationNode>) => void;
}) => {
  const [formData, setFormData] = useState({
    totalBudget: node?.totalBudget || 0,
    allocationPercent: node?.allocationPercent || 0,
    allocationMethod: node?.allocationMethod || 'MANUAL',
    growthTarget: node?.growthTarget || 0,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {node ? `Chỉnh sửa phân bổ: ${node.name}` : 'Thêm phân bổ mới'}
          </DialogTitle>
          <DialogDescription>
            Điều chỉnh ngân sách và phương thức phân bổ
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ngân sách</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  className="pl-9"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tỷ lệ phân bổ (%)</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  className="pl-9"
                  value={formData.allocationPercent}
                  onChange={(e) => setFormData({ ...formData, allocationPercent: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Phương thức phân bổ</label>
            <Select
              value={formData.allocationMethod}
              onValueChange={(value) => setFormData({ ...formData, allocationMethod: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">Thủ công</SelectItem>
                <SelectItem value="PROPORTIONAL">Theo tỷ lệ doanh thu</SelectItem>
                <SelectItem value="EQUAL">Chia đều</SelectItem>
                <SelectItem value="HISTORICAL">Theo lịch sử chi tiêu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Mục tiêu tăng trưởng (%)</label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                className="pl-9"
                value={formData.growthTarget}
                onChange={(e) => setFormData({ ...formData, growthTarget: Number(e.target.value) })}
              />
            </div>
          </div>
          
          {node && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Thông tin tham khảo</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Chi tiêu năm trước:</span>
                  <span className="ml-2 font-medium">{formatCurrencyCompact(node.lastYearSpend)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Số khách hàng:</span>
                  <span className="ml-2 font-medium">{node.customerCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={() => onSave(formData)}>
            <Save className="h-4 w-4 mr-2" />
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BudgetAllocationPage() {
  // URL params for budget selection
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedBudgetId = searchParams.get('budgetId') || '';

  // State
  const [localTree, setLocalTree] = useState<AllocationNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<AllocationNode | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'tree' | 'table' | 'flow'>('tree');

  // Fetch budgets for selection
  const { data: budgetsData, isLoading: budgetsLoading } = useBudgets({
    approvalStatus: 'APPROVED',
    pageSize: 50,
  });
  const budgets = budgetsData?.budgets || [];

  // Fetch selected budget details
  const { data: selectedBudget, isLoading: budgetLoading } = useBudget(selectedBudgetId);

  // Fetch allocations tree for selected budget
  const {
    data: apiAllocations,
    isLoading: allocationsLoading,
    refetch: refetchAllocations,
  } = useBudgetAllocationTree(selectedBudgetId);

  // Fetch geographic units for creating new allocations
  const { data: geoUnits } = useGeographicUnitsTree();

  // Fetch health score
  const { data: healthScore } = useFundHealthScore(selectedBudgetId);

  // Mutations
  const createAllocation = useCreateBudgetAllocation();
  const updateAllocation = useUpdateBudgetAllocation();
  const deleteAllocation = useDeleteBudgetAllocation();

  // Transform API data to UI format
  const allocationTree = useMemo(() => {
    if (!apiAllocations || apiAllocations.length === 0) {
      return selectedBudgetId ? [] : mockAllocationTree;
    }
    return transformAllocationsToTree(apiAllocations);
  }, [apiAllocations, selectedBudgetId]);

  // Update local tree when API data changes
  useEffect(() => {
    setLocalTree(allocationTree);
  }, [allocationTree]);

  // Calculate summary
  const budgetSummary = useMemo(() => {
    if (selectedBudget) {
      return calculateSummary(selectedBudget, localTree);
    }
    return mockBudgetSummary;
  }, [selectedBudget, localTree]);

  // Loading state
  const isLoading = budgetLoading || allocationsLoading;
  
  // Toggle node expansion (local state only)
  const toggleNode = (id: string) => {
    const updateTree = (nodes: AllocationNode[]): AllocationNode[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };
    setLocalTree(updateTree(localTree));
  };

  // Handle edit
  const handleEdit = (node: AllocationNode) => {
    setEditingNode(node);
    setIsEditDialogOpen(true);
  };

  // Handle save - calls real API
  const handleSave = async (data: Partial<AllocationNode>) => {
    if (!editingNode) return;

    try {
      await updateAllocation.mutateAsync({
        id: editingNode.id,
        data: {
          allocatedAmount: data.totalBudget,
          notes: `Growth target: ${data.growthTarget}%`,
        },
      });
      toast({ title: 'Success', description: 'Allocation updated successfully' });
      refetchAllocations();
    } catch (error: any) {
      toast({ title: 'Error', variant: 'destructive', description: error.response?.data?.error || 'Failed to update allocation' });
    }

    setIsEditDialogOpen(false);
    setEditingNode(null);
  };

  // Handle delete - calls real API
  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await deleteAllocation.mutateAsync(deleteConfirmId);
      toast({ title: 'Success', description: 'Allocation deleted' });
      refetchAllocations();
    } catch (error: any) {
      toast({ title: 'Error', variant: 'destructive', description: error.response?.data?.error || 'Failed to delete allocation' });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Handle lock toggle - calls real API
  const handleLockToggle = async (id: string) => {
    const node = findNodeById(localTree, id);
    if (!node) return;

    const newStatus = node.isLocked ? 'APPROVED' : 'LOCKED';

    try {
      await updateAllocation.mutateAsync({
        id,
        data: { status: newStatus as any },
      });
      toast({ title: 'Success', description: node.isLocked ? 'Allocation unlocked' : 'Allocation locked' });
      refetchAllocations();
    } catch (error: any) {
      toast({ title: 'Error', variant: 'destructive', description: error.response?.data?.error || 'Failed to toggle lock' });
    }
  };

  // Helper to find node by id
  const findNodeById = (nodes: AllocationNode[], id: string): AllocationNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Handle add allocation
  const handleAddAllocation = async (geoUnitId: string, amount: number, parentId?: string) => {
    if (!selectedBudgetId) {
      toast({ title: 'Error', variant: 'destructive', description: 'Please select a budget first' });
      return;
    }

    try {
      await createAllocation.mutateAsync({
        budgetId: selectedBudgetId,
        geographicUnitId: geoUnitId,
        parentId,
        allocatedAmount: amount,
      });
      toast({ title: 'Success', description: 'Allocation created' });
      setIsAddDialogOpen(false);
      refetchAllocations();
    } catch (error: any) {
      toast({ title: 'Error', variant: 'destructive', description: error.response?.data?.error || 'Failed to create allocation' });
    }
  };

  // Expand all (local state)
  const expandAll = () => {
    const updateTree = (nodes: AllocationNode[]): AllocationNode[] => {
      return nodes.map((node) => ({
        ...node,
        isExpanded: true,
        children: node.children ? updateTree(node.children) : undefined,
      }));
    };
    setLocalTree(updateTree(localTree));
  };

  // Collapse all (local state)
  const collapseAll = () => {
    const updateTree = (nodes: AllocationNode[]): AllocationNode[] => {
      return nodes.map((node) => ({
        ...node,
        isExpanded: false,
        children: node.children ? updateTree(node.children) : undefined,
      }));
    };
    setLocalTree(updateTree(localTree));
  };

  // Handle budget selection
  const handleBudgetSelect = (budgetId: string) => {
    setSearchParams({ budgetId });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Phân Bổ Ngân Sách</h1>
          <p className="text-muted-foreground">
            Quản lý phân bổ ngân sách theo cấp bậc địa lý
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Budget Selector */}
          <Select value={selectedBudgetId} onValueChange={handleBudgetSelect}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Chọn ngân sách..." />
            </SelectTrigger>
            <SelectContent>
              {budgetsLoading ? (
                <SelectItem value="__loading__" disabled>Loading...</SelectItem>
              ) : budgets.length === 0 ? (
                <SelectItem value="__empty__" disabled>No approved budgets</SelectItem>
              ) : (
                budgets.map((b: any) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.code} - {b.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => refetchAllocations()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)} disabled={!selectedBudgetId}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm phân bổ
          </Button>
        </div>
      </div>

      {/* Health Score Alert (if exists) */}
      {healthScore && healthScore.status !== 'EXCELLENT' && (
        <Card className={cn(
          'border-l-4',
          healthScore.status === 'CRITICAL' && 'border-l-red-500 bg-red-50 dark:bg-red-950',
          healthScore.status === 'WARNING' && 'border-l-amber-500 bg-amber-50 dark:bg-amber-950',
          healthScore.status === 'GOOD' && 'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
        )}>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className={cn(
                  'h-5 w-5',
                  healthScore.status === 'CRITICAL' && 'text-red-600',
                  healthScore.status === 'WARNING' && 'text-amber-600',
                  healthScore.status === 'GOOD' && 'text-blue-600'
                )} />
                <div>
                  <p className="font-medium">Fund Health Score: {healthScore.healthScore}/100 ({healthScore.status})</p>
                  <p className="text-sm text-muted-foreground">
                    {healthScore.alerts?.[0]?.message || 'Review budget utilization'}
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                Utilization: {healthScore.breakdown?.utilization?.rate || 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <SummaryCards summary={budgetSummary} />
      )}
      
      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
              
              {/* Filter by method */}
              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="MANUAL">Thủ công</SelectItem>
                  <SelectItem value="PROPORTIONAL">Theo tỷ lệ</SelectItem>
                  <SelectItem value="EQUAL">Chia đều</SelectItem>
                  <SelectItem value="HISTORICAL">Theo lịch sử</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <TabsList className="h-9">
                  <TabsTrigger value="tree" className="px-3">
                    <GitBranch className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="table" className="px-3">
                    <BarChart3 className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="flow" className="px-3">
                    <PieChart className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Expand/Collapse */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={expandAll}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mở rộng tất cả</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={collapseAll}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Thu gọn tất cả</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Tree View */}
          {viewMode === 'tree' && (
            <div className="border rounded-lg">
              {/* Header Row */}
              <div className="flex items-center gap-2 py-2 px-3 bg-muted/50 border-b text-sm font-medium text-muted-foreground">
                <div className="w-8" />
                <div className="w-10" />
                <div className="flex-1">Tên / Mã</div>
                <div className="w-20 text-right">Tỷ lệ</div>
                <div className="w-32 text-right">Ngân sách</div>
                <div className="w-24 text-center">Sử dụng</div>
                <div className="w-24 text-center">Trạng thái</div>
                <div className="w-10" />
              </div>
              
              {/* Tree Nodes */}
              <div className="divide-y">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : localTree.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {selectedBudgetId
                      ? 'No allocations yet. Click "Thêm phân bổ" to create one.'
                      : 'Please select a budget to view allocations.'}
                  </div>
                ) : (
                  localTree.map((node) => (
                    <TreeNode
                      key={node.id}
                      node={node}
                      onToggle={toggleNode}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onLockToggle={handleLockToggle}
                      selectedId={selectedNode}
                      onSelect={setSelectedNode}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <TableView
              data={localTree}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onLockToggle={handleLockToggle}
            />
          )}

          {/* Flow View */}
          {viewMode === 'flow' && (
            <FlowView data={localTree} summary={budgetSummary} />
          )}
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <AllocationFormDialog
        node={editingNode}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSave}
      />

      {/* Add Allocation Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm Phân Bổ Mới</DialogTitle>
            <DialogDescription>
              Tạo phân bổ mới cho ngân sách {selectedBudget?.code}
            </DialogDescription>
          </DialogHeader>
          <AddAllocationForm
            geoUnits={geoUnits || []}
            existingAllocations={localTree}
            parentOptions={localTree}
            onSubmit={handleAddAllocation}
            onCancel={() => setIsAddDialogOpen(false)}
            isLoading={createAllocation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phân bổ này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Add Allocation Form Component
function AddAllocationForm({
  geoUnits,
  existingAllocations: _existingAllocations,
  parentOptions,
  onSubmit,
  onCancel,
  isLoading,
}: {
  geoUnits: any[];
  existingAllocations: AllocationNode[];
  parentOptions: AllocationNode[];
  onSubmit: (geoUnitId: string, amount: number, parentId?: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [selectedGeoUnit, setSelectedGeoUnit] = useState('');
  const [selectedParent, setSelectedParent] = useState('__none__');
  const [amount, setAmount] = useState('');

  // Flatten geo units for select
  const flattenGeoUnits = (units: any[], level = 0): any[] => {
    const result: any[] = [];
    for (const unit of units) {
      result.push({ ...unit, depth: level });
      if (unit.children) {
        result.push(...flattenGeoUnits(unit.children, level + 1));
      }
    }
    return result;
  };

  const flatGeoUnits = useMemo(() => flattenGeoUnits(geoUnits), [geoUnits]);

  // Flatten parent options
  const flattenParents = (nodes: AllocationNode[], level = 0): Array<AllocationNode & { depth: number }> => {
    const result: Array<AllocationNode & { depth: number }> = [];
    for (const node of nodes) {
      result.push({ ...node, depth: level });
      if (node.children) {
        result.push(...flattenParents(node.children, level + 1));
      }
    }
    return result;
  };

  const flatParents = useMemo(() => flattenParents(parentOptions), [parentOptions]);

  const handleSubmit = () => {
    if (!selectedGeoUnit || !amount) return;
    onSubmit(selectedGeoUnit, parseFloat(amount), selectedParent === '__none__' ? undefined : selectedParent);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Khu vực địa lý</label>
        <Select value={selectedGeoUnit} onValueChange={setSelectedGeoUnit}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn khu vực..." />
          </SelectTrigger>
          <SelectContent>
            {flatGeoUnits.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {'  '.repeat(unit.depth)}{unit.name} ({unit.level})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Phân bổ cha (tùy chọn)</label>
        <Select value={selectedParent} onValueChange={setSelectedParent}>
          <SelectTrigger>
            <SelectValue placeholder="Không có (root level)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Không có (root level)</SelectItem>
            {flatParents.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {'  '.repeat(node.depth)}{node.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Số tiền phân bổ (VND)</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            className="pl-9"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={!selectedGeoUnit || !amount || isLoading}>
          {isLoading ? 'Đang tạo...' : 'Tạo phân bổ'}
        </Button>
      </DialogFooter>
    </div>
  );
}
