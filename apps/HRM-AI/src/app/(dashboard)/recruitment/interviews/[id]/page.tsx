'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  MapPin,
  User,
  Video,
  Star,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage } from '@/components/shared/loading-spinner'
import {
  INTERVIEW_TYPE,
  INTERVIEW_RESULT,
  RECOMMENDATION,
} from '@/lib/recruitment/constants'

interface InterviewDetail {
  id: string
  type: string
  candidateName: string
  candidateId: string
  applicationId: string
  position: string
  scheduledAt: string
  duration: number
  location: string
  meetingUrl: string | null
  result: string
  notes: string
  interviewers: { name: string; email: string }[]
  evaluation: {
    rating: number
    recommendation: string
    strengths: string
    weaknesses: string
    notes: string
  } | null
}

export default function InterviewDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [interview, setInterview] = useState<InterviewDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Evaluation form
  const [evalForm, setEvalForm] = useState({
    rating: 3,
    recommendation: '',
    strengths: '',
    weaknesses: '',
    notes: '',
  })
  const [showEvalForm, setShowEvalForm] = useState(false)

  useEffect(() => {
    async function fetchInterview() {
      try {
        const res = await fetch(`/api/recruitment/interviews/${id}`)
        if (!res.ok) throw new Error('Không thể tải thông tin phỏng vấn')
        const json = await res.json()
        const interviewData = json.data ?? json
        setInterview(interviewData)
        if (interviewData.evaluation) {
          setEvalForm(interviewData.evaluation)
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchInterview()
  }, [id])

  const handleUpdateResult = async (result: string) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/recruitment/interviews/${id}/result`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      })
      if (!res.ok) throw new Error('Không thể cập nhật kết quả')
      const updated = await res.json()
      setInterview(updated.data ?? updated)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEvaluation = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/recruitment/interviews/${id}/evaluation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evalForm),
      })
      if (!res.ok) throw new Error('Không thể gửi đánh giá')
      const updated = await res.json()
      setInterview(updated.data ?? updated)
      setShowEvalForm(false)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  const getResultBadge = (result: string) => {
    const info = INTERVIEW_RESULT[result]
    if (!info) return <Badge variant="secondary">{result}</Badge>
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      yellow: 'bg-yellow-100 text-yellow-800',
    }
    return <Badge className={colorMap[info.color] || ''}>{info.label}</Badge>
  }

  if (loading) return <LoadingPage />

  if (error || !interview) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chi tiết phỏng vấn" />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error || 'Không tìm thấy phỏng vấn'}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Phỏng vấn: ${interview.candidateName}`}
        description={INTERVIEW_TYPE[interview.type]?.label || interview.type}
      >
        <div className="flex items-center gap-2">
          {interview.result === 'PENDING' && (
            <>
              <Button
                onClick={() => handleUpdateResult('PASSED')}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Đạt
              </Button>
              <Button
                onClick={() => handleUpdateResult('FAILED')}
                disabled={submitting}
                variant="destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Không đạt
              </Button>
            </>
          )}
          <Link href="/recruitment/interviews">
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
          {/* Interview Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin phỏng vấn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian</p>
                    <p className="font-medium">
                      {new Date(interview.scheduledAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Thời lượng</p>
                    <p className="font-medium">{interview.duration} phút</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Địa điểm</p>
                    <p className="font-medium">{interview.location || 'Chưa xác định'}</p>
                  </div>
                </div>
                {interview.meetingUrl && (
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Link họp</p>
                      <a
                        href={interview.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Tham gia cuộc họp
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Người phỏng vấn</p>
                <div className="flex flex-wrap gap-2">
                  {interview.interviewers.map((interviewer, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{interviewer.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {interview.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ghi chú</p>
                    <p className="text-sm whitespace-pre-wrap">{interview.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Evaluation */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Đánh giá
              </CardTitle>
              {!interview.evaluation && !showEvalForm && (
                <Button size="sm" onClick={() => setShowEvalForm(true)}>
                  Thêm đánh giá
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {interview.evaluation ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Điểm:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= interview.evaluation!.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {interview.evaluation.recommendation && (
                    <div>
                      <p className="text-sm text-muted-foreground">Đề xuất</p>
                      <Badge variant="secondary">
                        {RECOMMENDATION[interview.evaluation.recommendation]?.label || interview.evaluation.recommendation}
                      </Badge>
                    </div>
                  )}
                  {interview.evaluation.strengths && (
                    <div>
                      <p className="text-sm text-muted-foreground">Điểm mạnh</p>
                      <p className="text-sm">{interview.evaluation.strengths}</p>
                    </div>
                  )}
                  {interview.evaluation.weaknesses && (
                    <div>
                      <p className="text-sm text-muted-foreground">Điểm yếu</p>
                      <p className="text-sm">{interview.evaluation.weaknesses}</p>
                    </div>
                  )}
                  {interview.evaluation.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Ghi chú</p>
                      <p className="text-sm">{interview.evaluation.notes}</p>
                    </div>
                  )}
                </div>
              ) : showEvalForm ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Điểm đánh giá</Label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEvalForm(prev => ({ ...prev, rating: star }))}
                        >
                          <Star
                            className={`h-6 w-6 cursor-pointer ${
                              star <= evalForm.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Đề xuất</Label>
                    <Select
                      value={evalForm.recommendation}
                      onValueChange={(v) => setEvalForm(prev => ({ ...prev, recommendation: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn đề xuất" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(RECOMMENDATION).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Điểm mạnh</Label>
                    <Textarea
                      value={evalForm.strengths}
                      onChange={(e) => setEvalForm(prev => ({ ...prev, strengths: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Điểm yếu</Label>
                    <Textarea
                      value={evalForm.weaknesses}
                      onChange={(e) => setEvalForm(prev => ({ ...prev, weaknesses: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ghi chú thêm</Label>
                    <Textarea
                      value={evalForm.notes}
                      onChange={(e) => setEvalForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSubmitEvaluation} disabled={submitting}>
                      {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowEvalForm(false)}>
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Chưa có đánh giá
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ứng viên</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Họ tên</p>
                <Link
                  href={`/recruitment/candidates/${interview.candidateId}`}
                  className="font-medium hover:underline"
                >
                  {interview.candidateName}
                </Link>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vị trí ứng tuyển</p>
                <p className="font-medium text-sm">{interview.position}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Kết quả</p>
                <div className="mt-1">{getResultBadge(interview.result)}</div>
              </div>
              <Separator />
              <Link href={`/recruitment/applications/${interview.applicationId}`}>
                <Button variant="outline" className="w-full" size="sm">
                  Xem hồ sơ ứng tuyển
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
