'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BarChart } from '@/components/analytics/charts/BarChart';
import { LineChart } from '@/components/analytics/charts/LineChart';
import { PieChart } from '@/components/analytics/charts/PieChart';
import {
  AlertTriangle,
  Pencil,
  Save,
  X,
  Trash2,
  GripVertical,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
} from 'lucide-react';

interface Widget {
  id: string;
  widgetTypeId: string;
  name: string;
  config: Record<string, unknown>;
  order: number;
  data?: unknown;
}

interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  createdAt: string;
  updatedAt: string;
}

function SortableWidget({
  widget,
  isEditMode,
  onRemove,
}: {
  widget: Widget;
  isEditMode: boolean;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getWidgetIcon = (typeId: string) => {
    switch (typeId) {
      case 'bar_chart':
        return <BarChart3 className="h-5 w-5 text-blue-600" />;
      case 'line_chart':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'headcount':
        return <Users className="h-5 w-5 text-purple-600" />;
      case 'compensation':
        return <DollarSign className="h-5 w-5 text-yellow-600" />;
      case 'attendance':
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return <BarChart3 className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card className={`p-4 h-full ${isEditMode ? 'border-dashed border-2' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isEditMode && (
              <div {...attributes} {...listeners} className="cursor-grab">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            {getWidgetIcon(widget.widgetTypeId)}
            <h4 className="font-medium text-sm">{widget.name}</h4>
          </div>
          {isEditMode && (
            <button
              onClick={() => onRemove(widget.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="h-[200px] flex items-center justify-center bg-muted/30 rounded">
          {widget.data ? (
            <WidgetContent widget={widget} />
          ) : (
            <span className="text-sm text-muted-foreground">
              {isEditMode ? 'Widget preview' : 'Đang tải...'}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}

function WidgetContent({ widget }: { widget: Widget }) {
  const chartData = widget.data as { labels?: string[]; values?: number[] } | undefined;

  if (!chartData || !chartData.labels || !chartData.values) {
    return <span className="text-sm text-muted-foreground">Không có dữ liệu</span>;
  }

  switch (widget.widgetTypeId) {
    case 'bar_chart':
      return (
        <BarChart
          data={{
            labels: chartData.labels,
            datasets: [{ label: widget.name, data: chartData.values }],
          }}
        />
      );
    case 'line_chart':
      return (
        <LineChart
          data={{
            labels: chartData.labels,
            datasets: [{ label: widget.name, data: chartData.values }],
          }}
        />
      );
    case 'pie_chart':
      return (
        <PieChart
          data={{
            labels: chartData.labels,
            datasets: [{ label: widget.name, data: chartData.values }],
          }}
        />
      );
    default:
      return (
        <div className="text-center">
          <div className="text-2xl font-bold">
            {chartData.values[0]?.toLocaleString() ?? '-'}
          </div>
          <div className="text-sm text-muted-foreground">{widget.name}</div>
        </div>
      );
  }
}

export default function DashboardViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dashboardId = params.id as string;

  const [dashboard, setDashboard] = useState<DashboardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(
    searchParams.get('edit') === 'true'
  );
  const [saving, setSaving] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics/dashboards/${dashboardId}`);
        if (!response.ok) throw new Error('Không thể tải dashboard');
        const result = await response.json();
        setDashboard(result);
        setWidgets(result.widgets || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [dashboardId]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  function removeWidget(widgetId: string) {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  }

  async function handleSave() {
    try {
      setSaving(true);
      const response = await fetch(`/api/analytics/dashboards/${dashboardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dashboard,
          widgets: widgets.map((w, index) => ({ ...w, order: index })),
        }),
      });
      if (!response.ok) throw new Error('Không thể lưu dashboard');
      const result = await response.json();
      setDashboard(result);
      setIsEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-[200px] w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/analytics/dashboards')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{dashboard.name}</h1>
            {dashboard.description && (
              <p className="text-sm text-muted-foreground">{dashboard.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={() => {
                setWidgets(dashboard.widgets || []);
                setIsEditMode(false);
              }}>
                <X className="h-4 w-4 mr-1" />
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditMode(true)}>
              <Pencil className="h-4 w-4 mr-1" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      {isEditMode && (
        <Alert>
          <Pencil className="h-4 w-4" />
          <span>
            Chế độ chỉnh sửa: Kéo thả để sắp xếp, nhấn nút xóa để loại bỏ widget
          </span>
        </Alert>
      )}

      {/* Widgets Grid */}
      {widgets.length === 0 ? (
        <Card className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Chưa có widget nào</h3>
          <p className="text-sm text-muted-foreground">
            Chuyển sang chế độ chỉnh sửa để thêm widget
          </p>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={widgets.map((w) => w.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgets.map((widget) => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  isEditMode={isEditMode}
                  onRemove={removeWidget}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
