'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Globe,
  XCircle,
  Edit,
  Eye,
  MapPin,
  Briefcase,
  Kanban,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage } from '@/components/shared/loading-spinner'
import { JOB_POSTING_STATUS, JOB_TYPE, WORK_MODE } from '@/lib/recruitment/constants'

interface JobPostingDetail {
  id: string
  title: string
  slug: string
  department: string
  jobType: string
  workMode: string
  location: string
  status: string
  description: string
  requirements: string
  benefits: string
  salaryMin: number | null
  salaryMax: number | null
  showSalary: boolean
  applicationsCount: number
  viewsCount: number
  publishedAt: string | null
  closingDate: string | null
  createdAt: string
  requisition: { id: string; code: string; title: string } | null
}

export default function JobPostingDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [job, setJob] = useState<JobPostingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/recruitment/jobs/${id}`)
        if (!res.ok) throw new Error('Không thể tải thông tin tin tuyển dụng')
        const json = await res.json()
        setJob(json.data ?? json)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchJob()
  }, [id])

  const handlePublish = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/recruitment/jobs/${id}/publish`, { method: 'POST' })
      if (!res.ok) throw new Error('Không thể đăng tin')
      const updated = await res.json()
      setJob(updated.data ?? updated)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setActionLoading(false)
    }
  }

  const handleClose = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/recruitment/jobs/${id}/close`, { method: 'POST' })
      if (!res.ok) throw new Error('Không thể đóng tin')
      const updated = await res.json()
      setJob(updated.data ?? updated)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const info = JOB_POSTING_STATUS[status]
    if (!info) return <Badge variant="secondary">{status}</Badge>
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
    }
    return <Badge className={colorMap[info.color] || ''}>{info.label}</Badge>
  }

  if (loading) return <LoadingPage />

  if (error || !job) {
    return (
      <div className="space-y-6">
        <PageHeader title="Tin tuyển dụng" />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error || 'Không tìm thấy tin tuyển dụng'}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title={job.title}>
        <div className="flex items-center gap-2">
          {job.status === 'DRAFT' && (
            <Button onClick={handlePublish} disabled={actionLoading}>
              <Globe className="mr-2 h-4 w-4" />
              Đăng tin
            </Button>
          )}
          {job.status === 'PUBLISHED' && (
            <Button onClick={handleClose} disabled={actionLoading} variant="destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Đóng tin
            </Button>
          )}
          <Link href={`/recruitment/jobs/${id}/pipeline`}>
            <Button variant="outline">
              <Kanban className="mr-2 h-4 w-4" />
              Pipeline
            </Button>
          </Link>
          <Link href={`/recruitment/jobs/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          </Link>
          <Link href="/recruitment/jobs">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung tin tuyển dụng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {job.description && (
                <div>
                  <h3 className="font-medium mb-2">Mô tả công việc</h3>
                  <div className="whitespace-pre-wrap text-sm">{job.description}</div>
                </div>
              )}
              {job.requirements && (
                <div>
                  <h3 className="font-medium mb-2">Yêu cầu</h3>
                  <div className="whitespace-pre-wrap text-sm">{job.requirements}</div>
                </div>
              )}
              {job.benefits && (
                <div>
                  <h3 className="font-medium mb-2">Quyền lợi</h3>
                  <div className="whitespace-pre-wrap text-sm">{job.benefits}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trạng thái</span>
                {getStatusBadge(job.status)}
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{JOB_TYPE[job.jobType]?.label || job.jobType}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{job.location || 'Chưa xác định'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>{WORK_MODE[job.workMode]?.label || job.workMode}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Lượt xem</span>
                  <span className="font-medium">{job.viewsCount || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Hồ sơ</span>
                  <span className="font-medium">{job.applicationsCount || 0}</span>
                </div>
              </div>
              {job.salaryMin && job.salaryMax && job.showSalary && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Mức lương</p>
                    <p className="font-medium">
                      {job.salaryMin.toLocaleString('vi-VN')} - {job.salaryMax.toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                </>
              )}
              <Separator />
              <div className="space-y-2 text-sm">
                {job.publishedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ngày đăng</span>
                    <span>{new Date(job.publishedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
                {job.closingDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Hạn nộp</span>
                    <span>{new Date(job.closingDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ngày tạo</span>
                  <span>{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {job.requisition && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Yêu cầu tuyển dụng</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/recruitment/requisitions/${job.requisition.id}`}
                  className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{job.requisition.title}</p>
                    <p className="text-xs text-muted-foreground">{job.requisition.code}</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
