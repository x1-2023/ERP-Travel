'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Application } from '@/types/recruitment'

interface UseApplicationsOptions {
  tenantId: string
  status?: string
  requisitionId?: string
  page?: number
}

export function useApplications(options: UseApplicationsOptions) {
  const [applications, setApplications] = useState<Application[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ tenantId: options.tenantId })
      if (options.status) params.set('status', options.status)
      if (options.requisitionId) params.set('requisitionId', options.requisitionId)
      if (options.page) params.set('page', String(options.page))

      const res = await fetch(`/api/recruitment/applications?${params}`)
      const data = await res.json()

      if (data.success) {
        setApplications(data.data.applications)
        setTotal(data.data.total)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }, [options.tenantId, options.status, options.requisitionId, options.page])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const updateStatus = useCallback(async (applicationId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/recruitment/applications/${applicationId}/status?tenantId=${options.tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchApplications()
      }
      return data
    } catch {
      return { success: false, error: 'Failed to update status' }
    }
  }, [options.tenantId, fetchApplications])

  return { applications, total, loading, error, refetch: fetchApplications, updateStatus }
}

export function usePipeline(tenantId: string, requisitionId?: string) {
  const [pipeline, setPipeline] = useState<Record<string, Application[]>>({})
  const [loading, setLoading] = useState(true)

  const fetchPipeline = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ tenantId })
      if (requisitionId) params.set('requisitionId', requisitionId)

      const res = await fetch(`/api/recruitment/applications/pipeline?${params}`)
      const data = await res.json()

      if (data.success) {
        setPipeline(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch pipeline:', err)
    } finally {
      setLoading(false)
    }
  }, [tenantId, requisitionId])

  useEffect(() => {
    fetchPipeline()
  }, [fetchPipeline])

  return { pipeline, loading, refetch: fetchPipeline }
}
