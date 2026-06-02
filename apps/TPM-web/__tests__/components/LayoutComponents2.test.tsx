/**
 * Layout Components Tests (Additional)
 * Tests for AuthLayout, Sidebar, SidebarItem, SidebarSection, SidebarUser, DashboardLayout
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';

// Mock stores
vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    sidebarOpen: true,
    theme: 'light',
    language: 'en',
    isMobile: false,
    toggleSidebar: vi.fn(),
    setSidebarOpen: vi.fn(),
    setTheme: vi.fn(),
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn(),
    setIsMobile: vi.fn(),
  }),
}));

let mockAuthState = {
  user: { id: 'user-1', name: 'Test User', email: 'test@example.com', role: 'ADMIN' },
  isAuthenticated: true,
  isLoading: false,
  logout: vi.fn(),
  accessToken: 'test-token',
  fetchUser: vi.fn(),
};

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockAuthState,
}));

vi.mock('@/lib/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'header.searchPlaceholder': 'Search...',
        'header.settings': 'Settings',
        'header.logout': 'Logout',
        'header.help': 'Help',
        'header.keyboardShortcuts': 'Keyboard Shortcuts',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@/components/notifications/NotificationDropdown', () => ({
  NotificationDropdown: () => <div data-testid="notification-dropdown">Notifications</div>,
}));

vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggleCompact: () => <button data-testid="theme-toggle">Theme</button>,
}));

vi.mock('@/components/ui/LanguageToggle', () => ({
  LanguageToggle: () => <button data-testid="language-toggle">Language</button>,
}));

vi.mock('@/hooks/useSidebarCollapse', () => ({
  useSidebarCollapse: () => ({
    toggleSection: vi.fn(),
    isSectionExpanded: () => true,
  }),
}));

vi.mock('@/hooks/useNavigation', () => ({
  useNavigation: () => ({
    isActive: () => false,
  }),
}));

vi.mock('@/config/sidebarConfig', () => ({
  sidebarConfig: {
    brand: {
      name: 'PROMO MASTER',
      subtitle: 'Trade Management',
      icon: ({ className, style, strokeWidth }: any) => <svg data-testid="brand-icon" className={className} />,
    },
    sections: [
      {
        id: 'main',
        title: 'Main',
        titleEn: 'Main',
        items: [
          {
            id: 'dashboard',
            title: 'Dashboard',
            titleVi: 'Trang chu',
            href: '/dashboard',
            icon: ({ className }: any) => <svg data-testid="item-icon" className={className} />,
          },
        ],
      },
    ],
    footer: {
      showStatus: false,
      statusItems: [],
    },
  },
  getSidebarColors: () => ({
    text: '#fff',
    textMuted: '#aaa',
    textSubtle: '#888',
    bgSubtle: 'rgba(255,255,255,0.1)',
    bgActive: 'rgba(255,255,255,0.15)',
    bgHover: 'rgba(255,255,255,0.05)',
    bgGradient: 'transparent',
    border: 'rgba(255,255,255,0.1)',
    borderAccent: 'rgba(255,255,255,0.2)',
    overlayGradient: 'transparent',
    statusOnline: '#22c55e',
    statusOffline: '#ef4444',
    statusSyncing: '#f59e0b',
  }),
  getSidebarBgColor: () => '#1a1a2e',
  getBadgeColors: () => ({
    bg: 'rgba(255,255,255,0.2)',
    text: '#fff',
  }),
}));

vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: ({ fullScreen }: any) => (
    <div data-testid="loading-spinner">{fullScreen ? 'Full screen loading' : 'Loading'}</div>
  ),
}));

// Mock Sidebar and Header for DashboardLayout (uses ./sidebar barrel and ./Header)
vi.mock('@/components/layout/sidebar', () => ({
  Sidebar: ({ isMobileOpen }: any) => (
    <div data-testid="sidebar-mock">Sidebar Mock</div>
  ),
}));

vi.mock('@/components/layout/Header', () => ({
  Header: ({ onMobileMenuClick }: any) => (
    <div data-testid="header-mock">Header Mock</div>
  ),
}));

// ============================================================================
// AuthLayout
// ============================================================================
import AuthLayout from '@/components/layout/AuthLayout';

describe('AuthLayout', () => {
  beforeEach(() => {
    mockAuthState = {
      user: { id: 'user-1', name: 'Test User', email: 'test@example.com', role: 'ADMIN' },
      isAuthenticated: false,
      isLoading: false,
      logout: vi.fn(),
      accessToken: '',
      fetchUser: vi.fn(),
    };
  });

  it('renders auth layout when not authenticated', () => {
    render(<AuthLayout />);
    expect(screen.getByText('PROMO MASTER')).toBeInTheDocument();
    expect(screen.getByText('Trade Promotion Management System')).toBeInTheDocument();
  });

  it('renders PM logo', () => {
    render(<AuthLayout />);
    expect(screen.getByText('PM')).toBeInTheDocument();
  });
});

// ============================================================================
// SidebarUser (standalone component - no barrel import needed)
// ============================================================================
import { SidebarUser } from '@/components/layout/sidebar/SidebarUser';

describe('SidebarUser', () => {
  const colors = {
    text: '#fff',
    textMuted: '#aaa',
    textSubtle: '#888',
    bgSubtle: 'rgba(255,255,255,0.1)',
    bgActive: 'rgba(255,255,255,0.15)',
    bgHover: 'rgba(255,255,255,0.05)',
    bgGradient: 'transparent',
    border: 'rgba(255,255,255,0.1)',
    borderAccent: 'rgba(255,255,255,0.2)',
    overlayGradient: 'transparent',
    statusOnline: '#22c55e',
    statusOffline: '#ef4444',
    statusSyncing: '#f59e0b',
  };

  it('renders user name and role', () => {
    render(
      <SidebarUser
        name="Jane Doe"
        role="Admin"
        initials="JD"
        isCollapsed={false}
        colors={colors}
      />
    );
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('hides name and role when collapsed', () => {
    render(
      <SidebarUser
        name="Jane Doe"
        role="Admin"
        initials="JD"
        isCollapsed={true}
        colors={colors}
      />
    );
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});

// ============================================================================
// SidebarItem (standalone component)
// ============================================================================
import { SidebarItem } from '@/components/layout/sidebar/SidebarItem';

describe('SidebarItem', () => {
  const colors = {
    text: '#fff',
    textMuted: '#aaa',
    textSubtle: '#888',
    bgSubtle: 'rgba(255,255,255,0.1)',
    bgActive: 'rgba(255,255,255,0.15)',
    bgHover: 'rgba(255,255,255,0.05)',
    bgGradient: 'transparent',
    border: 'rgba(255,255,255,0.1)',
    borderAccent: 'rgba(255,255,255,0.2)',
    overlayGradient: 'transparent',
    statusOnline: '#22c55e',
    statusOffline: '#ef4444',
    statusSyncing: '#f59e0b',
  };

  const mockItem = {
    id: 'dashboard',
    title: 'Dashboard',
    titleVi: 'Trang chu',
    href: '/dashboard',
    icon: ({ className }: any) => <svg data-testid="sidebar-item-icon" className={className} />,
  };

  it('renders item title in English when language is en', () => {
    render(
      <SidebarItem
        item={mockItem}
        isCollapsed={false}
        isActive={false}
        colors={colors}
        language="en"
      />
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders Vietnamese title when language is vi', () => {
    render(
      <SidebarItem
        item={mockItem}
        isCollapsed={false}
        isActive={false}
        colors={colors}
        language="vi"
      />
    );
    expect(screen.getByText('Trang chu')).toBeInTheDocument();
  });

  it('hides title when collapsed', () => {
    render(
      <SidebarItem
        item={mockItem}
        isCollapsed={true}
        isActive={false}
        colors={colors}
        language="en"
      />
    );
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('renders link to correct href', () => {
    render(
      <SidebarItem
        item={mockItem}
        isCollapsed={false}
        isActive={false}
        colors={colors}
        language="en"
      />
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard');
  });
});

// ============================================================================
// SidebarSection (standalone component)
// ============================================================================
import { SidebarSection } from '@/components/layout/sidebar/SidebarSection';

describe('SidebarSection', () => {
  const colors = {
    text: '#fff',
    textMuted: '#aaa',
    textSubtle: '#888',
    bgSubtle: 'rgba(255,255,255,0.1)',
    bgActive: 'rgba(255,255,255,0.15)',
    bgHover: 'rgba(255,255,255,0.05)',
    bgGradient: 'transparent',
    border: 'rgba(255,255,255,0.1)',
    borderAccent: 'rgba(255,255,255,0.2)',
    overlayGradient: 'transparent',
    statusOnline: '#22c55e',
    statusOffline: '#ef4444',
    statusSyncing: '#f59e0b',
  };

  const mockSection = {
    id: 'main',
    title: 'Main Menu',
    titleEn: 'Main Menu',
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        href: '/dashboard',
        icon: ({ className }: any) => <svg className={className} />,
      },
      {
        id: 'promotions',
        title: 'Promotions',
        href: '/promotions',
        icon: ({ className }: any) => <svg className={className} />,
      },
    ],
  };

  it('renders section title when expanded', () => {
    render(
      <SidebarSection
        section={mockSection}
        isExpanded={true}
        isCollapsed={false}
        colors={colors}
        onToggle={vi.fn()}
        isItemActive={() => false}
        language="en"
      />
    );
    expect(screen.getByText('Main Menu')).toBeInTheDocument();
  });

  it('renders section items when expanded', () => {
    render(
      <SidebarSection
        section={mockSection}
        isExpanded={true}
        isCollapsed={false}
        colors={colors}
        onToggle={vi.fn()}
        isItemActive={() => false}
        language="en"
      />
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Promotions')).toBeInTheDocument();
  });

  it('hides section title when sidebar is collapsed', () => {
    render(
      <SidebarSection
        section={mockSection}
        isExpanded={true}
        isCollapsed={true}
        colors={colors}
        onToggle={vi.fn()}
        isItemActive={() => false}
        language="en"
      />
    );
    expect(screen.queryByText('Main Menu')).not.toBeInTheDocument();
  });
});

// ============================================================================
// DashboardLayout (uses mocked Sidebar and Header)
// ============================================================================
import DashboardLayout from '@/components/layout/DashboardLayout';

describe('DashboardLayout', () => {
  beforeEach(() => {
    mockAuthState = {
      user: { id: 'user-1', name: 'Test User', email: 'test@example.com', role: 'ADMIN' },
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
      accessToken: 'test-token',
      fetchUser: vi.fn(),
    };
  });

  it('renders dashboard layout when authenticated', () => {
    render(<DashboardLayout />);
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockAuthState.isLoading = true;
    render(<DashboardLayout />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
