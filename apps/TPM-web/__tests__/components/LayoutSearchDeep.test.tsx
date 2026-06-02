/**
 * LayoutSearchDeep Tests
 * Tests for SidebarUser, Sidebar, QuickSearch, VoiceButton
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test-utils';

// ============================================================================
// Mocks
// ============================================================================

const mockToggleSidebar = vi.fn();
const mockToggleSection = vi.fn();

vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    sidebarOpen: true,
    theme: 'light',
    language: 'vi',
    isMobile: false,
    toggleSidebar: mockToggleSidebar,
    setSidebarOpen: vi.fn(),
    setTheme: vi.fn(),
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn(),
    setIsMobile: vi.fn(),
  }),
}));

vi.mock('@/hooks/useSidebarCollapse', () => ({
  useSidebarCollapse: () => ({
    toggleSection: mockToggleSection,
    isSectionExpanded: () => true,
    expandedSections: ['overview'],
    expandAll: vi.fn(),
    collapseAll: vi.fn(),
    resetToDefaults: vi.fn(),
  }),
}));

vi.mock('@/hooks/useNavigation', () => ({
  useNavigation: () => ({
    currentPath: '/dashboard',
    isActive: (href: string) => href === '/dashboard',
    isChildActive: () => false,
    getActiveSection: () => 'overview',
    getActiveItem: () => null,
    navigateTo: vi.fn(),
    breadcrumbs: [],
  }),
}));

// ============================================================================
// 1. SidebarUser
// ============================================================================
import { SidebarUser } from '@/components/layout/sidebar/SidebarUser';

const defaultColors = {
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.85)',
  textSubtle: 'rgba(255,255,255,0.6)',
  textHover: '#FFFFFF',
  border: 'rgba(255,255,255,0.12)',
  borderAccent: 'rgba(255,255,255,0.25)',
  bgHover: 'rgba(255,255,255,0.1)',
  bgActive: 'rgba(255,255,255,0.18)',
  bgSubtle: 'rgba(255,255,255,0.12)',
  bgGradient: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
  overlayGradient: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 30%, rgba(0,0,0,0.2) 100%)',
  statusOnline: '#4ade80',
  statusOffline: '#f87171',
  statusSyncing: '#fbbf24',
};

describe('SidebarUser', () => {
  it('renders without crashing', () => {
    render(
      <SidebarUser
        name="Quynh Nguyen"
        role="Admin"
        initials="QN"
        isCollapsed={false}
        colors={defaultColors}
      />
    );
    expect(screen.getByText('QN')).toBeInTheDocument();
  });

  it('shows name, role, and initials when not collapsed', () => {
    render(
      <SidebarUser
        name="Quynh Nguyen"
        role="Admin"
        initials="QN"
        isCollapsed={false}
        colors={defaultColors}
      />
    );
    expect(screen.getByText('Quynh Nguyen')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('QN')).toBeInTheDocument();
  });

  it('only shows initials when collapsed (name and role hidden)', () => {
    render(
      <SidebarUser
        name="Quynh Nguyen"
        role="Admin"
        initials="QN"
        isCollapsed={true}
        colors={defaultColors}
      />
    );
    expect(screen.getByText('QN')).toBeInTheDocument();
    expect(screen.queryByText('Quynh Nguyen')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});

// ============================================================================
// 2. Sidebar
// ============================================================================
import { Sidebar } from '@/components/layout/sidebar/Sidebar';

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Sidebar />);
    // The brand name should be rendered
    expect(screen.getAllByText('Promo Master').length).toBeGreaterThanOrEqual(1);
  });

  it('displays brand name and subtitle', () => {
    render(<Sidebar />);
    // Desktop and mobile sidebars both render the brand
    expect(screen.getAllByText('Promo Master').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Suntory PepsiCo').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the SidebarUser with hardcoded user info', () => {
    render(<Sidebar />);
    // The Sidebar hardcodes initials="QN"
    expect(screen.getAllByText('QN').length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// 3. QuickSearch
// ============================================================================
import { QuickSearch } from '@/components/search/QuickSearch';

describe('QuickSearch', () => {
  it('renders search input and quick actions when open', () => {
    render(<QuickSearch open={true} onOpenChange={vi.fn()} />);
    // The search input placeholder
    expect(
      screen.getByPlaceholderText('Search pages, actions, promotions...')
    ).toBeInTheDocument();
    // Quick Actions section header
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('renders quick action items when open', () => {
    render(<QuickSearch open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByText('Create Promotion')).toBeInTheDocument();
    expect(screen.getByText('Create Budget')).toBeInTheDocument();
    expect(screen.getByText('View Calendar')).toBeInTheDocument();
    expect(screen.getByText('AI Suggestions')).toBeInTheDocument();
  });

  it('renders nothing visible when open is false', () => {
    const { container } = render(
      <QuickSearch open={false} onOpenChange={vi.fn()} />
    );
    // When dialog is closed, Radix does not render DialogContent into the DOM
    expect(screen.queryByText('Quick Actions')).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Search pages, actions, promotions...')
    ).not.toBeInTheDocument();
  });
});

// ============================================================================
// 4. VoiceButton
// ============================================================================
import { VoiceButton } from '@/components/voice/VoiceButton';

describe('VoiceButton', () => {
  it('renders a button (microphone icon)', () => {
    render(<VoiceButton onTranscript={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('renders disabled when disabled prop is true', () => {
    render(<VoiceButton onTranscript={vi.fn()} disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders with small size', () => {
    render(<VoiceButton onTranscript={vi.fn()} size="sm" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // The small size class should be applied
    expect(button.className).toContain('h-8');
    expect(button.className).toContain('w-8');
  });
});
