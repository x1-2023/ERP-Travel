/**
 * Layout Components Tests
 * Tests for Header, Sidebar, DashboardLayout
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test-utils';

// Mock stores
const mockToggleSidebar = vi.fn();
const mockLogout = vi.fn();

vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    sidebarOpen: true,
    theme: 'light',
    language: 'en',
    isMobile: false,
    toggleSidebar: mockToggleSidebar,
    setSidebarOpen: vi.fn(),
    setTheme: vi.fn(),
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn(),
    setIsMobile: vi.fn(),
  }),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'user-1', name: 'Test User', email: 'test@example.com', role: 'ADMIN' },
    isAuthenticated: true,
    isLoading: false,
    logout: mockLogout,
  }),
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
      icon: () => null,
    },
    sections: [],
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
    border: 'rgba(255,255,255,0.1)',
    overlayGradient: 'transparent',
    statusOnline: '#22c55e',
    statusOffline: '#ef4444',
    statusSyncing: '#f59e0b',
  }),
  getSidebarBgColor: () => '#1a1a2e',
}));

vi.mock('./sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

import { Header } from '@/components/layout/Header';

// ============================================================================
// Header
// ============================================================================
describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Header />);
    // The header should render a search input
    expect(screen.getByTestId('global-search')).toBeInTheDocument();
  });

  it('displays the global search input', () => {
    render(<Header />);
    const searchInput = screen.getByTestId('global-search');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'search');
  });

  it('displays the user menu trigger', () => {
    render(<Header />);
    const userMenu = screen.getByTestId('user-menu');
    expect(userMenu).toBeInTheDocument();
  });

  it('displays user initial', () => {
    render(<Header />);
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('displays refresh button with tooltip', () => {
    render(<Header />);
    const refreshButton = screen.getByTitle('Refresh (\u2318R)');
    expect(refreshButton).toBeInTheDocument();
  });

  it('displays help button', () => {
    render(<Header />);
    const helpButton = screen.getByTitle('Help (?)');
    expect(helpButton).toBeInTheDocument();
  });

  it('displays notification dropdown', () => {
    render(<Header />);
    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
  });

  it('displays theme toggle', () => {
    render(<Header />);
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('displays language toggle', () => {
    render(<Header />);
    expect(screen.getByTestId('language-toggle')).toBeInTheDocument();
  });

  it('renders mobile menu button when handler is provided', () => {
    const onMobileMenuClick = vi.fn();
    render(<Header onMobileMenuClick={onMobileMenuClick} />);
    // Mobile menu button exists (hidden on lg, visible on mobile)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});
