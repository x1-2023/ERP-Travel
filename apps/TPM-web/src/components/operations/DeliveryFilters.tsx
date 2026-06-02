/**
 * Delivery Filters Component
 */

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import type { DeliveryStatus } from '@/types/operations';
import { DELIVERY_STATUS_CONFIG } from '@/types/operations';

interface DeliveryFiltersProps {
  filters: {
    search: string;
    status: DeliveryStatus | 'all' | '';
    dateFrom: string;
    dateTo: string;
  };
  onFiltersChange: (filters: {
    search?: string;
    status?: DeliveryStatus | 'all' | '';
    dateFrom?: string;
    dateTo?: string;
  }) => void;
}

export function DeliveryFilters({ filters, onFiltersChange }: DeliveryFiltersProps) {
  const hasFilters =
    filters.search || (filters.status && filters.status !== 'all') || filters.dateFrom || filters.dateTo;

  const handleClear = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      dateFrom: '',
      dateTo: '',
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="h-9 w-48 pl-8"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={filters.status || 'all'}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            status: value as DeliveryStatus | 'all',
          })
        }
      >
        <SelectTrigger className="h-9 w-36">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {Object.entries(DELIVERY_STATUS_CONFIG).map(([status, config]) => (
            <SelectItem key={status} value={status}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Range */}
      <DatePicker
        value={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
        onChange={(date) =>
          onFiltersChange({
            ...filters,
            dateFrom: date ? date.toISOString().split('T')[0] : '',
          })
        }
        placeholder="From date"
      />
      <DatePicker
        value={filters.dateTo ? new Date(filters.dateTo) : undefined}
        onChange={(date) =>
          onFiltersChange({
            ...filters,
            dateTo: date ? date.toISOString().split('T')[0] : '',
          })
        }
        placeholder="To date"
      />

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleClear} className="h-9">
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
