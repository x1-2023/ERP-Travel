'use client'

import { useState, useEffect, useCallback } from 'react'
import type { OnboardingData, OnboardingTemplate } from '@/types/recruitment'

export function useOnboardings(tenantId: string, status?: string) {
  const [onboardings, setOnboardings] = useState<OnboardingData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOnboardings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ tenantId })
      if (status) params.set('status', status)

      const res = await fetch(`/api/recruitment/onboarding?${params}`)
      const data = await res.json()

      if (data.success) {
        setOnboardings(data.data.onboardings)
      }
    } catch (err) {
      console.error('Failed to fetch onboardings:', err)
    } finally {
      setLoading(false)
    }
  }, [tenantId, status])

  useEffect(() => {
    fetchOnboardings()
  }, [fetchOnboardings])

  return { onboardings, loading, refetch: fetchOnboardings }
}

export function useOnboardingTemplates(tenantId: string) {
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ tenantId })
      const res = await fetch(`/api/recruitment/onboarding/templates?${params}`)
      const data = await res.json()

      if (data.success) {
        setTemplates(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err)
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return { templates, loading, refetch: fetchTemplates }
}
