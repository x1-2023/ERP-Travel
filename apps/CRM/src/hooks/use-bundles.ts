'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { BundleInput } from '@/lib/validations/bundle'

// ── Helpers ──────────────────────────────────────────────────────────
async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.json()
}

// ── Types ────────────────────────────────────────────────────────────
export interface BundleItem {
  id: string
  productId: string
  quantity: number
  isRequired: boolean
  sortOrder: number
  product: {
    id: string
    name: string
    sku: string | null
    unitPrice: string | number
    category: string
  }
}

export interface Bundle {
  id: string
  name: string
  description: string | null
  sku: string
  bundleType: string
  basePrice: number
  currency: string
  isActive: boolean
  sortOrder: number
  items: BundleItem[]
  pricingTiers: Array<{
    id: string
    tier: string
    priceMultiplier: number
    minQuantity: number
  }>
  compatibilityWarnings?: Array<{
    id: string
    type: string
    notes: string | null
    product: { id: string; name: string }
    relatedProduct: { id: string; name: string }
  }>
  createdAt: string
  updatedAt: string
}

interface BundleListResponse {
  data: Bundle[]
  total: number
}

// ── Queries ──────────────────────────────────────────────────────────

export function useBundles(filters?: { bundleType?: string; isActive?: string }) {
  const params = new URLSearchParams()
  if (filters?.bundleType) params.set('bundleType', filters.bundleType)
  if (filters?.isActive) params.set('isActive', filters.isActive)
  const qs = params.toString()

  return useQuery<BundleListResponse>({
    queryKey: ['bundles', filters],
    queryFn: () => fetchJson<BundleListResponse>(`/api/bundles${qs ? `?${qs}` : ''}`),
    staleTime: 30_000,
  })
}

export function useBundle(id: string | undefined) {
  return useQuery<Bundle>({
    queryKey: ['bundles', id],
    queryFn: () => fetchJson<Bundle>(`/api/bundles/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  })
}

// ── Mutations ────────────────────────────────────────────────────────

export function useCreateBundle() {
  const qc = useQueryClient()
  return useMutation<Bundle, Error, BundleInput>({
    mutationFn: (data) =>
      fetchJson<Bundle>('/api/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bundles'] })
    },
  })
}

export function useUpdateBundle() {
  const qc = useQueryClient()
  return useMutation<Bundle, Error, { id: string; data: Partial<BundleInput> }>({
    mutationFn: ({ id, data }) =>
      fetchJson<Bundle>(`/api/bundles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bundles'] })
    },
  })
}

export function useDeleteBundle() {
  const qc = useQueryClient()
  return useMutation<Bundle, Error, string>({
    mutationFn: (id) =>
      fetchJson<Bundle>(`/api/bundles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bundles'] })
    },
  })
}
