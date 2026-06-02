'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Interview, CalendarEvent } from '@/types/recruitment'

interface UseInterviewsOptions {
  tenantId: string
  startDate?: Date
  endDate?: Date
}

export function useInterviews(options: UseInterviewsOptions) {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInterviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ tenantId: options.tenantId })
      if (options.startDate) params.set('startDate', options.startDate.toISOString())
      if (options.endDate) params.set('endDate', options.endDate.toISOString())

      const res = await fetch(`/api/recruitment/interviews?${params}`)
      const data = await res.json()

      if (data.success) {
        setInterviews(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch interviews:', err)
    } finally {
      setLoading(false)
    }
  }, [options.tenantId, options.startDate, options.endDate])

  useEffect(() => {
    fetchInterviews()
  }, [fetchInterviews])

  return { interviews, loading, refetch: fetchInterviews }
}

export function useCalendarEvents(tenantId: string, startDate: Date, endDate: Date) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        tenantId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })

      const res = await fetch(`/api/recruitment/interviews/calendar?${params}`)
      const data = await res.json()

      if (data.success) {
        setEvents(data.data.map((e: Record<string, unknown>) => ({
          ...e,
          start: new Date(e.start as string),
          end: new Date(e.end as string),
        })))
      }
    } catch (err) {
      console.error('Failed to fetch calendar events:', err)
    } finally {
      setLoading(false)
    }
  }, [tenantId, startDate, endDate])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return { events, loading, refetch: fetchEvents }
}
