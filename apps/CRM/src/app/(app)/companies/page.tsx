'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Search,
  Building2,
  Users,
  Briefcase,
  MapPin,
  Download,
  Upload,
} from 'lucide-react'

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
import { useCompanies } from '@/hooks/use-companies'
import { usePermissions } from '@/hooks/use-permissions'
import { COMPANY_SIZES, COUNTRIES } from '@/lib/constants'
import type { CompanyWithContacts } from '@/types'

const INDUSTRIES = [
  'Công nghệ',
  'Tài chính',
  'Sản xuất',
  'Bán lẻ',
  'Y tế',
  'Giáo dục',
  'Bất động sản',
  'Logistics',
  'F&B',
  'Khác',
]

export default function CompaniesPage() {
  const router = useRouter()
  const { canCreate, canExport, isManagerOrAbove } = usePermissions()
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/companies/export')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `companies-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [industry, setIndustry] = useState<string>()
  const [page, setPage] = useState(1)
  const limit = 12

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading } = useCompanies({
    q: debouncedSearch || undefined,
    industry: industry === '__all__' ? undefined : industry,
    page,
    limit,
  })

  const companies = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  return (
    <PageShell
      title={t('companies.title')}
      actions={
        <div className="flex items-center gap-2">
          {canExport && (
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
              className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
            >
              <Download className="h-4 w-4 mr-1" />
              {exporting ? t('common.processing') : t('import.exportCSV')}
            </Button>
          )}
          {isManagerOrAbove && (
            <Link href="/companies/import">
              <Button
                variant="outline"
                className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
              >
                <Upload className="h-4 w-4 mr-1" />
                {t('import.importCSV')}
              </Button>
            </Link>
          )}
          {canCreate && (
            <Link href="/companies/new">
              <Button className="btn-accent-glow">
                <Plus className="h-4 w-4" />
                {t('companies.addCompany')}
              </Button>
            </Link>
          )}
        </div>
      }
    >
      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--crm-text-muted)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('companies.searchPlaceholder')}
            className="input-premium pl-10 bg-[var(--crm-bg-card)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
          />
        </div>

        <Select
          value={industry ?? ''}
          onValueChange={(val) => setIndustry(val || undefined)}
        >
          <SelectTrigger className="h-9 w-[160px] input-premium bg-[var(--crm-bg-card)] border-[var(--crm-border)] text-sm text-[var(--crm-text-secondary)]">
            <SelectValue placeholder="Ngành nghề" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
            <SelectItem value="__all__" className="text-[var(--crm-text-secondary)]">
              {t('companies.allIndustries')}
            </SelectItem>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind} value={ind} className="text-[var(--crm-text-primary)]">
                {ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Company Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 bg-[var(--crm-bg-subtle)]" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="glass-card-static py-16 flex flex-col items-center justify-center">
          <Building2 className="h-12 w-12 text-[var(--crm-text-muted)]" />
          <p className="mt-4 text-sm font-medium text-[var(--crm-text-primary)]">
            {t('companies.empty')}
          </p>
          <p className="mt-1 text-xs text-[var(--crm-text-muted)]">
            Bắt đầu bằng cách thêm công ty đầu tiên
          </p>
          {canCreate && (
            <Link href="/companies/new" className="mt-4">
              <Button className="btn-accent-glow">
                <Plus className="h-4 w-4" />
                {t('companies.addCompany')}
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onClick={() => router.push(`/companies/${company.id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-[var(--crm-text-muted)]">
                {t('common.showing')} {(page - 1) * limit + 1}-
                {Math.min(page * limit, total)} {t('common.of')} {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-7 border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
                >
                  Trước
                </Button>
                <span className="text-xs text-[var(--crm-text-secondary)]">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-7 border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </PageShell>
  )
}

function CompanyCard({
  company,
  onClick,
}: {
  company: CompanyWithContacts
  onClick: () => void
}) {
  const { t } = useTranslation()
  const sizeInfo = COMPANY_SIZES.find((s) => s.value === company.size)
  const sizeLabel = sizeInfo ? t(sizeInfo.labelKey) : undefined

  return (
    <Card
      className="cursor-pointer glass-card-static transition-colors hover:bg-[#1a2234] hover:border-[#10B981]/20"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10B981]/10">
              <Building2 className="h-5 w-5 text-[#10B981]" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-[var(--crm-text-primary)]">
                {company.name}
              </h3>
              {company.industry && (
                <p className="text-xs text-[var(--crm-text-secondary)]">{company.industry}</p>
              )}
            </div>
          </div>
          {sizeLabel && (
            <Badge
              variant="secondary"
              className="shrink-0 bg-[var(--crm-border)] text-[var(--crm-text-secondary)] border-0 text-[10px]"
            >
              {sizeLabel}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--crm-text-secondary)]">
            <Users className="h-3.5 w-3.5 text-[var(--crm-text-muted)]" />
            <span>{company._count?.contacts ?? 0} liên hệ</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--crm-text-secondary)]">
            <Briefcase className="h-3.5 w-3.5 text-[var(--crm-text-muted)]" />
            <span>{company._count?.deals ?? 0} deal</span>
          </div>
          {company.city && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--crm-text-secondary)]">
              <MapPin className="h-3.5 w-3.5 text-[var(--crm-text-muted)]" />
              <span className="truncate">{company.city}</span>
            </div>
          )}
          {company.country && company.country !== 'VN' && (
            <Badge variant="outline" className="text-[10px] border-[var(--crm-border)] text-[var(--crm-text-muted)]">
              {company.country}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
