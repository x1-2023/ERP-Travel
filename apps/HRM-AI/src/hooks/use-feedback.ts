'use client'

import { useState, useEffect, useCallback } from 'react'
import type { FeedbackData, FeedbackRequest } from '@/types/performance'

export function useFeedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeedback = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/performance/feedback')
      if (!res.ok) throw new Error('Failed to fetch feedback')
      const data = await res.json()
      setFeedbacks(data.feedbacks || data || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  return { feedbacks, loading, refetch: fetchFeedback }
}

export function useFeedbackRequests() {
  const [requests, setRequests] = useState<FeedbackRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/performance/feedback/requests')
      if (!res.ok) throw new Error('Failed to fetch requests')
      const data = await res.json()
      setRequests(data || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  return { requests, loading, refetch: fetchRequests }
}
