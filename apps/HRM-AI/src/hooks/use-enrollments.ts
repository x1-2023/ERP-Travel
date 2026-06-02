'use client';

import { useState, useEffect, useCallback } from 'react';
import { Enrollment } from '@/types/learning';

interface UseEnrollmentFilters {
  status?: string;
  courseType?: string;
}

export function useEnrollments(filters?: UseEnrollmentFilters) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.courseType) params.set('courseType', filters.courseType);

      const res = await fetch(`/api/learning/enrollments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEnrollments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.courseType]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return { enrollments, loading, refetch: fetchEnrollments };
}
