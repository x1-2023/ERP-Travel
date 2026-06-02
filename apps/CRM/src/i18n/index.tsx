'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import vi from './vi'
import en from './en'

export type Locale = 'vi' | 'en'

type TranslationKey = keyof typeof vi

const dictionaries = { vi, en } as const

interface TranslationContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey | (string & {}), params?: Record<string, string | number>) => string
}

const TranslationContext = createContext<TranslationContextValue | null>(null)

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'vi'
  const stored = localStorage.getItem('crm-locale')
  if (stored === 'en' || stored === 'vi') return stored
  return 'vi'
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi')

  useEffect(() => {
    setLocaleState(getInitialLocale())
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('crm-locale', newLocale)
  }, [])

  const t = useCallback(
    (key: TranslationKey | (string & {}), params?: Record<string, string | number>): string => {
      const k = key as TranslationKey
      let value: string = dictionaries[locale]?.[k] ?? dictionaries.vi[k] ?? key
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(`{${k}}`, String(v))
        })
      }
      return value
    },
    [locale]
  )

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}
