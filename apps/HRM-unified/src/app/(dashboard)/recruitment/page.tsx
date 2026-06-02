'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  FileText,
  Calendar,
  Gift,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import { LoadingPage } from '@/components/shared/loading-spinner'
import { APPLICATION_STATUS } from '@/lib/recruitment/constants'

interface RecruitmentAnalytics {
  openRequisitions: number
  totalApplications: number
  interviewsThisWeek: number
  offersPending: number
  funnel: { stage: string; count: number }[]
  recentApplications: {
    id: string
    candidateName: string
    position: string
    status: string
    appliedAt: string
  }[]
}

export default function RecruitmentDashboardPage() {
  const [data, setData] = useState<RecruitmentAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/recruitment/analytics')
        if (!res.ok) throw new Error('Không thể tải dữ liệu')
        const json = await res.json()
        // API returns { success: true, data: result }
        setData(json.data || json)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return <LoadingPage />

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Tuyển dụng"
          description="Quản lý quy trình tuyển dụng"
        />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      </div>
    )
  }

  const analytics = {
    openRequisitions: data?.openRequisitions ?? 0,
    totalApplications: data?.totalApplications ?? 0,
    interviewsThisWeek: data?.interviewsThisWeek ?? 0,
    offersPending: data?.offersPending ?? 0,
    funnel: data?.funnel ?? [],
    recentApplications: data?.recentApplications ?? [],
  }

  const funnelCounts = analytics.funnel.length > 0 ? analytics.funnel.map(f => f.count) : [1]
  const maxFunnelCount = Math.max(...funnelCounts, 1)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tuyển dụng"
        description="Tổng quan quy trình tuyển dụng"
      >
        <Link href="/recruitment/requisitions/new">
          <Button>
            <Briefcase className="mr-2 h-4 w-4" />
            Tạo yêu cầu tuyển dụng
          </Button>
        </Link>
      </PageHeader>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Vị trí đang tuyển"
          value={analytics.openRequisitions}
          icon={Briefcase}
          description="Yêu cầu đang mở"
        />
        <StatsCard
          title="Tổng hồ sơ"
          value={analytics.totalApplications}
          icon={FileText}
          description="Ứng viên nộp hồ sơ"
        />
        <StatsCard
          title="Phỏng vấn tuần này"
          value={analytics.interviewsThisWeek}
          icon={Calendar}
          description="Lịch phỏng vấn sắp tới"
        />
        <StatsCard
          title="Offer đang chờ"
          value={analytics.offersPending}
          icon={Gift}
          description="Chờ phản hồi"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hiring Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Phễu tuyển dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.funnel.length > 0 ? (
              <div className="space-y-3">
                {analytics.funnel.map((stage) => {
                  const stageInfo = APPLICATION_STATUS[stage.stage]
                  const percentage = (stage.count / maxFunnelCount) * 100
                  return (
                    <div key={stage.stage} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{stageInfo?.label || stage.stage}</span>
                        <span className="font-medium">{stage.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Chưa có dữ liệu phễu tuyển dụng
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Hồ sơ gần đây
            </CardTitle>
            <Link href="/recruitment/applications">
              <Button variant="ghost" size="sm">
                Xem tất cả
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {analytics.recentApplications.length > 0 ? (
              <div className="space-y-3">
                {analytics.recentApplications.map((app) => {
                  const statusInfo = APPLICATION_STATUS[app.status]
                  return (
                    <Link
                      key={app.id}
                      href={`/recruitment/applications/${app.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium">{app.candidateName}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.position}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {statusInfo?.label || app.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Chưa có hồ sơ ứng tuyển
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/recruitment/requisitions">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 p-4">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="font-medium">Yêu cầu tuyển dụng</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/recruitment/jobs">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 p-4">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-medium">Tin tuyển dụng</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/recruitment/interviews">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 p-4">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">Phỏng vấn</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/recruitment/onboarding">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">Onboarding</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
