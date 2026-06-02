'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authQueryConfig } from '@/lib/query-config'

interface DocumentData {
  id: string
  name: string
  fileName: string
  fileSize: number
  mimeType: string
  storagePath: string
  category: string
  description: string | null
  version: number
  parentId: string | null
  dealId: string | null
  companyId: string | null
  contactId: string | null
  uploadedBy: { id: string; name: string | null; avatarUrl: string | null }
  createdAt: string
}

export function useDocuments(params: { dealId?: string; companyId?: string; contactId?: string; category?: string }) {
  const queryParams = new URLSearchParams()
  if (params.dealId) queryParams.set('dealId', params.dealId)
  if (params.companyId) queryParams.set('companyId', params.companyId)
  if (params.contactId) queryParams.set('contactId', params.contactId)
  if (params.category) queryParams.set('category', params.category)

  return useQuery({
    queryKey: ['documents', params],
    queryFn: async () => {
      const res = await fetch(`/api/documents?${queryParams}`)
      if (!res.ok) throw new Error('Failed to fetch documents')
      const json = await res.json()
      return json.data as DocumentData[]
    },
    enabled: !!(params.dealId || params.companyId || params.contactId),
    ...authQueryConfig,
  })
}

export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }
      return res.json() as Promise<DocumentData>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useUploadVersion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const res = await fetch(`/api/documents/${id}/versions`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Version upload failed')
      }
      return res.json() as Promise<DocumentData>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Delete failed')
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useDocumentUrl(id: string | null) {
  return useQuery({
    queryKey: ['document-url', id],
    queryFn: async () => {
      const res = await fetch(`/api/documents/${id}`)
      if (!res.ok) throw new Error('Failed to get document URL')
      const json = await res.json()
      return json.url as string
    },
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 min cache (URL valid for 1h)
    ...authQueryConfig,
  })
}
