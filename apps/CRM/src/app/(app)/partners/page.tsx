'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Handshake, Building2, MapPin } from 'lucide-react'

import { useTranslation } from '@/i18n'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePartners } from '@/hooks/use-partners'
import { PARTNER_TYPES, CERTIFICATION_LEVELS, formatShortCurrency } from '@/lib/constants'

export default function PartnersPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [certFilter, setCertFilter] = useState<string>('')

  const { data, isLoading } = usePartners({
    partnerType: typeFilter || undefined,
    certificationLevel: certFilter || undefined,
  })

  const partners = data?.data || []

  return (
    <PageShell
      title={t('partner.title')}
      actions={
        <Link href="/partners/new">
          <Button size="sm" className="btn-accent-glow">
            <Plus className="h-4 w-4" />
            {t('partner.create')}
          </Button>
        </Link>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Select
          value={typeFilter}
          onValueChange={(val) => setTypeFilter(val === '__all__' ? '' : val)}
        >
          <SelectTrigger className="w-[180px] input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
            <SelectValue placeholder="Loại đối tác" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
            <SelectItem value="__all__" className="text-[var(--crm-text-secondary)]">Tất cả</SelectItem>
            {PARTNER_TYPES.map((pt) => (
              <SelectItem key={pt.value} value={pt.value} className="text-[var(--crm-text-primary)]">
                {t(pt.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={certFilter}
          onValueChange={(val) => setCertFilter(val === '__all__' ? '' : val)}
        >
          <SelectTrigger className="w-[160px] input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
            <SelectValue placeholder="Cấp độ" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
            <SelectItem value="__all__" className="text-[var(--crm-text-secondary)]">Tất cả</SelectItem>
            {CERTIFICATION_LEVELS.map((cl) => (
              <SelectItem key={cl.value} value={cl.value} className="text-[var(--crm-text-primary)]">
                {t(cl.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && partners.length === 0 && (
        <div className="text-center py-20 text-[var(--crm-text-muted)]">
          <Handshake className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có đối tác nào</p>
        </div>
      )}

      {/* Partner cards */}
      {!isLoading && partners.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => {
            const typeConst = PARTNER_TYPES.find((pt) => pt.value === partner.partnerType)
            const certConst = CERTIFICATION_LEVELS.find((cl) => cl.value === partner.certificationLevel)

            return (
              <Card
                key={partner.id}
                className="glass-card-static cursor-pointer hover:border-[var(--crm-accent)] transition-colors"
                onClick={() => router.push(`/partners/${partner.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-[var(--crm-bg-subtle)] flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-[var(--crm-text-muted)]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-[var(--crm-text-primary)]">
                          {partner.company?.name}
                        </h3>
                        {partner.territory && (
                          <div className="flex items-center gap-1 text-xs text-[var(--crm-text-muted)]">
                            <MapPin className="h-3 w-3" />
                            {partner.territory}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs border-none"
                      style={{
                        backgroundColor: partner.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
                        color: partner.isActive ? '#10B981' : '#6B7280',
                      }}
                    >
                      {partner.isActive ? t('partner.active') : t('partner.inactive')}
                    </Badge>
                  </div>

                  <div className="flex gap-2 mb-3">
                    {typeConst && (
                      <Badge
                        variant="outline"
                        className="text-xs border-none"
                        style={{ backgroundColor: `${typeConst.color}20`, color: typeConst.color }}
                      >
                        {t(typeConst.labelKey)}
                      </Badge>
                    )}
                    {certConst && (
                      <Badge
                        variant="outline"
                        className="text-xs border-none"
                        style={{ backgroundColor: `${certConst.color}20`, color: certConst.color }}
                      >
                        {t(certConst.labelKey)}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-[var(--crm-text-primary)]">
                        {partner._count?.deals || 0}
                      </div>
                      <div className="text-xs text-[var(--crm-text-muted)]">Deals</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[var(--crm-text-primary)]">
                        {partner._count?.registrations || 0}
                      </div>
                      <div className="text-xs text-[var(--crm-text-muted)]">Regs</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[var(--crm-accent-text)]">
                        {partner.commissionRate}%
                      </div>
                      <div className="text-xs text-[var(--crm-text-muted)]">Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
