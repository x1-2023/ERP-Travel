'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PerformanceReview, ReviewCycle } from '@/types/performance'

interface UseReviewsOptions {
  reviewCycleId?: string
  employeeId?: string
  managerId?: string
  status?: string
  page?: number
}

export function useReviews(options: UseReviewsOptions = {}) {
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (options.reviewCycleId) params.set('reviewCycleId', options.reviewCycleId)
      if (options.employeeId) params.set('employeeId', options.employeeId)
      if (options.managerId) params.set('managerId', options.managerId)
      if (options.status) params.set('status', options.status)
      if (options.page) params.set('page', String(options.page))

      const res = await fetch(`/api/performance/reviews?${params}`)
      if (!res.ok) throw new Error('Failed to fetch reviews')
      const data = await res.json()
      setReviews(data.reviews || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [options.reviewCycleId, options.employeeId, options.managerId, options.status, options.page])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return { reviews, total, loading, error, refetch: fetchReviews }
}

export function useReview(id: string | null) {
  const [review, setReview] = useState<PerformanceReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReview = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/performance/reviews/${id}`)
      if (!res.ok) throw new Error('Failed to fetch review')
      const data = await res.json()
      setReview(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchReview()
  }, [fetchReview])

  return { review, loading, error, refetch: fetchReview }
}

export function useReviewCycles() {
  const [cycles, setCycles] = useState<ReviewCycle[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCycles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/performance/cycles')
      if (!res.ok) throw new Error('Failed to fetch cycles')
      const data = await res.json()
      setCycles(data.cycles || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCycles()
  }, [fetchCycles])

  return { cycles, loading, refetch: fetchCycles }
}
