'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { COURSE_TYPE, COURSE_LEVEL } from '@/lib/learning/constants';

interface CourseFiltersProps {
  filters: { type?: string; level?: string; category?: string };
  onFiltersChange: (filters: { type?: string; level?: string; category?: string }) => void;
}

export function CourseFilters({ filters, onFiltersChange }: CourseFiltersProps) {
  const hasFilters = Object.values(filters).some(Boolean);

  const clearFilters = () => onFiltersChange({});

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <Select
          value={filters.type || ''}
          onValueChange={(value) => onFiltersChange({ ...filters, type: value || undefined })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Loai khoa hoc" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(COURSE_TYPE).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.level || ''}
          onValueChange={(value) => onFiltersChange({ ...filters, level: value || undefined })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Cap do" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(COURSE_LEVEL).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
            <X className="w-3 h-3 mr-1" /> Xoa bo loc
          </Button>
        )}
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.type && (
            <Badge variant="secondary" className="text-xs">
              {COURSE_TYPE[filters.type as keyof typeof COURSE_TYPE]?.label}
              <button onClick={() => onFiltersChange({ ...filters, type: undefined })} className="ml-1"><X className="w-3 h-3" /></button>
            </Badge>
          )}
          {filters.level && (
            <Badge variant="secondary" className="text-xs">
              {COURSE_LEVEL[filters.level as keyof typeof COURSE_LEVEL]?.label}
              <button onClick={() => onFiltersChange({ ...filters, level: undefined })} className="ml-1"><X className="w-3 h-3" /></button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
