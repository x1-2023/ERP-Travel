'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CONTACT_STATUSES } from '@/lib/constants'
import { useTranslation } from '@/i18n'
import type { ContactWithCompany } from '@/types'

interface ContactCardProps {
  contact: ContactWithCompany
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function ContactCard({ contact }: ContactCardProps) {
  const { t } = useTranslation()
  const status = CONTACT_STATUSES.find((s) => s.value === contact.status)

  return (
    <Link
      href={`/contacts/${contact.id}`}
      className="flex items-center gap-3 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-bg-card)] p-3 transition-colors hover:bg-[var(--crm-bg-hover)]"
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback
          className="bg-[#10B981]/20 text-[#10B981] text-sm font-medium"
        >
          {getInitials(contact.firstName, contact.lastName)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-[var(--crm-text-primary)]">
            {contact.firstName} {contact.lastName}
          </p>
          {status && (
            <Badge
              className="shrink-0 border-0 text-[10px] px-1.5 py-0"
              style={{
                backgroundColor: `${status.color}20`,
                color: status.color,
              }}
            >
              {t(status.labelKey)}
            </Badge>
          )}
        </div>
        {contact.email && (
          <p className="truncate text-xs text-[var(--crm-text-secondary)]">{contact.email}</p>
        )}
        {contact.company && (
          <p className="truncate text-xs text-[var(--crm-text-muted)]">
            {contact.company.name}
          </p>
        )}
      </div>
    </Link>
  )
}
