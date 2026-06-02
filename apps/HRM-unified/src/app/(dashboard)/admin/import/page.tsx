'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ImportJob {
  id: string
  importType: string
  fileName: string
  status: string
  totalRows: number
  processedRows: number
  successRows: number
  errorRows: number
  createdAt: string
  user?: { name: string }
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  PENDING: { label: 'Chờ xử lý', variant: 'secondary' },
  PROCESSING: { label: 'Đang xử lý', variant: 'default' },
  COMPLETED: { label: 'Hoàn thành', variant: 'default' },
  FAILED: { label: 'Lỗi', variant: 'destructive' },
}

export default function ImportDashboardPage() {
  const [jobs, setJobs] = useState<ImportJob[]>([])

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/import')
      const data = await res.json()
      setJobs(data.data || [])
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    fetchJobs()

    // Auto-refresh every 3 seconds while any job is processing
    const interval = setInterval(() => {
      fetchJobs()
    }, 3000)

    return () => clearInterval(interval)
  }, [fetchJobs])

  const hasActiveJobs = jobs.some(j => j.status === 'PENDING' || j.status === 'PROCESSING')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Import dữ liệu</h1>
        {hasActiveJobs && (
          <Badge variant="default" className="animate-pulse">Đang xử lý...</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/import/employees">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader><CardTitle>Import nhân viên</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Nhập danh sách nhân viên từ file Excel</p></CardContent>
          </Card>
        </Link>
        <Link href="/admin/import/attendance">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader><CardTitle>Import chấm công</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Nhập dữ liệu chấm công từ file Excel/CSV</p></CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader><CardTitle>Lịch sử import</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {jobs.map(job => {
              const hasErrors = job.errorRows > 0 || job.status === 'FAILED'
              const progress = job.totalRows > 0 ? Math.round((job.processedRows / job.totalRows) * 100) : 0

              return (
                <Link key={job.id} href={`/admin/import/${job.id}`}>
                  <div className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{job.fileName}</div>
                      <div className="text-sm text-muted-foreground">
                        {job.importType === 'employees' ? 'Nhân viên' : 'Chấm công'} | {new Date(job.createdAt).toLocaleString('vi-VN')}
                        {job.user && ` | ${job.user.name}`}
                      </div>
                      <div className="text-xs mt-1">
                        {job.totalRows} dòng | <span className="text-green-600">{job.successRows} thành công</span>
                        {job.errorRows > 0 && <> | <span className="text-red-600">{job.errorRows} lỗi</span></>}
                      </div>
                      {job.status === 'PROCESSING' && (
                        <div className="mt-1.5 w-full bg-secondary rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-4">
                      <Badge variant={STATUS_MAP[job.status]?.variant || 'secondary'}>
                        {STATUS_MAP[job.status]?.label || job.status}
                      </Badge>
                      {hasErrors && (
                        <span className="text-xs text-red-500">Xem chi tiết lỗi →</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
            {jobs.length === 0 && <p className="text-center text-muted-foreground py-4">Chưa có import nào</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
