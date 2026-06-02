'use client'

import Link from 'next/link'
import { Plus, Users, Filter } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAudiences } from '@/hooks/use-campaigns'
import { useTranslation } from '@/i18n'

export default function AudiencesPage() {
  const { t } = useTranslation()
  const { data: audiences, isLoading } = useAudiences()

  return (
    <PageShell
      title={t('audiences.title')}
      description={t('audiences.description')}
      actions={
        <Button asChild className="btn-accent-glow">
          <Link href="/campaigns/audiences/new">
            <Plus className="w-4 h-4 mr-1.5" />
            {t('audiences.create')}
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card-static p-4">
              <Skeleton className="h-12 w-full bg-[var(--crm-bg-subtle)]" />
            </div>
          ))}
        </div>
      ) : !audiences || audiences.length === 0 ? (
        <div className="glass-card-static py-16 flex flex-col items-center justify-center text-center">
          <Users className="w-12 h-12 text-[#333] mb-3" />
          <p className="text-[var(--crm-text-secondary)] text-sm">{t('audiences.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {audiences.map((audience: any) => (
            <div key={audience.id} className="glass-card-static p-3">
              <div className="flex items-center gap-2 mb-2">
                {audience.type === 'DYNAMIC' ? (
                  <Filter className="w-4 h-4 text-purple-400" />
                ) : (
                  <Users className="w-4 h-4 text-blue-400" />
                )}
                <h3 className="text-sm font-medium text-[var(--crm-text-primary)]">{audience.name}</h3>
              </div>
              {audience.description && (
                <p className="text-xs text-[var(--crm-text-muted)] mb-2">{audience.description}</p>
              )}
              <div className="flex items-center gap-2">
                <Badge className="badge-premium border-0 text-[10px]" style={{
                  backgroundColor: audience.type === 'DYNAMIC' ? '#8B5CF620' : '#3B82F620',
                  color: audience.type === 'DYNAMIC' ? '#8B5CF6' : '#3B82F6',
                }}>
                  {audience.type === 'DYNAMIC' ? t('audiences.dynamic') : t('audiences.static')}
                </Badge>
                {audience.type === 'DYNAMIC' ? (
                  <span className="text-xs text-[var(--crm-text-muted)]">
                    {t('audiences.previewCount', { n: audience._count?.members || 0 })}
                  </span>
                ) : (
                  <span className="text-xs text-[var(--crm-text-muted)]">{t('audiences.nContacts', { n: audience._count?.members || 0 })}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
