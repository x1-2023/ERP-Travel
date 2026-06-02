'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface ImportError {
  row: number
  field: string
  value?: string
  error: string
}

interface ImportJob {
  id: string
  importType: string
  fileName: string
  status: string
  totalRows: number
  processedRows: number
  successRows: number
  errorRows: number
  errors: ImportError[] | null
  summary: Record<string, unknown> | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  user?: { name: string; email: string }
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  PENDING: { label: 'Chờ xử lý', variant: 'secondary' },
  PROCESSING: { label: 'Đang xử lý...', variant: 'default' },
  COMPLETED: { label: 'Hoàn thành', variant: 'default' },
  FAILED: { label: 'Lỗi', variant: 'destructive' },
}

export default function ImportJobDetailPage() {
  const params = useParams()
  const jobId = params.jobId as string
  const [job, setJob] = useState<ImportJob | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/admin/import/${jobId}`)
        const data = await res.json()
        setJob(data.data || data)
        setLoading(false)

        // Stop polling when job is complete
        if (data.data?.status === 'COMPLETED' || data.data?.status === 'FAILED' ||
            data?.status === 'COMPLETED' || data?.status === 'FAILED') {
          if (interval) clearInterval(interval)
        }
      } catch {
        setLoading(false)
      }
    }

    fetchJob()
    // Poll every 2 seconds while processing
    interval = setInterval(fetchJob, 2000)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [jobId])

  if (loading) {
    return <div className="flex items-center justify-center py-12"><p>Đang tải...</p></div>
  }

  if (!job) {
    return <div className="flex items-center justify-center py-12"><p>Không tìm thấy job</p></div>
  }

  const progress = job.totalRows > 0 ? Math.round((job.processedRows / job.totalRows) * 100) : 0
  const errors = Array.isArray(job.errors) ? job.errors : []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/import">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Quay lại</Button>
        </Link>
        <h1 className="text-2xl font-bold">Chi tiết Import</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{job.fileName}</CardTitle>
            <Badge variant={STATUS_MAP[job.status]?.variant || 'secondary'}>
              {STATUS_MAP[job.status]?.label || job.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Loại</p>
              <p className="font-medium">{job.importType === 'employees' ? 'Nhân viên' : 'Chấm công'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tổng dòng</p>
              <p className="font-medium">{job.totalRows}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Thành công</p>
              <p className="font-medium text-green-600">{job.successRows}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Lỗi</p>
              <p className="font-medium text-red-600">{job.errorRows}</p>
            </div>
          </div>

          {/* Progress bar */}
          {job.status === 'PROCESSING' && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Tiến trình</span>
                <span>{progress}% ({job.processedRows}/{job.totalRows})</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {job.user && (
            <p className="text-sm text-muted-foreground">
              Thực hiện bởi: {job.user.name} ({job.user.email})
              {job.createdAt && ` | ${new Date(job.createdAt).toLocaleString('vi-VN')}`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Error details */}
      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Chi tiết lỗi ({errors.length} lỗi)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-medium">Dòng</th>
                    <th className="text-left p-2 font-medium">Trường</th>
                    <th className="text-left p-2 font-medium">Giá trị</th>
                    <th className="text-left p-2 font-medium">Lỗi</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.map((err, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 font-mono">{err.row}</td>
                      <td className="p-2">{err.field}</td>
                      <td className="p-2 font-mono text-muted-foreground">{err.value || '-'}</td>
                      <td className="p-2 text-red-600">{err.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {job.status === 'COMPLETED' && errors.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-green-600 font-medium">Import hoàn thành thành công! Tất cả {job.successRows} dòng đã được xử lý.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
