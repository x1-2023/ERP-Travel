'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { PageShell } from '@/components/layout/PageShell'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DateRangeSelector } from '@/components/analytics/DateRangeSelector'
import { AnalyticsKPICards } from '@/components/analytics/AnalyticsKPICards'
import {
  LazyPipelineFunnelChart,
  LazyDealsOverTimeChart,
  LazyQuoteStatusChart,
  LazyTopContactsChart,
  LazyCampaignPerformanceChart,
  LazyActivityByTypeChart,
} from '@/components/analytics/charts'
import { IntegrationStatus } from '@/components/integrations/IntegrationStatus'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  useDashboardAnalytics, useForecast, useVelocity, useWinLoss,
  useGeoAnalytics, usePartnerPerformance,
  type DateRange, type ForecastQuarter,
} from '@/hooks/use-analytics'
import { useActivities } from '@/hooks/use-activities'
import { ACTIVITY_TYPES, formatShortCurrency, getCountryName, COUNTRIES } from '@/lib/constants'
import { useTranslation } from '@/i18n'
import {
  Phone, Mail, Users, CheckSquare, FileText, Coffee, Monitor, ArrowRight,
  TrendingUp, Target, BarChart3, AlertTriangle, DollarSign, Trophy, Globe,
} from 'lucide-react'
import type { ActivityWithRelations } from '@/types'

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  CALL: Phone, EMAIL: Mail, MEETING: Users, TASK: CheckSquare,
  NOTE: FileText, LUNCH: Coffee, DEMO: Monitor, FOLLOW_UP: ArrowRight,
}

const SEGMENT_COLORS: Record<string, string> = {
  GOVERNMENT: '#3B82F6',
  COMMERCIAL: '#10B981',
  ACADEMIC: '#8B5CF6',
  PARTNER: '#F59E0B',
  UNKNOWN: '#6B7280',
}

const PIE_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#6366F1', '#EC4899', '#6B7280']

const REGION_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#6B7280']

type DashboardTab = 'overview' | 'forecast' | 'winloss' | 'geo'

function getDefaultRange(): DateRange {
  const now = new Date()
  return {
    from: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).toISOString(),
    to: now.toISOString(),
  }
}

function getRelativeTime(date: Date, t: (key: any, params?: Record<string, string | number>) => string): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return t('time.justNow')
  if (diffMins < 60) return t('time.minutesAgo', { n: diffMins })
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return t('time.hoursAgo', { n: diffHours })
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return t('time.daysAgo', { n: diffDays })
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function ActivityItem({ activity }: { activity: ActivityWithRelations }) {
  const { t } = useTranslation()
  const Icon = ACTIVITY_ICONS[activity.type] || FileText
  const type = ACTIVITY_TYPES.find((at) => at.value === activity.type)
  const typeLabel = type ? t(type.labelKey as any) : activity.type
  const relativeTime = getRelativeTime(new Date(activity.createdAt), t)

  return (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--crm-border-subtle)] last:border-0">
      <div className="p-1.5 rounded-lg bg-[var(--crm-bg-subtle)] shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-[var(--crm-text-secondary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--crm-text-primary)] line-clamp-1">
          {activity.subject || typeLabel}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {activity.contact && (
            <span className="text-xs text-[var(--crm-text-muted)] truncate">
              {activity.contact.firstName} {activity.contact.lastName}
            </span>
          )}
          {activity.deal && (
            <span className="text-xs text-[var(--crm-text-muted)] truncate">
              {activity.deal.title}
            </span>
          )}
        </div>
      </div>
      <span className="text-xs text-[var(--crm-text-muted)] shrink-0">{relativeTime}</span>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card-static p-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card-static p-4">
            <Skeleton className="h-[280px] w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Forecast Tab ─────────────────────────────────────────────────────

function ForecastTab() {
  const { t } = useTranslation()
  const { data: forecast, isLoading } = useForecast('USD')
  const { data: velocity } = useVelocity(180)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (isLoading) return <DashboardSkeleton />
  if (!forecast) return null

  // Prepare chart data: flatten quarters with segment breakdown for stacked bar
  const chartData = forecast.quarters.map((q) => ({
    quarter: q.quarter,
    GOVERNMENT: q.bySegment.GOVERNMENT?.weighted || 0,
    COMMERCIAL: q.bySegment.COMMERCIAL?.weighted || 0,
    ACADEMIC: q.bySegment.ACADEMIC?.weighted || 0,
    PARTNER: q.bySegment.PARTNER?.weighted || 0,
    UNKNOWN: q.bySegment.UNKNOWN?.weighted || 0,
    total: q.weighted,
  }))

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="glass-card-static">
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-[#3B82F6]" />
            <div className="text-xs text-[var(--crm-text-muted)] mb-1">{t('forecast.thisQuarter')}</div>
            <div className="text-xl font-bold text-[var(--crm-text-primary)]">
              ${formatShortCurrency(forecast.thisQuarter.weighted)}
            </div>
            <div className="text-xs text-[var(--crm-text-muted)]">
              {forecast.thisQuarter.dealCount} {t('forecast.deals')} &middot; ${formatShortCurrency(forecast.thisQuarter.unweighted)} raw
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-static">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-[#10B981]" />
            <div className="text-xs text-[var(--crm-text-muted)] mb-1">{t('forecast.nextQuarter')}</div>
            <div className="text-xl font-bold text-[var(--crm-text-primary)]">
              ${formatShortCurrency(forecast.nextQuarter.weighted)}
            </div>
            <div className="text-xs text-[var(--crm-text-muted)]">
              {forecast.nextQuarter.dealCount} {t('forecast.deals')} &middot; ${formatShortCurrency(forecast.nextQuarter.unweighted)} raw
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-static">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-5 w-5 mx-auto mb-1 text-[#8B5CF6]" />
            <div className="text-xs text-[var(--crm-text-muted)] mb-1">{t('forecast.pipelineTotal')}</div>
            <div className="text-xl font-bold text-[var(--crm-text-primary)]">
              ${formatShortCurrency(forecast.pipelineTotal.weighted)}
            </div>
            <div className="text-xs text-[var(--crm-text-muted)]">
              {forecast.pipelineTotal.dealCount} {t('forecast.deals')} &middot; ${formatShortCurrency(forecast.pipelineTotal.unweighted)} raw
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weighted Pipeline Stacked Bar Chart */}
      {mounted && chartData.length > 0 && (
        <div className="glass-card-static p-4">
          <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-4">{t('forecast.weighted')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--crm-border)" />
              <XAxis dataKey="quarter" tick={{ fill: 'var(--crm-text-muted)', fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `$${formatShortCurrency(v)}`} tick={{ fill: 'var(--crm-text-muted)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--crm-bg-card)',
                  border: '1px solid var(--crm-border)',
                  borderRadius: '8px',
                  color: 'var(--crm-text-primary)',
                }}
                formatter={(value: any, name: any) => [`$${formatShortCurrency(value)}`, name]}
              />
              <Legend />
              {Object.entries(SEGMENT_COLORS).map(([seg, color]) => (
                <Bar key={seg} dataKey={seg} stackId="a" fill={color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Velocity Table */}
      {velocity && (
        <div className="glass-card-static p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--crm-text-secondary)]">{t('velocity.title')}</h3>
            <div className="flex gap-3 text-xs text-[var(--crm-text-muted)]">
              <span>{t('velocity.cycleDays')}: <strong className="text-[var(--crm-text-primary)]">{velocity.avgCycleDays}d</strong></span>
              <span>Median: <strong className="text-[var(--crm-text-primary)]">{velocity.medianCycleDays}d</strong></span>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--crm-border)]">
                <TableHead className="text-[var(--crm-text-muted)]">Stage</TableHead>
                <TableHead className="text-[var(--crm-text-muted)]">{t('velocity.avgDays')}</TableHead>
                <TableHead className="text-[var(--crm-text-muted)]">Deals</TableHead>
                <TableHead className="text-[var(--crm-text-muted)]">{t('velocity.conversionRate')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {velocity.stageVelocity.map((sv, i) => {
                const isBottleneck = sv.stage === velocity.bottleneck
                const conversion = velocity.conversionRates[i]
                return (
                  <TableRow
                    key={sv.stage}
                    className={`border-[var(--crm-border)] ${isBottleneck ? 'bg-red-500/10' : ''}`}
                  >
                    <TableCell className="text-sm text-[var(--crm-text-primary)]">
                      {sv.stage}
                      {isBottleneck && (
                        <Badge variant="outline" className="ml-2 text-xs border-none bg-red-500/20 text-red-400">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {t('velocity.bottleneck')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className={`text-sm font-medium ${isBottleneck ? 'text-red-400' : 'text-[var(--crm-text-primary)]'}`}>
                      {sv.avgDays}d
                    </TableCell>
                    <TableCell className="text-sm text-[var(--crm-text-secondary)]">{sv.dealCount}</TableCell>
                    <TableCell className="text-sm text-[var(--crm-text-secondary)]">
                      {conversion ? `${Math.round(conversion.rate * 100)}%` : '—'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

// ── Win/Loss Tab ─────────────────────────────────────────────────────

function WinLossTab() {
  const { t } = useTranslation()
  const { data: winLoss, isLoading } = useWinLoss(365)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (isLoading) return <DashboardSkeleton />
  if (!winLoss) return null

  const overall = winLoss.overall

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass-card-static">
          <CardContent className="p-4 text-center">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-[#10B981]" />
            <div className="text-xl font-bold text-[var(--crm-text-primary)]">{Math.round(overall.winRate * 100)}%</div>
            <div className="text-xs text-[var(--crm-text-muted)]">{t('winLoss.winRate')}</div>
          </CardContent>
        </Card>
        <Card className="glass-card-static">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-[#10B981]">{overall.won}</div>
            <div className="text-xs text-[var(--crm-text-muted)]">{t('winLoss.won')}</div>
          </CardContent>
        </Card>
        <Card className="glass-card-static">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-[#EF4444]">{overall.lost}</div>
            <div className="text-xs text-[var(--crm-text-muted)]">{t('winLoss.lost')}</div>
          </CardContent>
        </Card>
        <Card className="glass-card-static">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto mb-1 text-[var(--crm-accent-text)]" />
            <div className="text-xl font-bold text-[var(--crm-text-primary)]">
              ${formatShortCurrency(overall.won > 0 ? Math.round(overall.wonValue / overall.won) : 0)}
            </div>
            <div className="text-xs text-[var(--crm-text-muted)]">Avg Deal</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Loss Reason Donut */}
        {mounted && winLoss.lossReasons.length > 0 && (
          <div className="glass-card-static p-4">
            <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-4">{t('winLoss.lossReasons')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={winLoss.lossReasons}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="reason"
                  label={(props: any) => `${t(`lossReason.${props.reason}` as any)} ${Math.round(props.percentage * 100)}%`}
                >
                  {winLoss.lossReasons.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--crm-bg-card)',
                    border: '1px solid var(--crm-border)',
                    borderRadius: '8px',
                    color: 'var(--crm-text-primary)',
                  }}
                  formatter={(value: any, name: any) => [value, t(`lossReason.${name}` as any)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Competitor Table */}
        <div className="glass-card-static p-4">
          <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-3">{t('winLoss.competitors')}</h3>
          {winLoss.competitors.length === 0 ? (
            <p className="text-sm text-[var(--crm-text-muted)] py-8 text-center">No competitor data</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--crm-border)]">
                  <TableHead className="text-[var(--crm-text-muted)]">{t('winLoss.competitors')}</TableHead>
                  <TableHead className="text-[var(--crm-text-muted)]">{t('winLoss.lost')}</TableHead>
                  <TableHead className="text-[var(--crm-text-muted)]">Value Lost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {winLoss.competitors.map((comp) => (
                  <TableRow key={comp.name} className="border-[var(--crm-border)]">
                    <TableCell className="text-sm font-medium text-[var(--crm-text-primary)]">{comp.name}</TableCell>
                    <TableCell className="text-sm text-red-400">{comp.dealsLost}</TableCell>
                    <TableCell className="text-sm text-[var(--crm-text-secondary)]">
                      ${formatShortCurrency(comp.totalValueLost)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Win Rate Trend Line */}
      {mounted && winLoss.trend.length > 0 && (
        <div className="glass-card-static p-4">
          <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-4">{t('winLoss.trend')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={winLoss.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--crm-border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--crm-text-muted)', fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => `${Math.round(v * 100)}%`}
                domain={[0, 1]}
                tick={{ fill: 'var(--crm-text-muted)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--crm-bg-card)',
                  border: '1px solid var(--crm-border)',
                  borderRadius: '8px',
                  color: 'var(--crm-text-primary)',
                }}
                formatter={(value: any) => [`${Math.round(value * 100)}%`, 'Win Rate']}
              />
              <Line type="monotone" dataKey="winRate" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<DashboardTab>('overview')
  const [range, setRange] = useState<DateRange>(getDefaultRange)
  const { data, isLoading } = useDashboardAnalytics(range, tab === 'overview')
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities({ limit: 5 })

  const handleRangeChange = useCallback((newRange: DateRange) => {
    setRange(newRange)
  }, [])

  const tabs: { key: DashboardTab; label: string }[] = [
    { key: 'overview', label: t('dashboard.title') },
    { key: 'forecast', label: t('forecast.title') },
    { key: 'winloss', label: t('winLoss.title') },
    { key: 'geo', label: t('geo.title') },
  ]

  return (
    <PageShell
      title={t('dashboard.title')}
      actions={
        tab === 'overview' ? <DateRangeSelector value={range} onChange={handleRangeChange} /> : undefined
      }
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-[var(--crm-border)]">
        {tabs.map((t_item) => (
          <button
            key={t_item.key}
            onClick={() => setTab(t_item.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t_item.key
                ? 'border-[#10B981] text-[#10B981]'
                : 'border-transparent text-[var(--crm-text-muted)] hover:text-[var(--crm-text-secondary)]'
            }`}
          >
            {t_item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <>
          {isLoading ? (
            <DashboardSkeleton />
          ) : data ? (
            <div className="space-y-4">
              <AnalyticsKPICards kpis={data.kpis} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <LazyPipelineFunnelChart data={data.charts.pipelineFunnel} />
                <LazyDealsOverTimeChart data={data.charts.dealsOverTime} />
                <LazyQuoteStatusChart data={data.charts.quotesByStatus} />
                <LazyTopContactsChart data={data.charts.topContacts} />
                <LazyCampaignPerformanceChart data={data.charts.campaignPerformance} />
                <LazyActivityByTypeChart data={data.charts.activityByType} />
              </div>
              <IntegrationStatus />
              <div className="glass-card-static p-4">
                <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-2">
                  {t('dashboard.recentActivities')}
                </h3>
                {activitiesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activitiesData?.data && activitiesData.data.length > 0 ? (
                  <div>
                    {activitiesData.data.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--crm-text-muted)] py-4 text-center">
                    {t('dashboard.noActivities')}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}

      {tab === 'forecast' && <ForecastTab />}
      {tab === 'winloss' && <WinLossTab />}
      {tab === 'geo' && <GeoTab />}
    </PageShell>
  )
}

// ── GeoTab ──────────────────────────────────────────────────────────

function GeoTab() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState(365)
  const { data: geo, isLoading: geoLoading } = useGeoAnalytics(period)
  const { data: partnerPerf, isLoading: partnerLoading } = usePartnerPerformance(period)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (geoLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 bg-[var(--crm-bg-subtle)]" />
        ))}
      </div>
    )
  }

  if (!geo) return null

  // Prepare heatmap data
  const segments = Array.from(new Set(geo.matrix.map((m) => m.segment)))
  const topMatrixCountries = geo.byCountry.slice(0, 8).map((c) => c.country)
  const maxMatrixValue = Math.max(...geo.matrix.map((m) => m.value), 1)

  // Country bar chart data
  const barData = geo.byCountry.slice(0, 10).map((c) => ({
    country: c.country,
    name: c.countryName,
    pipeline: c.pipelineValue,
    won: c.wonValue,
  }))

  return (
    <div className="space-y-4">
      {/* Period filter */}
      <div className="flex items-center gap-2">
        {[30, 90, 180, 365].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              period === p
                ? 'bg-[#10B981]/20 text-[#10B981]'
                : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text-secondary)]'
            }`}
          >
            {p}d
          </button>
        ))}
      </div>

      {/* Top 5 country cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {geo.byCountry.slice(0, 5).map((c) => {
          const wrColor = c.winRate >= 0.6 ? '#10B981' : c.winRate >= 0.3 ? '#F59E0B' : '#EF4444'
          return (
            <div key={c.country} className="glass-card-static p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{c.country}</span>
                <span className="text-xs font-medium text-[var(--crm-text-primary)]">{c.countryName}</span>
              </div>
              <div className="text-xs text-[var(--crm-text-muted)] space-y-1">
                <div className="flex justify-between">
                  <span>{t('geo.pipeline')}</span>
                  <span className="text-[#3B82F6] font-medium">${formatShortCurrency(c.pipelineValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('geo.won')}</span>
                  <span className="text-[#10B981] font-medium">${formatShortCurrency(c.wonValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('geo.dealCount')}</span>
                  <span className="text-[var(--crm-text-primary)]">{c.dealCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('geo.winRate')}</span>
                  <span style={{ color: wrColor }} className="font-medium">{Math.round(c.winRate * 100)}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Revenue by Country horizontal bar */}
        {mounted && barData.length > 0 && (
          <div className="glass-card-static p-4">
            <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-4">{t('geo.byCountry')}</h3>
            <ResponsiveContainer width="100%" height={Math.max(200, barData.length * 40)}>
              <BarChart data={barData} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--crm-border)" />
                <XAxis type="number" tickFormatter={(v) => `$${formatShortCurrency(v)}`} tick={{ fill: 'var(--crm-text-muted)', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'var(--crm-text-muted)', fontSize: 11 }} width={55} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--crm-bg-card)',
                    border: '1px solid var(--crm-border)',
                    borderRadius: '8px',
                    color: 'var(--crm-text-primary)',
                  }}
                  formatter={(value: any, name: any) => [`$${formatShortCurrency(value)}`, name === 'pipeline' ? t('geo.pipeline') : t('geo.won')]}
                />
                <Bar dataKey="pipeline" fill="#3B82F6" name={t('geo.pipeline')} />
                <Bar dataKey="won" fill="#10B981" name={t('geo.won')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue by Region donut */}
        {mounted && geo.byRegion.length > 0 && (
          <div className="glass-card-static p-4">
            <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-4">{t('geo.byRegion')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={geo.byRegion}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="totalValue"
                  nameKey="region"
                  label={(props: any) => `${props.region}`}
                >
                  {geo.byRegion.map((_, i) => (
                    <Cell key={i} fill={REGION_COLORS[i % REGION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--crm-bg-card)',
                    border: '1px solid var(--crm-border)',
                    borderRadius: '8px',
                    color: 'var(--crm-text-primary)',
                  }}
                  formatter={(value: any, name: any) => [`$${formatShortCurrency(value)}`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Country × Segment heatmap table */}
      {topMatrixCountries.length > 0 && segments.length > 0 && (
        <div className="glass-card-static p-4">
          <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-3">{t('geo.matrix')}</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--crm-border)]">
                  <TableHead className="text-[var(--crm-text-muted)]">{t('company.country')}</TableHead>
                  {segments.map((seg) => (
                    <TableHead key={seg} className="text-[var(--crm-text-muted)] text-center">{seg}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {topMatrixCountries.map((country) => (
                  <TableRow key={country} className="border-[var(--crm-border)]">
                    <TableCell className="text-sm font-medium text-[var(--crm-text-primary)]">
                      {getCountryName(country)}
                    </TableCell>
                    {segments.map((seg) => {
                      const cell = geo.matrix.find((m) => m.country === country && m.segment === seg)
                      if (!cell) {
                        return <TableCell key={seg} className="text-center text-xs text-[var(--crm-text-muted)]">—</TableCell>
                      }
                      const intensity = Math.min(cell.value / maxMatrixValue, 1)
                      return (
                        <TableCell
                          key={seg}
                          className="text-center"
                          style={{ backgroundColor: `rgba(59, 130, 246, ${0.05 + intensity * 0.35})` }}
                        >
                          <div className="text-xs font-medium text-[var(--crm-text-primary)]">${formatShortCurrency(cell.value)}</div>
                          <div className="text-[10px] text-[var(--crm-text-muted)]">{cell.dealCount} deals</div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Partner Performance */}
      {partnerPerf && partnerPerf.partners.length > 0 && (
        <div className="glass-card-static p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--crm-text-secondary)]">{t('partnerPerf.title')}</h3>
            <div className="flex gap-3 text-xs text-[var(--crm-text-muted)]">
              <span>{t('partnerPerf.contribution')}: <strong className="text-[#10B981]">{Math.round(partnerPerf.partnerContribution * 100)}%</strong></span>
              <span>{t('partnerPerf.totalPartnerRevenue')}: <strong className="text-[var(--crm-text-primary)]">${formatShortCurrency(partnerPerf.totalPartnerRevenue)}</strong></span>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--crm-border)]">
                <TableHead className="text-[var(--crm-text-muted)]">Partner</TableHead>
                <TableHead className="text-[var(--crm-text-muted)]">{t('partnerPerf.territory')}</TableHead>
                <TableHead className="text-[var(--crm-text-muted)]">{t('geo.dealCount')}</TableHead>
                <TableHead className="text-[var(--crm-text-muted)]">{t('geo.won')}</TableHead>
                <TableHead className="text-[var(--crm-text-muted)]">{t('geo.winRate')}</TableHead>
                <TableHead className="text-[var(--crm-text-muted)]">{t('partnerPerf.revenue')}</TableHead>
                <TableHead className="text-[var(--crm-text-muted)]">{t('partnerPerf.commissionEarned')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnerPerf.partners.map((p) => (
                <TableRow key={p.partnerId} className="border-[var(--crm-border)]">
                  <TableCell className="text-sm font-medium text-[var(--crm-text-primary)]">{p.partnerName}</TableCell>
                  <TableCell className="text-sm text-[var(--crm-text-secondary)]">{p.territory}</TableCell>
                  <TableCell className="text-sm text-[var(--crm-text-primary)]">{p.dealCount}</TableCell>
                  <TableCell className="text-sm text-[#10B981]">{p.wonCount}</TableCell>
                  <TableCell className="text-sm" style={{ color: p.winRate >= 0.6 ? '#10B981' : p.winRate >= 0.3 ? '#F59E0B' : '#EF4444' }}>
                    {Math.round(p.winRate * 100)}%
                  </TableCell>
                  <TableCell className="text-sm text-[var(--crm-text-primary)]">${formatShortCurrency(p.totalRevenue)}</TableCell>
                  <TableCell className="text-sm text-[var(--crm-text-secondary)]">${formatShortCurrency(p.commissionEarned)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
