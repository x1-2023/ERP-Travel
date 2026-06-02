import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  LogOut,
  Settings,
  ChevronDown,
  Keyboard,
  HelpCircle,
  RefreshCw,
  Menu,
  ExternalLink,
  BookOpen,
  MessageCircle,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { ThemeToggleCompact } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMobileMenuClick?: () => void;
}

// Keyboard shortcuts data
const keyboardShortcuts = [
  { category: 'Navigation', shortcuts: [
    { keys: ['⌘', 'K'], description: 'Open search' },
    { keys: ['⌘', 'B'], description: 'Toggle sidebar' },
    { keys: ['⌘', '1'], description: 'Go to Dashboard' },
    { keys: ['⌘', '2'], description: 'Go to Promotions' },
    { keys: ['⌘', '3'], description: 'Go to Claims' },
  ]},
  { category: 'Actions', shortcuts: [
    { keys: ['⌘', 'N'], description: 'New promotion' },
    { keys: ['⌘', 'S'], description: 'Save changes' },
    { keys: ['⌘', 'R'], description: 'Refresh data' },
    { keys: ['Esc'], description: 'Close dialog / Cancel' },
  ]},
  { category: 'Tables', shortcuts: [
    { keys: ['↑', '↓'], description: 'Navigate rows' },
    { keys: ['Enter'], description: 'Open selected item' },
    { keys: ['⌘', 'A'], description: 'Select all' },
    { keys: ['Delete'], description: 'Delete selected' },
  ]},
];

export function Header({ onMobileMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // sidebarOpen = true means expanded, false means collapsed
  const sidebarCollapsed = !sidebarOpen;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Trigger data refresh
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘+K or Ctrl+K - Open search (placeholder)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Focus search input
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      }
      // ⌘+B or Ctrl+B - Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      // ⌘+/ or Ctrl+/ - Show shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(true);
      }
      // ⌘+R or Ctrl+R - Refresh (prevent default browser refresh)
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        handleRefresh();
      }
      // ? - Show help (when not in input)
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setShowHelp(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 z-30 h-12',
          'bg-background/95 backdrop-blur-sm',
          'border-b border-surface-border',
          'flex items-center justify-between px-6',
          'transition-all duration-200',
          sidebarCollapsed ? 'lg:left-16' : 'lg:left-64',
          'left-0'
        )}
      >
        {/* Left Section - Mobile menu & Search */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          {onMobileMenuClick && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden text-foreground-muted hover:text-foreground"
              onClick={onMobileMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Global Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
            <Input
              type="search"
              placeholder={t('header.searchPlaceholder')}
              data-testid="global-search"
              className={cn(
                'pl-9 pr-12 h-8 w-64 md:w-80',
                'bg-surface border-surface-border',
                'placeholder:text-foreground-subtle',
                'focus:w-80 md:focus:w-96 transition-all duration-200'
              )}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="kbd">⌘K</span>
            </kbd>
          </div>

          {/* Quick Stats - Desktop only */}
          <div className="hidden lg:flex items-center gap-4 ml-4 pl-4 border-l border-surface-border">
            <div className="flex items-center gap-2">
              <div className="status-dot status-dot-success" />
              <span className="text-2xs text-foreground-muted">Active:</span>
              <span className="text-xs font-semibold text-foreground font-mono">24</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="status-dot status-dot-warning" />
              <span className="text-2xs text-foreground-muted">Pending:</span>
              <span className="text-xs font-semibold text-foreground font-mono">12</span>
            </div>
          </div>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRefresh}
            className="text-foreground-muted hover:text-foreground"
            title="Refresh (⌘R)"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </Button>

          {/* Help */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-foreground-muted hover:text-foreground"
            onClick={() => setShowHelp(true)}
            title="Help (?)"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Language Toggle */}
          <LanguageToggle />

          {/* Theme Toggle */}
          <ThemeToggleCompact />

          {/* Keyboard Shortcuts */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-foreground-muted hover:text-foreground hidden md:flex"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard Shortcuts (⌘/)"
          >
            <Keyboard className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Separator */}
          <div className="h-6 w-px bg-surface-border mx-1" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 h-8 max-w-[180px]"
                data-testid="user-menu"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground">
                  <span className="text-xs font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden xl:flex flex-col items-start min-w-0 flex-1">
                  <span className="text-xs font-medium text-foreground truncate max-w-full">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-2xs text-foreground-muted truncate max-w-full">
                    {user?.role || 'Manager'}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-foreground-subtle shrink-0 hidden xl:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>{t('header.settings')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-danger focus:text-danger"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>{t('header.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              {t('header.help')}
            </DialogTitle>
            <DialogDescription>
              {t('header.help')} - PROMO MASTER
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Quick Links */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">
                Resources
              </h4>
              <div className="grid gap-2">
                <a
                  href="#"
                  className="flex items-center gap-3 p-3 rounded border border-surface-border hover:bg-surface-hover transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Documentation</p>
                    <p className="text-xs text-foreground-muted">Learn how to use the system</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-foreground-subtle" />
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 p-3 rounded border border-surface-border hover:bg-surface-hover transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-success" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Live Chat</p>
                    <p className="text-xs text-foreground-muted">Chat with support team</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-foreground-subtle" />
                </a>
                <a
                  href="mailto:support@your-domain.com"
                  className="flex items-center gap-3 p-3 rounded border border-surface-border hover:bg-surface-hover transition-colors"
                >
                  <Mail className="h-4 w-4 text-warning" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email Support</p>
                    <p className="text-xs text-foreground-muted">support@your-domain.com</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-foreground-subtle" />
                </a>
              </div>
            </div>

            {/* Version Info */}
            <div className="pt-4 border-t border-surface-border">
              <div className="flex items-center justify-between text-xs text-foreground-muted">
                <span>PROMO MASTER v2.0.0</span>
                <button
                  onClick={() => {
                    setShowHelp(false);
                    setShowShortcuts(true);
                  }}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Keyboard className="h-3 w-3" />
                  {t('header.keyboardShortcuts')}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-primary" />
              {t('header.keyboardShortcuts')}
            </DialogTitle>
            <DialogDescription>
              Press <kbd className="kbd mx-1">⌘/</kbd> anytime to show this dialog
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
            {keyboardShortcuts.map((category) => (
              <div key={category.category}>
                <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3">
                  {category.category}
                </h4>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm text-foreground">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <span key={keyIdx}>
                            <kbd className="kbd">{key}</kbd>
                            {keyIdx < shortcut.keys.length - 1 && (
                              <span className="text-foreground-subtle mx-0.5">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
