'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

interface FilterBuilderProps {
  fields: FilterField[];
  filters: FilterRow[];
  onChange: (filters: FilterRow[]) => void;
  className?: string;
}

const OPERATORS: Record<string, { value: string; label: string }[]> = {
  text: [
    { value: 'equals', label: 'Bằng' },
    { value: 'contains', label: 'Chứa' },
    { value: 'starts_with', label: 'Bắt đầu với' },
    { value: 'ends_with', label: 'Kết thúc với' },
    { value: 'not_equals', label: 'Khác' },
  ],
  number: [
    { value: 'equals', label: '=' },
    { value: 'gt', label: '>' },
    { value: 'gte', label: '>=' },
    { value: 'lt', label: '<' },
    { value: 'lte', label: '<=' },
    { value: 'not_equals', label: '!=' },
  ],
  date: [
    { value: 'equals', label: 'Bằng' },
    { value: 'before', label: 'Trước' },
    { value: 'after', label: 'Sau' },
    { value: 'between', label: 'Trong khoảng' },
  ],
  select: [
    { value: 'equals', label: 'Bằng' },
    { value: 'not_equals', label: 'Khác' },
    { value: 'in', label: 'Thuộc' },
  ],
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function FilterBuilder({
  fields,
  filters,
  onChange,
  className,
}: FilterBuilderProps) {
  const addFilter = () => {
    const newFilter: FilterRow = {
      id: generateId(),
      field: fields[0]?.key || '',
      operator: 'equals',
      value: '',
    };
    onChange([...filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    onChange(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<FilterRow>) => {
    onChange(
      filters.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const getFieldType = (fieldKey: string): string => {
    const field = fields.find((f) => f.key === fieldKey);
    return field?.type || 'text';
  };

  const getFieldOptions = (fieldKey: string) => {
    const field = fields.find((f) => f.key === fieldKey);
    return field?.options || [];
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Bộ lọc</h4>
        <Button variant="outline" size="sm" onClick={addFilter}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Thêm
        </Button>
      </div>

      {filters.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3 border rounded-md">
          Chưa có bộ lọc nào. Nhấn &quot;Thêm&quot; để tạo bộ lọc.
        </p>
      ) : (
        <div className="space-y-2">
          {filters.map((filter, index) => {
            const fieldType = getFieldType(filter.field);
            const operators = OPERATORS[fieldType] || OPERATORS.text;
            const fieldOptions = getFieldOptions(filter.field);

            return (
              <div
                key={filter.id}
                className="flex items-center gap-2 rounded-md border p-2"
              >
                {index > 0 && (
                  <span className="text-xs text-muted-foreground shrink-0">VÀ</span>
                )}

                {/* Field selector */}
                <select
                  value={filter.field}
                  onChange={(e) => updateFilter(filter.id, {
                    field: e.target.value,
                    operator: 'equals',
                    value: '',
                  })}
                  className="h-8 rounded border border-input bg-background px-2 text-xs flex-1 min-w-0"
                >
                  {fields.map((field) => (
                    <option key={field.key} value={field.key}>
                      {field.label}
                    </option>
                  ))}
                </select>

                {/* Operator selector */}
                <select
                  value={filter.operator}
                  onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                  className="h-8 rounded border border-input bg-background px-2 text-xs w-24 shrink-0"
                >
                  {operators.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>

                {/* Value input */}
                {fieldType === 'select' && fieldOptions.length > 0 ? (
                  <select
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                    className="h-8 rounded border border-input bg-background px-2 text-xs flex-1 min-w-0"
                  >
                    <option value="">Chọn...</option>
                    {fieldOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={fieldType === 'number' ? 'number' : fieldType === 'date' ? 'date' : 'text'}
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                    placeholder="Giá trị..."
                    className="h-8 rounded border border-input bg-background px-2 text-xs flex-1 min-w-0"
                  />
                )}

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(filter.id)}
                  className="h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
