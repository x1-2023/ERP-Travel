/**
 * Filter Panel Component
 */

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface FilterOption {
  field: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
}

interface FilterPanelProps {
  options: FilterOption[];
  value: Record<string, unknown>;
  onChange: (filters: Record<string, unknown>) => void;
}

export function FilterPanel({ options, value, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Record<string, unknown>>(value);

  const activeFilterCount = Object.values(value).filter(Boolean).length;

  const handleApply = () => {
    onChange(localFilters);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalFilters({});
    onChange({});
    setOpen(false);
  };

  const handleRemoveFilter = (field: string) => {
    const newFilters = { ...value };
    delete newFilters[field];
    onChange(newFilters);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="font-medium">Filter Data</div>

            {options.map((option) => (
              <div key={option.field} className="space-y-2">
                <Label htmlFor={option.field}>{option.label}</Label>
                {option.type === 'select' && option.options ? (
                  <Select
                    value={(localFilters[option.field] as string) || '__all__'}
                    onValueChange={(val) =>
                      setLocalFilters((prev) => ({ ...prev, [option.field]: val === '__all__' ? undefined : val }))
                    }
                  >
                    <SelectTrigger id={option.field}>
                      <SelectValue placeholder={`Select ${option.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All</SelectItem>
                      {option.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={option.field}
                    type={option.type === 'date' ? 'date' : option.type === 'number' ? 'number' : 'text'}
                    value={(localFilters[option.field] as string) || ''}
                    onChange={(e) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        [option.field]: e.target.value || undefined,
                      }))
                    }
                    placeholder={`Enter ${option.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleApply} className="flex-1">
                Apply
              </Button>
              <Button size="sm" variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filter badges */}
      {Object.entries(value).map(([field, val]) => {
        if (!val) return null;
        const option = options.find((o) => o.field === field);
        return (
          <Badge key={field} variant="secondary" className="gap-1">
            {option?.label}: {String(val)}
            <button
              onClick={() => handleRemoveFilter(field)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}
    </div>
  );
}
