'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { JOB_TYPE, WORK_MODE } from '@/lib/recruitment/constants'
import type { JobPosting, JobRequisition } from '@/types/recruitment'
import { Loader2 } from 'lucide-react'

const jobPostingSchema = z.object({
  requisitionId: z.string().min(1, 'Vui lòng chọn yêu cầu tuyển dụng'),
  title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
  description: z.string().min(1, 'Vui lòng nhập mô tả'),
  requirements: z.string().min(1, 'Vui lòng nhập yêu cầu'),
  benefits: z.string().optional(),
  location: z.string().optional(),
  jobType: z.string().min(1, 'Vui lòng chọn loại công việc'),
  workMode: z.string().min(1, 'Vui lòng chọn hình thức'),
  salaryDisplay: z.string().optional(),
  isInternal: z.boolean(),
  isPublic: z.boolean(),
  expiresAt: z.string().optional(),
})

type JobPostingFormData = z.infer<typeof jobPostingSchema>

interface JobPostingFormProps {
  jobPosting?: JobPosting
  requisitions: JobRequisition[]
  onSubmit: (data: JobPostingFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function JobPostingForm({
  jobPosting,
  requisitions,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: JobPostingFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      requisitionId: jobPosting?.requisitionId || '',
      title: jobPosting?.title || '',
      description: jobPosting?.description || '',
      requirements: jobPosting?.requirements || '',
      benefits: jobPosting?.benefits || '',
      location: jobPosting?.location || '',
      jobType: jobPosting?.jobType || '',
      workMode: jobPosting?.workMode || '',
      salaryDisplay: jobPosting?.salaryDisplay || '',
      isInternal: jobPosting?.isInternal ?? false,
      isPublic: jobPosting?.isPublic ?? true,
      expiresAt: jobPosting?.expiresAt
        ? new Date(jobPosting.expiresAt).toISOString().split('T')[0]
        : '',
    },
  })

  const handleRequisitionChange = (requisitionId: string) => {
    setValue('requisitionId', requisitionId)
    const req = requisitions.find((r) => r.id === requisitionId)
    if (req && !jobPosting) {
      setValue('title', req.title)
      setValue('description', req.description || '')
      setValue('requirements', req.requirements || '')
      setValue('benefits', req.benefits || '')
      setValue('location', req.location || '')
      setValue('jobType', req.jobType)
      setValue('workMode', req.workMode)
      setValue('salaryDisplay', req.salaryDisplay || '')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tin tuyển dụng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Yêu cầu tuyển dụng *</Label>
            <Select
              value={watch('requisitionId')}
              onValueChange={handleRequisitionChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn yêu cầu tuyển dụng" />
              </SelectTrigger>
              <SelectContent>
                {requisitions.map((req) => (
                  <SelectItem key={req.id} value={req.id}>
                    {req.requisitionCode} - {req.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.requisitionId && (
              <p className="text-sm text-red-500">{errors.requisitionId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề tin tuyển dụng *</Label>
            <Input
              id="title"
              placeholder="VD: Tuyển Senior Frontend Developer"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Loại công việc *</Label>
              <Select
                value={watch('jobType')}
                onValueChange={(val) => setValue('jobType', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(JOB_TYPE).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.jobType && (
                <p className="text-sm text-red-500">{errors.jobType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Hình thức *</Label>
              <Select
                value={watch('workMode')}
                onValueChange={(val) => setValue('workMode', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hình thức" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WORK_MODE).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.workMode && (
                <p className="text-sm text-red-500">{errors.workMode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Địa điểm</Label>
              <Input
                id="location"
                placeholder="VD: TP.HCM"
                {...register('location')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryDisplay">Mức lương hiển thị</Label>
              <Input
                id="salaryDisplay"
                placeholder="VD: 20-35 triệu"
                {...register('salaryDisplay')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Ngày hết hạn</Label>
              <Input
                id="expiresAt"
                type="date"
                {...register('expiresAt')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nội dung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả công việc *</Label>
            <Textarea
              id="description"
              placeholder="Mô tả chi tiết công việc..."
              rows={6}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Yêu cầu *</Label>
            <Textarea
              id="requirements"
              placeholder="Yêu cầu ứng viên..."
              rows={6}
              {...register('requirements')}
            />
            {errors.requirements && (
              <p className="text-sm text-red-500">{errors.requirements.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Quyền lợi</Label>
            <Textarea
              id="benefits"
              placeholder="Quyền lợi khi làm việc..."
              rows={4}
              {...register('benefits')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cài đặt hiển thị</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublic"
              checked={watch('isPublic')}
              onCheckedChange={(checked) => setValue('isPublic', !!checked)}
            />
            <Label htmlFor="isPublic" className="cursor-pointer">
              Hiển thị trên trang tuyển dụng công khai
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isInternal"
              checked={watch('isInternal')}
              onCheckedChange={(checked) => setValue('isInternal', !!checked)}
            />
            <Label htmlFor="isInternal" className="cursor-pointer">
              Tin tuyển dụng nội bộ
            </Label>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {jobPosting ? 'Cập nhật' : 'Tạo tin tuyển dụng'}
        </Button>
      </div>
    </form>
  )
}
