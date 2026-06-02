'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { StarRating } from '../ratings/star-rating'

interface FeedbackFormData {
  overallRating: number
  strengths: string
  areasForImprovement: string
  comments: string
  isAnonymous: boolean
}

interface FeedbackFormProps {
  subjectName: string
  feedbackType: string
  questions?: string[]
  onSubmit: (data: FeedbackFormData) => void
  onCancel: () => void
}

export function FeedbackForm({
  subjectName,
  feedbackType,
  questions,
  onSubmit,
  onCancel,
}: FeedbackFormProps) {
  const [formData, setFormData] = useState<FeedbackFormData>({
    overallRating: 0,
    strengths: '',
    areasForImprovement: '',
    comments: '',
    isAnonymous: false,
  })

  const updateField = <K extends keyof FeedbackFormData>(
    key: K,
    value: FeedbackFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Phản hồi cho: <span className="text-foreground font-medium">{subjectName}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Loại: {feedbackType}
        </p>
      </div>

      <Separator />

      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Đánh giá tổng thể</Label>
          <div className="mt-1.5">
            <StarRating
              value={formData.overallRating}
              onChange={(v) => updateField('overallRating', v)}
              size="lg"
              showLabel
            />
          </div>
        </div>

        {questions && questions.length > 0 && (
          <div className="space-y-2 p-3 rounded-sm border bg-muted/30">
            <Label className="text-xs text-muted-foreground">Câu hỏi gợi ý:</Label>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
              {questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <Label className="text-xs text-muted-foreground">Điểm mạnh</Label>
          <Textarea
            value={formData.strengths}
            onChange={(e) => updateField('strengths', e.target.value)}
            placeholder="Mô tả các điểm mạnh nổi bật..."
            rows={3}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Cần cải thiện</Label>
          <Textarea
            value={formData.areasForImprovement}
            onChange={(e) => updateField('areasForImprovement', e.target.value)}
            placeholder="Những lĩnh vực cần phát triển thêm..."
            rows={3}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Nhận xét thêm</Label>
          <Textarea
            value={formData.comments}
            onChange={(e) => updateField('comments', e.target.value)}
            placeholder="Nhận xét hoặc góp ý bổ sung..."
            rows={3}
            className="mt-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isAnonymous"
            checked={formData.isAnonymous}
            onChange={(e) => updateField('isAnonymous', e.target.checked)}
            className="rounded-sm border-border"
          />
          <Label htmlFor="isAnonymous" className="text-sm cursor-pointer">
            Gửi phản hồi ẩn danh
          </Label>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" disabled={formData.overallRating === 0}>
          Gửi phản hồi
        </Button>
      </div>
    </form>
  )
}
