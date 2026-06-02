'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Checkbox } from '@/components/ui/checkbox'
import { INTERVIEW_TYPE } from '@/lib/recruitment/constants'
import { Loader2, X } from 'lucide-react'

const interviewSchema = z.object({
  interviewType: z.string().min(1, 'Vui lòng chọn loại phỏng vấn'),
  scheduledDate: z.string().min(1, 'Vui lòng chọn ngày'),
  scheduledTime: z.string().min(1, 'Vui lòng chọn giờ'),
  duration: z.coerce.number().min(15, 'Thời lượng tối thiểu 15 phút'),
  location: z.string().optional(),
  notes: z.string().optional(),
  interviewerIds: z.array(z.string()).min(1, 'Cần ít nhất 1 người phỏng vấn'),
})

type InterviewFormData = z.infer<typeof interviewSchema>

interface Interviewer {
  id: string
  fullName: string
  position?: string
}

interface InterviewSchedulerProps {
  applicationId: string
  candidateName: string
  round?: number
  interviewers: Interviewer[]
  onSubmit: (data: InterviewFormData & { applicationId: string; round: number }) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function InterviewScheduler({
  applicationId,
  candidateName,
  round = 1,
  interviewers,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: InterviewSchedulerProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema) as never,
    defaultValues: {
      interviewType: '',
      scheduledDate: '',
      scheduledTime: '',
      duration: 60,
      location: '',
      notes: '',
      interviewerIds: [],
    },
  })

  const selectedInterviewerIds = watch('interviewerIds')

  const toggleInterviewer = (interviewerId: string) => {
    const current = selectedInterviewerIds || []
    if (current.includes(interviewerId)) {
      setValue(
        'interviewerIds',
        current.filter((id) => id !== interviewerId)
      )
    } else {
      setValue('interviewerIds', [...current, interviewerId])
    }
  }

  const handleFormSubmit = async (data: InterviewFormData) => {
    await onSubmit({ ...data, applicationId, round })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Lên lịch phỏng vấn - Vòng {round}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ứng viên: <span className="font-medium">{candidateName}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Loại phỏng vấn *</Label>
            <Select
              value={watch('interviewType')}
              onValueChange={(val) => setValue('interviewType', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại phỏng vấn" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INTERVIEW_TYPE).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.interviewType && (
              <p className="text-sm text-red-500">{errors.interviewType.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Ngày *</Label>
              <Input
                id="scheduledDate"
                type="date"
                {...register('scheduledDate')}
              />
              {errors.scheduledDate && (
                <p className="text-sm text-red-500">{errors.scheduledDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Giờ *</Label>
              <Input
                id="scheduledTime"
                type="time"
                {...register('scheduledTime')}
              />
              {errors.scheduledTime && (
                <p className="text-sm text-red-500">{errors.scheduledTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Thời lượng (phút) *</Label>
              <Select
                value={String(watch('duration'))}
                onValueChange={(val) => setValue('duration', Number(val))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 phút</SelectItem>
                  <SelectItem value="30">30 phút</SelectItem>
                  <SelectItem value="45">45 phút</SelectItem>
                  <SelectItem value="60">60 phút</SelectItem>
                  <SelectItem value="90">90 phút</SelectItem>
                  <SelectItem value="120">120 phút</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Địa điểm / Link meeting</Label>
            <Input
              id="location"
              placeholder="VD: Phòng họp A hoặc link Google Meet"
              {...register('location')}
            />
          </div>

          <div className="space-y-2">
            <Label>Người phỏng vấn *</Label>
            <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
              {interviewers.map((interviewer) => (
                <div
                  key={interviewer.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`interviewer-${interviewer.id}`}
                    checked={selectedInterviewerIds?.includes(interviewer.id)}
                    onCheckedChange={() => toggleInterviewer(interviewer.id)}
                  />
                  <Label
                    htmlFor={`interviewer-${interviewer.id}`}
                    className="cursor-pointer flex-1"
                  >
                    <span className="font-medium">{interviewer.fullName}</span>
                    {interviewer.position && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        ({interviewer.position})
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
            {errors.interviewerIds && (
              <p className="text-sm text-red-500">{errors.interviewerIds.message}</p>
            )}
            {selectedInterviewerIds?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedInterviewerIds.map((id) => {
                  const interviewer = interviewers.find((i) => i.id === id)
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded"
                    >
                      {interviewer?.fullName}
                      <button
                        type="button"
                        onClick={() => toggleInterviewer(id)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              placeholder="Ghi chú cho buổi phỏng vấn..."
              rows={3}
              {...register('notes')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lên lịch phỏng vấn
        </Button>
      </div>
    </form>
  )
}
