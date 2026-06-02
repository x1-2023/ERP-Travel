'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage } from '@/components/shared/loading-spinner'
import { JOB_TYPE, WORK_MODE } from '@/lib/recruitment/constants'

interface JobPostingFormData {
  title: string
  department: string
  jobType: string
  workMode: string
  location: string
  description: string
  requirements: string
  benefits: string
  salaryMin: string
  salaryMax: string
  showSalary: boolean
  closingDate: string
}

export default function EditJobPostingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<JobPostingFormData>({
    title: '',
    department: '',
    jobType: 'FULL_TIME',
    workMode: 'ONSITE',
    location: '',
    description: '',
    requirements: '',
    benefits: '',
    salaryMin: '',
    salaryMax: '',
    showSalary: true,
    closingDate: '',
  })

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/recruitment/jobs/${id}`)
        if (!res.ok) throw new Error('Không thể tải thông tin tin tuyển dụng')
        const json = await res.json()
        const job = json.data ?? json
        setFormData({
          title: job.title || '',
          department: job.department || '',
          jobType: job.jobType || 'FULL_TIME',
          workMode: job.workMode || 'ONSITE',
          location: job.location || '',
          description: job.description || '',
          requirements: job.requirements || '',
          benefits: job.benefits || '',
          salaryMin: job.salaryMin?.toString() || '',
          salaryMax: job.salaryMax?.toString() || '',
          showSalary: job.showSalary ?? true,
          closingDate: job.closingDate ? job.closingDate.split('T')[0] : '',
        })
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchJob()
  }, [id])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/recruitment/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        }),
      })
      if (!res.ok) throw new Error('Không thể cập nhật tin tuyển dụng')
      router.push(`/recruitment/jobs/${id}`)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingPage />

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chỉnh sửa tin tuyển dụng" />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chỉnh sửa tin tuyển dụng"
        description={formData.title}
      >
        <Link href={`/recruitment/jobs/${id}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Phòng ban</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Loại hình</Label>
                <Select
                  value={formData.jobType}
                  onValueChange={(v) => handleChange('jobType', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(JOB_TYPE).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hình thức</Label>
                <Select
                  value={formData.workMode}
                  onValueChange={(v) => handleChange('workMode', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WORK_MODE).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Lương tối thiểu</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => handleChange('salaryMin', e.target.value)}
                  placeholder="VND"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Lương tối đa</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => handleChange('salaryMax', e.target.value)}
                  placeholder="VND"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closingDate">Hạn nộp hồ sơ</Label>
                <Input
                  id="closingDate"
                  type="date"
                  value={formData.closingDate}
                  onChange={(e) => handleChange('closingDate', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showSalary"
                checked={formData.showSalary}
                onCheckedChange={(checked) => handleChange('showSalary', !!checked)}
              />
              <Label htmlFor="showSalary" className="text-sm">
                Hiển thị mức lương trên tin tuyển dụng
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nội dung chi tiết</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả công việc *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Yêu cầu ứng viên</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleChange('requirements', e.target.value)}
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="benefits">Quyền lợi</Label>
              <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) => handleChange('benefits', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/recruitment/jobs/${id}`}>
            <Button type="button" variant="outline">Hủy</Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </div>
  )
}
