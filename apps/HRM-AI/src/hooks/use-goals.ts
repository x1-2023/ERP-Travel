'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Goal } from '@/types/performance'

interface UseGoalsOptions {
  goalType?: string
  status?: string
  ownerId?: string
  page?: number
  limit?: number
}

export function useGoals(options: UseGoalsOptions = {}) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (options.goalType) params.set('goalType', options.goalType)
      if (options.status) params.set('status', options.status)
      if (options.ownerId) params.set('ownerId', options.ownerId)
      if (options.page) params.set('page', String(options.page))
      if (options.limit) params.set('limit', String(options.limit))

      const res = await fetch(`/api/performance/goals?${params}`)
      if (!res.ok) throw new Error('Failed to fetch goals')
      const data = await res.json()
      setGoals(data.goals || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [options.goalType, options.status, options.ownerId, options.page, options.limit])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  return { goals, total, loading, error, refetch: fetchGoals }
}

export function useGoal(id: string | null) {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoal = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/performance/goals/${id}`)
      if (!res.ok) throw new Error('Failed to fetch goal')
      const data = await res.json()
      setGoal(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchGoal()
  }, [fetchGoal])

  return { goal, loading, error, refetch: fetchGoal }
}
