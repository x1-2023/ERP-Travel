'use client';

import useSWR from 'swr';

export function useAllowanceTypes() {
  return useSWR('/api/compensation/allowances/types');
}

export function useEmployeeAllowances(employeeId?: string) {
  return useSWR(employeeId ? `/api/compensation/allowances/employee/${employeeId}` : null);
}

export function useMyAllowances() {
  return useSWR('/api/compensation/allowances/me');
}
