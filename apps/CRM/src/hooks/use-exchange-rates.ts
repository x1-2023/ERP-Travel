'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authQueryConfig } from '@/lib/query-config'

export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const res = await fetch('/api/exchange-rates')
      if (!res.ok) throw new Error('Failed to fetch exchange rates')
      const json = await res.json()
      return json.data as Array<{
        id: string
        currency: string
        symbol: string
        name: string
        rateToBase: number
        isBase: boolean
        isActive: boolean
        updatedAt: string
      }>
    },
    ...authQueryConfig,
  })
}

export function useCreateExchangeRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      currency: string
      symbol: string
      name: string
      rateToBase: number
      isBase?: boolean
      isActive?: boolean
    }) => {
      const res = await fetch('/api/exchange-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create exchange rate')
      }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exchange-rates'] }),
  })
}

export function useUpdateExchangeRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; rateToBase?: number; isActive?: boolean; isBase?: boolean }) => {
      const res = await fetch(`/api/exchange-rates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update exchange rate')
      }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exchange-rates'] }),
  })
}

export function useDeleteExchangeRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/exchange-rates/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete exchange rate')
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exchange-rates'] }),
  })
}
