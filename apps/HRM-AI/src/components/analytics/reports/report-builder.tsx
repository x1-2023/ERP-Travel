'use client';

import { useState } from 'react';
import { Play, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColumnSelector } from './column-selector';
import { FilterBuilder } from './filter-builder';
import { cn } from '@/lib/utils';

interface ColumnOption {
  key: string;
  label: string;
  group?: string;
}

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
}

interface FilterRow {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface DataSourceOption {
  value: string;
  label: string;
  columns: ColumnOption[];
  filterFields: FilterField[];
}

interface ReportConfig {
  dataSource: string;
  selectedColumns: string[];
  filters: FilterRow[];
  groupBy: string;
}

interface ReportBuilderProps {
  dataSources: DataSourceOption[];
  onRun: (config: ReportConfig) => void;
  onSave?: (config: ReportConfig, name: string) => void;
  loading?: boolean;
  className?: string;
}

export function ReportBuilder({
  dataSources,
  onRun,
  onSave,
  loading = false,
  className,
}: ReportBuilderProps) {
  const [dataSource, setDataSource] = useState(dataSources[0]?.value || '');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterRow[]>([]);
  const [groupBy, setGroupBy] = useState('');
  const [reportName, setReportName] = useState('');

  const currentSource = dataSources.find((ds) => ds.value === dataSource);
  const columns = currentSource?.columns || [];
  const filterFields = currentSource?.filterFields || [];

  const handleDataSourceChange = (value: string) => {
    setDataSource(value);
    setSelectedColumns([]);
    setFilters([]);
    setGroupBy('');
  };

  const handleRun = () => {
    onRun({
      dataSource,
      selectedColumns,
      filters,
      groupBy,
    });
  };

  const handleSave = () => {
    if (onSave && reportName.trim()) {
      onSave(
        { dataSource, selectedColumns, filters, groupBy },
        reportName.trim()
      );
      setReportName('');
    }
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Tạo báo cáo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Source */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nguồn dữ liệu</label>
          <select
            value={dataSource}
            onChange={(e) => handleDataSourceChange(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {dataSources.map((ds) => (
              <option key={ds.value} value={ds.value}>
                {ds.label}
              </option>
            ))}
          </select>
        </div>

        {/* Column Selector */}
        {columns.length > 0 && (
          <ColumnSelector
            dataSource={dataSource}
            columns={columns}
            selected={selectedColumns}
            onChange={setSelectedColumns}
          />
        )}

        {/* Filters */}
        {filterFields.length > 0 && (
          <FilterBuilder
            fields={filterFields}
            filters={filters}
            onChange={setFilters}
          />
        )}

        {/* Group By */}
        {columns.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Nhóm theo</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Không nhóm</option>
              {columns.map((col) => (
                <option key={col.key} value={col.key}>
                  {col.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button onClick={handleRun} disabled={loading || selectedColumns.length === 0}>
            <Play className="h-3.5 w-3.5 mr-1.5" />
            {loading ? 'Đang chạy...' : 'Chạy báo cáo'}
          </Button>

          {onSave && (
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Tên báo cáo..."
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm w-40"
              />
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={!reportName.trim() || selectedColumns.length === 0}
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Lưu
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
