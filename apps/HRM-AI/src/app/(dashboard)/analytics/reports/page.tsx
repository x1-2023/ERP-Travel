'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import {
  AlertTriangle,
  Plus,
  FileText,
  Play,
  Save,
  X,
  Eye,
  Filter,
  Columns,
} from 'lucide-react';

interface SavedReport {
  id: string;
  name: string;
  dataSource: string;
  createdAt: string;
  updatedAt: string;
  lastRun: string | null;
}

interface DataSourceOption {
  id: string;
  name: string;
  columns: { id: string; name: string; type: string }[];
}

interface FilterRow {
  id: string;
  column: string;
  operator: string;
  value: string;
}

const DATA_SOURCES: DataSourceOption[] = [
  {
    id: 'employees',
    name: 'Nhân viên',
    columns: [
      { id: 'name', name: 'Họ tên', type: 'text' },
      { id: 'department', name: 'Phòng ban', type: 'text' },
      { id: 'position', name: 'Vị trí', type: 'text' },
      { id: 'salary', name: 'Lương', type: 'number' },
      { id: 'startDate', name: 'Ngày vào', type: 'date' },
      { id: 'gender', name: 'Giới tính', type: 'text' },
      { id: 'age', name: 'Tuổi', type: 'number' },
      { id: 'status', name: 'Trạng thái', type: 'text' },
    ],
  },
  {
    id: 'attendance',
    name: 'Chấm công',
    columns: [
      { id: 'employeeName', name: 'Nhân viên', type: 'text' },
      { id: 'date', name: 'Ngày', type: 'date' },
      { id: 'checkIn', name: 'Giờ vào', type: 'time' },
      { id: 'checkOut', name: 'Giờ ra', type: 'time' },
      { id: 'workHours', name: 'Giờ làm', type: 'number' },
      { id: 'status', name: 'Trạng thái', type: 'text' },
    ],
  },
  {
    id: 'payroll',
    name: 'Bảng lương',
    columns: [
      { id: 'employeeName', name: 'Nhân viên', type: 'text' },
      { id: 'month', name: 'Tháng', type: 'text' },
      { id: 'baseSalary', name: 'Lương cơ bản', type: 'number' },
      { id: 'allowance', name: 'Phụ cấp', type: 'number' },
      { id: 'deduction', name: 'Khấu trừ', type: 'number' },
      { id: 'netSalary', name: 'Thực lĩnh', type: 'number' },
    ],
  },
];

const OPERATORS = [
  { id: 'eq', name: 'Bằng' },
  { id: 'neq', name: 'Khác' },
  { id: 'gt', name: 'Lớn hơn' },
  { id: 'lt', name: 'Nhỏ hơn' },
  { id: 'gte', name: 'Lớn hơn hoặc bằng' },
  { id: 'lte', name: 'Nhỏ hơn hoặc bằng' },
  { id: 'contains', name: 'Chứa' },
  { id: 'startsWith', name: 'Bắt đầu bằng' },
];

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  // Builder state
  const [reportName, setReportName] = useState('');
  const [selectedDataSource, setSelectedDataSource] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterRow[]>([]);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[] | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/reports');
      if (!response.ok) throw new Error('Không thể tải danh sách báo cáo');
      const result = await response.json();
      setReports(result.data || result.reports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }

  function toggleColumn(columnId: string) {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((c) => c !== columnId)
        : [...prev, columnId]
    );
  }

  function addFilter() {
    const dataSource = DATA_SOURCES.find((ds) => ds.id === selectedDataSource);
    if (!dataSource || dataSource.columns.length === 0) return;

    setFilters((prev) => [
      ...prev,
      {
        id: `filter_${Date.now()}`,
        column: dataSource.columns[0].id,
        operator: 'eq',
        value: '',
      },
    ]);
  }

  function updateFilter(id: string, field: keyof FilterRow, value: string) {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  }

  function removeFilter(id: string) {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }

  async function handlePreview() {
    if (!selectedDataSource || selectedColumns.length === 0) {
      setError('Vui lòng chọn nguồn dữ liệu và ít nhất một cột');
      return;
    }

    try {
      setPreviewing(true);
      setError(null);
      const response = await fetch('/api/analytics/reports/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataSource: selectedDataSource,
          columns: selectedColumns,
          filters: filters.filter((f) => f.value.trim() !== ''),
        }),
      });
      if (!response.ok) throw new Error('Không thể tạo xem trước');
      const result = await response.json();
      setPreviewData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setPreviewing(false);
    }
  }

  async function handleSaveReport() {
    if (!reportName.trim()) {
      setError('Vui lòng nhập tên báo cáo');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reportName.trim(),
          dataSource: selectedDataSource,
          columns: selectedColumns,
          filters: filters.filter((f) => f.value.trim() !== ''),
        }),
      });
      if (!response.ok) throw new Error('Không thể lưu báo cáo');
      await response.json();
      setShowBuilder(false);
      resetBuilder();
      fetchReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  }

  function resetBuilder() {
    setReportName('');
    setSelectedDataSource('');
    setSelectedColumns([]);
    setFilters([]);
    setPreviewData(null);
    setError(null);
  }

  const currentDataSource = DATA_SOURCES.find((ds) => ds.id === selectedDataSource);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Báo cáo</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Báo cáo</h1>
        <Button onClick={() => setShowBuilder(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo báo cáo mới
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      )}

      {/* Report Builder */}
      {showBuilder && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tạo báo cáo mới</h2>
            <Button variant="outline" size="sm" onClick={() => {
              setShowBuilder(false);
              resetBuilder();
            }}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Report Name */}
            <div>
              <label className="text-sm font-medium">Tên báo cáo *</label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Nhập tên báo cáo..."
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Data Source */}
            <div>
              <label className="text-sm font-medium">Nguồn dữ liệu *</label>
              <select
                value={selectedDataSource}
                onChange={(e) => {
                  setSelectedDataSource(e.target.value);
                  setSelectedColumns([]);
                  setFilters([]);
                  setPreviewData(null);
                }}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Chọn nguồn dữ liệu...</option>
                {DATA_SOURCES.map((ds) => (
                  <option key={ds.id} value={ds.id}>{ds.name}</option>
                ))}
              </select>
            </div>

            {/* Column Selection */}
            {currentDataSource && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Columns className="h-4 w-4" />
                  <label className="text-sm font-medium">Chọn cột hiển thị</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentDataSource.columns.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => toggleColumn(col.id)}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                        selectedColumns.includes(col.id)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted border-input'
                      }`}
                    >
                      {col.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            {currentDataSource && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <label className="text-sm font-medium">Bộ lọc</label>
                  </div>
                  <Button variant="outline" size="sm" onClick={addFilter}>
                    <Plus className="h-3 w-3 mr-1" />
                    Thêm bộ lọc
                  </Button>
                </div>
                <div className="space-y-2">
                  {filters.map((filter) => (
                    <div key={filter.id} className="flex gap-2 items-center">
                      <select
                        value={filter.column}
                        onChange={(e) => updateFilter(filter.id, 'column', e.target.value)}
                        className="px-2 py-1.5 border rounded-md text-sm flex-1"
                      >
                        {currentDataSource.columns.map((col) => (
                          <option key={col.id} value={col.id}>{col.name}</option>
                        ))}
                      </select>
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                        className="px-2 py-1.5 border rounded-md text-sm flex-1"
                      >
                        {OPERATORS.map((op) => (
                          <option key={op.id} value={op.id}>{op.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                        placeholder="Giá trị..."
                        className="px-2 py-1.5 border rounded-md text-sm flex-1"
                      />
                      <button
                        onClick={() => removeFilter(filter.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handlePreview} disabled={previewing}>
                <Play className="h-4 w-4 mr-1" />
                {previewing ? 'Đang tải...' : 'Xem trước'}
              </Button>
              <Button onClick={handleSaveReport} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Đang lưu...' : 'Lưu báo cáo'}
              </Button>
            </div>

            {/* Preview Results */}
            {previewData && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Kết quả xem trước</h4>
                <div className="overflow-x-auto border rounded-md">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        {selectedColumns.map((colId) => {
                          const col = currentDataSource?.columns.find((c) => c.id === colId);
                          return (
                            <th key={colId} className="text-left py-2 px-3">
                              {col?.name || colId}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="border-b">
                          {selectedColumns.map((colId) => (
                            <td key={colId} className="py-2 px-3">
                              {String(row[colId] ?? '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 10 && (
                    <div className="text-center py-2 text-xs text-muted-foreground">
                      Hiển thị 10/{previewData.length} dòng
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Saved Reports List */}
      {reports.length === 0 && !showBuilder ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Chưa có báo cáo nào</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Tạo báo cáo tùy chỉnh để phân tích dữ liệu HR
          </p>
          <Button onClick={() => setShowBuilder(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo báo cáo đầu tiên
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/analytics/reports/${report.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {DATA_SOURCES.find((ds) => ds.id === report.dataSource)?.name || report.dataSource}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Tạo: {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      {report.lastRun && (
                        <span className="text-xs text-muted-foreground">
                          Chạy lần cuối: {new Date(report.lastRun).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/analytics/reports/${report.id}`);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Xem
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
