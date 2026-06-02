'use client';

import useSWR from 'swr';

export function useBenefitPlans(type?: string) {
  const params = type ? `?type=${type}` : '';
  return useSWR(`/api/compensation/benefits${params}`);
}

export function useMyBenefitEnrollments() {
  return useSWR('/api/compensation/benefits/enrollments/me');
}

export function useBenefitEnrollments(planId?: string) {
  return useSWR(planId ? `/api/compensation/benefits/${planId}/enrollments` : null);
}
