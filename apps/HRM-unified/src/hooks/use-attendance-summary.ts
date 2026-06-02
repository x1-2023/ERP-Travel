// src/hooks/use-attendance-summary.ts
// Attendance summary (monthly timesheet) hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AttendanceSummaryFilters, AttendanceSummaryWithRelations, PaginatedResponse } from '@/types'

// Fetch functions
async function fetchSummaries(filters: AttendanceSummaryFilters): Promise<PaginatedResponse<AttendanceSummaryWithRelations>> {
  const params = new URLSearchParams()
  if (filters.employeeId) params.set('employeeId', filters.employeeId)
  if (filters.departmentId) params.set('departmentId', filters.departmentId)
  if (filters.year) params.set('year', String(filters.year))
  if (filters.month) params.set('month', String(filters.month))
  if (filters.isLocked !== undefined) params.set('isLocked', String(filters.isLocked))
  if (filters.page) params.set('page', String(filters.page))
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize))

  const res = await fetch(`/api/attendance-summary?${params}`)
  if (!res.ok) throw new Error('Failed to fetch attendance summaries')
  const json = await res.json()
  if (json.meta) {
    return {
      data: json.data,
      pagination: {
        page: json.meta.page,
        pageSize: json.meta.pageSize ?? json.meta.limit,
        total: json.meta.total,
        totalPages: json.meta.totalPages,
      },
    }
  }
  return json
}

async function fetchSummaryById(id: string): Promise<AttendanceSummaryWithRelations> {
  const res = await fetch(`/api/attendance-summary/${id}`)
  if (!res.ok) throw new Error('Failed to fetch attendance summary')
  const json = await res.json()
  return json.data ?? json
}

// Hooks
export function useAttendanceSummaries(filters: AttendanceSummaryFilters = {}) {
  return useQuery({
    queryKey: ['attendance-summary', filters],
    queryFn: () => fetchSummaries(filters),
  })
}

export function useAttendanceSummaryById(id: string | undefined) {
  return useQuery({
    queryKey: ['attendance-summary', id],
    queryFn: () => fetchSummaryById(id!),
    enabled: !!id,
  })
}

export function useGenerateSummary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      employeeId,
      year,
      month,
    }: {
      employeeId: string
      year: number
      month: number
    }) => {
      const res = await fetch('/api/attendance-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, year, month }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to generate summary')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] })
    },
  })
}

export function useGenerateAllSummaries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      year,
      month,
      departmentId,
    }: {
      year: number
      month: number
      departmentId?: string
    }) => {
      const res = await fetch('/api/attendance-summary?action=generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, departmentId }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to generate summaries')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] })
    },
  })
}

export function useLockSummary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/attendance-summary/${id}?action=lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to lock summary')
      }
      return res.json()
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] })
      queryClient.invalidateQueries({ queryKey: ['attendance-summary', id] })
    },
  })
}

export function useUnlockSummary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/attendance-summary/${id}?action=unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to unlock summary')
      }
      return res.json()
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] })
      queryClient.invalidateQueries({ queryKey: ['attendance-summary', id] })
    },
  })
}
