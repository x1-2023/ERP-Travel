'use client'

import { useQuery } from '@tanstack/react-query'
import type { DashboardStats, FunnelData, RevenueData } from '@/types'

// ── Helpers ──────────────────────────────────────────────────────────
async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.json()
}

// ── Queries ──────────────────────────────────────────────────────────

/** Fetch dashboard summary statistics. */
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => fetchJson<DashboardStats>('/api/reports?type=dashboard'),
    staleTime: 30_000,
  })
}

/** Fetch pipeline funnel data for chart rendering. */
export function useFunnelData() {
  return useQuery<FunnelData[]>({
    queryKey: ['dashboard', 'funnel'],
    queryFn: () => fetchJson<FunnelData[]>('/api/reports?type=funnel'),
    staleTime: 30_000,
  })
}

/** Fetch monthly revenue data for chart rendering. */
export function useRevenueData() {
  return useQuery<RevenueData[]>({
    queryKey: ['dashboard', 'revenue'],
    queryFn: () => fetchJson<RevenueData[]>('/api/reports?type=revenue'),
    staleTime: 30_000,
  })
}
