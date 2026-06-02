'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Wand2, FileText } from 'lucide-react'
import type { ReportParams, ReportResult } from '@/types/report'

interface ReportBuilderProps {
  onGenerate: (result: ReportResult) => void
}

const reportTypes = [
  { value: 'attendance', label: 'Báo cáo chấm công' },
  { value: 'leave', label: 'Báo cáo nghỉ phép' },
  { value: 'overtime', label: 'Báo cáo tăng ca' },
  { value: 'headcount', label: 'Báo cáo nhân sự' },
]

export function ReportBuilder({ onGenerate }: ReportBuilderProps) {
  const [mode, setMode] = useState<'natural' | 'form'>('natural')
  const [query, setQuery] = useState('')
  const [formData, setFormData] = useState<Partial<ReportParams>>({
    reportType: 'attendance',
    parameters: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      groupBy: 'employee',
    },
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleNaturalSubmit = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) throw new Error('Failed to generate report')

      const { data } = await response.json()
      onGenerate(data)
    } catch (error) {
      console.error('Generate report error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: formData.reportType,
          title: `Báo cáo ${reportTypes.find((t) => t.value === formData.reportType)?.label}`,
          parameters: formData.parameters,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate report')

      const { data } = await response.json()
      onGenerate(data)
    } catch (error) {
      console.error('Generate report error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Tạo báo cáo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'natural' | 'form')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="natural">
              <Wand2 className="h-4 w-4 mr-2" />
              Ngôn ngữ tự nhiên
            </TabsTrigger>
            <TabsTrigger value="form">
              <FileText className="h-4 w-4 mr-2" />
              Biểu mẫu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="natural" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nhập yêu cầu báo cáo</Label>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ví dụ: Báo cáo chấm công tháng này theo phòng ban"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Mô tả báo cáo bạn muốn bằng tiếng Việt. AI sẽ tự động hiểu và tạo báo cáo phù hợp.
              </p>
            </div>
            <Button
              onClick={handleNaturalSubmit}
              disabled={!query.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Tạo báo cáo
            </Button>
          </TabsContent>

          <TabsContent value="form" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Loại báo cáo</Label>
                <Select
                  value={formData.reportType}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, reportType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Từ ngày</Label>
                  <Input
                    type="date"
                    value={formData.parameters?.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        parameters: {
                          ...prev.parameters!,
                          startDate: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Đến ngày</Label>
                  <Input
                    type="date"
                    value={formData.parameters?.endDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        parameters: {
                          ...prev.parameters!,
                          endDate: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nhóm theo</Label>
                <Select
                  value={formData.parameters?.groupBy}
                  onValueChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      parameters: { ...prev.parameters!, groupBy: v },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Nhân viên</SelectItem>
                    <SelectItem value="department">Phòng ban</SelectItem>
                    <SelectItem value="date">Ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleFormSubmit}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Tạo báo cáo
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
