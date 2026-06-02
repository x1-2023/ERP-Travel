'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { Deal, DealWithRelations } from '@/types'

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
interface DealListParams {
  q?: string
  stageId?: string
  companyId?: string
  ownerId?: string
  status?: string
  page?: number
  limit?: number
}

interface DealListResponse {
  data: DealWithRelations[]
  total: number
  page: number
  limit: number
}

interface MoveDealPayload {
  id: string
  stageId: string
}

// ── Queries ──────────────────────────────────────────────────────────

/** List deals with optional search, filter, and pagination. */
export function useDeals(params?: DealListParams) {
  return useQuery<DealListResponse>({
    queryKey: ['deals', params],
    queryFn: () =>
      fetchJson<DealListResponse>(buildUrl('/api/deals', params as Record<string, string | number | undefined>)),
    staleTime: 30_000,
  })
}

/** Fetch a single deal by ID. */
export function useDeal(id: string) {
  return useQuery<DealWithRelations>({
    queryKey: ['deals', id],
    queryFn: () => fetchJson<DealWithRelations>(`/api/deals/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  })
}

// ── Mutations ────────────────────────────────────────────────────────

/** Create a new deal. */
export function useCreateDeal() {
  const qc = useQueryClient()

  return useMutation<Deal, Error, Partial<Deal>>({
    mutationFn: (data) =>
      fetchJson<Deal>('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] })
    },
  })
}

/** Update an existing deal. */
export function useUpdateDeal() {
  const qc = useQueryClient()

  return useMutation<Deal, Error, { id: string } & Partial<Deal>>({
    mutationFn: ({ id, ...data }) =>
      fetchJson<Deal>(`/api/deals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['deals'] })
      qc.invalidateQueries({ queryKey: ['deals', variables.id] })
      qc.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })
}

/** Delete a deal by ID. */
export function useDeleteDeal() {
  const qc = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      fetchJson<void>(`/api/deals/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] })
    },
  })
}

/** Move a deal to a different pipeline stage (drag-and-drop). */
export function useMoveDeal() {
  const qc = useQueryClient()

  return useMutation<Deal, Error, MoveDealPayload>({
    mutationFn: ({ id, stageId }) =>
      fetchJson<Deal>(`/api/deals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipeline'] })
      qc.invalidateQueries({ queryKey: ['deals'] })
    },
  })
}
