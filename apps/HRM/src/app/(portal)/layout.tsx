"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BottomTabs } from "@/components/portal/bottom-tabs"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-slate-600 rounded-full" />
      </div>
    )
  }

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: "#1E3A5F" }}>
          VietERP HRM
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Desktop →
          </Link>
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: "#1E3A5F" }}
          >
            {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20 px-4 py-4">
        {children}
      </main>

      {/* Bottom tabs */}
      <BottomTabs />
    </div>
  )
}
