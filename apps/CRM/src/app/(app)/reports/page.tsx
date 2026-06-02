'use client'

import { useState, useMemo, useCallback } from 'react'
import { BarChart3, TrendingUp, Activity, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { DateRangeSelector } from '@/components/analytics/DateRangeSelector'
import { useDashboardStats, useFunnelData, useRevenueData } from '@/hooks/use-dashboard'
import { useDashboardAnalytics, useSalesExportUrl, type DateRange } from '@/hooks/use-analytics'
import { useActivities } from '@/hooks/use-activities'
import { formatCurrency, formatShortCurrency, ACTIVITY_TYPES } from '@/lib/constants'
import { useTranslation } from '@/i18n'

const CHART_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#F97316', '#EC4899']
const DEALS_PER_PAGE = 10

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--crm-bg-hover)] border border-[var(--crm-border)] rounded-md px-3 py-2 shadow-lg">
      <p className="text-xs text-[var(--crm-text-secondary)] mb-1">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="text-xs text-[var(--crm-text-primary)]">
          {entry.name}: {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
        </p>
      ))}
    </div>
  )
}

function getDefaultRange(): DateRange {
  const now = new Date()
  return {
    from: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).toISOString(),
    to: now.toISOString(),
  }
}

export default function ReportsPage() {
  const { t } = useTranslation()
  const [range, setRange] = useState<DateRange>(getDefaultRange)
  const [salesPage, setSalesPage] = useState(0)

  const { data: stats, isLoading: loadingStats } = useDashboardStats()
  const { data: funnelData, isLoading: loadingFunnel } = useFunnelData()
  const { data: revenueData, isLoading: loadingRevenue } = useRevenueData()
  const { data: activitiesData, isLoading: loadingActivities } = useActivities({ limit: 200 })
  const { data: analytics, isLoading: loadingAnalytics } = useDashboardAnalytics(range)

  const exportUrl = useSalesExportUrl(range)

  const handleRangeChange = useCallback((newRange: DateRange) => {
    setRange(newRange)
    setSalesPage(0)
  }, [])

  // Activity breakdown by type
  const activityBreakdown = useMemo(() => {
    const activities = activitiesData?.data || []
    const counts: Record<string, number> = {}
    activities.forEach((a) => { counts[a.type] = (counts[a.type] || 0) + 1 })
    return ACTIVITY_TYPES.map((item, idx) => ({
      type: t(item.labelKey),
      value: counts[item.value] || 0,
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }))
  }, [activitiesData, t])

  // Funnel conversion rates
  const funnelWithConversion = useMemo(() => {
    if (!funnelData || funnelData.length === 0) return []
    return funnelData.map((stage, idx) => ({
      ...stage,
      conversion: idx === 0 ? 100 : funnelData[0].count > 0 ? Math.round((stage.count / funnelData[0].count) * 100) : 0,
    }))
  }, [funnelData])

  // Sales deals from dealsOverTime for table (simplified — show deal summaries by month)
  const dealsOverTime = analytics?.charts?.dealsOverTime || []
  const totalDealsPages = Math.max(1, Math.ceil(dealsOverTime.length / DEALS_PER_PAGE))
  const pagedDeals = dealsOverTime.slice(salesPage * DEALS_PER_PAGE, (salesPage + 1) * DEALS_PER_PAGE)

  return (
    <PageShell
      title={t('reports.title')}
      description={t('reports.description' as any)}
      actions={<DateRangeSelector value={range} onChange={handleRangeChange} />}
    >
      <Tabs defaultValue="sales">
        <TabsList className="bg-[var(--crm-bg-card)] border border-[var(--crm-border)]">
          <TabsTrigger
            value="sales"
            className="text-[var(--crm-text-secondary)] data-[state=active]:bg-[#10B981]/10 data-[state=active]:text-[#10B981]"
          >
            <TrendingUp className="w-4 h-4 mr-1.5" />
            {t('reports.salesReport' as any)}
          </TabsTrigger>
          <TabsTrigger
            value="pipeline"
            className="text-[var(--crm-text-secondary)] data-[state=active]:bg-[#10B981]/10 data-[state=active]:text-[#10B981]"
          >
            <BarChart3 className="w-4 h-4 mr-1.5" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="text-[var(--crm-text-secondary)] data-[state=active]:bg-[#10B981]/10 data-[state=active]:text-[#10B981]"
          >
            <Activity className="w-4 h-4 mr-1.5" />
            {t('reports.activityTab' as any)}
          </TabsTrigger>
        </TabsList>

        {/* ── Sales Report Tab ─────────────────────────────────────────── */}
        <TabsContent value="sales" className="space-y-4 mt-4">
          {loadingAnalytics ? (
            <Skeleton className="h-80 w-full bg-[var(--crm-bg-subtle)]" />
          ) : analytics ? (
            <>
              {/* KPI summary row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="kpi-card">
                  <p className="text-xs text-[var(--crm-text-muted)]">{t('analytics.totalRevenue' as any)}</p>
                  <p className="text-2xl font-bold text-[#10B981] mt-1">{formatShortCurrency(analytics.kpis.totalRevenue)}</p>
                </div>
                <div className="kpi-card">
                  <p className="text-xs text-[var(--crm-text-muted)]">{t('analytics.totalQuotes' as any)}</p>
                  <p className="text-2xl font-bold text-[var(--crm-text-primary)] mt-1">{analytics.kpis.totalQuotes}</p>
                </div>
                <div className="kpi-card">
                  <p className="text-xs text-[var(--crm-text-muted)]">{t('analytics.totalOrders' as any)}</p>
                  <p className="text-2xl font-bold text-[var(--crm-text-primary)] mt-1">{analytics.kpis.totalOrders}</p>
                </div>
                <div className="kpi-card">
                  <p className="text-xs text-[var(--crm-text-muted)]">{t('analytics.avgDealValue' as any)}</p>
                  <p className="text-2xl font-bold text-[#3B82F6] mt-1">{formatShortCurrency(analytics.kpis.avgDealValue)}</p>
                </div>
              </div>

              {/* Deals over time chart */}
              <div className="chart-container">
                <h3 className="text-sm font-medium text-[var(--crm-text-primary)] mb-4">
                  {t('analytics.dealsOverTime' as any)}
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dealsOverTime} margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--crm-border-subtle)" />
                      <XAxis dataKey="month" tick={{ fill: 'var(--crm-text-muted)', fontSize: 11 }} />
                      <YAxis tick={{ fill: 'var(--crm-text-muted)', fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend formatter={(value: string) => <span className="text-xs text-[var(--crm-text-secondary)]">{value}</span>} />
                      <Bar dataKey="won" name={t('analytics.won' as any)} fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="lost" name={t('analytics.lost' as any)} fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sales table (deals by month) */}
              <div className="glass-card-static overflow-hidden">
                <div className="flex items-center justify-between p-4 pb-0">
                  <h3 className="text-sm font-medium text-[var(--crm-text-primary)]">
                    {t('reports.monthlySummary' as any)}
                  </h3>
                  <a
                    href={exportUrl}
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t('reports.exportCsv' as any)}
                  </a>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[var(--crm-border)] hover:bg-transparent">
                      <TableHead className="text-[var(--crm-text-secondary)]">{t('reports.month' as any)}</TableHead>
                      <TableHead className="text-[var(--crm-text-secondary)] text-right">{t('analytics.won' as any)}</TableHead>
                      <TableHead className="text-[var(--crm-text-secondary)] text-right">{t('analytics.lost' as any)}</TableHead>
                      <TableHead className="text-[var(--crm-text-secondary)] text-right">{t('analytics.totalRevenue' as any)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedDeals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-[var(--crm-text-muted)] py-8">
                          {t('common.noData' as any)}
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedDeals.map((row) => (
                        <TableRow key={row.month} className="border-[var(--crm-border)]">
                          <TableCell className="text-[var(--crm-text-primary)] font-medium">{row.month}</TableCell>
                          <TableCell className="text-right text-emerald-400">{row.won}</TableCell>
                          <TableCell className="text-right text-red-400">{row.lost}</TableCell>
                          <TableCell className="text-right text-[var(--crm-text-primary)]">{formatCurrency(row.revenue)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {totalDealsPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-[var(--crm-border)]">
                    <span className="text-xs text-[var(--crm-text-muted)]">
                      {t('common.showing')} {salesPage * DEALS_PER_PAGE + 1}-{Math.min((salesPage + 1) * DEALS_PER_PAGE, dealsOverTime.length)} {t('common.of')} {dealsOverTime.length}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSalesPage((p) => Math.max(0, p - 1))}
                        disabled={salesPage === 0}
                        className="p-1.5 rounded-lg text-[var(--crm-text-secondary)] hover:bg-[var(--crm-bg-subtle)] disabled:opacity-30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSalesPage((p) => Math.min(totalDealsPages - 1, p + 1))}
                        disabled={salesPage >= totalDealsPages - 1}
                        className="p-1.5 rounded-lg text-[var(--crm-text-secondary)] hover:bg-[var(--crm-bg-subtle)] disabled:opacity-30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </TabsContent>

        {/* ── Pipeline Tab ─────────────────────────────────────────────── */}
        <TabsContent value="pipeline" className="space-y-4 mt-4">
          {loadingFunnel ? (
            <Skeleton className="h-80 w-full bg-[var(--crm-bg-subtle)]" />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="kpi-card">
                  <p className="text-xs text-[var(--crm-text-muted)]">{t('reports.openDeals' as any)}</p>
                  <p className="text-2xl font-bold text-[var(--crm-text-primary)] mt-1">{stats?.activeDeals || 0}</p>
                </div>
                <div className="kpi-card">
                  <p className="text-xs text-[var(--crm-text-muted)]">{t('reports.pipelineValue')}</p>
                  <p className="text-2xl font-bold text-[#10B981] mt-1">{formatShortCurrency(stats?.pipelineValue || 0)}</p>
                </div>
                <div className="kpi-card">
                  <p className="text-xs text-[var(--crm-text-muted)]">{t('analytics.conversionRate' as any)}</p>
                  <p className="text-2xl font-bold text-[#3B82F6] mt-1">{stats?.conversionRate || 0}%</p>
                </div>
              </div>

              <div className="chart-container">
                <h3 className="text-sm font-medium text-[var(--crm-text-primary)] mb-4">{t('analytics.pipelineFunnel' as any)}</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelWithConversion} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--crm-border-subtle)" />
                      <XAxis type="number" tick={{ fill: 'var(--crm-text-muted)', fontSize: 11 }} />
                      <YAxis type="category" dataKey="stage" tick={{ fill: 'var(--crm-text-secondary)', fontSize: 11 }} width={120} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="value" name={t('common.value')} radius={[0, 4, 4, 0]}>
                        {(funnelWithConversion || []).map((entry, idx) => (
                          <Cell key={idx} fill={entry.color || CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card-static overflow-hidden">
                <div className="p-4 pb-0">
                  <h3 className="text-sm font-medium text-[var(--crm-text-primary)]">{t('reports.conversionByStage' as any)}</h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[var(--crm-border)] hover:bg-transparent">
                      <TableHead className="text-[var(--crm-text-secondary)]">{t('reports.stage')}</TableHead>
                      <TableHead className="text-[var(--crm-text-secondary)] text-right">{t('reports.quantity')}</TableHead>
                      <TableHead className="text-[var(--crm-text-secondary)] text-right">{t('common.value')}</TableHead>
                      <TableHead className="text-[var(--crm-text-secondary)] text-right">{t('analytics.conversionRate' as any)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {funnelWithConversion.map((stage) => (
                      <TableRow key={stage.stage} className="border-[var(--crm-border)]">
                        <TableCell className="text-[var(--crm-text-primary)] font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                            {stage.stage}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-[var(--crm-text-primary)]">{stage.count}</TableCell>
                        <TableCell className="text-right text-[var(--crm-text-primary)]">{formatCurrency(stage.value)}</TableCell>
                        <TableCell className="text-right text-[#10B981]">{stage.conversion}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Activity Tab ─────────────────────────────────────────────── */}
        <TabsContent value="activity" className="space-y-4 mt-4">
          {loadingActivities ? (
            <Skeleton className="h-80 w-full bg-[var(--crm-bg-subtle)]" />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="chart-container">
                  <h3 className="text-sm font-medium text-[var(--crm-text-primary)] mb-4">{t('analytics.activityByType' as any)}</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityBreakdown} margin={{ left: 10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--crm-border-subtle)" />
                        <XAxis dataKey="type" tick={{ fill: 'var(--crm-text-muted)', fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                        <YAxis tick={{ fill: 'var(--crm-text-muted)', fontSize: 11 }} />
                        <Tooltip
                          content={({ active, payload, label }: any) => {
                            if (!active || !payload?.length) return null
                            return (
                              <div className="bg-[var(--crm-bg-hover)] border border-[var(--crm-border)] rounded-md px-3 py-2 shadow-lg">
                                <p className="text-xs text-[var(--crm-text-secondary)] mb-1">{label}</p>
                                <p className="text-xs text-[var(--crm-text-primary)]">{t('reports.quantity')}: {payload[0].value}</p>
                              </div>
                            )
                          }}
                        />
                        <Bar dataKey="value" name={t('reports.quantity')} radius={[4, 4, 0, 0]}>
                          {activityBreakdown.map((entry, idx) => (<Cell key={idx} fill={entry.color} />))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-container">
                  <h3 className="text-sm font-medium text-[var(--crm-text-primary)] mb-4">{t('reports.activityDistribution' as any)}</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={activityBreakdown.filter((d) => d.value > 0)} dataKey="value" nameKey="type" cx="50%" cy="50%" outerRadius={90} innerRadius={50} strokeWidth={0}>
                          {activityBreakdown.filter((d) => d.value > 0).map((entry, idx) => (<Cell key={idx} fill={entry.color} />))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }: any) => {
                            if (!active || !payload?.length) return null
                            const item = payload[0]
                            return (
                              <div className="bg-[var(--crm-bg-hover)] border border-[var(--crm-border)] rounded-md px-3 py-2 shadow-lg">
                                <p className="text-xs text-[var(--crm-text-primary)]">{item.name}: {item.value}</p>
                              </div>
                            )
                          }}
                        />
                        <Legend formatter={(value: string) => <span className="text-xs text-[var(--crm-text-secondary)]">{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="glass-card-static overflow-hidden">
                <div className="p-4 pb-0">
                  <h3 className="text-sm font-medium text-[var(--crm-text-primary)]">{t('reports.activitySummary' as any)}</h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[var(--crm-border)] hover:bg-transparent">
                      <TableHead className="text-[var(--crm-text-secondary)]">{t('common.type')}</TableHead>
                      <TableHead className="text-[var(--crm-text-secondary)] text-right">{t('reports.quantity')}</TableHead>
                      <TableHead className="text-[var(--crm-text-secondary)] text-right">{t('reports.percentage' as any)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityBreakdown.map((item) => {
                      const total = activityBreakdown.reduce((sum, a) => sum + a.value, 0)
                      const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
                      return (
                        <TableRow key={item.type} className="border-[var(--crm-border)]">
                          <TableCell className="text-[var(--crm-text-primary)]">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.type}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-[var(--crm-text-primary)]">{item.value}</TableCell>
                          <TableCell className="text-right text-[var(--crm-text-muted)]">{pct}%</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
