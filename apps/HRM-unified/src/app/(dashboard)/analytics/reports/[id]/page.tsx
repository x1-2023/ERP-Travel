'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import {
  AlertTriangle,
  ArrowLeft,
  Play,
  Download,
  Pencil,
  Trash2,
  FileText,
  Filter,
  Columns,
  Clock,
} from 'lucide-react';

interface FilterConfig {
  column: string;
  operator: string;
  value: string;
}

interface ColumnConfig {
  id: string;
  name: string;
  type: string;
}

interface ReportConfig {
  id: string;
  name: string;
  dataSource: string;
  dataSourceName: string;
  columns: string[];
  columnConfigs: ColumnConfig[];
  filters: FilterConfig[];
  createdAt: string;
  updatedAt: string;
  lastRun: string | null;
}

export default function ReportViewPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<ReportConfig | null>(null);
  const [results, setResults] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics/reports/${reportId}`);
        if (!response.ok) throw new Error('Không thể tải báo cáo');
        const result = await response.json();
        setReport(result.data ?? result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [reportId]);

  async function handleRun() {
    try {
      setRunning(true);
      setError(null);
      const response = await fetch(`/api/analytics/reports/${reportId}/run`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Không thể chạy báo cáo');
      const result = await response.json();
      setResults(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi chạy');
    } finally {
      setRunning(false);
    }
  }

  async function handleExport() {
    try {
      setExporting(true);
      setError(null);
      const response = await fetch(`/api/analytics/reports/${reportId}/export`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Không thể xuất báo cáo');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report?.name || 'report'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xuất');
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Bạn có chắc muốn xóa báo cáo này?')) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/analytics/reports/${reportId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Không thể xóa báo cáo');
      router.push('/analytics/reports');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa');
      setDeleting(false);
    }
  }

  const getOperatorLabel = (op: string) => {
    const labels: Record<string, string> = {
      eq: 'Bằng',
      neq: 'Khác',
      gt: 'Lớn hơn',
      lt: 'Nhỏ hơn',
      gte: '>=',
      lte: '<=',
      contains: 'Chứa',
      startsWith: 'Bắt đầu bằng',
    };
    return labels[op] || op;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card className="p-4">
          <Skeleton className="h-[100px] w-full" />
        </Card>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card className="p-4">
          <Skeleton className="h-[300px] w-full" />
        </Card>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/analytics/reports')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              {report.name}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Badge variant="outline">{report.dataSourceName}</Badge>
              <span>
                Tạo: {new Date(report.createdAt).toLocaleDateString('vi-VN')}
              </span>
              {report.lastRun && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Chạy lần cuối: {new Date(report.lastRun).toLocaleString('vi-VN')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      )}

      {/* Report Configuration */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Cấu hình báo cáo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Columns */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Columns className="h-4 w-4" />
              <span>Cột hiển thị ({report.columns.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {report.columnConfigs.map((col) => (
                <Badge key={col.id} variant="secondary" className="text-xs">
                  {col.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Filter className="h-4 w-4" />
              <span>Bộ lọc ({report.filters.length})</span>
            </div>
            {report.filters.length === 0 ? (
              <span className="text-sm text-muted-foreground">Không có bộ lọc</span>
            ) : (
              <div className="space-y-1">
                {report.filters.map((filter, idx) => {
                  const col = report.columnConfigs.find((c) => c.id === filter.column);
                  return (
                    <div key={idx} className="text-sm">
                      <span className="font-medium">{col?.name || filter.column}</span>{' '}
                      <span className="text-muted-foreground">{getOperatorLabel(filter.operator)}</span>{' '}
                      <span className="font-medium">&quot;{filter.value}&quot;</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleRun} disabled={running}>
          <Play className="h-4 w-4 mr-1" />
          {running ? 'Đang chạy...' : 'Chạy báo cáo'}
        </Button>
        <Button variant="outline" onClick={handleExport} disabled={exporting || !results}>
          <Download className="h-4 w-4 mr-1" />
          {exporting ? 'Đang xuất...' : 'Xuất Excel'}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/analytics/reports/${reportId}/edit`)}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Chỉnh sửa
        </Button>
        <Button
          variant="outline"
          className="text-red-600 hover:text-red-700"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {deleting ? 'Đang xóa...' : 'Xóa'}
        </Button>
      </div>

      {/* Results Table */}
      {results && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Kết quả ({results.length} dòng)</h3>
          </div>
          {results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Không có dữ liệu phù hợp</p>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                      #
                    </th>
                    {report.columnConfigs
                      .filter((col) => report.columns.includes(col.id))
                      .map((col) => (
                        <th key={col.id} className="text-left py-2 px-3">
                          {col.name}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/30">
                      <td className="py-2 px-3 text-xs text-muted-foreground">
                        {idx + 1}
                      </td>
                      {report.columns.map((colId) => (
                        <td key={colId} className="py-2 px-3">
                          {formatCellValue(row[colId])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {!results && (
        <Card className="p-8 text-center text-muted-foreground">
          <Play className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Nhấn &quot;Chạy báo cáo&quot; để xem kết quả</p>
        </Card>
      )}
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    return value.toLocaleString('vi-VN');
  }
  return String(value);
}
