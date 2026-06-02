'use client'

import { useState, useEffect, useCallback } from 'react'
import type { JobRequisition } from '@/types/recruitment'

interface UseRequisitionsOptions {
  tenantId: string
  status?: string
  departmentId?: string
  page?: number
}

export function useRequisitions(options: UseRequisitionsOptions) {
  const [requisitions, setRequisitions] = useState<JobRequisition[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequisitions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ tenantId: options.tenantId })
      if (options.status) params.set('status', options.status)
      if (options.departmentId) params.set('departmentId', options.departmentId)
      if (options.page) params.set('page', String(options.page))

      const res = await fetch(`/api/recruitment/requisitions?${params}`)
      const data = await res.json()

      if (data.success) {
        setRequisitions(data.data.requisitions)
        setTotal(data.data.total)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to fetch requisitions')
    } finally {
      setLoading(false)
    }
  }, [options.tenantId, options.status, options.departmentId, options.page])

  useEffect(() => {
    fetchRequisitions()
  }, [fetchRequisitions])

  return { requisitions, total, loading, error, refetch: fetchRequisitions }
}
