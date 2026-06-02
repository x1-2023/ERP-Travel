'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CheckIn } from '@/types/performance'

export function useCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCheckIns = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/performance/check-ins')
      if (!res.ok) throw new Error('Failed to fetch check-ins')
      const data = await res.json()
      setCheckIns(data.checkIns || data || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCheckIns()
  }, [fetchCheckIns])

  return { checkIns, loading, refetch: fetchCheckIns }
}

export function useCheckIn(id: string | null) {
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCheckIn = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/performance/check-ins/${id}`)
      if (!res.ok) throw new Error('Failed to fetch check-in')
      const data = await res.json()
      setCheckIn(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCheckIn()
  }, [fetchCheckIn])

  return { checkIn, loading, refetch: fetchCheckIn }
}
