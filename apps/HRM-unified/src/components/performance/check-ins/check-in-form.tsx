'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { MoodSelector } from './mood-selector'
import type { CheckIn } from '@/types/performance'

interface CheckInFormData {
  accomplishments: string
  challenges: string
  priorities: string
  supportNeeded: string
  moodRating: number | undefined
}

interface CheckInFormProps {
  checkIn?: CheckIn
  onSubmit: (data: CheckInFormData) => void
  onCancel: () => void
}

export function CheckInForm({ checkIn, onSubmit, onCancel }: CheckInFormProps) {
  const [formData, setFormData] = useState<CheckInFormData>({
    accomplishments: checkIn?.accomplishments || '',
    challenges: checkIn?.challenges || '',
    priorities: checkIn?.priorities || '',
    supportNeeded: checkIn?.supportNeeded || '',
    moodRating: checkIn?.moodRating,
  })

  const updateField = <K extends keyof CheckInFormData>(
    key: K,
    value: CheckInFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">
            Tâm trạng hôm nay
          </Label>
          <div className="mt-2">
            <MoodSelector
              value={formData.moodRating}
              onChange={(v) => updateField('moodRating', v)}
            />
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-xs text-muted-foreground">
            Thành tựu tuần này
          </Label>
          <Textarea
            value={formData.accomplishments}
            onChange={(e) => updateField('accomplishments', e.target.value)}
            placeholder="Những việc đã hoàn thành tốt..."
            rows={3}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">
            Khó khăn / Thử thách
          </Label>
          <Textarea
            value={formData.challenges}
            onChange={(e) => updateField('challenges', e.target.value)}
            placeholder="Những khó khăn đang gặp phải..."
            rows={3}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">
            Ưu tiên tuần tới
          </Label>
          <Textarea
            value={formData.priorities}
            onChange={(e) => updateField('priorities', e.target.value)}
            placeholder="Những việc cần tập trung tuần tới..."
            rows={3}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">
            Hỗ trợ cần thiết
          </Label>
          <Textarea
            value={formData.supportNeeded}
            onChange={(e) => updateField('supportNeeded', e.target.value)}
            placeholder="Cần hỗ trợ gì từ quản lý/team..."
            rows={3}
            className="mt-1"
          />
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit">
          {checkIn ? 'Cập nhật' : 'Gửi Check-in'}
        </Button>
      </div>
    </form>
  )
}
