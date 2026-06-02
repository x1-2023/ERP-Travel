'use client'

import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  isMobile: boolean
  searchOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setIsMobile: (mobile: boolean) => void
  openSearch: () => void
  closeSearch: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  searchOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setIsMobile: (mobile) => set({ isMobile: mobile }),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
}))
