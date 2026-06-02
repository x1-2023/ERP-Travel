'use client';

import { useState } from 'react';
import { Play, Pencil, Trash2, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SavedReport {
  id: string;
  name: string;
  dataSource: string;
  dataSourceLabel: string;
  createdAt: string;
  lastRunAt?: string;
  columnCount: number;
  filterCount: number;
}

interface SavedReportsListProps {
  reports: SavedReport[];
  onRun: (reportId: string) => void;
  onEdit: (reportId: string) => void;
  onDelete: (reportId: string) => void;
  loading?: string; // id of currently running report
  className?: string;
}

export function SavedReportsList({
  reports,
  onRun,
  onEdit,
  onDelete,
  loading,
  className,
}: SavedReportsListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      // Auto-reset confirmation after 3s
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Báo cáo đã lưu</CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Chưa có báo cáo nào được lưu.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="rounded-md bg-primary/10 p-2 shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{report.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {report.dataSourceLabel} | {report.columnCount} cột | {report.filterCount} bộ lọc
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Tạo: {formatDate(report.createdAt)}</span>
                      {report.lastRunAt && (
                        <span className="ml-2">| Chạy: {formatDate(report.lastRunAt)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRun(report.id)}
                    disabled={loading === report.id}
                    className="h-8 w-8 p-0"
                    title="Chạy báo cáo"
                  >
                    <Play className={cn('h-3.5 w-3.5', loading === report.id && 'animate-pulse')} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(report.id)}
                    className="h-8 w-8 p-0"
                    title="Chỉnh sửa"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(report.id)}
                    className={cn(
                      'h-8 w-8 p-0',
                      confirmDelete === report.id && 'text-destructive hover:text-destructive'
                    )}
                    title={confirmDelete === report.id ? 'Nhấn lần nữa để xóa' : 'Xóa'}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
