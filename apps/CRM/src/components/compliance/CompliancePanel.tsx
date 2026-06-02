'use client'

import { Shield, ShieldCheck, ShieldAlert, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ComplianceBadge } from './ComplianceBadge'
import { useComplianceChecks, useScreenEntity } from '@/hooks/use-compliance'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n'

interface CompliancePanelProps {
  entityType: 'DEAL' | 'COMPANY' | 'CONTACT'
  entityId: string
  entityName: string
  country: string
  complianceStatus?: string
}

const STATUS_ICONS: Record<string, typeof Shield> = {
  NOT_CHECKED: Shield,
  CLEAR: ShieldCheck,
  FLAGGED: AlertTriangle,
  BLOCKED: ShieldAlert,
  REVIEW_REQUIRED: AlertTriangle,
}

export function CompliancePanel({
  entityType,
  entityId,
  entityName,
  country,
  complianceStatus = 'NOT_CHECKED',
}: CompliancePanelProps) {
  const { t } = useTranslation()
  const { data: checks = [], isLoading } = useComplianceChecks(entityType, entityId)
  const screenMutation = useScreenEntity()

  const handleScreen = () => {
    screenMutation.mutate(
      { entityType, entityId, name: entityName, country },
      {
        onSuccess: (result) => {
          const status = result.screening?.status
          if (status === 'CLEAR') {
            toast({ title: t('compliance.screenClear') })
          } else if (status === 'BLOCKED') {
            toast({ title: t('compliance.screenBlocked'), variant: 'destructive' })
          } else {
            toast({ title: t('compliance.screenFlagged'), variant: 'destructive' })
          }
        },
        onError: (err) => {
          toast({ title: t('common.error'), description: err.message, variant: 'destructive' })
        },
      }
    )
  }

  const StatusIcon = STATUS_ICONS[complianceStatus] || Shield

  return (
    <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-[var(--crm-text-primary)] flex items-center gap-2">
            <StatusIcon className="w-4 h-4" />
            {t('compliance.title')}
          </CardTitle>
          <ComplianceBadge status={complianceStatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={handleScreen}
          disabled={screenMutation.isPending}
        >
          {screenMutation.isPending ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3 mr-1" />
          )}
          {t('compliance.runScreening')}
        </Button>

        {isLoading ? (
          <p className="text-xs text-[var(--crm-text-muted)]">{t('common.loading')}</p>
        ) : checks.length === 0 ? (
          <p className="text-xs text-[var(--crm-text-muted)] text-center py-2">
            {t('compliance.noChecks')}
          </p>
        ) : (
          <div className="space-y-2">
            {checks.map((check) => (
              <div
                key={check.id}
                className="p-2 rounded-md bg-[var(--crm-bg-page)] border border-[var(--crm-border)]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[var(--crm-text-primary)]">
                    {check.checkType}
                  </span>
                  <ComplianceBadge status={check.status} className="text-[10px]" />
                </div>
                {check.result?.message && (
                  <p className="text-[10px] text-[var(--crm-text-muted)]">{check.result.message}</p>
                )}
                <p className="text-[10px] text-[var(--crm-text-muted)] mt-1">
                  {new Date(check.checkedAt).toLocaleDateString()} · {check.checkedBy?.name ?? 'System'}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
