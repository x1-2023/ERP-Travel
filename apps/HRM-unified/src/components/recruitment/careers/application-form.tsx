'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload } from 'lucide-react'
import { useState } from 'react'

const applicationSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(1, 'Vui lòng nhập số điện thoại'),
  cvUrl: z.string().optional(),
  coverLetter: z.string().optional(),
  expectedSalary: z.coerce.number().optional(),
  yearsOfExperience: z.coerce.number().min(0).optional(),
  linkedinUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

interface ApplicationFormProps {
  jobTitle: string
  jobPostingId: string
  onSubmit: (data: ApplicationFormData & { jobPostingId: string }) => Promise<void>
  isSubmitting?: boolean
}

export function ApplicationForm({
  jobTitle,
  jobPostingId,
  onSubmit,
  isSubmitting = false,
}: ApplicationFormProps) {
  const [cvFile, setCvFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema) as never,
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      cvUrl: '',
      coverLetter: '',
      expectedSalary: undefined,
      yearsOfExperience: undefined,
      linkedinUrl: '',
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCvFile(file)
      // In a real app, you would upload the file and get a URL
      setValue('cvUrl', file.name)
    }
  }

  const handleFormSubmit = async (data: ApplicationFormData) => {
    await onSubmit({ ...data, jobPostingId })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ứng tuyển</CardTitle>
          <p className="text-sm text-muted-foreground">
            Vị trí: <span className="font-medium text-foreground">{jobTitle}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                placeholder="0912 345 678"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn</Label>
              <Input
                id="linkedinUrl"
                placeholder="https://linkedin.com/in/..."
                {...register('linkedinUrl')}
              />
              {errors.linkedinUrl && (
                <p className="text-sm text-red-500">{errors.linkedinUrl.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Số năm kinh nghiệm</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                min={0}
                placeholder="VD: 3"
                {...register('yearsOfExperience')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedSalary">Mức lương mong muốn (VND)</Label>
              <Input
                id="expectedSalary"
                type="number"
                placeholder="VD: 25000000"
                {...register('expectedSalary')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>CV / Hồ sơ</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <input
                type="file"
                id="cv-upload"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <label htmlFor="cv-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                {cvFile ? (
                  <div>
                    <p className="text-sm font-medium text-primary">{cvFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click để đổi file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Click để tải lên CV (PDF, DOC, DOCX)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Kích thước tối đa: 5MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter">Thư giới thiệu</Label>
            <Textarea
              id="coverLetter"
              placeholder="Viết đôi dòng giới thiệu về bản thân và lý do ứng tuyển..."
              rows={5}
              {...register('coverLetter')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Gửi hồ sơ ứng tuyển
        </Button>
      </div>
    </form>
  )
}
