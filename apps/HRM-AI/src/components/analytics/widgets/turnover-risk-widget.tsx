'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { WidgetContainer } from './widget-container';
import { cn } from '@/lib/utils';

interface RiskEmployee {
  id: string;
  name: string;
  department: string;
  riskScore: number;
  riskLevel: 'high' | 'medium' | 'low';
}

interface TurnoverRiskWidgetProps {
  id?: string;
  onRemove?: (id: string) => void;
  isDragging?: boolean;
  className?: string;
}

const riskLevelConfig = {
  high: {
    label: 'Cao',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  medium: {
    label: 'Trung bình',
    badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  low: {
    label: 'Thấp',
    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
};

export function TurnoverRiskWidget({
  id = 'turnover-risk',
  onRemove,
  isDragging,
  className,
}: TurnoverRiskWidgetProps) {
  const [employees, setEmployees] = useState<RiskEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/turnover-risk?limit=5');
        if (response.ok) {
          const result = await response.json();
          setEmployees(result);
        }
      } catch (error) {
        console.error('Failed to fetch turnover risk data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <WidgetContainer
      id={id}
      title="Nhân viên có nguy cơ nghỉ việc"
      onRemove={onRemove}
      isDragging={isDragging}
      className={className}
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : employees.length > 0 ? (
        <div className="space-y-2">
          {employees.map((employee, index) => (
            <div
              key={employee.id}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                  employee.riskLevel === 'high' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
                  employee.riskLevel === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
                  employee.riskLevel === 'low' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                )}>
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{employee.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{employee.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium">{employee.riskScore}%</span>
                <Badge
                  variant="secondary"
                  className={cn('text-[10px] px-1.5 py-0', riskLevelConfig[employee.riskLevel].badgeClass)}
                >
                  {riskLevelConfig[employee.riskLevel].label}
                </Badge>
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
