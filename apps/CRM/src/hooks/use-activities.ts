'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { Activity, ActivityWithRelations } from '@/types'
import { authQueryConfig } from '@/lib/query-config'

// ── Helpers ──────────────────────────────────────────────────────────
function buildUrl(
  base: string,
  params?: Record<string, string | number | undefined | null>,
) {
  const url = new URL(base, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.json()
}

// ── Types ────────────────────────────────────────────────────────────
interface ActivityListParams {
  q?: string
  type?: string
  contactId?: string
  companyId?: string
  dealId?: string
  completed?: string
  page?: number
  limit?: number
}

interface ActivityListResponse {
  data: ActivityWithRelations[]
  total: number
  page: number
  limit: number
}

// ── Queries ──────────────────────────────────────────────────────────

/** List activities with optional filters. */
export function useActivities(params?: ActivityListParams & { enabled?: boolean }) {
  const { enabled, ...queryParams } = params ?? {}
  return useQuery<ActivityListResponse>({
    queryKey: ['activities', queryParams],
    queryFn: () =>
      fetchJson<ActivityListResponse>(buildUrl('/api/activities', queryParams as Record<string, string | number | undefined>)),
    staleTime: 30_000,
    enabled: enabled ?? true,
    ...authQueryConfig,
  })
}

// ── Mutations ────────────────────────────────────────────────────────

/** Create a new activity. */
export function useCreateActivity() {
  const qc = useQueryClient()

  return useMutation<Activity, Error, Partial<Activity>>({
    mutationFn: (data) =>
      fetchJson<Activity>('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

/** Update an activity (e.g. mark as complete). */
export function useUpdateActivity() {
  const qc = useQueryClient()

  return useMutation<Activity, Error, { id: string } & Partial<Activity>>({
    mutationFn: ({ id, ...data }) =>
      fetchJson<Activity>(`/api/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

/** Delete an activity by ID. */
export function useDeleteActivity() {
  const qc = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      fetchJson<void>(`/api/activities/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}
