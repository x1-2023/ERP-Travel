'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { Plus, Search, Pencil, Trash2, Users, Download, Upload } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

import { useTranslation } from '@/i18n'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ContactFilters } from '@/components/contacts/ContactFilters'
import { useContacts, useDeleteContact } from '@/hooks/use-contacts'
import { usePermissions } from '@/hooks/use-permissions'
import { CONTACT_STATUSES } from '@/lib/constants'
import type { ContactWithCompany } from '@/types'

const columnHelper = createColumnHelper<ContactWithCompany>()

export default function ContactsPageWrapper() {
  return (
    <Suspense fallback={<ContactsPageSkeleton />}>
      <ContactsPage />
    </Suspense>
  )
}

function ContactsPageSkeleton() {
  const { t } = useTranslation()
  return (
    <PageShell title={t('contacts.title')}>
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full bg-[var(--crm-bg-subtle)]" />
        ))}
      </div>
    </PageShell>
  )
}

function ContactsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { canCreate, canEditRecord, canDeleteRecord, canExport, isManagerOrAbove } = usePermissions()
  const { t } = useTranslation()

  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [filters, setFilters] = useState<{
    status?: string
    companyId?: string
    source?: string
  }>({
    status: searchParams.get('status') ?? undefined,
    companyId: searchParams.get('companyId') ?? undefined,
  })
  const [page, setPage] = useState(1)
  const limit = 20

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Sync search to URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('q', debouncedSearch)
    if (filters.status) params.set('status', filters.status)
    if (filters.companyId) params.set('companyId', filters.companyId)
    const qs = params.toString()
    router.replace(`/contacts${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [debouncedSearch, filters, router])

  const { data, isLoading } = useContacts({
    q: debouncedSearch || undefined,
    status: filters.status === '__all__' ? undefined : filters.status,
    companyId: filters.companyId === '__all__' ? undefined : filters.companyId,
    page,
    limit,
  })

  const [exporting, setExporting] = useState(false)

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/contacts/export')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }, [])

  const deleteContact = useDeleteContact()

  const handleDelete = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (window.confirm(t('contacts.confirmDelete'))) {
        deleteContact.mutate(id)
      }
    },
    [deleteContact]
  )

  const columns = [
    columnHelper.accessor(
      (row) => `${row.firstName} ${row.lastName}`,
      {
        id: 'name',
        header: t('contacts.colName'),
        cell: ({ row }) => {
          const c = row.original
          const initials = `${c.firstName.charAt(0)}${c.lastName.charAt(0)}`.toUpperCase()
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#10B981]/20 text-[#10B981] text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-[var(--crm-text-primary)]">
                {c.firstName} {c.lastName}
              </span>
            </div>
          )
        },
      }
    ),
    columnHelper.accessor('email', {
      header: t('common.email'),
      cell: ({ getValue }) => (
        <span className="text-[var(--crm-text-secondary)]">{getValue() ?? '-'}</span>
      ),
    }),
    columnHelper.accessor('phone', {
      header: t('contacts.colPhone'),
      cell: ({ getValue }) => (
        <span className="text-[var(--crm-text-secondary)]">{getValue() ?? '-'}</span>
      ),
    }),
    columnHelper.accessor('company', {
      header: t('contacts.colCompany'),
      cell: ({ getValue }) => {
        const company = getValue()
        return company ? (
          <Link
            href={`/companies/${company.id}`}
            className="text-[#10B981] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {company.name}
          </Link>
        ) : (
          <span className="text-[var(--crm-text-muted)]">-</span>
        )
      },
    }),
    columnHelper.accessor('status', {
      header: t('contacts.colStatus'),
      cell: ({ getValue }) => {
        const status = CONTACT_STATUSES.find((s) => s.value === getValue())
        return status ? (
          <Badge
            className="border-0 text-[10px] px-2 py-0.5"
            style={{
              backgroundColor: `${status.color}20`,
              color: status.color,
            }}
          >
            {t(status.labelKey)}
          </Badge>
        ) : (
          <span className="text-[var(--crm-text-muted)]">-</span>
        )
      },
    }),
    columnHelper.accessor('score', {
      header: t('contacts.colScore'),
      cell: ({ getValue }) => {
        const score = getValue() ?? 0
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-[var(--crm-border)]">
              <div
                className="h-full rounded-full bg-[#10B981]"
                style={{ width: `${Math.min(score, 100)}%` }}
              />
            </div>
            <span className="text-xs text-[var(--crm-text-secondary)]">{score}</span>
          </div>
        )
      },
    }),
    columnHelper.accessor('lastActivityAt', {
      header: t('contacts.colLastActivity'),
      cell: ({ getValue }) => {
        const date = getValue()
        return date ? (
          <span className="text-xs text-[var(--crm-text-secondary)]">
            {formatDistanceToNow(new Date(date), {
              addSuffix: true,
              locale: vi,
            })}
          </span>
        ) : (
          <span className="text-xs text-[var(--crm-text-muted)]">-</span>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {canEditRecord(row.original.ownerId) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/contacts/${row.original.id}`)
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {canDeleteRecord(row.original.ownerId) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[var(--crm-text-secondary)] hover:text-red-400"
              onClick={(e) => handleDelete(row.original.id, e)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    }),
  ]

  const contacts = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  const table = useReactTable({
    data: contacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <PageShell
      title={t('contacts.title')}
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
            <Link href="/contacts/import">
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
            <Link href="/contacts/new">
              <Button className="btn-accent-glow">
                <Plus className="h-4 w-4" />
                {t('contacts.addContact')}
              </Button>
            </Link>
          )}
        </div>
      }
    >
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--crm-text-muted)]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('contacts.searchPlaceholder')}
          className="input-premium pl-10 bg-[var(--crm-bg-card)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
        />
      </div>

      {/* Filters */}
      <ContactFilters filters={filters} onFilterChange={setFilters} />

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-[var(--crm-bg-subtle)]" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="glass-card-static py-16 flex flex-col items-center justify-center">
          <Users className="h-12 w-12 text-[var(--crm-text-muted)]" />
          <p className="mt-4 text-sm font-medium text-[var(--crm-text-primary)]">
            {t('contacts.empty')}
          </p>
          <p className="mt-1 text-xs text-[var(--crm-text-muted)]">
            {t('contacts.emptyHint')}
          </p>
          {canCreate && (
            <Link href="/contacts/new" className="mt-4">
              <Button className="btn-accent-glow">
                <Plus className="h-4 w-4" />
                {t('contacts.addContact')}
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="glass-card-static overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-[var(--crm-border-subtle)] hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-[var(--crm-border)] cursor-pointer hover:bg-[var(--crm-bg-subtle)]"
                    onClick={() => router.push(`/contacts/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                  {t('common.previous')}
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
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </PageShell>
  )
}
