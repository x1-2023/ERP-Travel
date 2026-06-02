'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { useUIStore } from '@/stores/ui-store'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { setIsMobile, setSidebarOpen } = useUIStore()

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const mobile = e.matches
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
    }
    handleChange(mql)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [setIsMobile, setSidebarOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--crm-bg-page)]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 page-bg">
          {children}
        </main>
      </div>
    </div>
  )
}
