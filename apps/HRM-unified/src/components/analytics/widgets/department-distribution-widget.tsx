'use client';

import { useEffect, useState } from 'react';
import { WidgetContainer } from './widget-container';

interface DepartmentData {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface DepartmentDistributionWidgetProps {
  id?: string;
  onRemove?: (id: string) => void;
  isDragging?: boolean;
  className?: string;
}

const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
];

export function DepartmentDistributionWidget({
  id = 'department-distribution',
  onRemove,
  isDragging,
  className,
}: DepartmentDistributionWidgetProps) {
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/department-distribution');
        if (response.ok) {
          const result = await response.json();
          setDepartments(
            result.map((dept: DepartmentData, index: number) => ({
              ...dept,
              color: dept.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch department distribution:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const maxCount = Math.max(...departments.map((d) => d.count), 1);

  return (
    <WidgetContainer
      id={id}
      title="Phân bố nhân sự theo phòng ban"
      onRemove={onRemove}
      isDragging={isDragging}
      className={className}
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : departments.length > 0 ? (
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {departments.map((dept) => (
            <div key={dept.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate max-w-[60%]">{dept.name}</span>
                <span className="font-medium">{dept.count} ({dept.percentage.toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${(dept.count / maxCount) * 100}%`,
                    backgroundColor: dept.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Không có dữ liệu
        </p>
      )}
    </WidgetContainer>
  );
}
