/**
 * Budget Allocation Page
 * Hierarchical budget allocation with tree view and flow visualization
 * Phase 5: Integrated with Backend APIs
 */

import { useState, useMemo } from 'react';
import {
  ChevronRight, ChevronDown, DollarSign, MapPin, Building2,
  Store, Search, Filter, Plus, MoreHorizontal,
  ArrowRight, AlertCircle, Eye, Edit2,
  FolderTree, GitBranch, Layers, BarChart3, Download, Copy, Loader2
} from 'lucide-react';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import {
  useGeographicUnitsTree,
  useBudgetAllocationTree,
  type BudgetAllocation as BudgetAllocationData,
} from '@/hooks';
import { useBudgets } from '@/hooks/useBudgets';
import type { Budget } from '@/types';

// Types
interface TreeNode {
  id: string;
  code: string;
  name: string;
  type: 'root' | 'region' | 'province' | 'district' | 'dealer';
  total: number;
  allocated: number;
  spent: number;
  available: number;
  children?: TreeNode[];
  geographicUnitId?: string;
  allocationId?: string;
}

interface PathItem {
  id: string;
  name: string;
  type: string;
}

const formatFullCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
};

const getUtilization = (spent: number, total: number): number => {
  if (!total) return 0;
  return Math.round((spent / total) * 100);
};

const getAllocation = (allocated: number, total: number): number => {
  if (!total) return 0;
  return Math.round((allocated / total) * 100);
};

// Map geographic level to type
const levelToType: Record<string, TreeNode['type']> = {
  COUNTRY: 'root',
  REGION: 'region',
  PROVINCE: 'province',
  DISTRICT: 'district',
  DEALER: 'dealer',
};

// Type Config
const typeConfig = {
  root: { icon: DollarSign, label: 'Ngân sách gốc', color: '#0047AB', bg: '#F0F5FF' },
  region: { icon: MapPin, label: 'Vùng/Miền', color: '#7C3AED', bg: '#F5F3FF' },
  province: { icon: Building2, label: 'Tỉnh/Thành', color: '#0891B2', bg: '#ECFEFF' },
  district: { icon: Layers, label: 'Quận/Huyện', color: '#059669', bg: '#ECFDF5' },
  dealer: { icon: Store, label: 'Đại lý', color: '#D97706', bg: '#FFFBEB' },
};

// Transform allocation data to tree nodes
function transformAllocationsToTree(
  allocations: BudgetAllocationData[]
): TreeNode[] {
  const transform = (allocation: BudgetAllocationData): TreeNode => ({
    id: allocation.code,
    code: allocation.code,
    name: allocation.geographicUnit?.name || 'Unknown',
    type: levelToType[allocation.geographicUnit?.level || 'DEALER'] || 'dealer',
    total: Number(allocation.allocatedAmount) || 0,
    allocated: Number(allocation.childrenAllocated) || 0,
    spent: Number(allocation.spentAmount) || 0,
    available: Number(allocation.availableToAllocate) || 0,
    geographicUnitId: allocation.geographicUnitId,
    allocationId: allocation.id,
    children: allocation.children?.map(transform),
  });

  return allocations.map(transform);
}

// Tree Node Component
interface TreeNodeProps {
  node: TreeNode;
  level?: number;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (node: TreeNode, path: PathItem[]) => void;
  selectedId: string | null;
  path?: PathItem[];
}

const TreeNodeComponent = ({ node, level = 0, expanded, onToggle, onSelect, selectedId, path = [] }: TreeNodeProps) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded[node.id];
  const isSelected = selectedId === node.id;
  const config = typeConfig[node.type] || typeConfig.dealer;
  const Icon = config.icon;

  const utilization = getUtilization(node.spent, node.total);
  const allocation = getAllocation(node.allocated, node.total);

  const currentPath: PathItem[] = [...path, { id: node.id, name: node.name, type: node.type }];

  return (
    <div>
      <div
        className={`group flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all duration-100 ${
          isSelected
            ? 'bg-primary-muted border border-primary'
            : 'hover:bg-surface-hover border border-transparent'
        }`}
        style={{ marginLeft: level * 24 }}
        onClick={() => onSelect(node, currentPath)}
      >
        <button
          className={`w-6 h-6 flex items-center justify-center rounded hover:bg-surface-active transition-colors ${
            !hasChildren ? 'invisible' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: config.bg }}
        >
          <Icon className="w-4 h-4" style={{ color: config.color }} strokeWidth={1.75} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">{node.name}</span>
            <span className="text-xs font-mono text-foreground-subtle">{node.code}</span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
            <span>{config.label}</span>
            {hasChildren && (
              <span className="text-foreground-subtle">• {node.children?.length} cấp dưới</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="text-right w-28">
            <div className="text-sm font-semibold text-foreground tabular-nums">
              <CurrencyDisplay amount={node.total} size="sm" />
            </div>
            <div className="text-xs text-foreground-subtle">Tổng</div>
          </div>

          <div className="w-32">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Phân bổ</span>
              <span className={`font-medium ${allocation === 100 ? 'text-success' : 'text-warning'}`}>
                {allocation}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(allocation, 100)}%`,
                  backgroundColor: allocation === 100 ? '#10B981' : '#F59E0B'
                }}
              />
            </div>
          </div>

          <div className="w-32">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Sử dụng</span>
              <span className={`font-medium ${
                utilization >= 80 ? 'text-danger' : utilization >= 50 ? 'text-warning' : 'text-primary'
              }`}>
                {utilization}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(utilization, 100)}%`,
                  backgroundColor: utilization >= 80 ? '#EF4444' : utilization >= 50 ? '#F59E0B' : '#3B82F6'
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-active">
              <Eye className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-active">
              <Edit2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-active">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="relative">
          <div
            className="absolute left-6 top-0 bottom-4 w-px bg-muted"
            style={{ marginLeft: level * 24 + 12 }}
          />
          {node.children?.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedId={selectedId}
              path={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Flow Visualization Component
interface FlowVisualizationProps {
  node: TreeNode | null;
  path: PathItem[];
}

const FlowVisualization = ({ node, path }: FlowVisualizationProps) => {
  if (!node) return null;

  const config = typeConfig[node.type];
  const Icon = config.icon;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <GitBranch className="w-5 h-5 text-foreground-subtle" strokeWidth={1.75} />
        Luồng phân bổ ngân sách
      </h3>

      {path.length > 0 && (
        <div className="flex items-center gap-2 mb-6 text-sm overflow-x-auto pb-2">
          {path.map((item, index) => {
            const itemConfig = typeConfig[item.type as keyof typeof typeConfig];
            return (
              <div key={item.id} className="flex items-center gap-2">
                {index > 0 && <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                <span
                  className="px-2 py-1 rounded flex items-center gap-1.5 flex-shrink-0"
                  style={{ backgroundColor: itemConfig.bg, color: itemConfig.color }}
                >
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {hasChildren && (
        <div className="relative">
          <div className="flex justify-center mb-4">
            <div
              className="px-6 py-3 rounded-xl border-2 flex items-center gap-3"
              style={{ borderColor: config.color, backgroundColor: config.bg }}
            >
              <Icon className="w-5 h-5" style={{ color: config.color }} strokeWidth={1.75} />
              <div>
                <div className="font-semibold" style={{ color: config.color }}>{node.name}</div>
                <div className="text-sm text-foreground-muted"><CurrencyDisplay amount={node.total} size="sm" /></div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <div className="w-px h-8 bg-surface-border" />
          </div>

          <div className="flex items-start justify-center gap-4 overflow-x-auto pb-4">
            {node.children?.map((child) => {
              const childConfig = typeConfig[child.type];
              const ChildIcon = childConfig.icon;
              const percentage = node.total > 0 ? Math.round((child.total / node.total) * 100) : 0;
              const utilization = getUtilization(child.spent, child.total);

              return (
                <div key={child.id} className="flex flex-col items-center min-w-[140px]">
                  <div className="flex items-center gap-0">
                    <div className="w-8 h-px bg-surface-border" />
                    <div className="w-px h-6 bg-surface-border" />
                  </div>

                  <div className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-foreground-muted mb-2">
                    {percentage}%
                  </div>

                  <div
                    className="w-full p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                    style={{ borderColor: childConfig.color + '40', backgroundColor: childConfig.bg }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ChildIcon className="w-4 h-4" style={{ color: childConfig.color }} strokeWidth={1.75} />
                      <span className="font-medium text-foreground text-sm truncate">{child.name}</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground mb-2">
                      <CurrencyDisplay amount={child.total} size="sm" />
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${utilization}%`,
                          backgroundColor: childConfig.color
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Đã dùng: {utilization}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!hasChildren && (
        <div className="text-center text-muted-foreground py-8">
          <Store className="w-12 h-12 mx-auto mb-3 text-foreground-subtle" strokeWidth={1.5} />
          <p>Đây là cấp cuối cùng (Đại lý)</p>
          <p className="text-sm">Không có cấp dưới để phân bổ</p>
        </div>
      )}
    </div>
  );
};

// Detail Panel Component
interface DetailPanelProps {
  node: TreeNode | null;
}

const DetailPanel = ({ node }: DetailPanelProps) => {
  if (!node) return null;

  const config = typeConfig[node.type];
  const Icon = config.icon;
  const utilization = getUtilization(node.spent, node.total);
  const allocation = getAllocation(node.allocated, node.total);
  const available = node.total - node.spent;
  const unallocated = node.available;

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: config.bg }}
          >
            <Icon className="w-6 h-6" style={{ color: config.color }} strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-foreground">{node.name}</h2>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: config.bg, color: config.color }}
              >
                {config.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{node.code}</p>
          </div>
          <button className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-muted rounded-lg transition-colors">
            Chỉnh sửa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Tổng ngân sách</div>
          <div className="text-xl font-semibold text-foreground">{formatFullCurrency(node.total)}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Đã phân bổ con</div>
          <div className="text-xl font-semibold text-success">{formatFullCurrency(node.allocated)}</div>
          <div className="text-xs text-foreground-subtle">{allocation}% tổng</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Đã chi tiêu</div>
          <div className="text-xl font-semibold text-primary">{formatFullCurrency(node.spent)}</div>
          <div className="text-xs text-foreground-subtle">{utilization}% tổng</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Còn khả dụng</div>
          <div className="text-xl font-semibold text-foreground">{formatFullCurrency(available)}</div>
          <div className="text-xs text-foreground-subtle">{100 - utilization}% tổng</div>
        </div>
      </div>

      {unallocated > 0 && (
        <div className="bg-warning-muted border border-warning rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <div className="font-medium text-warning">Chưa phân bổ hết</div>
            <div className="text-sm text-warning">
              Còn {formatFullCurrency(unallocated)} chưa được phân bổ xuống cấp dưới
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="text-sm font-medium text-foreground mb-3">Thao tác nhanh</div>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground-muted bg-muted hover:bg-surface-hover rounded-lg transition-colors">
            <Plus className="w-4 h-4" strokeWidth={2} />
            Thêm cấp dưới
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground-muted bg-muted hover:bg-surface-hover rounded-lg transition-colors">
            <Copy className="w-4 h-4" strokeWidth={1.75} />
            Nhân bản
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground-muted bg-muted hover:bg-surface-hover rounded-lg transition-colors">
            <BarChart3 className="w-4 h-4" strokeWidth={1.75} />
            Báo cáo
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground-muted bg-muted hover:bg-surface-hover rounded-lg transition-colors">
            <Download className="w-4 h-4" strokeWidth={1.75} />
            Xuất Excel
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function BudgetAllocation() {
  const [viewMode, setViewMode] = useState<'tree' | 'flow'>('tree');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [selectedPath, setSelectedPath] = useState<PathItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');

  // Fetch budgets for selection
  const { data: budgetsData, isLoading: budgetsLoading } = useBudgets({ limit: 100 });
  const budgets = budgetsData?.budgets || [];

  // Fetch geographic units tree (for future use in creating allocations)
  const { isLoading: geoLoading } = useGeographicUnitsTree();

  // Fetch budget allocations tree for selected budget
  const { data: allocations, isLoading: allocationsLoading } = useBudgetAllocationTree(selectedBudgetId);

  // Transform allocations to tree nodes
  const treeData = useMemo(() => {
    if (!allocations || allocations.length === 0) {
      // If no allocations yet, show empty state
      return null;
    }

    return transformAllocationsToTree(allocations);
  }, [allocations]);

  // Create root node from selected budget
  const rootNode = useMemo(() => {
    if (!selectedBudgetId || !budgets.length) return null;

    const budget = budgets.find((b: Budget) => b.id === selectedBudgetId);
    if (!budget) return null;

    const totalAmount = Number(budget.totalAmount || budget.totalBudget || 0);
    const allocatedAmount = Number(budget.allocatedAmount || budget.committed || 0);
    const spentAmount = Number(budget.spentAmount || 0);

    return {
      id: budget.code || budget.id,
      code: budget.code || budget.id,
      name: budget.name,
      type: 'root' as const,
      total: totalAmount,
      allocated: allocatedAmount,
      spent: spentAmount,
      available: totalAmount - allocatedAmount,
      children: treeData || [],
    };
  }, [selectedBudgetId, budgets, treeData]);

  const handleToggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelect = (node: TreeNode, path: PathItem[]) => {
    setSelectedNode(node);
    setSelectedPath(path);
  };

  const expandAll = () => {
    if (!rootNode) return;
    const getAllIds = (node: TreeNode): Record<string, boolean> => {
      let ids: Record<string, boolean> = { [node.id]: true };
      if (node.children) {
        node.children.forEach(child => {
          ids = { ...ids, ...getAllIds(child) };
        });
      }
      return ids;
    };
    setExpanded(getAllIds(rootNode));
  };

  const collapseAll = () => {
    if (!rootNode) return;
    setExpanded({ [rootNode.id]: true });
  };

  const isLoading = budgetsLoading || geoLoading || allocationsLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Phân bổ Ngân sách</h1>
              <p className="text-sm text-muted-foreground">Cấu trúc phân cấp ngân sách theo vùng miền</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Budget Selector */}
              <select
                value={selectedBudgetId}
                onChange={(e) => {
                  setSelectedBudgetId(e.target.value);
                  setSelectedNode(null);
                  setSelectedPath([]);
                  setExpanded({});
                }}
                className="h-9 px-3 pr-8 text-sm bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Chọn ngân sách...</option>
                {budgets.map((budget: Budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name} ({budget.code || budget.id})
                  </option>
                ))}
              </select>

              <div className="flex items-center bg-muted rounded-lg p-1">
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'tree' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setViewMode('tree')}
                >
                  <FolderTree className="w-4 h-4" strokeWidth={1.75} />
                  Cây thư mục
                </button>
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'flow' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setViewMode('flow')}
                >
                  <GitBranch className="w-4 h-4" strokeWidth={1.75} />
                  Luồng phân bổ
                </button>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" strokeWidth={2} />
                Tạo phân bổ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* No Budget Selected State */}
        {!selectedBudgetId && (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-foreground-subtle" strokeWidth={1.5} />
            <h3 className="text-lg font-medium text-foreground mb-2">Chọn ngân sách để xem phân bổ</h3>
            <p className="text-muted-foreground mb-6">
              Vui lòng chọn một ngân sách từ danh sách để xem và quản lý cấu trúc phân bổ
            </p>
            {budgets.length === 0 && !budgetsLoading && (
              <p className="text-warning text-sm">
                Chưa có ngân sách nào. Vui lòng tạo ngân sách trước khi phân bổ.
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {selectedBudgetId && isLoading && (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
            <p className="text-muted-foreground">Đang tải dữ liệu phân bổ...</p>
          </div>
        )}

        {/* Main Content when budget is selected */}
        {selectedBudgetId && !isLoading && rootNode && (
          <div className="flex gap-6">
            {/* Left Panel */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="bg-card rounded-xl border border-border p-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.75} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên, mã..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 text-sm bg-muted text-foreground placeholder:text-muted-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <button className="flex items-center gap-2 h-9 px-3 text-sm font-medium text-foreground-muted bg-card border border-border rounded-lg hover:bg-surface-hover">
                    <Filter className="w-4 h-4" strokeWidth={1.75} />
                    Lọc
                  </button>

                  <div className="flex items-center gap-1 border-l border-border pl-4">
                    <button
                      onClick={expandAll}
                      className="h-9 px-3 text-sm font-medium text-foreground-muted hover:bg-surface-hover rounded-lg"
                    >
                      Mở rộng
                    </button>
                    <button
                      onClick={collapseAll}
                      className="h-9 px-3 text-sm font-medium text-foreground-muted hover:bg-surface-hover rounded-lg"
                    >
                      Thu gọn
                    </button>
                  </div>
                </div>
              </div>

              {/* Tree View */}
              {viewMode === 'tree' && (
                <div className="bg-card rounded-xl border border-border p-4">
                  {/* Legend */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border text-xs">
                    {Object.entries(typeConfig).map(([key, cfg]) => {
                      const LegendIcon = cfg.icon;
                      return (
                        <div key={key} className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                            <LegendIcon className="w-3 h-3" style={{ color: cfg.color }} strokeWidth={2} />
                          </div>
                          <span className="text-foreground-subtle">{cfg.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {rootNode.children && rootNode.children.length > 0 ? (
                    <>
                      {/* Root Node */}
                      <TreeNodeComponent
                        node={rootNode}
                        expanded={{ ...expanded, [rootNode.id]: true }}
                        onToggle={handleToggle}
                        onSelect={handleSelect}
                        selectedId={selectedNode?.id || null}
                      />
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <FolderTree className="w-12 h-12 mx-auto mb-4 text-foreground-subtle" strokeWidth={1.5} />
                      <h3 className="font-medium text-foreground mb-2">Chưa có phân bổ</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ngân sách này chưa có dữ liệu phân bổ theo vùng miền
                      </p>
                      <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90">
                        <Plus className="w-4 h-4" />
                        Tạo phân bổ đầu tiên
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Flow View */}
              {viewMode === 'flow' && (
                <FlowVisualization node={selectedNode || rootNode} path={selectedPath} />
              )}
            </div>

            {/* Right Panel - Details */}
            <div className="w-[380px] flex-shrink-0">
              {selectedNode ? (
                <DetailPanel node={selectedNode} />
              ) : (
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                  <FolderTree className="w-12 h-12 mx-auto mb-4 text-foreground-subtle" strokeWidth={1.5} />
                  <h3 className="font-medium text-foreground mb-2">Chọn một mục</h3>
                  <p className="text-sm text-muted-foreground">
                    Click vào bất kỳ mục nào trong cây để xem chi tiết và thao tác
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
