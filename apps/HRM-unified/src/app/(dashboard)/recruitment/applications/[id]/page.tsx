'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  XCircle,
  Calendar,
  Clock,
  User,
  FileText,
  MessageSquare,
  Star,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage } from '@/components/shared/loading-spinner'
import {
  APPLICATION_STATUS,
  INTERVIEW_TYPE,
  INTERVIEW_RESULT,
  PIPELINE_STAGES,
} from '@/lib/recruitment/constants'

interface ApplicationDetail {
  id: string
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  candidateId: string
  position: string
  requisitionId: string
  status: string
  source: string
  coverLetter: string
  expectedSalary: number | null
  yearsOfExperience: number | null
  appliedAt: string
  cvUrl: string | null
  statusHistory: {
    status: string
    changedAt: string
    changedBy: string
    note: string
  }[]
  interviews: {
    id: string
    type: string
    scheduledAt: string
    result: string
    interviewers: string[]
  }[]
  evaluations: {
    id: string
    evaluator: string
    rating: number
    recommendation: string
    notes: string
    createdAt: string
  }[]
  offers: {
    id: string
    salary: number
    status: string
    createdAt: string
  }[]
  activityLog: {
    action: string
    description: string
    createdAt: string
    user: string
  }[]
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  useEffect(() => {
    async function fetchApplication() {
      try {
        const res = await fetch(`/api/recruitment/applications/${id}`)
        if (!res.ok) throw new Error('Không thể tải thông tin hồ sơ ứng tuyển')
        const json = await res.json()
        setApplication(json.data ?? json)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchApplication()
  }, [id])

  const handleMoveToNextStage = async () => {
    if (!application) return
    setActionLoading(true)
    try {
      const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === application.status)
      const nextStage = PIPELINE_STAGES[currentStageIndex + 1]
      if (!nextStage) return

      const res = await fetch(`/api/recruitment/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStage.id }),
      })
      if (!res.ok) throw new Error('Không thể chuyển giai đoạn')
      const updated = await res.json()
      setApplication(updated.data ?? updated)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/recruitment/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', note: rejectNote }),
      })
      if (!res.ok) throw new Error('Không thể từ chối hồ sơ')
      const updated = await res.json()
      setApplication(updated.data ?? updated)
      setShowRejectForm(false)
      setRejectNote('')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const info = APPLICATION_STATUS[status]
    if (!info) return <Badge variant="secondary">{status}</Badge>
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      purple: 'bg-purple-100 text-purple-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      green: 'bg-green-100 text-green-800',
      emerald: 'bg-emerald-100 text-emerald-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800',
    }
    return <Badge className={colorMap[info.color] || ''}>{info.label}</Badge>
  }

  if (loading) return <LoadingPage />

  if (error || !application) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chi tiết hồ sơ" />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error || 'Không tìm thấy hồ sơ'}
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === application.status)
  const canMoveNext = currentStageIndex >= 0 && currentStageIndex < PIPELINE_STAGES.length - 2
  const isTerminal = application.status === 'REJECTED' || application.status === 'WITHDRAWN' || application.status === 'HIRED'

  return (
    <div className="space-y-6">
      <PageHeader title={`Hồ sơ: ${application.candidateName}`}>
        <div className="flex items-center gap-2">
          {!isTerminal && canMoveNext && (
            <Button onClick={handleMoveToNextStage} disabled={actionLoading}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Chuyển giai đoạn tiếp
            </Button>
          )}
          {!isTerminal && (
            <Button
              variant="destructive"
              onClick={() => setShowRejectForm(true)}
              disabled={actionLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Từ chối
            </Button>
          )}
          <Link href={`/recruitment/interviews/new?applicationId=${id}`}>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Lên lịch PV
            </Button>
          </Link>
          <Link href="/recruitment/applications">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Status Timeline */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {PIPELINE_STAGES.filter(s => s.id !== 'REJECTED').map((stage, idx) => {
              const isActive = stage.id === application.status
              const isPast = currentStageIndex > idx
              return (
                <div key={stage.id} className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isActive
                        ? 'bg-primary text-white'
                        : isPast
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {stage.label}
                  </div>
                  {idx < PIPELINE_STAGES.length - 2 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reject Form */}
      {showRejectForm && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Từ chối hồ sơ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Lý do từ chối..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading}
              >
                Xác nhận từ chối
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectForm(false)}
              >
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin ứng viên
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Họ tên</p>
                  <Link
                    href={`/recruitment/candidates/${application.candidateId}`}
                    className="font-medium hover:underline"
                  >
                    {application.candidateName}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{application.candidateEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">{application.candidatePhone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kinh nghiệm</p>
                  <p className="font-medium">
                    {application.yearsOfExperience
                      ? `${application.yearsOfExperience} năm`
                      : 'Chưa cung cấp'}
                  </p>
                </div>
              </div>
              {application.expectedSalary && (
                <div>
                  <p className="text-sm text-muted-foreground">Lương mong muốn</p>
                  <p className="font-medium">
                    {application.expectedSalary.toLocaleString('vi-VN')} VND
                  </p>
                </div>
              )}
              {application.coverLetter && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Thư xin việc</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-3">
                    {application.coverLetter}
                  </p>
                </div>
              )}
              {application.cvUrl && (
                <a href={application.cvUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Xem CV
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Interviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Lịch sử phỏng vấn
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.interviews && application.interviews.length > 0 ? (
                <div className="space-y-3">
                  {application.interviews.map((interview) => (
                    <Link
                      key={interview.id}
                      href={`/recruitment/interviews/${interview.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {INTERVIEW_TYPE[interview.type]?.label || interview.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(interview.scheduledAt).toLocaleString('vi-VN')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PV: {interview.interviewers.join(', ')}
                        </p>
                      </div>
                      <Badge
                        className={
                          interview.result === 'PASSED'
                            ? 'bg-green-100 text-green-800'
                            : interview.result === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {INTERVIEW_RESULT[interview.result]?.label || interview.result}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Chưa có lịch phỏng vấn
                </p>
              )}
            </CardContent>
          </Card>

          {/* Evaluations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Đánh giá
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.evaluations && application.evaluations.length > 0 ? (
                <div className="space-y-4">
                  {application.evaluations.map((evaluation) => (
                    <div key={evaluation.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{evaluation.evaluator}</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= evaluation.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {evaluation.notes && (
                        <p className="text-sm text-muted-foreground">
                          {evaluation.notes}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(evaluation.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Chưa có đánh giá
                </p>
              )}
            </CardContent>
          </Card>

          {/* Offers */}
          {application.offers && application.offers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {application.offers.map((offer) => (
                    <Link
                      key={offer.id}
                      href={`/recruitment/offers/${offer.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {offer.salary.toLocaleString('vi-VN')} VND
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(offer.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <Badge variant="secondary">{offer.status}</Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin hồ sơ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <div className="mt-1">{getStatusBadge(application.status)}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vị trí</p>
                <p className="font-medium text-sm">{application.position}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nguồn</p>
                <p className="font-medium text-sm">{application.source}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày nộp</p>
                <p className="font-medium text-sm">
                  {new Date(application.appliedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Nhật ký hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.activityLog && application.activityLog.length > 0 ? (
                <div className="space-y-3">
                  {application.activityLog.map((log, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm">{log.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.user} - {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-sm text-muted-foreground">
                  Chưa có hoạt động
                </p>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Lịch sử trạng thái
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.statusHistory && application.statusHistory.length > 0 ? (
                <div className="space-y-3">
                  {application.statusHistory.map((history, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-gray-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(history.status)}
                        </div>
                        {history.note && (
                          <p className="text-xs mt-1">{history.note}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {history.changedBy} - {new Date(history.changedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-sm text-muted-foreground">
                  Chưa có lịch sử
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
