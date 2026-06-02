"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { ChatWidget } from "@/components/ai/chat-widget"
import { CommandPalette } from "@/components/ui/command-palette"
import { MobileBottomNav } from "@/components/layout/mobile-nav"
import { useSidebarStore } from "@/stores/sidebar-store"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { collapsed, toggle } = useSidebarStore()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:flex h-full">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Breadcrumb />
          {children}
        </main>
      </div>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
      {/* AI Chat Widget */}
      <ChatWidget />
      {/* AI Command Palette */}
      <CommandPalette />
    </div>
  )
}
