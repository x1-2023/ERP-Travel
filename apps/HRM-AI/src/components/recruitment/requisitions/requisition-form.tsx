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
import { Separator } from '@/components/ui/separator'
import { JOB_TYPE, WORK_MODE, PRIORITY } from '@/lib/recruitment/constants'
import type { JobRequisition } from '@/types/recruitment'
import { Loader2 } from 'lucide-react'

const requisitionSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
  departmentId: z.string().min(1, 'Vui lòng chọn phòng ban'),
  reportingToId: z.string().optional(),
  jobType: z.string().min(1, 'Vui lòng chọn loại công việc'),
  workMode: z.string().min(1, 'Vui lòng chọn hình thức làm việc'),
  location: z.string().optional(),
  headcount: z.coerce.number().min(1, 'Số lượng tối thiểu là 1'),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  salaryDisplay: z.string().optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  priority: z.string().min(1, 'Vui lòng chọn mức ưu tiên'),
  targetHireDate: z.string().optional(),
})

type RequisitionFormData = z.infer<typeof requisitionSchema>

interface Department {
  id: string
  name: string
}

interface Employee {
  id: string
  fullName: string
}

interface RequisitionFormProps {
  requisition?: JobRequisition
  departments: Department[]
  employees: Employee[]
  onSubmit: (data: RequisitionFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function RequisitionForm({
  requisition,
  departments,
  employees,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: RequisitionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RequisitionFormData>({
    resolver: zodResolver(requisitionSchema) as never,
    defaultValues: {
      title: requisition?.title || '',
      departmentId: requisition?.departmentId || '',
      reportingToId: requisition?.reportingToId || '',
      jobType: requisition?.jobType || '',
      workMode: requisition?.workMode || '',
      location: requisition?.location || '',
      headcount: requisition?.headcount || 1,
      salaryMin: requisition?.salaryMin || undefined,
      salaryMax: requisition?.salaryMax || undefined,
      salaryDisplay: requisition?.salaryDisplay || '',
      description: requisition?.description || '',
      requirements: requisition?.requirements || '',
      benefits: requisition?.benefits || '',
      priority: requisition?.priority || 'NORMAL',
      targetHireDate: requisition?.targetHireDate
        ? new Date(requisition.targetHireDate).toISOString().split('T')[0]
        : '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề vị trí *</Label>
            <Input
              id="title"
              placeholder="VD: Senior Frontend Developer"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phòng ban *</Label>
              <Select
                value={watch('departmentId')}
                onValueChange={(val) => setValue('departmentId', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departmentId && (
                <p className="text-sm text-red-500">{errors.departmentId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Báo cáo cho</Label>
              <Select
                value={watch('reportingToId') || ''}
                onValueChange={(val) => setValue('reportingToId', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn quản lý" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Label>Hình thức làm việc *</Label>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="headcount">Số lượng tuyển *</Label>
              <Input
                id="headcount"
                type="number"
                min={1}
                {...register('headcount')}
              />
              {errors.headcount && (
                <p className="text-sm text-red-500">{errors.headcount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Mức ưu tiên *</Label>
              <Select
                value={watch('priority')}
                onValueChange={(val) => setValue('priority', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mức ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500">{errors.priority.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetHireDate">Ngày dự kiến tuyển</Label>
              <Input
                id="targetHireDate"
                type="date"
                {...register('targetHireDate')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lương</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Lương tối thiểu (VND)</Label>
              <Input
                id="salaryMin"
                type="number"
                placeholder="VD: 20000000"
                {...register('salaryMin')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Lương tối đa (VND)</Label>
              <Input
                id="salaryMax"
                type="number"
                placeholder="VD: 35000000"
                {...register('salaryMax')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryDisplay">Hiển thị lương</Label>
              <Input
                id="salaryDisplay"
                placeholder="VD: 20-35 triệu"
                {...register('salaryDisplay')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mô tả công việc</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả chi tiết về vị trí công việc..."
              rows={5}
              {...register('description')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirements">Yêu cầu</Label>
            <Textarea
              id="requirements"
              placeholder="Các yêu cầu cho ứng viên..."
              rows={5}
              {...register('requirements')}
            />
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

      <Separator />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {requisition ? 'Cập nhật' : 'Tạo yêu cầu tuyển dụng'}
        </Button>
      </div>
    </form>
  )
}
