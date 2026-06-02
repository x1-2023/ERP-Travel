'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { REVIEW_CYCLE_TYPE, DEFAULT_REVIEW_WEIGHTS } from '@/lib/performance/constants'

export default function CreateCyclePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    cycleType: 'ANNUAL',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    goalSettingStart: '',
    goalSettingEnd: '',
    selfReviewStart: '',
    selfReviewEnd: '',
    managerReviewStart: '',
    managerReviewEnd: '',
    calibrationStart: '',
    calibrationEnd: '',
    goalWeight: DEFAULT_REVIEW_WEIGHTS.goal,
    competencyWeight: DEFAULT_REVIEW_WEIGHTS.competency,
    valuesWeight: DEFAULT_REVIEW_WEIGHTS.values,
    feedbackWeight: DEFAULT_REVIEW_WEIGHTS.feedback,
    allowSelfReview: true,
    allow360Feedback: false,
    requireCalibration: true,
  })

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/performance/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        router.push('/performance/admin/cycles')
      }
    } catch {
      // Handle error
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center gap-4">
        <Link href="/performance/admin/cycles">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-amber-400">Tạo chu kỳ đánh giá</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Basic Info */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Tên chu kỳ *</Label>
              <Input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="VD: Đánh giá năm 2025"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Loại</Label>
                <Select value={form.cycleType} onValueChange={(v) => handleChange('cycleType', v)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {Object.entries(REVIEW_CYCLE_TYPE).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Năm</Label>
                <Input
                  type="number"
                  value={form.year}
                  onChange={(e) => handleChange('year', Number(e.target.value))}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Ngày bắt đầu *</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Ngày kết thúc *</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase Dates */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Giai đoạn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Thiết lập mục tiêu - Bắt đầu</Label>
                <Input type="date" value={form.goalSettingStart} onChange={(e) => handleChange('goalSettingStart', e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Thiết lập mục tiêu - Kết thúc</Label>
                <Input type="date" value={form.goalSettingEnd} onChange={(e) => handleChange('goalSettingEnd', e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Tự đánh giá - Bắt đầu</Label>
                <Input type="date" value={form.selfReviewStart} onChange={(e) => handleChange('selfReviewStart', e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Tự đánh giá - Kết thúc</Label>
                <Input type="date" value={form.selfReviewEnd} onChange={(e) => handleChange('selfReviewEnd', e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Quản lý đánh giá - Bắt đầu</Label>
                <Input type="date" value={form.managerReviewStart} onChange={(e) => handleChange('managerReviewStart', e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Quản lý đánh giá - Kết thúc</Label>
                <Input type="date" value={form.managerReviewEnd} onChange={(e) => handleChange('managerReviewEnd', e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Calibration - Bắt đầu</Label>
                <Input type="date" value={form.calibrationStart} onChange={(e) => handleChange('calibrationStart', e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Calibration - Kết thúc</Label>
                <Input type="date" value={form.calibrationEnd} onChange={(e) => handleChange('calibrationEnd', e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weights */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Trọng số đánh giá (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Mục tiêu</Label>
                <Input type="number" value={form.goalWeight} onChange={(e) => handleChange('goalWeight', Number(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Năng lực</Label>
                <Input type="number" value={form.competencyWeight} onChange={(e) => handleChange('competencyWeight', Number(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Giá trị</Label>
                <Input type="number" value={form.valuesWeight} onChange={(e) => handleChange('valuesWeight', Number(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Feedback</Label>
                <Input type="number" value={form.feedbackWeight} onChange={(e) => handleChange('feedbackWeight', Number(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Config */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Cấu hình</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Cho phép tự đánh giá</Label>
              <Switch checked={form.allowSelfReview} onCheckedChange={(v) => handleChange('allowSelfReview', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Cho phép feedback 360</Label>
              <Switch checked={form.allow360Feedback} onCheckedChange={(v) => handleChange('allow360Feedback', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Yêu cầu calibration</Label>
              <Switch checked={form.requireCalibration} onCheckedChange={(v) => handleChange('requireCalibration', v)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-black">
            <Save className="mr-2 h-4 w-4" />
            {submitting ? 'Đang lưu...' : 'Tạo chu kỳ'}
          </Button>
          <Link href="/performance/admin/cycles">
            <Button type="button" variant="outline" className="border-zinc-700 text-zinc-300">Huỷ</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
