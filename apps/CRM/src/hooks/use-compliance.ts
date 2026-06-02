'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authQueryConfig } from '@/lib/query-config'

export function useComplianceChecks(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['compliance-checks', entityType, entityId],
    queryFn: async () => {
      const res = await fetch(`/api/compliance/checks?entityType=${entityType}&entityId=${entityId}`)
      if (!res.ok) throw new Error('Failed to fetch compliance checks')
      const json = await res.json()
      return json.data as Array<{
        id: string
        entityType: string
        entityId: string
        checkType: string
        status: string
        riskLevel: string | null
        result: any
        notes: string | null
        checkedAt: string
        checkedBy: { id: string; name: string | null } | null
        expiresAt: string | null
      }>
    },
    enabled: !!entityType && !!entityId,
    ...authQueryConfig,
  })
}

export function useScreenEntity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { entityType: string; entityId: string; name: string; country: string }) => {
      const res = await fetch('/api/compliance/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Screening failed')
      }
      return res.json()
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['compliance-checks', vars.entityType, vars.entityId] })
    },
  })
}

export function useDealChecklist(dealId: string) {
  return useQuery({
    queryKey: ['deal-checklist', dealId],
    queryFn: async () => {
      const res = await fetch(`/api/deals/${dealId}/checklist`)
      if (!res.ok) throw new Error('Failed to fetch checklist')
      const json = await res.json()
      return json.data as Array<{
        id: string
        dealId: string
        key: string
        label: string
        checked: boolean
        checkedAt: string | null
        checkedBy: string | null
        notes: string | null
      }>
    },
    enabled: !!dealId,
    ...authQueryConfig,
  })
}

export function useUpdateChecklistItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ dealId, key, checked, notes }: { dealId: string; key: string; checked: boolean; notes?: string }) => {
      const res = await fetch(`/api/deals/${dealId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, checked, notes }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Update failed')
      }
      return res.json()
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['deal-checklist', vars.dealId] })
    },
  })
}
