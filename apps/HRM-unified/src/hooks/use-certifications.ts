'use client';

import { useState, useEffect, useCallback } from 'react';
import { EmployeeCertification, CertificationType } from '@/types/learning';

export function useCertifications(filters?: { status?: string }) {
  const [certifications, setCertifications] = useState<EmployeeCertification[]>([]);
  const [types, setTypes] = useState<CertificationType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCertifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);

      const [certsRes, typesRes] = await Promise.all([
        fetch(`/api/learning/certifications?${params.toString()}`),
        fetch('/api/learning/certifications/types'),
      ]);

      if (certsRes.ok) {
        const data = await certsRes.json();
        setCertifications(Array.isArray(data) ? data : []);
      }
      if (typesRes.ok) {
        const data = await typesRes.json();
        setTypes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch certifications:', error);
    } finally {
      setLoading(false);
    }
  }, [filters?.status]);

  useEffect(() => {
    fetchCertifications();
  }, [fetchCertifications]);

  return { certifications, types, loading, refetch: fetchCertifications };
}
