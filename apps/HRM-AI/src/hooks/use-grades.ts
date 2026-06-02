'use client';

import useSWR from 'swr';

export function useSalaryGrades() {
  return useSWR('/api/compensation/grades');
}

export function useMeritMatrix(year?: number) {
  const params = year ? `?year=${year}` : '';
  return useSWR(`/api/compensation/merit-matrix${params}`);
}
