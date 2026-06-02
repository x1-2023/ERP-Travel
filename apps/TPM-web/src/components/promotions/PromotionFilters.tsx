/**
 * Promotion Filters Component
 */

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { SearchInput } from '@/components/shared/SearchInput';
import { useCustomerOptions } from '@/hooks/useCustomers';
import { useFundOptions } from '@/hooks/useFunds';
import type { PromotionStatus } from '@/types';

interface Filters {
  search?: string;
  status?: PromotionStatus | '';
  customerId?: string;
  fundId?: string;
}

interface PromotionFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const statusOptions: { value: PromotionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function PromotionFilters({ filters, onFiltersChange }: PromotionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: customerOptions = [] } = useCustomerOptions();
  const { data: fundOptions = [] } = useFundOptions();

  const activeFiltersCount = [
    filters.status,
    filters.customerId,
    filters.fundId,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      search: filters.search,
      status: '',
      customerId: '',
      fundId: '',
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <SearchInput
        value={filters.search}
        onChange={(search) => onFiltersChange({ ...filters, search })}
        placeholder="Search promotions..."
        className="w-full sm:w-80"
      />

      <Select
        value={filters.status || 'all'}
        onValueChange={(status) => onFiltersChange({ ...filters, status: status === 'all' ? '' : status as PromotionStatus })}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            More Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <Select
                value={filters.customerId || 'all'}
                onValueChange={(customerId) => onFiltersChange({ ...filters, customerId: customerId === 'all' ? '' : customerId })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All customers</SelectItem>
                  {customerOptions.map((option: { value: string; label: string }) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fund</label>
              <Select
                value={filters.fundId || 'all'}
                onValueChange={(fundId) => onFiltersChange({ ...filters, fundId: fundId === 'all' ? '' : fundId })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All funds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All funds</SelectItem>
                  {fundOptions.map((option: { value: string; label: string }) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
