'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { PricingTierInput } from '@/lib/validations/bundle'

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
export interface PricingTier {
  id: string
  productId: string | null
  bundleId: string | null
  tier: string
  priceMultiplier: number
  minQuantity: number
  product?: { id: string; name: string; sku: string | null } | null
  bundle?: { id: string; name: string; sku: string } | null
}

interface PricingTierListResponse {
  data: PricingTier[]
}

// ── Queries ──────────────────────────────────────────────────────────

export function usePricingTiers(productId?: string, bundleId?: string) {
  const params = new URLSearchParams()
  if (productId) params.set('productId', productId)
  if (bundleId) params.set('bundleId', bundleId)
  const qs = params.toString()

  return useQuery<PricingTierListResponse>({
    queryKey: ['pricing-tiers', productId, bundleId],
    queryFn: () => fetchJson<PricingTierListResponse>(`/api/pricing-tiers${qs ? `?${qs}` : ''}`),
    staleTime: 30_000,
  })
}

// ── Mutations ────────────────────────────────────────────────────────

export function useCreatePricingTier() {
  const qc = useQueryClient()
  return useMutation<PricingTier, Error, PricingTierInput>({
    mutationFn: (data) =>
      fetchJson<PricingTier>('/api/pricing-tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pricing-tiers'] })
      qc.invalidateQueries({ queryKey: ['bundles'] })
    },
  })
}
