'use client'

import { useState } from 'react'
import { ReportBuilder, ReportResultView } from '@/components/reports'
import type { ReportResult } from '@/types/report'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

export default function ReportsPage() {
  const [result, setResult] = useState<ReportResult | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveData, setSaveData] = useState({ name: '', description: '' })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleGenerate = (data: ReportResult) => {
    setResult(data)
    setSaveData({ name: data.title, description: '' })
  }

  const handleSave = async () => {
    if (!result) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/reports/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveData.name,
          description: saveData.description,
          reportType: 'custom',
          parameters: {},
        }),
      })

      if (response.ok) {
        toast({
          title: 'Đã lưu báo cáo',
          description: 'Báo cáo đã được lưu thành công',
        })
        setShowSaveDialog(false)
      }
    } catch (error) {
      console.error('Save report error:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu báo cáo',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    if (!result) return

    // Create CSV content
    const headers = result.columns.map((c) => c.label).join(',')
    const rows = result.data.map((row) =>
      result.columns.map((c) => String(row[c.key] ?? '')).join(',')
    )
    const csv = [headers, ...rows].join('\n')

    // Download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${result.title.replace(/\s+/g, '_')}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Đã xuất báo cáo',
      description: 'Tệp CSV đã được tải xuống',
    })
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Báo cáo</h1>
        <p className="text-muted-foreground">
          Tạo báo cáo nhân sự từ ngôn ngữ tự nhiên hoặc biểu mẫu
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <ReportBuilder onGenerate={handleGenerate} />

        <div>
          {result ? (
            <ReportResultView
              result={result}
              onSave={() => setShowSaveDialog(true)}
              onExport={handleExport}
            />
          ) : (
            <div className="flex items-center justify-center h-[400px] border rounded-lg bg-muted/50">
              <p className="text-muted-foreground">
                Tạo báo cáo để xem kết quả
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lưu báo cáo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên báo cáo</Label>
              <Input
                value={saveData.name}
                onChange={(e) =>
                  setSaveData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nhập tên báo cáo"
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả (tùy chọn)</Label>
              <Textarea
                value={saveData.description}
                onChange={(e) =>
                  setSaveData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Mô tả ngắn về báo cáo"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !saveData.name}>
              {isSaving ? 'Đang lưu...' : 'Lưu báo cáo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
