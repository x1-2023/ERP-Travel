'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Users, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { APPLICATION_SOURCE } from '@/lib/recruitment/constants'

interface Candidate {
  id: string
  fullName: string
  email: string
  phone: string
  source: string
  applicationsCount: number
  createdAt: string
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const params = new URLSearchParams()
        if (sourceFilter !== 'all') params.set('source', sourceFilter)
        if (search) params.set('search', search)

        const res = await fetch(`/api/recruitment/candidates?${params.toString()}`)
        if (!res.ok) throw new Error('Không thể tải danh sách ứng viên')
        const json = await res.json()
        // API returns { success: true, data: { candidates, total, page, limit } }
        const data = json.data?.candidates || json.data || json.candidates || json || []
        setCandidates(Array.isArray(data) ? data : [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    fetchCandidates()
  }, [search, sourceFilter])

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ứng viên"
        description="Quản lý hồ sơ ứng viên"
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Nguồn ứng viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nguồn</SelectItem>
                {Object.entries(APPLICATION_SOURCE).map(([key, val]) => (
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
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Nguồn</TableHead>
                  <TableHead className="text-center">Số hồ sơ</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Chưa có ứng viên nào
                    </TableCell>
                  </TableRow>
                ) : (
                  candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <Link
                          href={`/recruitment/candidates/${candidate.id}`}
                          className="font-medium hover:underline flex items-center gap-2"
                        >
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {candidate.fullName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{candidate.email}</TableCell>
                      <TableCell className="text-sm">{candidate.phone}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {APPLICATION_SOURCE[candidate.source]?.label || candidate.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          {candidate.applicationsCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(candidate.createdAt).toLocaleDateString('vi-VN')}
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
