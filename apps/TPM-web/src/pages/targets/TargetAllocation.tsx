/**
 * Target Allocation Page
 * Hierarchical target allocation with tree view and progress tracking
 * Phase 5: Integrated with Backend APIs
 */

import { useState, useMemo } from 'react';
import {
  ChevronRight, ChevronDown, Target, MapPin, Building2, Store,
  TrendingUp, TrendingDown, Search, Filter, Plus,
  Check, AlertCircle, Eye, Edit2, Layers,
  BarChart3, Calendar, Loader2, FolderTree, X, Save
} from 'lucide-react';
import {
  useGeographicUnitsTree,
  useTargetAllocationTree,
  type TargetAllocation as TargetAllocationData,
  getMetricLabel,
  type GeographicUnit,
} from '@/hooks';
import {
  useTargets,
  useTargetProgress,
  useCreateTargetAllocationNested,
  useUpdateTargetProgress,
  getProgressStatusColor,
} from '@/hooks/useTargets';
import { useToast } from '@/hooks/useToast';
import type { Target as TargetType } from '@/types';

// Types
interface TreeNode {
  id: string;
  code: string;
  name: string;
  target: number;
  achieved: number;
  type: 'root' | 'region' | 'province' | 'district' | 'dealer';
  metric: string;
  children?: TreeNode[];
  geographicUnitId?: string;
  allocationId?: string;
}

interface PathItem {
  id: string;
  name: string;
  type: string;
}

// Map geographic level to type
const levelToType: Record<string, TreeNode['type']> = {
  COUNTRY: 'root',
  REGION: 'region',
  PROVINCE: 'province',
  DISTRICT: 'district',
  DEALER: 'dealer',
};

// Utility Functions
const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString('vi-VN');
};

const getProgress = (achieved: number, target: number): number => {
  if (!target) return 0;
  return Math.round((achieved / target) * 100);
};

const getProgressColor = (p: number): string => {
  if (p >= 100) return '#10B981';
  if (p >= 75) return '#3B82F6';
  if (p >= 50) return '#F59E0B';
  return '#EF4444';
};

// Type Config
const typeConfig = {
  root: { icon: Target, label: 'Mục tiêu gốc', color: '#DC2626', bg: '#FEF2F2' },
  region: { icon: MapPin, label: 'Vùng/Miền', color: '#7C3AED', bg: '#F5F3FF' },
  province: { icon: Building2, label: 'Tỉnh/Thành', color: '#0891B2', bg: '#ECFEFF' },
  district: { icon: Layers, label: 'Quận/Huyện', color: '#059669', bg: '#ECFDF5' },
  dealer: { icon: Store, label: 'Đại lý', color: '#D97706', bg: '#FFFBEB' },
};

// Transform allocation data to tree nodes
function transformAllocationsToTree(allocations: TargetAllocationData[]): TreeNode[] {
  const transform = (allocation: TargetAllocationData): TreeNode => ({
    id: allocation.code,
    code: allocation.code,
    name: allocation.geographicUnit?.name || 'Unknown',
    type: levelToType[allocation.geographicUnit?.level || 'DEALER'] || 'dealer',
    target: Number(allocation.targetValue) || 0,
    achieved: Number(allocation.achievedValue) || 0,
    metric: allocation.metric || 'CASES',
    geographicUnitId: allocation.geographicUnitId,
    allocationId: allocation.id,
    children: allocation.children?.map(transform),
  });

  return allocations.map(transform);
}

// Progress Ring Component
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}

const ProgressRing = ({ progress, size = 48, strokeWidth = 4, color }: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          style={{ color }}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-foreground-muted">{Math.min(progress, 100)}%</span>
      </div>
    </div>
  );
};

// Target Tree Node Component
interface TargetTreeNodeProps {
  node: TreeNode;
  level?: number;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (node: TreeNode, path: PathItem[]) => void;
  selectedId: string | null;
  path?: PathItem[];
}

const TargetTreeNode = ({ node, level = 0, expanded, onToggle, onSelect, selectedId, path = [] }: TargetTreeNodeProps) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded[node.id];
  const isSelected = selectedId === node.id;
  const config = typeConfig[node.type] || typeConfig.dealer;
  const Icon = config.icon;

  const progress = getProgress(node.achieved, node.target);
  const progressColor = getProgressColor(progress);
  const currentPath: PathItem[] = [...path, { id: node.id, name: node.name, type: node.type }];

  return (
    <div>
      <div
        className={`group flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-all duration-100 ${
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
          <div className="text-right">
            <div className="text-sm font-semibold text-foreground tabular-nums">
              {formatNumber(node.achieved)} / {formatNumber(node.target)}
            </div>
            <div className="text-xs text-foreground-subtle">{getMetricLabel(node.metric as 'CASES' | 'VOLUME_LITERS' | 'REVENUE_VND' | 'UNITS')}</div>
          </div>

          <ProgressRing progress={progress} size={40} strokeWidth={3} color={progressColor} />

          <div className="w-24">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Tiến độ</span>
              <span style={{ color: progressColor }} className="font-medium">
                {progress}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: progressColor }}
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
            <TargetTreeNode
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

// Detail Panel Component
interface DetailPanelProps {
  node: TreeNode | null;
  onAddChild?: () => void;
  onUpdateProgress?: () => void;
}

const DetailPanel = ({ node, onAddChild, onUpdateProgress }: DetailPanelProps) => {
  if (!node) return null;

  const config = typeConfig[node.type];
  const Icon = config.icon;
  const progress = getProgress(node.achieved, node.target);
  const progressColor = getProgressColor(progress);
  const remaining = Math.max(0, node.target - node.achieved);

  const getStatusInfo = () => {
    if (progress >= 100) return { label: 'Hoàn thành', icon: Check, color: 'text-success', bg: 'bg-success-muted' };
    if (progress >= 75) return { label: 'Đang tốt', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary-muted' };
    if (progress >= 50) return { label: 'Cần cải thiện', icon: AlertCircle, color: 'text-warning', bg: 'bg-warning-muted' };
    return { label: 'Rủi ro', icon: TrendingDown, color: 'text-danger', bg: 'bg-danger-muted' };
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

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
            </div>
            <p className="text-sm text-muted-foreground font-mono">{node.code}</p>
            <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {status.label}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-center mb-4">
          <ProgressRing progress={progress} size={100} strokeWidth={8} color={progressColor} />
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {formatNumber(node.achieved)}
          </div>
          <div className="text-sm text-muted-foreground">
            trên {formatNumber(node.target)} {getMetricLabel(node.metric as 'CASES' | 'VOLUME_LITERS' | 'REVENUE_VND' | 'UNITS')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Mục tiêu</div>
          <div className="text-xl font-semibold text-foreground">{formatNumber(node.target)}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Đạt được</div>
          <div className="text-xl font-semibold text-success">{formatNumber(node.achieved)}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Còn lại</div>
          <div className="text-xl font-semibold text-warning">{formatNumber(remaining)}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Tiến độ</div>
          <div className="text-xl font-semibold" style={{ color: progressColor }}>{progress}%</div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="text-sm font-medium text-foreground mb-3">Thao tác</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onAddChild}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground-muted bg-muted hover:bg-surface-hover rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Thêm cấp dưới
          </button>
          <button
            onClick={onUpdateProgress}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground-muted bg-muted hover:bg-surface-hover rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" strokeWidth={1.75} />
            Cập nhật tiến độ
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground-muted bg-muted hover:bg-surface-hover rounded-lg transition-colors">
            <BarChart3 className="w-4 h-4" strokeWidth={1.75} />
            Báo cáo
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground-muted bg-muted hover:bg-surface-hover rounded-lg transition-colors">
            <Calendar className="w-4 h-4" strokeWidth={1.75} />
            Lịch sử
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Allocation Dialog
interface CreateAllocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  parentNode?: TreeNode | null;
  geoUnits: GeographicUnit[];
  onSuccess: () => void;
}

const CreateAllocationDialog = ({
  isOpen,
  onClose,
  targetId,
  parentNode,
  geoUnits,
  onSuccess,
}: CreateAllocationDialogProps) => {
  const [geoUnitId, setGeoUnitId] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const createMutation = useCreateTargetAllocationNested(targetId);

  // Filter geo units based on parent level
  const filteredGeoUnits = useMemo(() => {
    if (!parentNode) {
      // Root level - show regions
      return geoUnits.filter(g => g.level === 'REGION');
    }
    // Show children of parent's level
    const levelOrder = ['COUNTRY', 'REGION', 'PROVINCE', 'DISTRICT', 'DEALER'];
    const parentLevel = parentNode.type === 'root' ? 'COUNTRY' : parentNode.type.toUpperCase();
    const parentIdx = levelOrder.indexOf(parentLevel);
    const childLevel = levelOrder[parentIdx + 1];
    return geoUnits.filter(g => g.level === childLevel);
  }, [geoUnits, parentNode]);

  const handleSubmit = async () => {
    if (!geoUnitId || !targetValue) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        geographicUnitId: geoUnitId,
        parentId: parentNode?.allocationId,
        targetValue: Number(targetValue),
        notes: notes || undefined,
      });
      toast({
        title: 'Thành công',
        description: 'Đã tạo phân bổ mới',
      });
      onSuccess();
      onClose();
      setGeoUnitId('');
      setTargetValue('');
      setNotes('');
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: err instanceof Error ? err.message : 'Không thể tạo phân bổ',
        variant: 'destructive',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {parentNode ? `Thêm cấp dưới cho ${parentNode.name}` : 'Tạo phân bổ mới'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Đơn vị địa lý
            </label>
            <select
              value={geoUnitId}
              onChange={(e) => setGeoUnitId(e.target.value)}
              className="w-full h-10 px-3 bg-card border border-border rounded-lg text-foreground"
            >
              <option value="">Chọn đơn vị...</option>
              {filteredGeoUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} ({unit.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Giá trị mục tiêu
            </label>
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="w-full h-10 px-3 bg-card border border-border rounded-lg text-foreground"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Ghi chú
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground resize-none"
              rows={3}
              placeholder="Ghi chú (tùy chọn)"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground-muted bg-muted hover:bg-surface-hover rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Tạo phân bổ
          </button>
        </div>
      </div>
    </div>
  );
};

// Update Progress Dialog
interface UpdateProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  node: TreeNode | null;
  onSuccess: () => void;
}

const UpdateProgressDialog = ({
  isOpen,
  onClose,
  node,
  onSuccess,
}: UpdateProgressDialogProps) => {
  const [achievedValue, setAchievedValue] = useState('');
  const { toast } = useToast();
  const updateMutation = useUpdateTargetProgress();

  // Initialize with current value
  useMemo(() => {
    if (node) {
      setAchievedValue(String(node.achieved || 0));
    }
  }, [node]);

  const handleSubmit = async () => {
    if (!node?.allocationId || achievedValue === '') {
      toast({
        title: 'Lỗi',
        description: 'Không có dữ liệu để cập nhật',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        allocationId: node.allocationId,
        achievedValue: Number(achievedValue),
      });
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật tiến độ',
      });
      onSuccess();
      onClose();
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: err instanceof Error ? err.message : 'Không thể cập nhật',
        variant: 'destructive',
      });
    }
  };

  if (!isOpen || !node) return null;

  const progress = getProgress(Number(achievedValue), node.target);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Cập nhật tiến độ: {node.name}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Mục tiêu</span>
              <span className="font-medium text-foreground">{formatNumber(node.target)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hiện tại</span>
              <span className="font-medium text-foreground">{formatNumber(node.achieved)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Giá trị đạt được mới
            </label>
            <input
              type="number"
              value={achievedValue}
              onChange={(e) => setAchievedValue(e.target.value)}
              className="w-full h-10 px-3 bg-card border border-border rounded-lg text-foreground"
              placeholder="0"
            />
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tiến độ mới</span>
              <span className="text-lg font-semibold" style={{ color: getProgressColor(progress) }}>
                {progress}%
              </span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden mt-2">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: getProgressColor(progress) }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground-muted bg-muted hover:bg-surface-hover rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
};

// Progress Summary Panel
interface ProgressSummaryProps {
  targetId: string;
}

const ProgressSummaryPanel = ({ targetId }: ProgressSummaryProps) => {
  const { data: progressData, isLoading } = useTargetProgress(targetId);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!progressData) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-4">
      <h3 className="text-sm font-medium text-foreground mb-3">Tổng quan tiến độ</h3>

      {/* Status Breakdown */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-lg font-semibold text-green-600">{progressData.statusBreakdown.achieved}</div>
          <div className="text-xs text-green-600/80">Đạt</div>
        </div>
        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-lg font-semibold text-blue-600">{progressData.statusBreakdown.good}</div>
          <div className="text-xs text-blue-600/80">Tốt</div>
        </div>
        <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-lg font-semibold text-yellow-600">{progressData.statusBreakdown.slow}</div>
          <div className="text-xs text-yellow-600/80">Chậm</div>
        </div>
        <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-lg font-semibold text-red-600">{progressData.statusBreakdown.atRisk}</div>
          <div className="text-xs text-red-600/80">Rủi ro</div>
        </div>
      </div>

      {/* Top Performers */}
      {progressData.topPerformers.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium text-muted-foreground mb-2">Top thành tích</div>
          <div className="space-y-1">
            {progressData.topPerformers.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span className="text-foreground truncate">{p.name}</span>
                <span className={`font-medium ${getProgressStatusColor(p.progress >= 100 ? 'ACHIEVED' : p.progress >= 75 ? 'GOOD' : 'SLOW')}`}>
                  {p.progress.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Underperformers */}
      {progressData.underperformers.length > 0 && (
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Cần cải thiện</div>
          <div className="space-y-1">
            {progressData.underperformers.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span className="text-foreground truncate">{p.name}</span>
                <span className="font-medium text-red-600">{p.progress.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
export default function TargetAllocation() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [, setSelectedPath] = useState<PathItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [createParentNode, setCreateParentNode] = useState<TreeNode | null>(null);
  const { toast } = useToast();

  // Fetch targets for selection
  const { data: targetsData, isLoading: targetsLoading } = useTargets({ limit: 100 });
  const targets = targetsData?.targets || [];

  // Fetch geographic units tree (for creating allocations)
  const { data: geoUnitsData, isLoading: geoLoading } = useGeographicUnitsTree();
  const geoUnits = useMemo(() => {
    // Flatten the tree for select options
    const flatten = (units: GeographicUnit[]): GeographicUnit[] => {
      let result: GeographicUnit[] = [];
      for (const unit of units) {
        result.push(unit);
        if (unit.children && unit.children.length > 0) {
          result = [...result, ...flatten(unit.children as GeographicUnit[])];
        }
      }
      return result;
    };
    return geoUnitsData ? flatten(geoUnitsData) : [];
  }, [geoUnitsData]);

  // Fetch target allocations tree for selected target
  const { data: allocations, isLoading: allocationsLoading, refetch: refetchAllocations } = useTargetAllocationTree(selectedTargetId);

  // Transform allocations to tree nodes
  const treeData = useMemo(() => {
    if (!allocations || allocations.length === 0) {
      return null;
    }
    return transformAllocationsToTree(allocations);
  }, [allocations]);

  // Create root node from selected target
  const rootNode = useMemo(() => {
    if (!selectedTargetId || !targets.length) return null;

    const target = targets.find((t: TargetType) => t.id === selectedTargetId);
    if (!target) return null;

    return {
      id: target.code || target.id,
      code: target.code || target.id,
      name: target.name,
      type: 'root' as const,
      target: Number(target.totalTarget) || 0,
      achieved: Number(target.totalAchieved) || 0,
      metric: target.metric || 'CASES',
      children: treeData || [],
    };
  }, [selectedTargetId, targets, treeData]);

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

  const isLoading = targetsLoading || geoLoading || allocationsLoading;

  // Calculate overall stats
  const overallProgress = rootNode ? getProgress(rootNode.achieved, rootNode.target) : 0;

  // Handlers for dialogs
  const handleCreateAllocation = (parentNode?: TreeNode) => {
    setCreateParentNode(parentNode || null);
    setShowCreateDialog(true);
  };

  const handleUpdateProgress = () => {
    if (selectedNode) {
      setShowUpdateDialog(true);
    }
  };

  const handleAllocationSuccess = () => {
    refetchAllocations();
    toast({
      title: 'Dữ liệu đã cập nhật',
      description: 'Danh sách phân bổ đã được làm mới',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Phân bổ Mục tiêu</h1>
              <p className="text-sm text-muted-foreground">Cấu trúc phân cấp mục tiêu theo vùng miền</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Target Selector */}
              <select
                value={selectedTargetId}
                onChange={(e) => {
                  setSelectedTargetId(e.target.value);
                  setSelectedNode(null);
                  setSelectedPath([]);
                  setExpanded({});
                }}
                className="h-9 px-3 pr-8 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-foreground"
              >
                <option value="">Chọn mục tiêu...</option>
                {targets.map((target: TargetType) => (
                  <option key={target.id} value={target.id}>
                    {target.name} ({target.code || target.id})
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleCreateAllocation()}
                disabled={!selectedTargetId}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Tạo phân bổ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* No Target Selected State */}
        {!selectedTargetId && (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-foreground-subtle" strokeWidth={1.5} />
            <h3 className="text-lg font-medium text-foreground mb-2">Chọn mục tiêu để xem phân bổ</h3>
            <p className="text-muted-foreground mb-6">
              Vui lòng chọn một mục tiêu từ danh sách để xem và quản lý cấu trúc phân bổ
            </p>
            {targets.length === 0 && !targetsLoading && (
              <p className="text-warning text-sm">
                Chưa có mục tiêu nào. Vui lòng tạo mục tiêu trước khi phân bổ.
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {selectedTargetId && isLoading && (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
            <p className="text-muted-foreground">Đang tải dữ liệu phân bổ...</p>
          </div>
        )}

        {/* Main Content when target is selected */}
        {selectedTargetId && !isLoading && rootNode && (
          <div className="flex gap-6">
            {/* Left Panel */}
            <div className="flex-1 min-w-0">
              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="text-sm text-muted-foreground mb-1">Mục tiêu tổng</div>
                  <div className="text-2xl font-semibold text-foreground">{formatNumber(rootNode.target)}</div>
                  <div className="text-xs text-foreground-subtle">{getMetricLabel(rootNode.metric as 'CASES' | 'VOLUME_LITERS' | 'REVENUE_VND' | 'UNITS')}</div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="text-sm text-muted-foreground mb-1">Đã đạt</div>
                  <div className="text-2xl font-semibold text-success">{formatNumber(rootNode.achieved)}</div>
                  <div className="text-xs text-foreground-subtle">{overallProgress}% hoàn thành</div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="text-sm text-muted-foreground mb-1">Còn lại</div>
                  <div className="text-2xl font-semibold text-warning">{formatNumber(Math.max(0, rootNode.target - rootNode.achieved))}</div>
                  <div className="text-xs text-foreground-subtle">cần đạt thêm</div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="text-sm text-muted-foreground mb-1">Tiến độ</div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-semibold" style={{ color: getProgressColor(overallProgress) }}>
                      {overallProgress}%
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(overallProgress, 100)}%`, backgroundColor: getProgressColor(overallProgress) }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
                      className="w-full h-9 pl-9 pr-3 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-foreground placeholder:text-muted-foreground"
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
                  <TargetTreeNode
                    node={rootNode}
                    expanded={{ ...expanded, [rootNode.id]: true }}
                    onToggle={handleToggle}
                    onSelect={handleSelect}
                    selectedId={selectedNode?.id || null}
                  />
                ) : (
                  <div className="text-center py-12">
                    <FolderTree className="w-12 h-12 mx-auto mb-4 text-foreground-subtle" strokeWidth={1.5} />
                    <h3 className="font-medium text-foreground mb-2">Chưa có phân bổ</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Mục tiêu này chưa có dữ liệu phân bổ theo vùng miền
                    </p>
                    <button
                      onClick={() => handleCreateAllocation()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4" />
                      Tạo phân bổ đầu tiên
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Details */}
            <div className="w-[360px] flex-shrink-0">
              {/* Progress Summary */}
              <ProgressSummaryPanel targetId={selectedTargetId} />

              {selectedNode ? (
                <DetailPanel
                  node={selectedNode}
                  onAddChild={() => handleCreateAllocation(selectedNode)}
                  onUpdateProgress={handleUpdateProgress}
                />
              ) : (
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                  <Target className="w-12 h-12 mx-auto mb-4 text-foreground-subtle" strokeWidth={1.5} />
                  <h3 className="font-medium text-foreground mb-2">Chọn một mục</h3>
                  <p className="text-sm text-muted-foreground">
                    Click vào bất kỳ mục nào trong cây để xem chi tiết
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Allocation Dialog */}
      <CreateAllocationDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        targetId={selectedTargetId}
        parentNode={createParentNode}
        geoUnits={geoUnits}
        onSuccess={handleAllocationSuccess}
      />

      {/* Update Progress Dialog */}
      <UpdateProgressDialog
        isOpen={showUpdateDialog}
        onClose={() => setShowUpdateDialog(false)}
        node={selectedNode}
        onSuccess={handleAllocationSuccess}
      />
    </div>
  );
}
