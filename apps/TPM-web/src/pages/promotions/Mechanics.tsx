/**
 * Mechanics / Slab Configuration Page
 * BRD 3.3.3 - Configure discount %, rebate, free goods
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Settings,
  Percent,
  Gift,
  DollarSign,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
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

// Types
type MechanicType = 'DISCOUNT' | 'REBATE' | 'FREE_GOODS' | 'BUNDLE';
type MechanicStatus = 'ACTIVE' | 'DRAFT' | 'INACTIVE';

interface Slab {
  id: string;
  minQty: number;
  maxQty: number | null;
  value: number;
  unit: '%' | 'VND' | 'UNIT';
}

interface Mechanic {
  id: string;
  code: string;
  name: string;
  type: MechanicType;
  description: string;
  slabs: Slab[];
  status: MechanicStatus;
  applicableProducts: string[];
  applicableCustomers: string[];
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockMechanics: Mechanic[] = [
  {
    id: '1',
    code: 'DISC-VOL-01',
    name: 'Volume Discount Tiers',
    type: 'DISCOUNT',
    description: 'Chiết khấu theo số lượng mua',
    slabs: [
      { id: 's1', minQty: 10, maxQty: 49, value: 5, unit: '%' },
      { id: 's2', minQty: 50, maxQty: 99, value: 8, unit: '%' },
      { id: 's3', minQty: 100, maxQty: null, value: 12, unit: '%' },
    ],
    status: 'ACTIVE',
    applicableProducts: ['Pepsi 330ml', 'Mirinda 330ml', '7Up 330ml'],
    applicableCustomers: ['GT Channel', 'MT Channel'],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: '2',
    code: 'REB-QTRLY-01',
    name: 'Quarterly Rebate',
    type: 'REBATE',
    description: 'Hoàn tiền theo doanh số quý',
    slabs: [
      { id: 's1', minQty: 100000000, maxQty: 499999999, value: 2, unit: '%' },
      { id: 's2', minQty: 500000000, maxQty: 999999999, value: 3.5, unit: '%' },
      { id: 's3', minQty: 1000000000, maxQty: null, value: 5, unit: '%' },
    ],
    status: 'ACTIVE',
    applicableProducts: ['All Products'],
    applicableCustomers: ['Key Accounts'],
    createdAt: '2025-12-01',
    updatedAt: '2026-01-10',
  },
  {
    id: '3',
    code: 'FG-BUY10-01',
    name: 'Buy 10 Get 1 Free',
    type: 'FREE_GOODS',
    description: 'Mua 10 tặng 1 sản phẩm cùng loại',
    slabs: [
      { id: 's1', minQty: 10, maxQty: 19, value: 1, unit: 'UNIT' },
      { id: 's2', minQty: 20, maxQty: 49, value: 2, unit: 'UNIT' },
      { id: 's3', minQty: 50, maxQty: null, value: 5, unit: 'UNIT' },
    ],
    status: 'ACTIVE',
    applicableProducts: ['Aquafina 500ml', 'Aquafina 1.5L'],
    applicableCustomers: ['All Channels'],
    createdAt: '2026-01-05',
    updatedAt: '2026-01-20',
  },
  {
    id: '4',
    code: 'BUNDLE-COMBO-01',
    name: 'Combo Bundle Deal',
    type: 'BUNDLE',
    description: 'Combo nhiều sản phẩm giá ưu đãi',
    slabs: [
      { id: 's1', minQty: 1, maxQty: null, value: 15, unit: '%' },
    ],
    status: 'DRAFT',
    applicableProducts: ['Pepsi 330ml + Lay\'s 100g'],
    applicableCustomers: ['MT Channel'],
    createdAt: '2026-01-18',
    updatedAt: '2026-01-18',
  },
  {
    id: '5',
    code: 'DISC-CASH-01',
    name: 'Cash Discount',
    type: 'DISCOUNT',
    description: 'Giảm giá trực tiếp theo đơn hàng',
    slabs: [
      { id: 's1', minQty: 5000000, maxQty: 9999999, value: 100000, unit: 'VND' },
      { id: 's2', minQty: 10000000, maxQty: 19999999, value: 250000, unit: 'VND' },
      { id: 's3', minQty: 20000000, maxQty: null, value: 500000, unit: 'VND' },
    ],
    status: 'INACTIVE',
    applicableProducts: ['All Products'],
    applicableCustomers: ['GT Channel'],
    createdAt: '2025-11-01',
    updatedAt: '2025-12-31',
  },
];

const getTypeConfig = (type: MechanicType) => {
  const config = {
    DISCOUNT: { label: 'Discount', icon: Percent, color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
    REBATE: { label: 'Rebate', icon: DollarSign, color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
    FREE_GOODS: { label: 'Free Goods', icon: Gift, color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400' },
    BUNDLE: { label: 'Bundle', icon: Package, color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  };
  return config[type];
};

const getStatusBadge = (status: MechanicStatus) => {
  const config = {
    ACTIVE: { label: 'Active', variant: 'success' as const, icon: CheckCircle },
    DRAFT: { label: 'Draft', variant: 'secondary' as const, icon: Clock },
    INACTIVE: { label: 'Inactive', variant: 'outline' as const, icon: Clock },
  };
  const { label, variant, icon: Icon } = config[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

const formatSlabValue = (slab: Slab) => {
  if (slab.unit === '%') return `${slab.value}%`;
  if (slab.unit === 'VND') return <CurrencyDisplay amount={slab.value} size="sm" showToggle={false} />;
  return `${slab.value} units`;
};

const formatSlabRange = (slab: Slab, type: MechanicType) => {
  if (type === 'REBATE') {
    // For rebate, show as currency
    const minStr = new Intl.NumberFormat('vi-VN').format(slab.minQty);
    const maxStr = slab.maxQty ? new Intl.NumberFormat('vi-VN').format(slab.maxQty) : '∞';
    return `${minStr} - ${maxStr} VND`;
  }
  const maxStr = slab.maxQty ? slab.maxQty.toString() : '∞';
  return `${slab.minQty} - ${maxStr}`;
};

export default function MechanicsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, _setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Filter mechanics
  const filteredMechanics = mockMechanics.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || m.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;
    const matchesTab = activeTab === 'all' || m.type === activeTab;
    return matchesSearch && matchesType && matchesStatus && matchesTab;
  });

  // Stats
  const stats = {
    total: mockMechanics.length,
    active: mockMechanics.filter((m) => m.status === 'ACTIVE').length,
    discount: mockMechanics.filter((m) => m.type === 'DISCOUNT').length,
    rebate: mockMechanics.filter((m) => m.type === 'REBATE').length,
    freeGoods: mockMechanics.filter((m) => m.type === 'FREE_GOODS').length,
    bundle: mockMechanics.filter((m) => m.type === 'BUNDLE').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/promotions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mechanics / Slab</h1>
            <p className="text-muted-foreground mt-1">
              Cấu hình cơ chế khuyến mãi: discount, rebate, free goods
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Mechanic
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Mechanic</DialogTitle>
              <DialogDescription>
                Define a new promotion mechanic with slab tiers.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Mechanic Name</Label>
                <Input id="name" placeholder="e.g., Volume Discount Tiers" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select defaultValue="DISCOUNT">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DISCOUNT">Discount</SelectItem>
                      <SelectItem value="REBATE">Rebate</SelectItem>
                      <SelectItem value="FREE_GOODS">Free Goods</SelectItem>
                      <SelectItem value="BUNDLE">Bundle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="DRAFT">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Brief description of the mechanic" />
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label>Slab Tiers</Label>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-1 h-3 w-3" />
                    Add Tier
                  </Button>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Add slab tiers after creating the mechanic.</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>Create Mechanic</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.active} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discount</CardTitle>
            <Percent className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.discount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rebate</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rebate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Goods</CardTitle>
            <Gift className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.freeGoods}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bundle</CardTitle>
            <Package className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bundle}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Mechanic Configurations</CardTitle>
              <CardDescription>Manage promotion mechanics and slab tiers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <TabsList>
                <TabsTrigger value="all">All Types</TabsTrigger>
                <TabsTrigger value="DISCOUNT">Discount</TabsTrigger>
                <TabsTrigger value="REBATE">Rebate</TabsTrigger>
                <TabsTrigger value="FREE_GOODS">Free Goods</TabsTrigger>
                <TabsTrigger value="BUNDLE">Bundle</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search mechanics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-[200px]"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mechanic</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Slab Tiers</TableHead>
                      <TableHead>Applicable To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMechanics.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No mechanics found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMechanics.map((mechanic) => {
                        const typeConfig = getTypeConfig(mechanic.type);
                        const TypeIcon = typeConfig.icon;
                        return (
                          <TableRow key={mechanic.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{mechanic.name}</div>
                                <div className="text-sm text-muted-foreground">{mechanic.code}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={typeConfig.color}>
                                <TypeIcon className="mr-1 h-3 w-3" />
                                {typeConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {mechanic.slabs.slice(0, 2).map((slab) => (
                                  <div key={slab.id} className="text-sm">
                                    <span className="text-muted-foreground">
                                      {formatSlabRange(slab, mechanic.type)}:
                                    </span>{' '}
                                    <span className="font-medium">{formatSlabValue(slab)}</span>
                                  </div>
                                ))}
                                {mechanic.slabs.length > 2 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{mechanic.slabs.length - 2} more tiers
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">
                                  {mechanic.applicableProducts.slice(0, 2).join(', ')}
                                  {mechanic.applicableProducts.length > 2 && '...'}
                                </div>
                                <div className="text-muted-foreground">
                                  {mechanic.applicableCustomers.join(', ')}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(mechanic.status)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mechanic Types Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/30">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">Discount</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Giảm giá trực tiếp theo % hoặc số tiền cố định trên đơn hàng.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-semibold text-emerald-600 dark:text-emerald-400">Rebate</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Hoàn tiền theo doanh số tích lũy (tháng/quý/năm).
              </p>
            </div>
            <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/30">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-purple-600 dark:text-purple-400">Free Goods</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Tặng sản phẩm miễn phí khi mua đạt số lượng nhất định.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h4 className="font-semibold text-amber-600 dark:text-amber-400">Bundle</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Combo nhiều sản phẩm với giá ưu đãi đặc biệt.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
