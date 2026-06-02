// src/hooks/use-persisted-filters.ts
// Persist filter state in URL search params for bookmark-ability and back/forward navigation

'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

type FilterValue = string | number | boolean | null | undefined

/**
 * Hook to persist filter state in URL search params.
 * Filters survive page navigation and can be shared via URL.
 *
 * Usage:
 * ```tsx
 * const { filters, setFilter, setFilters, clearFilters } = usePersistedFilters({
 *   page: 1,
 *   pageSize: 20,
 *   search: '',
 *   departmentId: '',
 *   status: '',
 * })
 *
 * // Read filter values
 * const { page, search, departmentId } = filters
 *
 * // Set a single filter (resets page to 1)
 * <Input onChange={(e) => setFilter('search', e.target.value)} />
 *
 * // Set multiple filters at once
 * setFilters({ departmentId: 'dept-1', status: 'ACTIVE' })
 *
 * // Clear all filters
 * <Button onClick={clearFilters}>Xóa bộ lọc</Button>
 * ```
 */
export function usePersistedFilters<T extends Record<string, FilterValue>>(defaults: T) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Parse current filters from URL, falling back to defaults
  const filters = useMemo(() => {
    const result = { ...defaults }
    for (const key of Object.keys(defaults)) {
      const urlValue = searchParams.get(key)
      if (urlValue !== null) {
        const defaultValue = defaults[key]
        if (typeof defaultValue === 'number') {
          const parsed = Number(urlValue)
          ;(result as Record<string, FilterValue>)[key] = Number.isNaN(parsed) ? defaultValue : parsed
        } else if (typeof defaultValue === 'boolean') {
          ;(result as Record<string, FilterValue>)[key] = urlValue === 'true'
        } else {
          ;(result as Record<string, FilterValue>)[key] = urlValue
        }
      }
    }
    return result
  }, [searchParams, defaults])

  // Build URL from filters, omitting defaults
  const buildUrl = useCallback((newFilters: Record<string, FilterValue>) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(newFilters)) {
      if (value != null && value !== '' && value !== defaults[key]) {
        params.set(key, String(value))
      }
    }
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }, [pathname, defaults])

  // Set a single filter value
  const setFilter = useCallback((key: keyof T, value: FilterValue) => {
    const newFilters = { ...filters, [key]: value }
    // Reset page to 1 when changing non-page filters
    if (key !== 'page' && 'page' in newFilters) {
      (newFilters as Record<string, FilterValue>).page = 1
    }
    router.push(buildUrl(newFilters), { scroll: false })
  }, [filters, buildUrl, router])

  // Set multiple filter values at once
  const setFilters = useCallback((updates: Partial<T>) => {
    const newFilters = { ...filters, ...updates }
    if (!('page' in updates) && 'page' in newFilters) {
      (newFilters as Record<string, FilterValue>).page = 1
    }
    router.push(buildUrl(newFilters), { scroll: false })
  }, [filters, buildUrl, router])

  // Clear all filters back to defaults
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false })
  }, [pathname, router])

  return { filters, setFilter, setFilters, clearFilters }
}
