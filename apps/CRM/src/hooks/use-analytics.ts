'use client'

import { useQuery } from '@tanstack/react-query'
import type { AnalyticsDashboard } from '@/types'
import { authQueryConfig } from '@/lib/query-config'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Request failed (${res.status})`)
  }
  return res.json()
}

export interface DateRange {
  from: string // ISO date string
  to: string   // ISO date string
}

export function useDashboardAnalytics(range: DateRange, enabled = true) {
  return useQuery<AnalyticsDashboard>({
    queryKey: ['analytics', 'dashboard', range.from, range.to],
    queryFn: () =>
      fetchJson<AnalyticsDashboard>(
        `/api/analytics/dashboard?from=${range.from}&to=${range.to}`
      ),
    staleTime: 60_000,
    enabled,
    ...authQueryConfig,
  })
}

export function useSalesExportUrl(range: DateRange): string {
  return `/api/reports/export?from=${range.from}&to=${range.to}`
}

// ── Forecast ─────────────────────────────────────────────────────────

export interface ForecastQuarter {
  quarter: string
  weighted: number
  unweighted: number
  dealCount: number
  bySegment: Record<string, { weighted: number; count: number }>
  byCurrency: Record<string, { weighted: number; count: number }>
}

export interface ForecastData {
  quarters: ForecastQuarter[]
  thisQuarter: { weighted: number; unweighted: number; dealCount: number }
  nextQuarter: { weighted: number; unweighted: number; dealCount: number }
  pipelineTotal: { weighted: number; unweighted: number; dealCount: number }
  baseCurrency: string
}

export function useForecast(baseCurrency = 'USD') {
  return useQuery<ForecastData>({
    queryKey: ['analytics', 'forecast', baseCurrency],
    queryFn: () => fetchJson<ForecastData>(`/api/analytics/forecast?baseCurrency=${baseCurrency}`),
    staleTime: 60_000,
    ...authQueryConfig,
  })
}

// ── Velocity ─────────────────────────────────────────────────────────

export interface VelocityData {
  stageVelocity: Array<{ stage: string; avgDays: number; dealCount: number }>
  conversionRates: Array<{ from: string; to: string; rate: number }>
  avgCycleDays: number
  medianCycleDays: number
  bottleneck: string
  wonDealsCount: number
}

export function useVelocity(periodDays = 180) {
  return useQuery<VelocityData>({
    queryKey: ['analytics', 'velocity', periodDays],
    queryFn: () => fetchJson<VelocityData>(`/api/analytics/velocity?period=${periodDays}`),
    staleTime: 60_000,
    ...authQueryConfig,
  })
}

// ── Win/Loss ─────────────────────────────────────────────────────────

export interface WinLossData {
  overall: {
    won: number; lost: number; winRate: number
    totalValue: number; wonValue: number; lostValue: number
  }
  bySegment: Array<{ segment: string; won: number; lost: number; winRate: number; avgValue: number }>
  lossReasons: Array<{ reason: string; count: number; totalValue: number; percentage: number }>
  competitors: Array<{ name: string; dealsLost: number; totalValueLost: number }>
  trend: Array<{ month: string; winRate: number; won: number; lost: number }>
  baseCurrency: string
}

export function useWinLoss(periodDays = 365) {
  return useQuery<WinLossData>({
    queryKey: ['analytics', 'win-loss', periodDays],
    queryFn: () => fetchJson<WinLossData>(`/api/analytics/win-loss?period=${periodDays}`),
    staleTime: 60_000,
    ...authQueryConfig,
  })
}

// ── Geo-Analytics ───────────────────────────────────────────────────

export interface GeoCountryData {
  country: string
  countryName: string
  region: string
  dealCount: number
  pipelineValue: number
  wonValue: number
  avgDealValue: number
  winRate: number
}

export interface GeoAnalytics {
  byCountry: GeoCountryData[]
  byRegion: Array<{ region: string; dealCount: number; totalValue: number; wonValue: number }>
  matrix: Array<{ country: string; segment: string; dealCount: number; value: number }>
  topCountries: string[]
  baseCurrency: string
}

export function useGeoAnalytics(period = 365, baseCurrency = 'USD') {
  return useQuery<GeoAnalytics>({
    queryKey: ['analytics', 'geo', period, baseCurrency],
    queryFn: () => fetchJson<GeoAnalytics>(`/api/analytics/geo?period=${period}&baseCurrency=${baseCurrency}`),
    staleTime: 60_000,
    ...authQueryConfig,
  })
}

// ── Partner Performance ─────────────────────────────────────────────

export interface PartnerStat {
  partnerId: string
  partnerName: string
  territory: string
  certification: string
  dealCount: number
  wonCount: number
  winRate: number
  totalRevenue: number
  commissionEarned: number
  commissionPending: number
  avgDealValue: number
}

export interface PartnerPerformance {
  partners: PartnerStat[]
  totalPartnerRevenue: number
  totalCommissionPaid: number
  totalCommissionPending: number
  partnerContribution: number
  baseCurrency: string
}

export function usePartnerPerformance(period = 365, baseCurrency = 'USD') {
  return useQuery<PartnerPerformance>({
    queryKey: ['analytics', 'partner-performance', period, baseCurrency],
    queryFn: () => fetchJson<PartnerPerformance>(`/api/analytics/partner-performance?period=${period}&baseCurrency=${baseCurrency}`),
    staleTime: 60_000,
    ...authQueryConfig,
  })
}
