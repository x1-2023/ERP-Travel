'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Building2,
  Handshake,
  FileText,
  Loader2,
} from 'lucide-react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'
import { useSearch } from '@/hooks/use-search'
import { useTranslation } from '@/i18n'
import { formatCurrency } from '@/lib/constants'

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()
  const { results, isLoading, totalResults } = useSearch(query)
  const { t } = useTranslation()

  const isOpen = controlledOpen ?? internalOpen

  const setOpen = useCallback(
    (value: boolean) => {
      onOpenChange?.(value)
      setInternalOpen(value)
    },
    [onOpenChange]
  )

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!isOpen)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [setOpen, isOpen])

  // Reset query when closing
  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value)
    if (!value) {
      setQuery('')
    }
  }, [setOpen])

  const navigate = useCallback(
    (href: string) => {
      setOpen(false)
      setQuery('')
      router.push(href)
    },
    [router, setOpen]
  )

  const hasContacts = results.contacts.length > 0
  const hasCompanies = results.companies.length > 0
  const hasDeals = results.deals.length > 0
  const hasQuotes = results.quotes.length > 0

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder={t('search.placeholder')}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[400px]">
        {/* Loading indicator */}
        {isLoading && query.trim().length >= 2 && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--crm-text-muted)]" />
          </div>
        )}

        {query.trim().length >= 2 && !isLoading && totalResults === 0 && (
          <CommandEmpty>{t('search.noResults')}</CommandEmpty>
        )}

        {query.trim().length < 2 && !isLoading && (
          <div className="py-10 text-center text-sm text-[var(--crm-text-muted)]">
            {t('search.hint')}
          </div>
        )}

        {hasContacts && (
          <CommandGroup heading={t('search.contacts')}>
            {results.contacts.map((c) => (
              <CommandItem
                key={`contact-${c.id}`}
                value={`contact ${c.firstName} ${c.lastName} ${c.email || ''}`}
                onSelect={() => navigate(`/contacts/${c.id}`)}
                className="cursor-pointer"
              >
                <Users className="mr-2 h-4 w-4 text-[#3B82F6]" />
                <div className="flex flex-col">
                  <span className="text-sm text-[var(--crm-text-primary)]">
                    {c.firstName} {c.lastName}
                  </span>
                  <span className="text-xs text-[var(--crm-text-muted)]">
                    {[c.email, c.company?.name].filter(Boolean).join(' · ')}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {hasContacts && hasCompanies && <CommandSeparator />}

        {hasCompanies && (
          <CommandGroup heading={t('search.companies')}>
            {results.companies.map((co) => (
              <CommandItem
                key={`company-${co.id}`}
                value={`company ${co.name} ${co.industry || ''}`}
                onSelect={() => navigate(`/companies/${co.id}`)}
                className="cursor-pointer"
              >
                <Building2 className="mr-2 h-4 w-4 text-[#8B5CF6]" />
                <div className="flex flex-col">
                  <span className="text-sm text-[var(--crm-text-primary)]">{co.name}</span>
                  <span className="text-xs text-[var(--crm-text-muted)]">
                    {[
                      co.industry,
                      `${co._count.contacts} ${t('search.contacts').toLowerCase()}`,
                      `${co._count.deals} ${t('search.deals').toLowerCase()}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {(hasContacts || hasCompanies) && hasDeals && <CommandSeparator />}

        {hasDeals && (
          <CommandGroup heading={t('search.deals')}>
            {results.deals.map((d) => (
              <CommandItem
                key={`deal-${d.id}`}
                value={`deal ${d.title} ${d.company?.name || ''}`}
                onSelect={() => navigate(`/deals/${d.id}`)}
                className="cursor-pointer"
              >
                <Handshake className="mr-2 h-4 w-4 text-[#F59E0B]" />
                <div className="flex flex-1 flex-col">
                  <span className="text-sm text-[var(--crm-text-primary)]">{d.title}</span>
                  <span className="text-xs text-[var(--crm-text-muted)]">
                    {[
                      d.stage?.name,
                      d.company?.name,
                      formatCurrency(Number(d.value)),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </div>
                {d.stage && (
                  <span
                    className="ml-auto h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: d.stage.color }}
                  />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {(hasContacts || hasCompanies || hasDeals) && hasQuotes && (
          <CommandSeparator />
        )}

        {hasQuotes && (
          <CommandGroup heading={t('search.quotes')}>
            {results.quotes.map((q) => (
              <CommandItem
                key={`quote-${q.id}`}
                value={`quote ${q.quoteNumber} ${q.company?.name || ''}`}
                onSelect={() => navigate(`/quotes/${q.id}`)}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4 text-[#10B981]" />
                <div className="flex flex-col">
                  <span className="text-sm text-[var(--crm-text-primary)]">
                    {q.quoteNumber}
                  </span>
                  <span className="text-xs text-[var(--crm-text-muted)]">
                    {[
                      q.company?.name,
                      q.status,
                      formatCurrency(Number(q.total)),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
