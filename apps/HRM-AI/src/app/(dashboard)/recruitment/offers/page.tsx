'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage } from '@/components/shared/loading-spinner'
import { OFFER_STATUS } from '@/lib/recruitment/constants'

interface Offer {
  id: string
  code: string
  candidateName: string
  position: string
  salary: number
  status: string
  expiresAt: string | null
  createdAt: string
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchOffers() {
      try {
        const params = new URLSearchParams()
        if (statusFilter !== 'all') params.set('status', statusFilter)

        const res = await fetch(`/api/recruitment/offers?${params.toString()}`)
        if (!res.ok) throw new Error('Không thể tải danh sách offer')
        const json = await res.json()
        const result = json.data ?? json
        setOffers(Array.isArray(result) ? result : result.offers ?? [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    fetchOffers()
  }, [statusFilter])

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offer"
        description="Quản lý các offer tuyển dụng"
      />

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {Object.entries(OFFER_STATUS).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {error ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Ứng viên</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead className="text-right">Mức lương</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hạn phản hồi</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Chưa có offer nào
                    </TableCell>
                  </TableRow>
                ) : (
                  offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-mono text-sm">
                        <Link
                          href={`/recruitment/offers/${offer.id}`}
                          className="hover:underline"
                        >
                          {offer.code}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{offer.candidateName}</TableCell>
                      <TableCell className="text-sm">{offer.position}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {offer.salary.toLocaleString('vi-VN')} VND
                      </TableCell>
                      <TableCell>{getStatusBadge(offer.status)}</TableCell>
                      <TableCell className="text-sm">
                        {offer.expiresAt
                          ? new Date(offer.expiresAt).toLocaleDateString('vi-VN')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(offer.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
