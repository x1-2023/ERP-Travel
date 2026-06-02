'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Pencil,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  Tag,
  ExternalLink,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

import { useTranslation } from '@/i18n'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ContactTimeline } from '@/components/contacts/ContactTimeline'
import { useCompany } from '@/hooks/use-companies'
import { useActivities } from '@/hooks/use-activities'
import {
  COMPANY_SIZES,
  CONTACT_STATUSES,
  formatCurrency,
} from '@/lib/constants'
import { DEFAULT_STAGES } from '@/lib/constants'
import { DocumentPanel } from '@/components/documents/DocumentPanel'
import { CompliancePanel } from '@/components/compliance/CompliancePanel'

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslation()
  const id = params.id as string

  const { data: company, isLoading } = useCompany(id)
  const { data: activitiesData } = useActivities({ companyId: id, limit: 20 })

  const activities = activitiesData?.data ?? []
  const sizeInfo = COMPANY_SIZES.find((s) => s.value === company?.size)
  const sizeLabel = sizeInfo ? t(sizeInfo.labelKey) : undefined

  if (isLoading) {
    return (
      <PageShell title="">
        <div className="space-y-3">
          <Skeleton className="h-28 w-full bg-[var(--crm-bg-subtle)]" />
          <Skeleton className="h-64 w-full bg-[var(--crm-bg-subtle)]" />
        </div>
      </PageShell>
    )
  }

  if (!company) {
    return (
      <PageShell title={t('common.notFound')}>
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-sm text-[var(--crm-text-muted)]">{t('companies.notFound')}</p>
          <Button
            variant="outline"
            className="mt-4 border-[var(--crm-border)] text-[var(--crm-text-secondary)]"
            onClick={() => router.push('/companies')}
          >
            {t('common.back')}
          </Button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title=""
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
            onClick={() => router.push('/companies')}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
          <Button
            size="sm"
            className="bg-[#10B981] text-white hover:bg-[#059669]"
          >
            <Pencil className="h-4 w-4" />
            Chỉnh sửa
          </Button>
        </div>
      }
    >
      {/* Header */}
      <Card className="border-[var(--crm-border)] bg-[var(--crm-bg-card)]">
        <CardContent className="flex items-center gap-5 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#10B981]/10">
            <Building2 className="h-7 w-7 text-[#10B981]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[var(--crm-text-primary)]">
                {company.name}
              </h2>
              {company.industry && (
                <Badge
                  variant="secondary"
                  className="bg-[var(--crm-border)] text-[var(--crm-text-secondary)] border-0 text-xs"
                >
                  {company.industry}
                </Badge>
              )}
              {sizeLabel && (
                <Badge
                  variant="secondary"
                  className="bg-[#10B981]/10 text-[#10B981] border-0 text-xs"
                >
                  {sizeLabel}
                </Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-[var(--crm-text-secondary)]">
              {company.website && (
                <a
                  href={
                    company.website.startsWith('http')
                      ? company.website
                      : `https://${company.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#10B981] hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {company.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {/* Tags */}
            {company.tags && company.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {company.tags.map(({ tag }) => (
                  <Badge
                    key={tag.id}
                    className="border-0 text-[10px]"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    <Tag className="mr-1 h-2.5 w-2.5" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-[var(--crm-border)] bg-[var(--crm-bg-card)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-[var(--crm-text-secondary)]">
            Thông tin công ty
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <InfoItem icon={Phone} label="Điện thoại" value={company.phone} />
          <InfoItem icon={Mail} label={t('common.email')} value={company.email} />
          <InfoItem icon={MapPin} label="Địa chỉ" value={company.address} />
          <InfoItem icon={MapPin} label="Thành phố" value={company.city} />
          <InfoItem icon={MapPin} label="Tỉnh" value={company.province} />
          <InfoItem icon={FileText} label={t('companies.taxCode')} value={company.taxCode} />
        </CardContent>
      </Card>

      {/* Company Hierarchy */}
      {(company.parent || (company.children && company.children.length > 0)) && (
        <Card className="border-[var(--crm-border)] bg-[var(--crm-bg-card)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[var(--crm-text-secondary)]">
              {t('companies.parentCompany')} / {t('companies.subsidiaries')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {company.parent && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--crm-text-muted)]">{t('companies.parentCompany')}:</span>
                <Link
                  href={`/companies/${company.parent.id}`}
                  className="text-sm text-[#10B981] hover:underline"
                >
                  {company.parent.name}
                </Link>
              </div>
            )}
            {company.children && company.children.length > 0 && (
              <div>
                <span className="text-xs text-[var(--crm-text-muted)]">{t('companies.subsidiaries')}:</span>
                <div className="mt-1 space-y-1">
                  {company.children.map((child: any) => (
                    <Link
                      key={child.id}
                      href={`/companies/${child.id}`}
                      className="flex items-center gap-2 text-sm text-[var(--crm-text-primary)] hover:text-[#10B981] transition-colors"
                    >
                      <Building2 className="w-3 h-3 text-[var(--crm-text-muted)]" />
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Compliance & Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CompliancePanel
          entityType="COMPANY"
          entityId={id}
          entityName={company.name}
          country={company.country || 'VN'}
          complianceStatus={company.sanctionsStatus}
        />
        <DocumentPanel entityType="company" entityId={id} />
      </div>

      {/* Tabs: Contacts, Deals, Activities */}
      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList className="bg-[var(--crm-bg-card)] border border-[var(--crm-border)]">
          <TabsTrigger
            value="contacts"
            className="text-[var(--crm-text-secondary)] data-[state=active]:bg-[#10B981]/10 data-[state=active]:text-[#10B981]"
          >
            Liên hệ ({company.contacts?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="deals"
            className="text-[var(--crm-text-secondary)] data-[state=active]:bg-[#10B981]/10 data-[state=active]:text-[#10B981]"
          >
            Deal ({company.deals?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="activities"
            className="text-[var(--crm-text-secondary)] data-[state=active]:bg-[#10B981]/10 data-[state=active]:text-[#10B981]"
          >
            Hoạt động
          </TabsTrigger>
        </TabsList>

        {/* Contacts tab */}
        <TabsContent value="contacts">
          <Card className="border-[var(--crm-border)] bg-[var(--crm-bg-card)] overflow-hidden">
            {company.contacts && company.contacts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--crm-border)] hover:bg-transparent">
                    <TableHead className="text-[var(--crm-text-muted)] text-xs">Tên</TableHead>
                    <TableHead className="text-[var(--crm-text-muted)] text-xs">Email</TableHead>
                    <TableHead className="text-[var(--crm-text-muted)] text-xs">Điện thoại</TableHead>
                    <TableHead className="text-[var(--crm-text-muted)] text-xs">{t('common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {company.contacts.map((contact) => {
                    const st = CONTACT_STATUSES.find(
                      (s) => s.value === contact.status
                    )
                    const initials = `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`.toUpperCase()
                    return (
                      <TableRow
                        key={contact.id}
                        className="border-[var(--crm-border)] cursor-pointer hover:bg-white/[0.02]"
                        onClick={() => router.push(`/contacts/${contact.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-[#10B981]/20 text-[#10B981] text-[10px]">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-[var(--crm-text-primary)]">
                              {contact.firstName} {contact.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-[var(--crm-text-secondary)]">
                          {contact.email ?? '-'}
                        </TableCell>
                        <TableCell className="text-sm text-[var(--crm-text-secondary)]">
                          {contact.phone ?? '-'}
                        </TableCell>
                        <TableCell>
                          {st && (
                            <Badge
                              className="border-0 text-[10px]"
                              style={{
                                backgroundColor: `${st.color}20`,
                                color: st.color,
                              }}
                            >
                              {t(st.labelKey)}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-[var(--crm-text-muted)]">{t('companies.noContacts')}</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Deals tab */}
        <TabsContent value="deals">
          <Card className="border-[var(--crm-border)] bg-[var(--crm-bg-card)] overflow-hidden">
            {company.deals && company.deals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--crm-border)] hover:bg-transparent">
                    <TableHead className="text-[var(--crm-text-muted)] text-xs">Tên deal</TableHead>
                    <TableHead className="text-[var(--crm-text-muted)] text-xs">{t('common.value')}</TableHead>
                    <TableHead className="text-[var(--crm-text-muted)] text-xs">{t('pipeline.stage')}</TableHead>
                    <TableHead className="text-[var(--crm-text-muted)] text-xs">{t('quotes.createdDate')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {company.deals.map((deal) => {
                    const stageMeta = DEFAULT_STAGES.find(
                      (s) => s.name === (deal as any).stage?.name
                    )
                    return (
                      <TableRow
                        key={deal.id}
                        className="border-[var(--crm-border)] cursor-pointer hover:bg-white/[0.02]"
                        onClick={() => router.push(`/pipeline?deal=${deal.id}`)}
                      >
                        <TableCell className="text-sm font-medium text-[var(--crm-text-primary)]">
                          {deal.title}
                        </TableCell>
                        <TableCell className="text-sm text-[var(--crm-text-secondary)]">
                          {formatCurrency(Number(deal.value))}
                        </TableCell>
                        <TableCell>
                          {stageMeta ? (
                            <Badge
                              className="border-0 text-[10px]"
                              style={{
                                backgroundColor: `${stageMeta.color}20`,
                                color: stageMeta.color,
                              }}
                            >
                              {stageMeta.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-[var(--crm-text-muted)]">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-[var(--crm-text-secondary)]">
                          {formatDistanceToNow(new Date(deal.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-[var(--crm-text-muted)]">{t('companies.noDeals')}</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Activities tab */}
        <TabsContent value="activities">
          <Card className="border-[var(--crm-border)] bg-[var(--crm-bg-card)]">
            <CardContent className="p-6">
              <ContactTimeline activities={activities} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value?: string | null
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--crm-text-muted)]" />
      <div className="min-w-0">
        <p className="text-xs text-[var(--crm-text-muted)]">{label}</p>
        <p className="text-sm text-[var(--crm-text-primary)] truncate">{value || '-'}</p>
      </div>
    </div>
  )
}
