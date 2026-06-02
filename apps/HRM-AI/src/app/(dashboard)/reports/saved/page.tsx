'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Play, Trash2, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { SavedReport } from '@/types/report'
import Link from 'next/link'

export default function SavedReportsPage() {
  const [reports, setReports] = useState<SavedReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/reports/saved')
      if (response.ok) {
        const data = await response.json()
        setReports(data.data)
      }
    } catch (error) {
      console.error('Fetch reports error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/reports/saved/${deleteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setReports((prev) => prev.filter((r) => r.id !== deleteId))
        toast({
          title: 'Đã xóa',
          description: 'Báo cáo đã được xóa thành công',
        })
      }
    } catch (error) {
      console.error('Delete report error:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa báo cáo',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleRun = async (id: string) => {
    try {
      const response = await fetch(`/api/reports/saved/${id}/run`, {
        method: 'POST',
      })

      if (response.ok) {
        toast({
          title: 'Thành công',
          description: 'Báo cáo đã được chạy',
        })
        fetchReports()
      }
    } catch (error) {
      console.error('Run report error:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể chạy báo cáo',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Báo cáo đã lưu</h1>
          <p className="text-muted-foreground">
            Quản lý các báo cáo đã lưu
          </p>
        </div>
        <Button asChild>
          <Link href="/reports">
            <FileText className="h-4 w-4 mr-2" />
            Tạo báo cáo mới
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách báo cáo</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có báo cáo nào được lưu
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên báo cáo</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Chạy lần cuối</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{report.name}</p>
                        {report.description && (
                          <p className="text-sm text-muted-foreground">
                            {report.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{report.reportType}</TableCell>
                    <TableCell>
                      {format(new Date(report.createdAt), 'dd/MM/yyyy', {
                        locale: vi,
                      })}
                    </TableCell>
                    <TableCell>
                      {report.lastRunAt
                        ? format(
                            new Date(report.lastRunAt),
                            'HH:mm dd/MM/yyyy',
                            { locale: vi }
                          )
                        : 'Chưa chạy'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRun(report.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Chạy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa báo cáo này? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
