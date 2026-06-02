'use client'

import { useState, useEffect } from 'react'
import { Search, LogOut, User, ChevronDown, Sun, Moon, Settings, Menu } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/i18n'
import { CommandPalette } from '@/components/command-palette/CommandPalette'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { useUIStore } from '@/stores/ui-store'

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const { user, isLoading, logout } = useAuth()
  const { t, locale, setLocale } = useTranslation()
  const { isMobile, setSidebarOpen } = useUIStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const toggleLocale = () => setLocale(locale === 'vi' ? 'en' : 'vi')

  const initials = getInitials(user?.name)
  const displayName = user?.name || user?.email || 'User'
  const displayEmail = user?.email || ''

  return (
    <header className="h-11 flex items-center justify-between px-6 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--crm-border)] shrink-0">
      {/* Left: Hamburger + Search */}
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <button
          onClick={() => setSearchOpen(true)}
          className="input-premium flex items-center gap-2 px-3 text-sm"
          style={{ paddingTop: 3, paddingBottom: 3 }}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('common.search')}...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-4 px-1.5 py-0.5 rounded bg-[var(--crm-bg-subtle)] text-[10px] font-mono text-[var(--crm-text-muted)]">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </button>
      </div>

      {/* Command Palette */}
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLocale}
          className="text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)] font-medium text-xs px-2"
          title={locale === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        >
          {locale === 'vi' ? 'EN' : 'VI'}
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
          title={mounted ? (theme === 'dark' ? t('common.lightMode') : t('common.darkMode')) : undefined}
        >
          {mounted ? (
            theme === 'dark' ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )
          ) : (
            <span className="w-[18px] h-[18px] block" />
          )}
        </Button>

        {/* Notifications */}
        <NotificationBell />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[var(--crm-bg-subtle)] transition-colors">
              {isLoading ? (
                <>
                  <Skeleton className="w-7 h-7 rounded-full" />
                  <Skeleton className="hidden sm:block w-24 h-4" />
                </>
              ) : (
                <>
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-[#10B981]/20 text-[#10B981] text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm text-[var(--crm-text-primary)] font-medium max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--crm-text-muted)] hidden sm:inline" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-[var(--crm-bg-card)] border-[var(--crm-border)]"
          >
            <DropdownMenuLabel className="text-[var(--crm-text-primary)] font-normal">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-[var(--crm-text-muted)]">{displayEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[var(--crm-border)]" />
            <DropdownMenuItem className="text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] focus:text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              {t('nav.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] focus:text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                {t('nav.settings')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--crm-border)]" />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
