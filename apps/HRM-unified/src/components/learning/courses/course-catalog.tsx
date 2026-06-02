'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Course } from '@/types/learning';
import { CourseCard } from './course-card';
import { CourseFilters } from './course-filters';

interface CourseCatalogProps {
  courses: Course[];
  showEnroll?: boolean;
}

export function CourseCatalog({ courses, showEnroll = true }: CourseCatalogProps) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{ type?: string; level?: string; category?: string }>({});

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = !search || course.title.toLowerCase().includes(search.toLowerCase()) || course.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filters.type || course.courseType === filters.type;
    const matchesLevel = !filters.level || course.level === filters.level;
    const matchesCategory = !filters.category || course.categoryId === filters.category;
    return matchesSearch && matchesType && matchesLevel && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tim kiem khoa hoc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <CourseFilters filters={filters} onFiltersChange={setFilters} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} showEnroll={showEnroll} />
        ))}
      </div>
      {filteredCourses.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Khong tim thay khoa hoc nao</p>
        </div>
      )}
    </div>
  );
}
