'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SettingsKey, SettingsMap } from '@/lib/settings/types'

async function fetchAllSettings(): Promise<SettingsMap> {
  const res = await fetch('/api/settings')
  if (!res.ok) throw new Error('Failed to fetch settings')
  return res.json()
}

async function fetchSetting<K extends SettingsKey>(key: K): Promise<{ key: K; value: SettingsMap[K] }> {
  const res = await fetch(`/api/settings/${key}`)
  if (!res.ok) throw new Error(`Failed to fetch setting: ${key}`)
  return res.json()
}

async function updateSetting<K extends SettingsKey>(key: K, value: SettingsMap[K]): Promise<{ key: K; value: SettingsMap[K] }> {
  const res = await fetch(`/api/settings/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to save setting' }))
    throw new Error(err.error || 'Failed to save setting')
  }
  return res.json()
}

/**
 * Hook to fetch all settings merged with defaults.
 */
export function useAllSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchAllSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single setting by key.
 */
export function useSetting<K extends SettingsKey>(key: K) {
  return useQuery({
    queryKey: ['settings', key],
    queryFn: () => fetchSetting(key),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.value,
  })
}

/**
 * Hook to update a setting. Invalidates settings cache on success.
 */
export function useUpdateSetting<K extends SettingsKey>(key: K) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (value: SettingsMap[K]) => updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      queryClient.invalidateQueries({ queryKey: ['settings', key] })
    },
  })
}
