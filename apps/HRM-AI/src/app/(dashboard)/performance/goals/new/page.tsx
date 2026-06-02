'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { GOAL_TYPE, GOAL_PRIORITY } from '@/lib/performance/constants'
import Link from 'next/link'

export default function CreateGoalPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    goalType: 'INDIVIDUAL',
    priority: 'MEDIUM',
    startDate: '',
    endDate: '',
    targetValue: '',
    unit: '',
    weight: '100',
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/performance/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          targetValue: form.targetValue ? Number(form.targetValue) : undefined,
          weight: Number(form.weight),
        }),
      })
      if (res.ok) {
        router.push('/performance/goals')
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
        <Link href="/performance/goals">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-amber-400">Tạo mục tiêu mới</h1>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-zinc-100">Thông tin mục tiêu</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Tiêu đề *</Label>
              <Input
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Nhập tiêu đề mục tiêu"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Mô tả</Label>
              <Textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả chi tiết mục tiêu"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Loại mục tiêu</Label>
                <Select value={form.goalType} onValueChange={(v) => handleChange('goalType', v)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {Object.entries(GOAL_TYPE).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Mức độ ưu tiên</Label>
                <Select value={form.priority} onValueChange={(v) => handleChange('priority', v)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {Object.entries(GOAL_PRIORITY).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Giá trị mục tiêu</Label>
                <Input
                  type="number"
                  value={form.targetValue}
                  onChange={(e) => handleChange('targetValue', e.target.value)}
                  placeholder="100"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Đơn vị</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  placeholder="%"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Trọng số (%)</Label>
                <Input
                  type="number"
                  value={form.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-black">
                <Save className="mr-2 h-4 w-4" />
                {submitting ? 'Đang lưu...' : 'Tạo mục tiêu'}
              </Button>
              <Link href="/performance/goals">
                <Button type="button" variant="outline" className="border-zinc-700 text-zinc-300">
                  Huỷ
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
