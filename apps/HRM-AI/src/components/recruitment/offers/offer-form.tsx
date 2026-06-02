'use client'

import { useForm, useFieldArray } from 'react-hook-form'
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
import { JOB_TYPE, WORK_MODE } from '@/lib/recruitment/constants'
import { Loader2, Plus, Trash2 } from 'lucide-react'

const offerSchema = z.object({
  position: z.string().min(1, 'Vui lòng nhập vị trí'),
  departmentId: z.string().min(1, 'Vui lòng chọn phòng ban'),
  reportingToId: z.string().optional(),
  jobType: z.string().min(1, 'Vui lòng chọn loại công việc'),
  workMode: z.string().min(1, 'Vui lòng chọn hình thức'),
  location: z.string().optional(),
  baseSalary: z.coerce.number().min(1, 'Vui lòng nhập mức lương'),
  allowances: z.array(
    z.object({
      name: z.string().min(1, 'Nhập tên phụ cấp'),
      amount: z.coerce.number().min(0),
    })
  ),
  bonus: z.string().optional(),
  benefits: z.string().optional(),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  probationMonths: z.coerce.number().min(0).max(6),
  expiresAt: z.string().min(1, 'Vui lòng chọn hạn phản hồi'),
})

type OfferFormData = z.infer<typeof offerSchema>

interface Department {
  id: string
  name: string
}

interface Employee {
  id: string
  fullName: string
}

interface OfferFormProps {
  applicationId: string
  candidateName: string
  defaultPosition?: string
  departments: Department[]
  employees: Employee[]
  onSubmit: (data: OfferFormData & { applicationId: string }) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function OfferForm({
  applicationId,
  candidateName,
  defaultPosition = '',
  departments,
  employees,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: OfferFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema) as never,
    defaultValues: {
      position: defaultPosition,
      departmentId: '',
      reportingToId: '',
      jobType: 'FULL_TIME',
      workMode: 'ONSITE',
      location: '',
      baseSalary: 0,
      allowances: [],
      bonus: '',
      benefits: '',
      startDate: '',
      probationMonths: 2,
      expiresAt: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'allowances',
  })

  const baseSalary = watch('baseSalary') || 0
  const allowances = watch('allowances') || []
  const totalCompensation =
    baseSalary + allowances.reduce((sum, a) => sum + (a.amount || 0), 0)

  const handleFormSubmit = async (data: OfferFormData) => {
    await onSubmit({ ...data, applicationId })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tạo Offer</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ứng viên: <span className="font-medium">{candidateName}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position">Vị trí *</Label>
            <Input
              id="position"
              placeholder="VD: Senior Frontend Developer"
              {...register('position')}
            />
            {errors.position && (
              <p className="text-sm text-red-500">{errors.position.message}</p>
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(JOB_TYPE).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hình thức *</Label>
              <Select
                value={watch('workMode')}
                onValueChange={(val) => setValue('workMode', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WORK_MODE).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thù lao</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseSalary">Lương cơ bản (VND/tháng) *</Label>
            <Input
              id="baseSalary"
              type="number"
              placeholder="VD: 25000000"
              {...register('baseSalary')}
            />
            {errors.baseSalary && (
              <p className="text-sm text-red-500">{errors.baseSalary.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Phụ cấp</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: '', amount: 0 })}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Thêm phụ cấp
              </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-start">
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="Tên phụ cấp (VD: Ăn trưa)"
                    {...register(`allowances.${index}.name`)}
                  />
                  {errors.allowances?.[index]?.name && (
                    <p className="text-xs text-red-500">
                      {errors.allowances[index]?.name?.message}
                    </p>
                  )}
                </div>
                <div className="w-40 space-y-1">
                  <Input
                    type="number"
                    placeholder="Số tiền"
                    {...register(`allowances.${index}.amount`)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 mt-0.5"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span>Tổng thu nhập hàng tháng:</span>
              <span className="font-bold text-primary">
                {new Intl.NumberFormat('vi-VN').format(totalCompensation)} VND
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bonus">Thưởng</Label>
            <Textarea
              id="bonus"
              placeholder="VD: Thưởng tháng 13, thưởng KPI..."
              rows={2}
              {...register('bonus')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Quyền lợi khác</Label>
            <Textarea
              id="benefits"
              placeholder="VD: Bảo hiểm sức khỏe, đào tạo..."
              rows={3}
              {...register('benefits')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thời gian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Ngày bắt đầu *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="probationMonths">Thử việc (tháng)</Label>
              <Select
                value={String(watch('probationMonths'))}
                onValueChange={(val) => setValue('probationMonths', Number(val))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Không thử việc</SelectItem>
                  <SelectItem value="1">1 tháng</SelectItem>
                  <SelectItem value="2">2 tháng</SelectItem>
                  <SelectItem value="3">3 tháng</SelectItem>
                  <SelectItem value="6">6 tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Hạn phản hồi *</Label>
              <Input
                id="expiresAt"
                type="date"
                {...register('expiresAt')}
              />
              {errors.expiresAt && (
                <p className="text-sm text-red-500">{errors.expiresAt.message}</p>
              )}
            </div>
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
          Tạo Offer
        </Button>
      </div>
    </form>
  )
}
