'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { SalesOrder, OrderWithItems } from '@/types'

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
interface OrderListParams {
  q?: string
  status?: string
  companyId?: string
  dealId?: string
  page?: number
  limit?: number
}

interface OrderListResponse {
  data: OrderWithItems[]
  total: number
  page: number
  limit: number
}

// ── Queries ──────────────────────────────────────────────────────────

/** List orders with optional filters. */
export function useOrders(params?: OrderListParams) {
  return useQuery<OrderListResponse>({
    queryKey: ['orders', params],
    queryFn: () =>
      fetchJson<OrderListResponse>(buildUrl('/api/orders', params as Record<string, string | number | undefined>)),
    staleTime: 30_000,
  })
}

/** Fetch a single order by ID. */
export function useOrder(id: string) {
  return useQuery<OrderWithItems>({
    queryKey: ['orders', id],
    queryFn: () => fetchJson<OrderWithItems>(`/api/orders/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  })
}

// ── Mutations ────────────────────────────────────────────────────────

/** Create a new sales order. */
export function useCreateOrder() {
  const qc = useQueryClient()

  return useMutation<SalesOrder, Error, Partial<SalesOrder> & { items?: Array<Record<string, unknown>> }>({
    mutationFn: (data) =>
      fetchJson<SalesOrder>('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

/** Transition order status via state machine. */
export function useTransitionOrder() {
  const qc = useQueryClient()

  return useMutation<
    OrderWithItems,
    Error,
    {
      id: string
      toStatus: string
      note?: string
      cancellationReason?: string
      refundAmount?: number
      trackingNumber?: string
      shippingProvider?: string
    }
  >({
    mutationFn: ({ id, ...data }) =>
      fetchJson<OrderWithItems>(`/api/orders/${id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['orders', variables.id] })
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
