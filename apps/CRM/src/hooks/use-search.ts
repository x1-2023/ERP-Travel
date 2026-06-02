'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ── Result Types ──────────────────────────────────────────────────

export interface SearchContact {
  id: string
  firstName: string
  lastName: string
  email: string | null
  company: { name: string } | null
}

export interface SearchCompany {
  id: string
  name: string
  industry: string | null
  _count: { contacts: number; deals: number }
}

export interface SearchDeal {
  id: string
  title: string
  value: number | string
  stage: { name: string; color: string } | null
  company: { name: string } | null
}

export interface SearchQuote {
  id: string
  quoteNumber: string
  status: string
  total: number | string
  company: { name: string } | null
}

export interface SearchResults {
  contacts: SearchContact[]
  companies: SearchCompany[]
  deals: SearchDeal[]
  quotes: SearchQuote[]
}

const EMPTY_RESULTS: SearchResults = {
  contacts: [],
  companies: [],
  deals: [],
  quotes: [],
}

// ── Hook ──────────────────────────────────────────────────────────

/**
 * Global search hook with debounce (300ms) and AbortController.
 * Min 2 chars to trigger search. Cancels previous in-flight requests.
 */
export function useSearch(query: string, debounceMs = 300) {
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS)
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const totalResults =
    results.contacts.length +
    results.companies.length +
    results.deals.length +
    results.quotes.length

  const search = useCallback(async (term: string) => {
    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort()
    }

    if (term.trim().length < 2) {
      setResults(EMPTY_RESULTS)
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    setIsLoading(true)

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(term.trim())}`,
        { signal: controller.signal }
      )

      if (!res.ok) {
        setResults(EMPTY_RESULTS)
        return
      }

      const data: SearchResults = await res.json()
      setResults(data)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return // Cancelled — ignore
      }
      setResults(EMPTY_RESULTS)
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [])

  // Debounced effect
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(EMPTY_RESULTS)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timer = setTimeout(() => search(query), debounceMs)
    return () => clearTimeout(timer)
  }, [query, debounceMs, search])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort()
      }
    }
  }, [])

  return { results, isLoading, totalResults }
}
