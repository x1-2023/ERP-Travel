'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { Company, CompanyWithContacts } from '@/types'

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
interface CompanyListParams {
  q?: string
  industry?: string
  page?: number
  limit?: number
}

interface CompanyListResponse {
  data: CompanyWithContacts[]
  total: number
  page: number
  limit: number
}

// ── Queries ──────────────────────────────────────────────────────────

/** List companies with optional search and pagination. */
export function useCompanies(params?: CompanyListParams) {
  return useQuery<CompanyListResponse>({
    queryKey: ['companies', params],
    queryFn: () =>
      fetchJson<CompanyListResponse>(buildUrl('/api/companies', params as Record<string, string | number | undefined>)),
    staleTime: 30_000,
  })
}

/** Fetch a single company by ID. */
export function useCompany(id: string) {
  return useQuery<CompanyWithContacts>({
    queryKey: ['companies', id],
    queryFn: () => fetchJson<CompanyWithContacts>(`/api/companies/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  })
}

// ── Mutations ────────────────────────────────────────────────────────

/** Create a new company. */
export function useCreateCompany() {
  const qc = useQueryClient()

  return useMutation<Company, Error, Partial<Company>>({
    mutationFn: (data) =>
      fetchJson<Company>('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

/** Update an existing company. */
export function useUpdateCompany() {
  const qc = useQueryClient()

  return useMutation<Company, Error, { id: string } & Partial<Company>>({
    mutationFn: ({ id, ...data }) =>
      fetchJson<Company>(`/api/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['companies'] })
      qc.invalidateQueries({ queryKey: ['companies', variables.id] })
    },
  })
}

/** Delete a company by ID. */
export function useDeleteCompany() {
  const qc = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      fetchJson<void>(`/api/companies/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}
