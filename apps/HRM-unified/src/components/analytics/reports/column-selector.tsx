'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColumnOption {
  key: string;
  label: string;
  group?: string;
}

interface ColumnSelectorProps {
  dataSource: string;
  columns: ColumnOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export function ColumnSelector({
  columns,
  selected,
  onChange,
  className,
}: ColumnSelectorProps) {
  const toggleColumn = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter((s) => s !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  const selectAll = () => {
    onChange(columns.map((c) => c.key));
  };

  const deselectAll = () => {
    onChange([]);
  };

  // Group columns
  const groups = columns.reduce<Record<string, ColumnOption[]>>((acc, col) => {
    const group = col.group || 'Chung';
    if (!acc[group]) acc[group] = [];
    acc[group].push(col);
    return acc;
  }, {});

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Cột hiển thị</h4>
        <div className="flex gap-2 text-xs">
          <button
            onClick={selectAll}
            className="text-primary hover:underline"
          >
            Chọn tất cả
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={deselectAll}
            className="text-primary hover:underline"
          >
            Bỏ chọn
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-64 overflow-y-auto border rounded-md p-3">
        {Object.entries(groups).map(([group, groupColumns]) => (
          <div key={group}>
            {Object.keys(groups).length > 1 && (
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                {group}
              </p>
            )}
            <div className="grid grid-cols-2 gap-1">
              {groupColumns.map((col) => {
                const isSelected = selected.includes(col.key);
                return (
                  <button
                    key={col.key}
                    onClick={() => toggleColumn(col.key)}
                    className={cn(
                      'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left transition-colors',
                      'hover:bg-accent',
                      isSelected && 'bg-accent/50'
                    )}
                  >
                    <div className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                      isSelected ? 'bg-primary border-primary' : 'border-input'
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span className="truncate">{col.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Đã chọn {selected.length}/{columns.length} cột
      </p>
    </div>
  );
}
