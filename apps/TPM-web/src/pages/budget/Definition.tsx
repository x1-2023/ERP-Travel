/**
 * Budget Definition Page
 * Định nghĩa và kiểm soát ngân sách theo năm, quý, tháng
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { Label } from '@/components/ui/label';
import {
  Plus,
  Search,
  Download,
  Filter,
  MoreHorizontal,
  DollarSign,
  TrendingUp,
  Calendar,
  Lock,
  Unlock,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
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
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { safePercentage, safePercentageNumber } from '@/lib/utils';

// Types
interface BudgetDefinition {
  id: string;
  code: string;
  name: string;
  fiscalYear: number;
  period: 'ANNUAL' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'MONTHLY';
  totalAmount: number;
  allocatedAmount: number;
  committedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'LOCKED' | 'CLOSED';
  category: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockBudgets: BudgetDefinition[] = [
  {
    id: '1',
    code: 'BUD-2026-ANNUAL',
    name: 'FY2026 Trade Promotion Budget',
    fiscalYear: 2026,
    period: 'ANNUAL',
    totalAmount: 50000000000,
    allocatedAmount: 35000000000,
    committedAmount: 28000000000,
    spentAmount: 22000000000,
    remainingAmount: 15000000000,
    status: 'ACTIVE',
    category: 'Trade Promotion',
    createdBy: 'Quỳnh Nguyễn',
    createdAt: '2025-12-01',
    updatedAt: '2026-01-15',
  },
  {
    id: '2',
    code: 'BUD-2026-Q1',
    name: 'Q1/2026 Trade Budget',
    fiscalYear: 2026,
    period: 'Q1',
    totalAmount: 12500000000,
    allocatedAmount: 10000000000,
    committedAmount: 8500000000,
    spentAmount: 7200000000,
    remainingAmount: 2500000000,
    status: 'ACTIVE',
    category: 'Trade Promotion',
    createdBy: 'Quỳnh Nguyễn',
    createdAt: '2025-12-15',
    updatedAt: '2026-01-20',
  },
  {
    id: '3',
    code: 'BUD-2026-Q2',
    name: 'Q2/2026 Trade Budget',
    fiscalYear: 2026,
    period: 'Q2',
    totalAmount: 12500000000,
    allocatedAmount: 5000000000,
    committedAmount: 2000000000,
    spentAmount: 0,
    remainingAmount: 7500000000,
    status: 'PENDING_APPROVAL',
    category: 'Trade Promotion',
    createdBy: 'Minh Trần',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: '4',
    code: 'BUD-2026-MKT',
    name: 'FY2026 Marketing Budget',
    fiscalYear: 2026,
    period: 'ANNUAL',
    totalAmount: 20000000000,
    allocatedAmount: 15000000000,
    committedAmount: 12000000000,
    spentAmount: 8000000000,
    remainingAmount: 5000000000,
    status: 'APPROVED',
    category: 'Marketing',
    createdBy: 'Lan Phạm',
    createdAt: '2025-11-20',
    updatedAt: '2026-01-05',
  },
  {
    id: '5',
    code: 'BUD-2025-Q4',
    name: 'Q4/2025 Trade Budget',
    fiscalYear: 2025,
    period: 'Q4',
    totalAmount: 10000000000,
    allocatedAmount: 10000000000,
    committedAmount: 9800000000,
    spentAmount: 9500000000,
    remainingAmount: 0,
    status: 'CLOSED',
    category: 'Trade Promotion',
    createdBy: 'Quỳnh Nguyễn',
    createdAt: '2025-09-01',
    updatedAt: '2025-12-31',
  },
];

const getStatusBadge = (status: BudgetDefinition['status']) => {
  const statusConfig = {
    DRAFT: { label: 'Draft', variant: 'secondary' as const, icon: Clock },
    PENDING_APPROVAL: { label: 'Pending', variant: 'warning' as const, icon: AlertCircle },
    APPROVED: { label: 'Approved', variant: 'default' as const, icon: CheckCircle },
    ACTIVE: { label: 'Active', variant: 'success' as const, icon: CheckCircle },
    LOCKED: { label: 'Locked', variant: 'destructive' as const, icon: Lock },
    CLOSED: { label: 'Closed', variant: 'outline' as const, icon: Lock },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export default function BudgetDefinitionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Filter budgets
  const filteredBudgets = mockBudgets.filter((budget) => {
    const matchesSearch =
      budget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      budget.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYear === 'all' || budget.fiscalYear.toString() === selectedYear;
    const matchesStatus = selectedStatus === 'all' || budget.status === selectedStatus;
    return matchesSearch && matchesYear && matchesStatus;
  });

  // Calculate summary stats
  const summaryStats = {
    totalBudget: filteredBudgets.reduce((sum, b) => sum + b.totalAmount, 0),
    totalAllocated: filteredBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0),
    totalSpent: filteredBudgets.reduce((sum, b) => sum + b.spentAmount, 0),
    totalRemaining: filteredBudgets.reduce((sum, b) => sum + b.remainingAmount, 0),
    activeBudgets: filteredBudgets.filter((b) => b.status === 'ACTIVE').length,
    pendingApproval: filteredBudgets.filter((b) => b.status === 'PENDING_APPROVAL').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Definition</h1>
          <p className="text-muted-foreground mt-1">
            Định nghĩa và kiểm soát ngân sách theo năm, quý, tháng
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>
                Define a new budget for trade promotion management.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Budget Name</Label>
                <Input id="name" placeholder="e.g., Q2/2026 Trade Budget" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="year">Fiscal Year</Label>
                  <Select defaultValue="2026">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="period">Period</Label>
                  <Select defaultValue="Q1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ANNUAL">Annual</SelectItem>
                      <SelectItem value="Q1">Q1</SelectItem>
                      <SelectItem value="Q2">Q2</SelectItem>
                      <SelectItem value="Q3">Q3</SelectItem>
                      <SelectItem value="Q4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Total Amount (VND)</Label>
                <Input id="amount" type="number" placeholder="10,000,000,000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue="trade">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trade">Trade Promotion</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales Incentive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>Create Budget</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CurrencyDisplay amount={summaryStats.totalBudget} size="lg" /></div>
            <p className="text-xs text-muted-foreground">
              FY{selectedYear} total defined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CurrencyDisplay amount={summaryStats.totalAllocated} size="lg" /></div>
            <Progress
              value={safePercentageNumber(summaryStats.totalAllocated, summaryStats.totalBudget)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {safePercentage(summaryStats.totalAllocated, summaryStats.totalBudget, 0)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <CurrencyDisplay amount={summaryStats.totalRemaining} size="lg" />
            </div>
            <p className="text-xs text-muted-foreground">Available for allocation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.activeBudgets}</div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.pendingApproval} pending approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Budget Definitions</CardTitle>
              <CardDescription>Manage budget definitions and allocations</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search & Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="LOCKED">Locked</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Budget</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.map((budget) => (
                  <TableRow key={budget.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{budget.name}</div>
                        <div className="text-sm text-muted-foreground">{budget.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {budget.period === 'ANNUAL' ? 'Annual' : budget.period} {budget.fiscalYear}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <CurrencyDisplay amount={budget.totalAmount} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-mono"><CurrencyDisplay amount={budget.allocatedAmount} size="sm" /></div>
                      <Progress
                        value={safePercentageNumber(budget.allocatedAmount, budget.totalAmount)}
                        className="mt-1 h-1"
                      />
                    </TableCell>
                    <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                      <CurrencyDisplay amount={budget.remainingAmount} size="sm" />
                    </TableCell>
                    <TableCell>{getStatusBadge(budget.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/budget/allocation?id=${budget.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Allocation
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {budget.status === 'ACTIVE' && (
                            <DropdownMenuItem>
                              <Lock className="mr-2 h-4 w-4" />
                              Lock Budget
                            </DropdownMenuItem>
                          )}
                          {budget.status === 'LOCKED' && (
                            <DropdownMenuItem>
                              <Unlock className="mr-2 h-4 w-4" />
                              Unlock Budget
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 dark:text-red-400">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination placeholder */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredBudgets.length} of {mockBudgets.length} budgets
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
