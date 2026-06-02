'use client';

import useSWR from 'swr';

export function useCompensationCycles(year?: number) {
  const params = new URLSearchParams();
  if (year) params.set('year', String(year));
  return useSWR(`/api/compensation/cycles?${params}`);
}

export function useCompensationReviews(cycleId?: string, status?: string) {
  const params = new URLSearchParams();
  if (cycleId) params.set('cycleId', cycleId);
  if (status) params.set('status', status);
  return useSWR(`/api/compensation/reviews?${params}`);
}

export function useEmployeeCompensation(employeeId?: string) {
  return useSWR(employeeId ? `/api/compensation/employees/${employeeId}` : null);
}

export function useCompensationAnalytics() {
  return useSWR('/api/compensation/analytics');
}

export function useCompensationBudgets(cycleId?: string) {
  return useSWR(cycleId ? `/api/compensation/budgets?cycleId=${cycleId}` : null);
}

export function useTotalRewards(employeeId?: string, year?: number) {
  const params = new URLSearchParams();
  if (employeeId) params.set('employeeId', employeeId);
  if (year) params.set('year', String(year));
  return useSWR(`/api/compensation/total-rewards?${params}`);
}

export function usePayEquity(departmentId?: string) {
  const params = new URLSearchParams();
  if (departmentId) params.set('departmentId', departmentId);
  return useSWR(`/api/compensation/pay-equity?${params}`);
}

export function useBenchmarks() {
  return useSWR('/api/compensation/benchmarks');
}
