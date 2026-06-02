'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { authQueryConfig } from '@/lib/query-config'

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
export interface Partner {
  id: string
  companyId: string
  partnerType: string
  certificationLevel: string
  territory: string | null
  commissionRate: number
  contractStartDate: string | null
  contractEndDate: string | null
  isActive: boolean
  notes: string | null
  company: { id: string; name: string; country?: string; logoUrl?: string; industry?: string }
  _count?: { deals: number; commissions: number; registrations: number }
  createdAt: string
  updatedAt: string
}

export interface PartnerDetail extends Partner {
  registrations: DealRegistration[]
  commissions: Commission[]
  deals: Array<{
    id: string
    title: string
    value: number | string
    stage: { id: string; name: string; color: string; isWon: boolean }
    company: { id: string; name: string } | null
    updatedAt: string
  }>
  stats: {
    totalCommissionPaid: number
    totalCommissionPending: number
    wonDeals: number
    pipelineValue: number
  }
}

export interface DealRegistration {
  id: string
  dealId: string
  partnerId: string
  status: string
  expiresAt: string
  notes: string | null
  approvedAt: string | null
  rejectionNote: string | null
  deal?: { id: string; title: string; value: number | string; currency?: string }
  approvedBy?: { id: string; name: string } | null
  partner?: Partner
  createdAt: string
}

export interface Commission {
  id: string
  dealId: string
  partnerId: string
  amount: number
  currency: string
  rate: number
  status: string
  invoiceNumber: string | null
  paidAt: string | null
  notes: string | null
  deal?: { id: string; title: string; value?: number | string; currency?: string }
  partner?: Partner
  createdAt: string
}

interface PartnerListResponse {
  data: Partner[]
  total: number
  page: number
  limit: number
}

interface RegistrationListResponse {
  data: DealRegistration[]
}

interface CommissionListResponse {
  data: Commission[]
  total: number
  page: number
  limit: number
}

// ── Partner Queries ──────────────────────────────────────────────────

export function usePartners(filters?: {
  partnerType?: string
  certificationLevel?: string
  isActive?: string
  page?: number
  limit?: number
}) {
  const params = new URLSearchParams()
  if (filters?.partnerType) params.set('partnerType', filters.partnerType)
  if (filters?.certificationLevel) params.set('certificationLevel', filters.certificationLevel)
  if (filters?.isActive) params.set('isActive', filters.isActive)
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.limit) params.set('limit', String(filters.limit))
  const qs = params.toString()

  return useQuery<PartnerListResponse>({
    queryKey: ['partners', filters],
    queryFn: () => fetchJson<PartnerListResponse>(`/api/partners${qs ? `?${qs}` : ''}`),
    ...authQueryConfig,
  })
}

export function usePartner(id: string | undefined) {
  return useQuery<PartnerDetail>({
    queryKey: ['partners', id],
    queryFn: () => fetchJson<PartnerDetail>(`/api/partners/${id}`),
    enabled: !!id,
    ...authQueryConfig,
  })
}

// ── Partner Mutations ────────────────────────────────────────────────

export function useCreatePartner() {
  const qc = useQueryClient()
  return useMutation<Partner, Error, Record<string, unknown>>({
    mutationFn: (data) =>
      fetchJson<Partner>('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['partners'] })
    },
  })
}

export function useUpdatePartner() {
  const qc = useQueryClient()
  return useMutation<Partner, Error, { id: string; data: Record<string, unknown> }>({
    mutationFn: ({ id, data }) =>
      fetchJson<Partner>(`/api/partners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['partners'] })
    },
  })
}

export function useDeletePartner() {
  const qc = useQueryClient()
  return useMutation<Partner, Error, string>({
    mutationFn: (id) =>
      fetchJson<Partner>(`/api/partners/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['partners'] })
    },
  })
}

// ── Registration Queries/Mutations ───────────────────────────────────

export function useRegistrations(partnerId: string | undefined) {
  return useQuery<RegistrationListResponse>({
    queryKey: ['registrations', partnerId],
    queryFn: () => fetchJson<RegistrationListResponse>(`/api/partners/${partnerId}/registrations`),
    enabled: !!partnerId,
    ...authQueryConfig,
  })
}

export function useCreateRegistration() {
  const qc = useQueryClient()
  return useMutation<DealRegistration, Error, { partnerId: string; data: Record<string, unknown> }>({
    mutationFn: ({ partnerId, data }) =>
      fetchJson<DealRegistration>(`/api/partners/${partnerId}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['registrations', vars.partnerId] })
      qc.invalidateQueries({ queryKey: ['partners'] })
    },
  })
}

export function useActionRegistration() {
  const qc = useQueryClient()
  return useMutation<
    DealRegistration,
    Error,
    { partnerId: string; regId: string; data: { status: string; rejectionNote?: string } }
  >({
    mutationFn: ({ partnerId, regId, data }) =>
      fetchJson<DealRegistration>(`/api/partners/${partnerId}/registrations/${regId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['registrations', vars.partnerId] })
      qc.invalidateQueries({ queryKey: ['partners'] })
      qc.invalidateQueries({ queryKey: ['deals'] })
    },
  })
}

// ── Commission Queries/Mutations ─────────────────────────────────────

export function useCommissions(filters?: {
  status?: string
  partnerId?: string
  page?: number
  limit?: number
}) {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.partnerId) params.set('partnerId', filters.partnerId)
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.limit) params.set('limit', String(filters.limit))
  const qs = params.toString()

  return useQuery<CommissionListResponse>({
    queryKey: ['commissions', filters],
    queryFn: () => fetchJson<CommissionListResponse>(`/api/commissions${qs ? `?${qs}` : ''}`),
    ...authQueryConfig,
  })
}

export function useUpdateCommission() {
  const qc = useQueryClient()
  return useMutation<Commission, Error, { id: string; data: Record<string, unknown> }>({
    mutationFn: ({ id, data }) =>
      fetchJson<Commission>(`/api/commissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['commissions'] })
      qc.invalidateQueries({ queryKey: ['partners'] })
    },
  })
}
