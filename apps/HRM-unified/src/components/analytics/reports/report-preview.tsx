'use client';

import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsDataTable } from '../tables/analytics-data-table';
import { cn } from '@/lib/utils';

interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  format?: (value: unknown) => string;
}

interface ReportPreviewProps {
  title?: string;
  columns: ColumnDef[];
  data: Record<string, unknown>[];
  loading?: boolean;
  totalRows?: number;
  onExport?: () => void;
  className?: string;
}

export function ReportPreview({
  title = 'Kết quả báo cáo',
  columns,
  data,
  loading = false,
  totalRows,
  onExport,
  className,
}: ReportPreviewProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {totalRows !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              {totalRows.toLocaleString('vi-VN')} bản ghi
            </p>
          )}
        </div>
        {onExport && data.length > 0 && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Xuất Excel
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Đang tải dữ liệu...</span>
          </div>
        ) : data.length > 0 ? (
          <AnalyticsDataTable columns={columns} data={data} sortable />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Chưa có dữ liệu. Nhấn &quot;Chạy báo cáo&quot; để xem kết quả.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
