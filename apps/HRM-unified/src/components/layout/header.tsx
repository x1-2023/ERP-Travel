"use client"

import { Search, LogOut, User, Settings } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useSidebarStore } from "@/stores/sidebar-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { USER_ROLE_LABELS } from "@/lib/constants"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationPanel } from "@/components/notifications/notification-panel"

export function Header() {
  const { data: session } = useSession()
  const { setCommandPaletteOpen } = useSidebarStore()

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <header className="flex h-12 items-center gap-4 border-b border-border bg-card px-6">
      {/* Command Palette Trigger */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground hover:border-primary/40 hover:bg-muted hover:text-foreground transition-all duration-200 w-52"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs truncate">Tìm kiếm...</span>
        <kbd className="ml-auto text-[10px] bg-background px-1.5 py-0.5 rounded font-mono border border-border">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-3 ml-auto">
        {/* Theme Toggle */}
        <ThemeToggle variant="compact" className="h-7 w-7" />

        {/* AI-Powered Notifications */}
        <NotificationPanel />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-7 px-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary/20 text-primary text-[10px] rounded-sm">
                  {session?.user?.name ? getInitials(session.user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium text-foreground">{session?.user?.name || "User"}</p>
                <p className="text-[10px] text-muted-foreground">
                  {session?.user?.role ? USER_ROLE_LABELS[session.user.role] : ""}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{session?.user?.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {session?.user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Hồ sơ
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Cài đặt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
