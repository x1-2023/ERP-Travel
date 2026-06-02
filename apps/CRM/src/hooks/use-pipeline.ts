'use client'

import { useQuery } from '@tanstack/react-query'
import type { StageWithDeals, PipelineConfig } from '@/types'

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
interface PipelineResponse {
  config: PipelineConfig
  stages: StageWithDeals[]
}

// ── Queries ──────────────────────────────────────────────────────────

/** Fetch pipeline configuration with all stages and their deals. */
export function usePipeline() {
  return useQuery<PipelineResponse>({
    queryKey: ['pipeline'],
    queryFn: () => fetchJson<PipelineResponse>('/api/pipeline'),
    staleTime: 30_000,
  })
}
