'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RECOMMENDATION } from '@/lib/recruitment/constants'
import { Loader2, Star } from 'lucide-react'
import { useState } from 'react'

const evaluationSchema = z.object({
  technicalSkills: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  problemSolving: z.number().min(1).max(5),
  cultureFit: z.number().min(1).max(5),
  experience: z.number().min(1).max(5),
  overallRating: z.number().min(1).max(5),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  notes: z.string().optional(),
  recommendation: z.string().min(1, 'Vui lòng chọn đề xuất'),
})

type EvaluationFormData = z.infer<typeof evaluationSchema>

interface EvaluationFormProps {
  applicationId: string
  interviewId?: string
  candidateName: string
  onSubmit: (data: EvaluationFormData & { applicationId: string; interviewId?: string }) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

function RatingSlider({
  label,
  value,
  onChange,
  description,
}: {
  label: string
  value: number
  onChange: (val: number) => void
  description?: string
}) {
  const [hoverValue, setHoverValue] = useState(0)
  const ratingLabels = ['', 'Yếu', 'Trung bình', 'Khá', 'Tốt', 'Xuất sắc']

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-xs text-muted-foreground">
          {ratingLabels[hoverValue || value] || 'Chưa đánh giá'}
        </span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-0.5 transition-transform hover:scale-110"
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => onChange(star)}
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoverValue || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          {value > 0 ? `${value}/5` : ''}
        </span>
      </div>
    </div>
  )
}

export function EvaluationForm({
  applicationId,
  interviewId,
  candidateName,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: EvaluationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      technicalSkills: 0,
      communication: 0,
      problemSolving: 0,
      cultureFit: 0,
      experience: 0,
      overallRating: 0,
      strengths: '',
      weaknesses: '',
      notes: '',
      recommendation: '',
    },
  })

  const technicalSkills = watch('technicalSkills')
  const communication = watch('communication')
  const problemSolving = watch('problemSolving')
  const cultureFit = watch('cultureFit')
  const experience = watch('experience')
  const overallRating = watch('overallRating')

  const handleFormSubmit = async (data: EvaluationFormData) => {
    await onSubmit({ ...data, applicationId, interviewId })
  }

  const averageRating =
    technicalSkills + communication + problemSolving + cultureFit + experience > 0
      ? ((technicalSkills + communication + problemSolving + cultureFit + experience) / 5).toFixed(1)
      : '0'

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Đánh giá ứng viên</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ứng viên: <span className="font-medium">{candidateName}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RatingSlider
              label="Kỹ năng chuyên môn"
              value={technicalSkills}
              onChange={(val) => setValue('technicalSkills', val)}
              description="Kiến thức và kỹ năng kỹ thuật liên quan"
            />
            <RatingSlider
              label="Giao tiếp"
              value={communication}
              onChange={(val) => setValue('communication', val)}
              description="Khả năng truyền đạt và lắng nghe"
            />
            <RatingSlider
              label="Giải quyết vấn đề"
              value={problemSolving}
              onChange={(val) => setValue('problemSolving', val)}
              description="Tư duy logic và phân tích"
            />
            <RatingSlider
              label="Phù hợp văn hóa"
              value={cultureFit}
              onChange={(val) => setValue('cultureFit', val)}
              description="Phù hợp với giá trị và môi trường công ty"
            />
            <RatingSlider
              label="Kinh nghiệm"
              value={experience}
              onChange={(val) => setValue('experience', val)}
              description="Kinh nghiệm làm việc liên quan"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
            <div>
              <p className="text-sm font-medium">Điểm trung bình các tiêu chí</p>
              <p className="text-2xl font-bold text-primary">{averageRating}/5</p>
            </div>
            <div className="w-64">
              <RatingSlider
                label="Đánh giá tổng thể"
                value={overallRating}
                onChange={(val) => setValue('overallRating', val)}
              />
              {errors.overallRating && (
                <p className="text-sm text-red-500 mt-1">Vui lòng đánh giá tổng thể</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nhận xét</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strengths">Điểm mạnh</Label>
            <Textarea
              id="strengths"
              placeholder="Nhận xét về điểm mạnh của ứng viên..."
              rows={3}
              {...register('strengths')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weaknesses">Điểm yếu</Label>
            <Textarea
              id="weaknesses"
              placeholder="Nhận xét về điểm cần cải thiện..."
              rows={3}
              {...register('weaknesses')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú thêm</Label>
            <Textarea
              id="notes"
              placeholder="Các ghi chú khác..."
              rows={3}
              {...register('notes')}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Đề xuất *</Label>
            <Select
              value={watch('recommendation')}
              onValueChange={(val) => setValue('recommendation', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn đề xuất" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RECOMMENDATION).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.recommendation && (
              <p className="text-sm text-red-500">{errors.recommendation.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Gửi đánh giá
        </Button>
      </div>
    </form>
  )
}
