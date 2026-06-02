import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ── List webhooks ───────────────────────────────────────────────

export function useWebhooks() {
  return useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const res = await fetch('/api/webhooks')
      if (!res.ok) throw new Error('Failed to fetch webhooks')
      const json = await res.json()
      return json.data
    },
    staleTime: 30_000,
  })
}

// ── Single webhook with logs ────────────────────────────────────

export function useWebhook(id: string | null) {
  return useQuery({
    queryKey: ['webhooks', id],
    queryFn: async () => {
      const res = await fetch(`/api/webhooks/${id}`)
      if (!res.ok) throw new Error('Failed to fetch webhook')
      const json = await res.json()
      return json.data
    },
    enabled: !!id,
    staleTime: 15_000,
  })
}

// ── Create webhook ──────────────────────────────────────────────

export function useCreateWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; url: string; events: string[] }) => {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }))
        throw new Error(err.error || 'Failed to create webhook')
      }
      return res.json().then((j) => j.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    },
  })
}

// ── Update webhook ──────────────────────────────────────────────

export function useUpdateWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; url?: string; events?: string[]; active?: boolean }) => {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update webhook')
      return res.json().then((j) => j.data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      queryClient.invalidateQueries({ queryKey: ['webhooks', variables.id] })
    },
  })
}

// ── Delete webhook ──────────────────────────────────────────────

export function useDeleteWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/webhooks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete webhook')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    },
  })
}

// ── Test webhook ────────────────────────────────────────────────

export function useTestWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/webhooks/${id}/test`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to test webhook')
      return res.json().then((j) => j.data)
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', id] })
    },
  })
}
