'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  SendHorizontal,
  Play,
  FileText,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage } from '@/components/shared/loading-spinner'
import {
  REQUISITION_STATUS,
  JOB_TYPE,
  WORK_MODE,
  PRIORITY,
} from '@/lib/recruitment/constants'

interface RequisitionDetail {
  id: string
  code: string
  title: string
  department: string
  jobType: string
  workMode: string
  headcount: number
  filledCount: number
  priority: string
  status: string
  location: string
  salaryMin: number | null
  salaryMax: number | null
  description: string
  requirements: string
  benefits: string
  reason: string
  createdAt: string
  updatedAt: string
  createdBy: { name: string; email: string } | null
  approvedBy: { name: string; email: string } | null
  approvedAt: string | null
  jobPostings: { id: string; title: string; status: string }[]
  applications: { id: string; candidateName: string; status: string }[]
}

export default function RequisitionDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [requisition, setRequisition] = useState<RequisitionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function fetchRequisition() {
      try {
        const res = await fetch(`/api/recruitment/requisitions/${id}`)
        if (!res.ok) throw new Error('Không thể tải thông tin yêu cầu tuyển dụng')
        const json = await res.json()
        setRequisition(json.data ?? json)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchRequisition()
  }, [id])

  const handleAction = async (action: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/recruitment/requisitions/${id}/${action}`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error(`Không thể thực hiện thao tác`)
      const updated = await res.json()
      setRequisition(updated.data ?? updated)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const info = REQUISITION_STATUS[status]
    if (!info) return <Badge variant="secondary">{status}</Badge>
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      red: 'bg-red-100 text-red-800',
      green: 'bg-green-100 text-green-800',
      orange: 'bg-orange-100 text-orange-800',
      purple: 'bg-purple-100 text-purple-800',
    }
    return (
      <Badge className={colorMap[info.color] || ''}>{info.label}</Badge>
    )
  }

  if (loading) return <LoadingPage />

  if (error || !requisition) {
    return (
      <div className="space-y-6">
        <PageHeader title="Yêu cầu tuyển dụng" />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error || 'Không tìm thấy yêu cầu tuyển dụng'}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={requisition.title}
        description={`Mã: ${requisition.code}`}
      >
        <div className="flex items-center gap-2">
          {requisition.status === 'DRAFT' && (
            <Button
              onClick={() => handleAction('submit')}
              disabled={actionLoading}
            >
              <SendHorizontal className="mr-2 h-4 w-4" />
              Gửi duyệt
            </Button>
          )}
          {requisition.status === 'PENDING_APPROVAL' && (
            <>
              <Button
                onClick={() => handleAction('approve')}
                disabled={actionLoading}
                variant="default"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Phê duyệt
              </Button>
              <Button
                onClick={() => handleAction('reject')}
                disabled={actionLoading}
                variant="destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Từ chối
              </Button>
            </>
          )}
          {requisition.status === 'APPROVED' && (
            <Button
              onClick={() => handleAction('open')}
              disabled={actionLoading}
            >
              <Play className="mr-2 h-4 w-4" />
              Mở tuyển dụng
            </Button>
          )}
          <Link href="/recruitment/requisitions">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin yêu cầu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Phòng ban</p>
                  <p className="font-medium">{requisition.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loại hình</p>
                  <p className="font-medium">
                    {JOB_TYPE[requisition.jobType]?.label || requisition.jobType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hình thức làm việc</p>
                  <p className="font-medium">
                    {WORK_MODE[requisition.workMode]?.label || requisition.workMode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số lượng cần tuyển</p>
                  <p className="font-medium">
                    {requisition.filledCount}/{requisition.headcount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Địa điểm</p>
                  <p className="font-medium">{requisition.location || 'Chưa xác định'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mức lương</p>
                  <p className="font-medium">
                    {requisition.salaryMin && requisition.salaryMax
                      ? `${requisition.salaryMin.toLocaleString('vi-VN')} - ${requisition.salaryMax.toLocaleString('vi-VN')} VND`
                      : 'Thỏa thuận'}
                  </p>
                </div>
              </div>

              <Separator />

              {requisition.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Mô tả vị trí</p>
                  <p className="whitespace-pre-wrap">{requisition.description}</p>
                </div>
              )}

              {requisition.requirements && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Yêu cầu</p>
                  <p className="whitespace-pre-wrap">{requisition.requirements}</p>
                </div>
              )}

              {requisition.benefits && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Quyền lợi</p>
                  <p className="whitespace-pre-wrap">{requisition.benefits}</p>
                </div>
              )}

              {requisition.reason && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Lý do tuyển dụng</p>
                  <p className="whitespace-pre-wrap">{requisition.reason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked Job Postings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tin tuyển dụng liên quan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requisition.jobPostings && requisition.jobPostings.length > 0 ? (
                <div className="space-y-2">
                  {requisition.jobPostings.map((post) => (
                    <Link
                      key={post.id}
                      href={`/recruitment/jobs/${post.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                      <span className="font-medium">{post.title}</span>
                      <Badge variant="secondary">{post.status}</Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Chưa có tin tuyển dụng liên quan
                </p>
              )}
            </CardContent>
          </Card>

          {/* Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Hồ sơ ứng tuyển
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requisition.applications && requisition.applications.length > 0 ? (
                <div className="space-y-2">
                  {requisition.applications.map((app) => (
                    <Link
                      key={app.id}
                      href={`/recruitment/applications/${app.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                      <span className="font-medium">{app.candidateName}</span>
                      <Badge variant="secondary">{app.status}</Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Chưa có hồ sơ ứng tuyển
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(requisition.status)}
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Mức ưu tiên</p>
                <p className="font-medium">
                  {PRIORITY[requisition.priority]?.label || requisition.priority}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày tạo</p>
                <p className="font-medium">
                  {new Date(requisition.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              {requisition.createdBy && (
                <div>
                  <p className="text-sm text-muted-foreground">Người tạo</p>
                  <p className="font-medium">{requisition.createdBy.name}</p>
                </div>
              )}
              {requisition.approvedBy && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Người duyệt</p>
                    <p className="font-medium">{requisition.approvedBy.name}</p>
                  </div>
                  {requisition.approvedAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Ngày duyệt</p>
                      <p className="font-medium">
                        {new Date(requisition.approvedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
