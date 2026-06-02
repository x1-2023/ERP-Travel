'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { Quote, QuoteWithItems } from '@/types'

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
interface QuoteListParams {
  q?: string
  status?: string
  contactId?: string
  companyId?: string
  dealId?: string
  page?: number
  limit?: number
}

interface QuoteListResponse {
  data: QuoteWithItems[]
  total: number
  page: number
  limit: number
}

// ── Queries ──────────────────────────────────────────────────────────

/** List quotes with optional filters. */
export function useQuotes(params?: QuoteListParams) {
  return useQuery<QuoteListResponse>({
    queryKey: ['quotes', params],
    queryFn: () =>
      fetchJson<QuoteListResponse>(buildUrl('/api/quotes', params as Record<string, string | number | undefined>)),
    staleTime: 30_000,
  })
}

/** Fetch a single quote by ID. */
export function useQuote(id: string) {
  return useQuery<QuoteWithItems>({
    queryKey: ['quotes', id],
    queryFn: () => fetchJson<QuoteWithItems>(`/api/quotes/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  })
}

// ── Mutations ────────────────────────────────────────────────────────

/** Create a new quote. */
export function useCreateQuote() {
  const qc = useQueryClient()

  return useMutation<Quote, Error, Partial<Quote> & { items?: Array<Record<string, unknown>> }>({
    mutationFn: (data) =>
      fetchJson<Quote>('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes'] })
    },
  })
}

/** Update an existing quote. */
export function useUpdateQuote() {
  const qc = useQueryClient()

  return useMutation<Quote, Error, { id: string } & Partial<Quote> & { items?: Array<Record<string, unknown>> }>({
    mutationFn: ({ id, ...data }) =>
      fetchJson<Quote>(`/api/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['quotes'] })
      qc.invalidateQueries({ queryKey: ['quotes', variables.id] })
    },
  })
}
