/**
 * Data Table Component - Sortable and filterable table for recent activity
 * Thành phần Bảng Dữ liệu - Bảng có thể sắp xếp và lọc cho hoạt động gần đây
 */

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { TableRow } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DataTableProps {
  data: TableRow[];
  columns?: (keyof TableRow)[];
  pageSize?: number;
  onRowClick?: (row: TableRow) => void;
  loading?: boolean;
}

type SortOrder = 'asc' | 'desc' | null;

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns = ['timestamp', 'module', 'action', 'entity', 'user'],
  pageSize = 10,
  onRowClick,
  loading = false,
}) => {
  const [sortColumn, setSortColumn] = useState<keyof TableRow | null>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('');

  // Filter data
  const filteredData = useMemo(() => {
    if (!filter) return data;
    return data.filter((row) =>
      Object.values(row).some(
        (value) =>
          value &&
          String(value).toLowerCase().includes(filter.toLowerCase()),
      ),
    );
  }, [data, filter]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortOrder) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      // Handle dates
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortOrder === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      // Handle strings and numbers
      if (String(aVal) < String(bVal)) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (String(aVal) > String(bVal)) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortColumn, sortOrder]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return sortedData.slice(startIdx, startIdx + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (column: keyof TableRow) => {
    if (sortColumn === column) {
      setSortOrder(
        sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? null : 'asc',
      );
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const formatValue = (value: unknown): string => {
    if (value instanceof Date) {
      return formatDistanceToNow(value, {
        addSuffix: true,
        locale: vi,
      });
    }
    return String(value || '—');
  };

  const getColumnLabel = (col: keyof TableRow): string => {
    const labels: Record<string, string> = {
      timestamp: 'Time | Thời gian',
      module: 'Module | Mô-đun',
      action: 'Action | Hành động',
      entity: 'Entity | Thực thể',
      user: 'User | Người dùng',
    };
    return labels[String(col)] || String(col);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="h-10 animate-pulse rounded bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <input
          type="text"
          placeholder="Search | Tìm kiếm..."
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={String(col)}
                  onClick={() => handleSort(col)}
                  className={clsx(
                    'px-4 py-3 text-left font-semibold text-gray-700',
                    'cursor-pointer hover:bg-gray-100 transition-colors',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {getColumnLabel(col)}
                    {sortColumn === col && (
                      <>
                        {sortOrder === 'asc' && (
                          <ChevronUp size={16} className="text-blue-600" />
                        )}
                        {sortOrder === 'desc' && (
                          <ChevronDown size={16} className="text-blue-600" />
                        )}
                      </>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick?.(row)}
                  className={clsx(
                    'border-b border-gray-100 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-gray-50',
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={`${row.id}-${String(col)}`}
                      className="px-4 py-3 text-gray-700"
                    >
                      {formatValue(row[col])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No data | Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer - Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-600">
            {paginatedData.length > 0 ? (
              <>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
                {sortedData.length}
              </>
            ) : (
              'No results'
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={clsx(
                'rounded border px-3 py-1 text-xs font-medium transition-colors',
                currentPage === 1
                  ? 'border-gray-200 bg-gray-100 text-gray-400'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50',
              )}
            >
              Previous | Trước
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={clsx(
                'rounded border px-3 py-1 text-xs font-medium transition-colors',
                currentPage === totalPages
                  ? 'border-gray-200 bg-gray-100 text-gray-400'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50',
              )}
            >
              Next | Tiếp
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
