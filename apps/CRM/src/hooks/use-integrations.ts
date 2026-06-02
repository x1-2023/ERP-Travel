'use client'

import { useQuery } from '@tanstack/react-query'

interface ModuleStatus {
  name: string
  label: string
  port: number
  baseUrl: string
  color: string
  icon: string
  description: string
  online: boolean
}

interface IntegrationHealth {
  modules: ModuleStatus[]
  connected: number
  total: number
}

async function fetchIntegrationHealth(): Promise<IntegrationHealth> {
  const res = await fetch('/api/integrations/health')
  if (!res.ok) return { modules: [], connected: 0, total: 0 }
  return res.json()
}

export function useIntegrationHealth() {
  return useQuery({
    queryKey: ['integrations', 'health'],
    queryFn: fetchIntegrationHealth,
    refetchInterval: 30_000, // Auto-refresh every 30s
    staleTime: 15_000,
  })
}
