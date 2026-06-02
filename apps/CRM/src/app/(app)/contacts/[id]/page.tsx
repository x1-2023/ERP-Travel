'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Pencil,
  Phone,
  Mail,
  Smartphone,
  Building2,
  Briefcase,
  FileText,
  Tag,
  Calendar,
  MessageSquare,
  Video,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

import { useTranslation } from '@/i18n'
import { DocumentPanel } from '@/components/documents/DocumentPanel'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
// Card imports removed — using glass-card-static classes
import { Skeleton } from '@/components/ui/skeleton'
import { ContactTimeline } from '@/components/contacts/ContactTimeline'
import { useContact } from '@/hooks/use-contacts'
import { useActivities } from '@/hooks/use-activities'
import { CONTACT_STATUSES, LEAD_SOURCES, formatCurrency } from '@/lib/constants'

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslation()
  const id = params.id as string

  const { data: contact, isLoading } = useContact(id)
  const { data: activitiesData } = useActivities({ contactId: id, limit: 20 })

  const activities = activitiesData?.data ?? []
  const status = CONTACT_STATUSES.find((s) => s.value === contact?.status)
  const source = LEAD_SOURCES.find((s) => s.value === contact?.source)

  if (isLoading) {
    return (
      <PageShell title="">
        <div className="space-y-3">
          <Skeleton className="h-32 w-full bg-[var(--crm-bg-subtle)]" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="col-span-2 h-64 bg-[var(--crm-bg-subtle)]" />
            <Skeleton className="h-64 bg-[var(--crm-bg-subtle)]" />
          </div>
        </div>
      </PageShell>
    )
  }

  if (!contact) {
    return (
      <PageShell title={t('common.notFound')}>
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-sm text-[var(--crm-text-muted)]">{t('contacts.notFound')}</p>
          <Button
            variant="outline"
            className="mt-4 border-[var(--crm-border)] text-[var(--crm-text-secondary)]"
            onClick={() => router.push('/contacts')}
          >
            {t('common.back')}
          </Button>
        </div>
      </PageShell>
    )
  }

  const initials = `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`.toUpperCase()
  const deals = contact.tags ? [] : [] // Deals come from DealContact relation, showing placeholder

  return (
    <PageShell
      title=""
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
            onClick={() => router.push('/contacts')}
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
      {/* Contact Header */}
      <div className="glass-card-static p-6 flex items-center gap-5">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-[#10B981]/20 text-[#10B981] text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[var(--crm-text-primary)]">
                {contact.firstName} {contact.lastName}
              </h2>
              {status && (
                <Badge
                  className="border-0 text-xs"
                  style={{
                    backgroundColor: `${status.color}20`,
                    color: status.color,
                  }}
                >
                  {t(status.labelKey)}
                </Badge>
              )}
              {contact.score > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-12 rounded-full bg-[var(--crm-border)]">
                    <div
                      className="h-full rounded-full bg-[#10B981]"
                      style={{ width: `${Math.min(contact.score, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--crm-text-secondary)]">{contact.score}</span>
                </div>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-[var(--crm-text-secondary)]">
              {contact.jobTitle && <span>{contact.jobTitle}</span>}
              {contact.company && (
                <Link
                  href={`/companies/${contact.company.id}`}
                  className="text-[#10B981] hover:underline"
                >
                  {contact.company.name}
                </Link>
              )}
            </div>
          </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Left: Info + Deals + Tags */}
        <div className="lg:col-span-2 space-y-3">
          {/* Contact Info */}
          <div className="glass-card-static p-3">
            <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-3">
              Thông tin liên hệ
            </h3>
            <div className="grid gap-3">
              <InfoRow icon={Mail} label="Email" value={contact.email} />
              <InfoRow icon={Phone} label="Điện thoại" value={contact.phone} />
              <InfoRow icon={Smartphone} label="Di động" value={contact.mobile} />
              <InfoRow
                icon={Building2}
                label="Phòng ban"
                value={contact.department}
              />
              <InfoRow
                icon={Briefcase}
                label="Nguồn"
                value={source ? t(source.labelKey) : undefined}
              />
              {contact.notes && (
                <InfoRow icon={FileText} label="Ghi chú" value={contact.notes} />
              )}
            </div>
          </div>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="glass-card-static p-3">
              <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map(({ tag }) => (
                  <Badge
                    key={tag.id}
                    className="badge-premium border-0"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Activities + Quick Actions */}
        <div className="space-y-3">
          {/* Quick actions */}
          <div className="glass-card-static p-3">
            <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-3">
              {t('contacts.quickActions')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:border-[#10B981]/30"
              >
                <Phone className="h-3.5 w-3.5 text-[#10B981]" />
                {t('contacts.logCall')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:border-[#3B82F6]/30"
              >
                <Mail className="h-3.5 w-3.5 text-[#3B82F6]" />
                {t('contacts.sendEmail')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:border-[#8B5CF6]/30"
              >
                <Calendar className="h-3.5 w-3.5 text-[#8B5CF6]" />
                Đặt lịch họp
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:border-[#F59E0B]/30"
              >
                <MessageSquare className="h-3.5 w-3.5 text-[#F59E0B]" />
                {t('contacts.addNote')}
              </Button>
            </div>
          </div>

          {/* Documents */}
          <DocumentPanel entityType="contact" entityId={id} />

          {/* Activity Timeline */}
          <div className="glass-card-static p-3">
            <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-3">
              {t('nav.activities')}
            </h3>
            <ContactTimeline activities={activities} />
          </div>
        </div>
      </div>
    </PageShell>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value?: string | null
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--crm-text-muted)]" />
      <div className="min-w-0">
        <p className="text-xs text-[var(--crm-text-muted)]">{label}</p>
        <p className="text-sm text-[var(--crm-text-primary)]">{value || '-'}</p>
      </div>
    </div>
  )
}
