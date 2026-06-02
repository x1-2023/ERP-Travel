'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || body.error || `Request failed (${res.status})`)
  }
  return res.json()
}

interface TicketListParams {
  page?: number
  limit?: number
  status?: string
  priority?: string
  assigneeId?: string
  q?: string
}

export function useTickets(params?: TicketListParams) {
  const sp = new URLSearchParams()
  if (params?.page) sp.set('page', String(params.page))
  if (params?.limit) sp.set('limit', String(params.limit))
  if (params?.status) sp.set('status', params.status)
  if (params?.priority) sp.set('priority', params.priority)
  if (params?.assigneeId) sp.set('assigneeId', params.assigneeId)
  if (params?.q) sp.set('q', params.q)
  const qs = sp.toString()

  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => fetchJson<any>(`/api/tickets${qs ? `?${qs}` : ''}`),
    staleTime: 15_000,
  })
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => fetchJson<any>(`/api/tickets/${id}`),
    enabled: !!id,
    staleTime: 10_000,
  })
}

export function useUpdateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: unknown }) =>
      fetchJson(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tickets'] })
      qc.invalidateQueries({ queryKey: ['tickets', vars.id] })
    },
  })
}

export function useCreateTicketMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, ...data }: { ticketId: string; content: string; isInternal: boolean }) =>
      fetchJson(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tickets', vars.ticketId] })
      qc.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}
