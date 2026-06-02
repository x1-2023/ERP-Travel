'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Eye,
  SendHorizontal,
  MoreHorizontal,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage } from '@/components/shared/loading-spinner'
import { REQUISITION_STATUS, PRIORITY, JOB_TYPE } from '@/lib/recruitment/constants'

interface Requisition {
  id: string
  code: string
  title: string
  department: string
  jobType: string
  headcount: number
  status: string
  priority: string
  createdAt: string
}

export default function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchRequisitions() {
      try {
        const params = new URLSearchParams()
        if (statusFilter !== 'all') params.set('status', statusFilter)
        if (priorityFilter !== 'all') params.set('priority', priorityFilter)
        if (search) params.set('search', search)

        const res = await fetch(`/api/recruitment/requisitions?${params.toString()}`)
        if (!res.ok) throw new Error('Không thể tải danh sách yêu cầu tuyển dụng')
        const json = await res.json()
        // API returns { success: true, data: { requisitions, total, page, limit } }
        const data = json.data?.requisitions || json.data || json.requisitions || json || []
        setRequisitions(Array.isArray(data) ? data : [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    fetchRequisitions()
  }, [statusFilter, priorityFilter, search])

  const handleSubmitForApproval = async (id: string) => {
    try {
      const res = await fetch(`/api/recruitment/requisitions/${id}/submit`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Không thể gửi yêu cầu duyệt')
      setRequisitions(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'PENDING_APPROVAL' } : r)
      )
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
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
      <Badge className={colorMap[info.color] || ''}>
        {info.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const info = PRIORITY[priority]
    if (!info) return null
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
    }
    return (
      <Badge variant="outline" className={colorMap[info.color] || ''}>
        {info.label}
      </Badge>
    )
  }

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yêu cầu tuyển dụng"
        description="Quản lý các yêu cầu tuyển dụng"
      >
        <Link href="/recruitment/requisitions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tạo yêu cầu tuyển dụng
          </Button>
        </Link>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã hoặc tiêu đề..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {Object.entries(REQUISITION_STATUS).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Ưu tiên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.entries(PRIORITY).map(([key, val]) => (
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
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-center">Số lượng</TableHead>
                  <TableHead>Ưu tiên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requisitions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Chưa có yêu cầu tuyển dụng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  requisitions.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-sm">{req.code}</TableCell>
                      <TableCell>
                        <Link
                          href={`/recruitment/requisitions/${req.id}`}
                          className="font-medium hover:underline"
                        >
                          {req.title}
                        </Link>
                      </TableCell>
                      <TableCell>{req.department}</TableCell>
                      <TableCell>
                        {JOB_TYPE[req.jobType]?.shortLabel || req.jobType}
                      </TableCell>
                      <TableCell className="text-center">{req.headcount}</TableCell>
                      <TableCell>{getPriorityBadge(req.priority)}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell>
                        {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/recruitment/requisitions/${req.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </Link>
                            </DropdownMenuItem>
                            {req.status === 'DRAFT' && (
                              <DropdownMenuItem
                                onClick={() => handleSubmitForApproval(req.id)}
                              >
                                <SendHorizontal className="mr-2 h-4 w-4" />
                                Gửi duyệt
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
