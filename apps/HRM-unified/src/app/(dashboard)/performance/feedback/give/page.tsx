'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Send, Star, Loader2 } from 'lucide-react'
import { FEEDBACK_TYPE } from '@/lib/performance/constants'

function GiveFeedbackForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get('requestId')
  const subjectId = searchParams.get('subjectId')

  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    subjectId: subjectId || '',
    feedbackType: 'CONTINUOUS',
    overallRating: 0,
    strengths: '',
    areasForImprovement: '',
    comments: '',
    isAnonymous: false,
    isPublic: false,
  })

  const handleChange = (field: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body = {
        ...form,
        requestId: requestId || undefined,
        overallRating: form.overallRating || undefined,
      }
      const res = await fetch('/api/performance/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        router.push('/performance/feedback')
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
        <Link href="/performance/feedback">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-amber-400">Gửi Feedback</h1>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-zinc-100">Thông tin feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Nhân viên *</Label>
              <Input
                value={form.subjectId}
                onChange={(e) => handleChange('subjectId', e.target.value)}
                placeholder="ID nhân viên hoặc tìm kiếm..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Loại feedback</Label>
              <Select value={form.feedbackType} onValueChange={(v) => handleChange('feedbackType', v)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {Object.entries(FEEDBACK_TYPE).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Đánh giá tổng thể</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleChange('overallRating', val)}
                    className="p-1"
                  >
                    <Star
                      className={`h-6 w-6 ${val <= form.overallRating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Điểm mạnh</Label>
              <Textarea
                value={form.strengths}
                onChange={(e) => handleChange('strengths', e.target.value)}
                placeholder="Các điểm mạnh nổi bật..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Cần cải thiện</Label>
              <Textarea
                value={form.areasForImprovement}
                onChange={(e) => handleChange('areasForImprovement', e.target.value)}
                placeholder="Các lĩnh vực cần phát triển..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Nhận xét chi tiết</Label>
              <Textarea
                value={form.comments}
                onChange={(e) => handleChange('comments', e.target.value)}
                placeholder="Chia sẻ thêm..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isAnonymous}
                  onCheckedChange={(v) => handleChange('isAnonymous', v)}
                />
                <Label className="text-zinc-400 text-sm">Ẩn danh</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isPublic}
                  onCheckedChange={(v) => handleChange('isPublic', v)}
                />
                <Label className="text-zinc-400 text-sm">Công khai</Label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-black">
                <Send className="mr-2 h-4 w-4" />
                {submitting ? 'Đang gửi...' : 'Gửi feedback'}
              </Button>
              <Link href="/performance/feedback">
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

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
    </div>
  )
}

export default function GiveFeedbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GiveFeedbackForm />
    </Suspense>
  )
}
