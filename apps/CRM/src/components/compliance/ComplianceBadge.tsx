'use client'

import { Badge } from '@/components/ui/badge'
import { COMPLIANCE_STATUSES } from '@/lib/constants'
import { useTranslation } from '@/i18n'

interface ComplianceBadgeProps {
  status: string
  className?: string
}

export function ComplianceBadge({ status, className }: ComplianceBadgeProps) {
  const { t } = useTranslation()
  const info = COMPLIANCE_STATUSES.find((s) => s.value === status)

  return (
    <Badge
      variant="outline"
      className={className}
      style={{
        borderColor: info?.color,
        color: info?.color,
        backgroundColor: `${info?.color}15`,
      }}
    >
      {t(info?.labelKey ?? 'compliance.notChecked')}
    </Badge>
  )
}
