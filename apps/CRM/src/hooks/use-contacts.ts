'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { Contact, ContactWithCompany } from '@/types'

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
interface ContactListParams {
  q?: string
  status?: string
  companyId?: string
  page?: number
  limit?: number
}

interface ContactListResponse {
  data: ContactWithCompany[]
  total: number
  page: number
  limit: number
}

// ── Queries ──────────────────────────────────────────────────────────

/** List contacts with optional search, filter, and pagination. */
export function useContacts(params?: ContactListParams) {
  return useQuery<ContactListResponse>({
    queryKey: ['contacts', params],
    queryFn: () =>
      fetchJson<ContactListResponse>(buildUrl('/api/contacts', params as Record<string, string | number | undefined>)),
    staleTime: 30_000,
  })
}

/** Fetch a single contact by ID. */
export function useContact(id: string) {
  return useQuery<ContactWithCompany>({
    queryKey: ['contacts', id],
    queryFn: () => fetchJson<ContactWithCompany>(`/api/contacts/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  })
}

// ── Mutations ────────────────────────────────────────────────────────

/** Create a new contact. */
export function useCreateContact() {
  const qc = useQueryClient()

  return useMutation<Contact, Error, Partial<Contact>>({
    mutationFn: (data) =>
      fetchJson<Contact>('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

/** Update an existing contact. */
export function useUpdateContact() {
  const qc = useQueryClient()

  return useMutation<Contact, Error, { id: string } & Partial<Contact>>({
    mutationFn: ({ id, ...data }) =>
      fetchJson<Contact>(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
      qc.invalidateQueries({ queryKey: ['contacts', variables.id] })
    },
  })
}

/** Delete a contact by ID. */
export function useDeleteContact() {
  const qc = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      fetchJson<void>(`/api/contacts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}
