'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle,
  SendHorizontal,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage } from '@/components/shared/loading-spinner'
import { OFFER_STATUS } from '@/lib/recruitment/constants'

interface OfferDetail {
  id: string
  code: string
  candidateName: string
  candidateId: string
  applicationId: string
  position: string
  department: string
  status: string
  salary: number
  salaryNote: string
  startDate: string
  expiresAt: string | null
  benefits: string
  conditions: string
  notes: string
  createdAt: string
  updatedAt: string
  approvedBy: { name: string } | null
  approvedAt: string | null
  sentAt: string | null
  respondedAt: string | null
}

export default function OfferDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [offer, setOffer] = useState<OfferDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function fetchOffer() {
      try {
        const res = await fetch(`/api/recruitment/offers/${id}`)
        if (!res.ok) throw new Error('Không thể tải thông tin offer')
        const json = await res.json()
        setOffer(json)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchOffer()
  }, [id])

  const handleAction = async (action: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/recruitment/offers/${id}/${action}`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Không thể thực hiện thao tác')
      const updated = await res.json()
      setOffer(updated)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const info = OFFER_STATUS[status]
    if (!info) return <Badge variant="secondary">{status}</Badge>
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
    }
    return <Badge className={colorMap[info.color] || ''}>{info.label}</Badge>
  }

  if (loading) return <LoadingPage />

  if (error || !offer) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chi tiết Offer" />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error || 'Không tìm thấy offer'}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Offer: ${offer.code}`}
        description={`Ứng viên: ${offer.candidateName}`}
      >
        <div className="flex items-center gap-2">
          {offer.status === 'DRAFT' && (
            <Button
              onClick={() => handleAction('submit')}
              disabled={actionLoading}
            >
              <SendHorizontal className="mr-2 h-4 w-4" />
              Gửi duyệt
            </Button>
          )}
          {offer.status === 'PENDING_APPROVAL' && (
            <Button
              onClick={() => handleAction('approve')}
              disabled={actionLoading}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Phê duyệt
            </Button>
          )}
          {offer.status === 'APPROVED' && (
            <Button
              onClick={() => handleAction('send')}
              disabled={actionLoading}
            >
              <SendHorizontal className="mr-2 h-4 w-4" />
              Gửi cho ứng viên
            </Button>
          )}
          {offer.status === 'SENT' && (
            <>
              <Button
                onClick={() => handleAction('accept')}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Chấp nhận
              </Button>
              <Button
                onClick={() => handleAction('decline')}
                disabled={actionLoading}
                variant="destructive"
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                Từ chối
              </Button>
            </>
          )}
          <Link href="/recruitment/offers">
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
              <CardTitle>Thông tin Offer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Ứng viên</p>
                  <Link
                    href={`/recruitment/candidates/${offer.candidateId}`}
                    className="font-medium hover:underline"
                  >
                    {offer.candidateName}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vị trí</p>
                  <p className="font-medium">{offer.position}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phòng ban</p>
                  <p className="font-medium">{offer.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày bắt đầu dự kiến</p>
                  <p className="font-medium">
                    {new Date(offer.startDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Mức lương</p>
                <p className="text-xl font-bold text-primary">
                  {offer.salary.toLocaleString('vi-VN')} VND
                </p>
                {offer.salaryNote && (
                  <p className="text-sm text-muted-foreground mt-1">{offer.salaryNote}</p>
                )}
              </div>

              {offer.benefits && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Quyền lợi</p>
                    <p className="whitespace-pre-wrap text-sm">{offer.benefits}</p>
                  </div>
                </>
              )}

              {offer.conditions && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Điều kiện</p>
                  <p className="whitespace-pre-wrap text-sm">{offer.conditions}</p>
                </div>
              )}

              {offer.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Ghi chú</p>
                  <p className="whitespace-pre-wrap text-sm">{offer.notes}</p>
                </div>
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
              <div>{getStatusBadge(offer.status)}</div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày tạo</span>
                  <span>{new Date(offer.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                {offer.approvedBy && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Người duyệt</span>
                    <span>{offer.approvedBy.name}</span>
                  </div>
                )}
                {offer.approvedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày duyệt</span>
                    <span>{new Date(offer.approvedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
                {offer.sentAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày gửi</span>
                    <span>{new Date(offer.sentAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
                {offer.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hạn phản hồi</span>
                    <span>{new Date(offer.expiresAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
                {offer.respondedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày phản hồi</span>
                    <span>{new Date(offer.respondedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>
              <Separator />
              <Link href={`/recruitment/applications/${offer.applicationId}`}>
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
