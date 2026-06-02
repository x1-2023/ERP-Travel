'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import {
  AlertTriangle,
  Save,
  ArrowLeft,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Plus,
  X,
  GripVertical,
} from 'lucide-react';

interface WidgetType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

interface SelectedWidget {
  id: string;
  widgetTypeId: string;
  name: string;
  config: Record<string, unknown>;
}

const WIDGET_TYPES: WidgetType[] = [
  {
    id: 'kpi_card',
    name: 'Thẻ KPI',
    description: 'Hiển thị một chỉ số quan trọng',
    icon: <TrendingUp className="h-5 w-5" />,
    category: 'Cơ bản',
  },
  {
    id: 'bar_chart',
    name: 'Biểu đồ cột',
    description: 'So sánh giá trị giữa các nhóm',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'Biểu đồ',
  },
  {
    id: 'pie_chart',
    name: 'Biểu đồ tròn',
    description: 'Hiển thị tỷ lệ phần trăm',
    icon: <PieChart className="h-5 w-5" />,
    category: 'Biểu đồ',
  },
  {
    id: 'line_chart',
    name: 'Biểu đồ đường',
    description: 'Xu hướng theo thời gian',
    icon: <TrendingUp className="h-5 w-5" />,
    category: 'Biểu đồ',
  },
  {
    id: 'headcount',
    name: 'Nhân sự',
    description: 'Tổng quan số lượng nhân viên',
    icon: <Users className="h-5 w-5" />,
    category: 'HR',
  },
  {
    id: 'compensation',
    name: 'Lương thưởng',
    description: 'Tổng quan chi phí lương',
    icon: <DollarSign className="h-5 w-5" />,
    category: 'HR',
  },
  {
    id: 'attendance',
    name: 'Chuyên cần',
    description: 'Thống kê chấm công',
    icon: <Clock className="h-5 w-5" />,
    category: 'HR',
  },
];

export default function NewDashboardPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [widgets, setWidgets] = useState<SelectedWidget[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addWidget(widgetType: WidgetType) {
    const newWidget: SelectedWidget = {
      id: `widget_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      widgetTypeId: widgetType.id,
      name: widgetType.name,
      config: {},
    };
    setWidgets((prev) => [...prev, newWidget]);
  }

  function removeWidget(widgetId: string) {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Vui lòng nhập tên dashboard');
      return;
    }

    if (widgets.length === 0) {
      setError('Vui lòng thêm ít nhất một widget');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/analytics/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          widgets: widgets.map((w, index) => ({
            widgetTypeId: w.widgetTypeId,
            name: w.name,
            config: w.config,
            order: index,
          })),
        }),
      });

      if (!response.ok) throw new Error('Không thể lưu dashboard');

      const result = await response.json();
      router.push(`/analytics/dashboards/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  }

  const categories = Array.from(new Set(WIDGET_TYPES.map((w) => w.category)));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Tạo Dashboard mới</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Đang lưu...' : 'Lưu Dashboard'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form & Widget Palette */}
        <div className="space-y-4">
          {/* Form */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Thông tin cơ bản</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Tên dashboard *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên dashboard..."
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mô tả</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả..."
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Widget Palette */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Thêm Widget</h3>
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category}>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">
                    {category}
                  </h4>
                  <div className="space-y-1">
                    {WIDGET_TYPES.filter((w) => w.category === category).map((widgetType) => (
                      <button
                        key={widgetType.id}
                        onClick={() => addWidget(widgetType)}
                        className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
                      >
                        <div className="text-muted-foreground">{widgetType.icon}</div>
                        <div>
                          <div className="text-sm font-medium">{widgetType.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {widgetType.description}
                          </div>
                        </div>
                        <Plus className="h-4 w-4 ml-auto text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
          <Card className="p-4 min-h-[500px]">
            <h3 className="font-semibold mb-4">Xem trước bố cục</h3>
            {widgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mb-4" />
                <p className="text-sm">Chưa có widget nào</p>
                <p className="text-xs mt-1">
                  Chọn widget từ bảng bên trái để thêm vào dashboard
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {widgets.map((widget) => {
                  const widgetType = WIDGET_TYPES.find(
                    (wt) => wt.id === widget.widgetTypeId
                  );
                  return (
                    <div
                      key={widget.id}
                      className="border rounded-lg p-3 flex items-center gap-3 hover:border-primary transition-colors group"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <div className="text-muted-foreground">
                        {widgetType?.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{widget.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {widgetType?.category}
                        </div>
                      </div>
                      <button
                        onClick={() => removeWidget(widget.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
