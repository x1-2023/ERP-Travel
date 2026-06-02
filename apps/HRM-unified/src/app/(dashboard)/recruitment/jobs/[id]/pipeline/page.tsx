'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Filter,
  Search,
  Users,
  Clock,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage } from '@/components/shared/loading-spinner'
import { ApplicationPipeline } from '@/components/recruitment/applications/application-pipeline'
import type { Application } from '@/types/recruitment'
import { PIPELINE_STAGES } from '@/lib/recruitment/constants'

interface JobPosting {
  id: string
  title: string
  department: string
  status: string
  applicationsCount: number
}

interface PipelineStats {
  total: number
  newThisWeek: number
  avgTimeToHire: number
  conversionRate: number
}

export default function JobPipelinePage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<JobPosting | null>(null)
  const [pipeline, setPipeline] = useState<Record<string, Application[]>>({})
  const [stats, setStats] = useState<PipelineStats>({
    total: 0,
    newThisWeek: 0,
    avgTimeToHire: 0,
    conversionRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  const fetchPipelineData = useCallback(async () => {
    try {
      // Fetch job details
      const jobRes = await fetch(`/api/recruitment/jobs/${jobId}`)
      if (!jobRes.ok) throw new Error('Không thể tải thông tin công việc')
      const jobData = await jobRes.json()
      setJob(jobData.data ?? jobData)

      // Fetch applications for this job
      const appsRes = await fetch(`/api/recruitment/applications?jobId=${jobId}`)
      if (!appsRes.ok) throw new Error('Không thể tải danh sách ứng viên')
      const appsData = await appsRes.json()
      const applications: Application[] = appsData.data || appsData || []

      // Group by status
      const grouped: Record<string, Application[]> = {}
      PIPELINE_STAGES.forEach((stage) => {
        grouped[stage.id] = []
      })

      applications.forEach((app: Application) => {
        const status = app.status || 'NEW'
        if (!grouped[status]) {
          grouped[status] = []
        }
        grouped[status].push(app)
      })

      setPipeline(grouped)

      // Calculate stats
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const newThisWeek = applications.filter(
        (app: Application) => new Date(app.createdAt) >= weekAgo
      ).length

      const hired = applications.filter((app: Application) => app.status === 'HIRED')
      const conversionRate = applications.length > 0
        ? Math.round((hired.length / applications.length) * 100)
        : 0

      // Calculate average time to hire for hired candidates
      let avgTimeToHire = 0
      if (hired.length > 0) {
        const totalDays = hired.reduce((sum: number, app: Application) => {
          const start = new Date(app.createdAt)
          // Use current date as estimate since we don't have hiredAt timestamp
          return sum + Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        }, 0)
        avgTimeToHire = Math.round(totalDays / hired.length)
      }

      setStats({
        total: applications.length,
        newThisWeek,
        avgTimeToHire,
        conversionRate,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [jobId])

  useEffect(() => {
    if (jobId) fetchPipelineData()
  }, [jobId, fetchPipelineData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPipelineData()
  }

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/recruitment/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Không thể cập nhật trạng thái')

      // Update local state
      setPipeline((prev) => {
        const newPipeline = { ...prev }
        let movedApp: Application | null = null

        // Find and remove from current stage
        for (const [status, apps] of Object.entries(newPipeline)) {
          const idx = apps.findIndex((a) => a.id === applicationId)
          if (idx !== -1) {
            movedApp = apps[idx]
            newPipeline[status] = apps.filter((a) => a.id !== applicationId)
            break
          }
        }

        // Add to new stage
        if (movedApp) {
          movedApp = { ...movedApp, status: newStatus }
          if (!newPipeline[newStatus]) {
            newPipeline[newStatus] = []
          }
          newPipeline[newStatus].push(movedApp)
        }

        return newPipeline
      })
    } catch (err: unknown) {
      console.error('Status change error:', err)
      // Refresh to get correct state
      fetchPipelineData()
    }
  }

  const handleViewApplication = (application: Application) => {
    router.push(`/recruitment/applications/${application.id}`)
  }

  // Filter pipeline based on search and source
  const filteredPipeline = Object.entries(pipeline).reduce(
    (acc, [status, apps]) => {
      let filtered = apps

      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        filtered = filtered.filter(
          (app) =>
            app.candidate?.fullName?.toLowerCase().includes(term) ||
            app.candidate?.email?.toLowerCase().includes(term)
        )
      }

      if (sourceFilter !== 'all') {
        filtered = filtered.filter((app) => app.source === sourceFilter)
      }

      acc[status] = filtered
      return acc
    },
    {} as Record<string, Application[]>
  )

  if (loading) return <LoadingPage />

  if (error || !job) {
    return (
      <div className="space-y-6">
        <PageHeader title="Pipeline tuyển dụng" />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error || 'Không tìm thấy công việc'}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Pipeline: ${job.title}`} description={job.department}>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Link href={`/recruitment/jobs/${jobId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Chi tiết công việc
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng ứng viên
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mới tuần này
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{stats.newThisWeek}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Thời gian tuyển TB
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTimeToHire} ngày</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tỷ lệ tuyển
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm ứng viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Nguồn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nguồn</SelectItem>
                  <SelectItem value="WEBSITE">Website</SelectItem>
                  <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                  <SelectItem value="REFERRAL">Giới thiệu</SelectItem>
                  <SelectItem value="JOB_BOARD">Job Board</SelectItem>
                  <SelectItem value="AGENCY">Agency</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stage counts */}
            <div className="flex items-center gap-2 ml-auto">
              {PIPELINE_STAGES.slice(0, 6).map((stage) => (
                <Badge key={stage.id} variant="secondary" className={stage.color}>
                  {stage.label}: {filteredPipeline[stage.id]?.length || 0}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Board */}
      <div className="overflow-x-auto">
        <ApplicationPipeline
          pipeline={filteredPipeline}
          onStatusChange={handleStatusChange}
          onViewApplication={handleViewApplication}
        />
      </div>
    </div>
  )
}
