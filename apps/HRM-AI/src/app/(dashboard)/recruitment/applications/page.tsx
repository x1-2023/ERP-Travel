'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  LayoutGrid,
  List,
  GripVertical,
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
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage } from '@/components/shared/loading-spinner'
import { APPLICATION_STATUS, PIPELINE_STAGES } from '@/lib/recruitment/constants'

interface Application {
  id: string
  candidateName: string
  candidateEmail: string
  position: string
  requisitionId: string
  status: string
  source: string
  appliedAt: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [requisitionFilter, setRequisitionFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline')
  const [draggingId, setDraggingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApplications() {
      try {
        const params = new URLSearchParams()
        if (requisitionFilter !== 'all') params.set('requisitionId', requisitionFilter)
        if (search) params.set('search', search)

        const res = await fetch(`/api/recruitment/applications?${params.toString()}`)
        if (!res.ok) throw new Error('Không thể tải danh sách hồ sơ ứng tuyển')
        const json = await res.json()
        // API returns { success: true, data: { applications, total, page, limit } }
        const data = json.data?.applications || json.data || json.applications || json || []
        setApplications(Array.isArray(data) ? data : [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [requisitionFilter, search])

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData('applicationId', appId)
    setDraggingId(appId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const appId = e.dataTransfer.getData('applicationId')
    setDraggingId(null)

    if (!appId) return

    const app = applications.find(a => a.id === appId)
    if (!app || app.status === newStatus) return

    // Optimistic update
    setApplications(prev =>
      prev.map(a => a.id === appId ? { ...a, status: newStatus } : a)
    )

    try {
      const res = await fetch(`/api/recruitment/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        // Revert on failure
        setApplications(prev =>
          prev.map(a => a.id === appId ? { ...a, status: app.status } : a)
        )
        throw new Error('Không thể cập nhật trạng thái')
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
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

  const pipelineStages = PIPELINE_STAGES.filter(s => s.id !== 'REJECTED')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hồ sơ ứng tuyển"
        description="Quản lý pipeline ứng viên"
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm ứng viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={requisitionFilter} onValueChange={setRequisitionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Vị trí tuyển dụng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vị trí</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'pipeline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('pipeline')}
              >
                <LayoutGrid className="mr-1 h-4 w-4" />
                Pipeline
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="mr-1 h-4 w-4" />
                Danh sách
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
      ) : viewMode === 'pipeline' ? (
        /* Pipeline View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => {
            const stageApps = applications.filter(a => a.status === stage.id)
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-[280px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className={`rounded-lg ${stage.color} p-3 mb-2`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{stage.label}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {stageApps.length}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      className={`rounded-lg border bg-white p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${
                        draggingId === app.id ? 'opacity-50' : ''
                      }`}
                    >
                      <Link href={`/recruitment/applications/${app.id}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {app.candidateName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {app.position}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ứng viên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày nộp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Chưa có hồ sơ ứng tuyển
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <Link
                          href={`/recruitment/applications/${app.id}`}
                          className="font-medium hover:underline"
                        >
                          {app.candidateName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{app.candidateEmail}</TableCell>
                      <TableCell className="text-sm">{app.position}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
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
