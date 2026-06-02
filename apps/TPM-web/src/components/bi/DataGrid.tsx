/**
 * Data Grid Component
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ColumnConfig } from '@/types/advanced';

interface DataGridProps {
  columns: ColumnConfig[];
  data: Record<string, unknown>[];
  className?: string;
}

export function DataGrid({ columns, data, className }: DataGridProps) {
  const formatValue = (value: unknown, column: ColumnConfig): string => {
    if (value === null || value === undefined) {
      return '-';
    }

    switch (column.type) {
      case 'CURRENCY':
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        }).format(Number(value));

      case 'PERCENTAGE':
        return `${Number(value).toFixed(1)}%`;

      case 'NUMBER':
        return new Intl.NumberFormat('vi-VN').format(Number(value));

      case 'DATE':
        if (value instanceof Date) {
          return value.toLocaleDateString('vi-VN');
        }
        if (typeof value === 'string') {
          return new Date(value).toLocaleDateString('vi-VN');
        }
        return String(value);

      default:
        return String(value);
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className={cn('rounded-md border overflow-auto', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.field}
                style={{ width: column.width ? `${column.width}px` : undefined }}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.field}>
                  {formatValue(row[column.field], column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
