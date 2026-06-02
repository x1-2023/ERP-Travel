'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.json()
}

export function useCampaigns(params?: { status?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set('status', params.status)
  const qs = searchParams.toString()
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => fetchJson<any[]>(`/api/campaigns${qs ? `?${qs}` : ''}`),
    staleTime: 30_000,
  })
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => fetchJson<any>(`/api/campaigns/${id}`),
    enabled: !!id,
    staleTime: 15_000,
  })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) =>
      fetchJson('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

export function useUpdateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: any) =>
      fetchJson(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_: any, variables: any) => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      qc.invalidateQueries({ queryKey: ['campaigns', variables.id] })
    },
  })
}

export function useSendCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/campaigns/${id}/send`, { method: 'POST' }),
    onSuccess: (_: any, id: string) => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      qc.invalidateQueries({ queryKey: ['campaigns', id] })
      qc.invalidateQueries({ queryKey: ['campaign-stats', id] })
    },
  })
}

export function useCampaignStats(id: string, enabled = true) {
  return useQuery({
    queryKey: ['campaign-stats', id],
    queryFn: () => fetchJson<any>(`/api/campaigns/${id}/stats`),
    enabled: !!id && enabled,
    staleTime: 15_000,
  })
}

export function useDeleteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/campaigns/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

export function useAudiences() {
  return useQuery({
    queryKey: ['audiences'],
    queryFn: () => fetchJson<any[]>('/api/audiences'),
    staleTime: 30_000,
  })
}

export function useAudience(id: string) {
  return useQuery({
    queryKey: ['audiences', id],
    queryFn: () => fetchJson<any>(`/api/audiences/${id}`),
    enabled: !!id,
  })
}

export function useCreateAudience() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) =>
      fetchJson('/api/audiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['audiences'] }),
  })
}

export function useUpdateAudience() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: any) =>
      fetchJson(`/api/audiences/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_: any, variables: any) => {
      qc.invalidateQueries({ queryKey: ['audiences'] })
      qc.invalidateQueries({ queryKey: ['audiences', variables.id] })
    },
  })
}

export function usePreviewAudienceCount() {
  return useMutation({
    mutationFn: (rules: any) =>
      fetchJson<{ count: number }>('/api/audiences/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      }),
  })
}
