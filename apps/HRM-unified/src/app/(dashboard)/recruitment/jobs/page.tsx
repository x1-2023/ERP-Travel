'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Eye,
  Globe,
  XCircle,
  MoreHorizontal,
  FileText,
  Users,
  Clock,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage } from '@/components/shared/loading-spinner'
import { JOB_POSTING_STATUS, JOB_TYPE } from '@/lib/recruitment/constants'

interface JobPosting {
  id: string
  title: string
  department: string
  jobType: string
  location: string
  status: string
  applicationsCount: number
  publishedAt: string | null
  closingDate: string | null
  createdAt: string
}

export default function JobPostingsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  useEffect(() => {
    async function fetchJobs() {
      try {
        const params = new URLSearchParams()
        if (statusFilter !== 'all') params.set('status', statusFilter)
        if (search) params.set('search', search)

        const res = await fetch(`/api/recruitment/jobs?${params.toString()}`)
        if (!res.ok) throw new Error('Không thể tải danh sách tin tuyển dụng')
        const json = await res.json()
        // API returns { success: true, data: { postings, total, page, limit } }
        const data = json.data?.postings || json.data || json.postings || json || []
        setJobs(Array.isArray(data) ? data : [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [statusFilter, search])

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/recruitment/jobs/${id}/publish`, { method: 'POST' })
      if (!res.ok) throw new Error('Không thể đăng tin')
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'PUBLISHED' } : j))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    }
  }

  const handleClose = async (id: string) => {
    try {
      const res = await fetch(`/api/recruitment/jobs/${id}/close`, { method: 'POST' })
      if (!res.ok) throw new Error('Không thể đóng tin')
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'CLOSED' } : j))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tin tuyển dụng"
        description="Quản lý các tin tuyển dụng"
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm tin tuyển dụng..."
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
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.entries(JOB_POSTING_STATUS).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Bảng
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Chưa có tin tuyển dụng nào
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    <Link
                      href={`/recruitment/jobs/${job.id}`}
                      className="hover:underline"
                    >
                      {job.title}
                    </Link>
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/recruitment/jobs/${job.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </Link>
                      </DropdownMenuItem>
                      {job.status === 'DRAFT' && (
                        <DropdownMenuItem onClick={() => handlePublish(job.id)}>
                          <Globe className="mr-2 h-4 w-4" />
                          Đăng tin
                        </DropdownMenuItem>
                      )}
                      {job.status === 'PUBLISHED' && (
                        <DropdownMenuItem onClick={() => handleClose(job.id)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Đóng tin
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{job.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{JOB_TYPE[job.jobType]?.shortLabel || job.jobType}</span>
                  {job.location && <span>- {job.location}</span>}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{job.applicationsCount} hồ sơ</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  {getStatusBadge(job.status)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left text-sm font-medium">Tiêu đề</th>
                  <th className="p-3 text-left text-sm font-medium">Phòng ban</th>
                  <th className="p-3 text-left text-sm font-medium">Loại</th>
                  <th className="p-3 text-center text-sm font-medium">Hồ sơ</th>
                  <th className="p-3 text-left text-sm font-medium">Trạng thái</th>
                  <th className="p-3 text-right text-sm font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b hover:bg-accent/50">
                    <td className="p-3">
                      <Link href={`/recruitment/jobs/${job.id}`} className="font-medium hover:underline">
                        {job.title}
                      </Link>
                    </td>
                    <td className="p-3 text-sm">{job.department}</td>
                    <td className="p-3 text-sm">{JOB_TYPE[job.jobType]?.shortLabel || job.jobType}</td>
                    <td className="p-3 text-center text-sm">{job.applicationsCount}</td>
                    <td className="p-3">{getStatusBadge(job.status)}</td>
                    <td className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/recruitment/jobs/${job.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem
                            </Link>
                          </DropdownMenuItem>
                          {job.status === 'DRAFT' && (
                            <DropdownMenuItem onClick={() => handlePublish(job.id)}>
                              <Globe className="mr-2 h-4 w-4" />
                              Đăng tin
                            </DropdownMenuItem>
                          )}
                          {job.status === 'PUBLISHED' && (
                            <DropdownMenuItem onClick={() => handleClose(job.id)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Đóng tin
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
