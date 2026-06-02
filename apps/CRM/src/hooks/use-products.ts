'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { Product } from '@/types'

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
interface ProductListResponse {
  data: Product[]
  total: number
}

// ── Queries ──────────────────────────────────────────────────────────

/** Fetch all products. */
export function useProducts() {
  return useQuery<ProductListResponse>({
    queryKey: ['products'],
    queryFn: () => fetchJson<ProductListResponse>('/api/products'),
    staleTime: 30_000,
  })
}

// ── Mutations ────────────────────────────────────────────────────────

/** Create a new product. */
export function useCreateProduct() {
  const qc = useQueryClient()

  return useMutation<Product, Error, Partial<Product>>({
    mutationFn: (data) =>
      fetchJson<Product>('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
