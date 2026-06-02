'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage } from '@/components/shared/loading-spinner'
import { APPLICATION_STATUS, APPLICATION_SOURCE } from '@/lib/recruitment/constants'

interface CandidateDetail {
  id: string
  fullName: string
  email: string
  phone: string
  location: string
  source: string
  cvUrl: string | null
  skills: string[]
  summary: string
  education: {
    school: string
    degree: string
    field: string
    startYear: number
    endYear: number | null
  }[]
  workHistory: {
    company: string
    position: string
    startDate: string
    endDate: string | null
    description: string
  }[]
  applications: {
    id: string
    position: string
    status: string
    appliedAt: string
  }[]
  createdAt: string
}

export default function CandidateDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCandidate() {
      try {
        const res = await fetch(`/api/recruitment/candidates/${id}`)
        if (!res.ok) throw new Error('Không thể tải thông tin ứng viên')
        const json = await res.json()
        setCandidate(json.data ?? json)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchCandidate()
  }, [id])

  const getStatusBadge = (status: string) => {
    const info = APPLICATION_STATUS[status]
    if (!info) return <Badge variant="secondary">{status}</Badge>
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      purple: 'bg-purple-100 text-purple-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      green: 'bg-green-100 text-green-800',
      emerald: 'bg-emerald-100 text-emerald-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800',
    }
    return <Badge className={colorMap[info.color] || ''}>{info.label}</Badge>
  }

  if (loading) return <LoadingPage />

  if (error || !candidate) {
    return (
      <div className="space-y-6">
        <PageHeader title="Hồ sơ ứng viên" />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error || 'Không tìm thấy ứng viên'}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title={candidate.fullName}>
        <Link href="/recruitment/candidates">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          {candidate.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Giới thiệu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{candidate.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Kỹ năng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Kinh nghiệm làm việc
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.workHistory && candidate.workHistory.length > 0 ? (
                <div className="space-y-4">
                  {candidate.workHistory.map((work, idx) => (
                    <div key={idx} className="border-l-2 border-primary/20 pl-4">
                      <h4 className="font-medium">{work.position}</h4>
                      <p className="text-sm text-muted-foreground">{work.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(work.startDate).toLocaleDateString('vi-VN')} -{' '}
                        {work.endDate
                          ? new Date(work.endDate).toLocaleDateString('vi-VN')
                          : 'Hiện tại'}
                      </p>
                      {work.description && (
                        <p className="mt-1 text-sm">{work.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Chưa có thông tin kinh nghiệm
                </p>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Học vấn
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.education && candidate.education.length > 0 ? (
                <div className="space-y-4">
                  {candidate.education.map((edu, idx) => (
                    <div key={idx} className="border-l-2 border-primary/20 pl-4">
                      <h4 className="font-medium">{edu.school}</h4>
                      <p className="text-sm text-muted-foreground">
                        {edu.degree} - {edu.field}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {edu.startYear} - {edu.endYear || 'Hiện tại'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Chưa có thông tin học vấn
                </p>
              )}
            </CardContent>
          </Card>

          {/* Application History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Lịch sử ứng tuyển
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.applications && candidate.applications.length > 0 ? (
                <div className="space-y-2">
                  {candidate.applications.map((app) => (
                    <Link
                      key={app.id}
                      href={`/recruitment/applications/${app.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium">{app.position}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      {getStatusBadge(app.status)}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Chưa có hồ sơ ứng tuyển
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${candidate.email}`} className="hover:underline">
                  {candidate.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.phone}</span>
              </div>
              {candidate.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.location}</span>
                </div>
              )}
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Nguồn</p>
                <Badge variant="secondary" className="mt-1">
                  {APPLICATION_SOURCE[candidate.source]?.label || candidate.source}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày tạo hồ sơ</p>
                <p className="text-sm font-medium">
                  {new Date(candidate.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              {candidate.cvUrl && (
                <>
                  <Separator />
                  <a
                    href={candidate.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Xem CV
                    </Button>
                  </a>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
