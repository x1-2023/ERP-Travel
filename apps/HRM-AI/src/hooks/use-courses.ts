'use client';

import { useState, useEffect, useCallback } from 'react';
import { Course } from '@/types/learning';

interface UseCourseFilters {
  categoryId?: string;
  courseType?: string;
  level?: string;
  status?: string;
  search?: string;
  page?: number;
}

export function useCourses(filters?: UseCourseFilters) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.categoryId) params.set('categoryId', filters.categoryId);
      if (filters?.courseType) params.set('courseType', filters.courseType);
      if (filters?.level) params.set('level', filters.level);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.page) params.set('page', String(filters.page));

      const res = await fetch(`/api/learning/courses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  }, [filters?.categoryId, filters?.courseType, filters?.level, filters?.status, filters?.search, filters?.page]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, total, loading, refetch: fetchCourses };
}
