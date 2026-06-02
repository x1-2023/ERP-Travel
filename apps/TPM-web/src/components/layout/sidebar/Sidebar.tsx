import { ChevronLeft, ChevronRight, X, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import {
  sidebarConfig,
  getSidebarColors,
  getSidebarBgColor,
} from '@/config/sidebarConfig';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import { useNavigation } from '@/hooks/useNavigation';
import { SidebarSection } from './SidebarSection';
import { SidebarUser } from './SidebarUser';

// ============================================================================
// WAVE PATTERN SVG - Theme-aware background
// ============================================================================
const WavePattern = ({ isDark: _isDark }: { isDark: boolean }) => {
  // Both themes now use white strokes
  const strokeColor = 'white';
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity: 0.06 }}
    >
      <defs>
        <pattern
          id="wave-pattern"
          x="0"
          y="0"
          width="120"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 12 Q 30 4, 60 12 T 120 12"
            fill="none"
            stroke={strokeColor}
            strokeWidth={1}
          />
          <path
            d="M0 20 Q 30 12, 60 20 T 120 20"
            fill="none"
            stroke={strokeColor}
            strokeWidth={0.5}
            opacity={0.5}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wave-pattern)" />
    </svg>
  );
};

// ============================================================================
// STATUS SECTION
// ============================================================================
interface StatusSectionProps {
  colors: ReturnType<typeof getSidebarColors>;
  language: 'vi' | 'en';
}

const StatusSection = ({ colors, language }: StatusSectionProps) => {
  const statusItems = sidebarConfig.footer.statusItems || [];

  const getStatusColor = (status: 'online' | 'offline' | 'syncing') => {
    switch (status) {
      case 'online':
        return colors.statusOnline;
      case 'offline':
        return colors.statusOffline;
      case 'syncing':
        return colors.statusSyncing;
    }
  };

  const getStatusText = (status: 'online' | 'offline' | 'syncing') => {
    switch (status) {
      case 'online':
        return language === 'vi' ? 'Trực tuyến' : 'Online';
      case 'offline':
        return language === 'vi' ? 'Ngoại tuyến' : 'Offline';
      case 'syncing':
        return language === 'vi' ? 'Đang đồng bộ' : 'Syncing';
    }
  };

  return (
    <div
      className="relative z-10 px-3 py-2"
      style={{ borderTop: `1px solid ${colors.border}` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Activity
          className="h-4 w-4"
          strokeWidth={1.75}
          style={{ color: colors.textSubtle }}
        />
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: colors.textSubtle }}
        >
          {language === 'vi' ? 'Trạng thái' : 'Status'}
        </span>
      </div>
      <div className="space-y-1">
        {statusItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: colors.textMuted }}>
              {item.label}
            </span>
            <div className="flex items-center gap-1">
              {item.status !== 'syncing' && (
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getStatusColor(item.status) }}
                />
              )}
              <span
                className={cn(
                  'text-[11px] font-medium',
                  item.status === 'syncing' && 'font-mono'
                )}
                style={{ color: item.value ? colors.textSubtle : getStatusColor(item.status) }}
              >
                {item.value || getStatusText(item.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN SIDEBAR COMPONENT
// ============================================================================
interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const { sidebarOpen, toggleSidebar, theme, language } = useUIStore();
  const { toggleSection, isSectionExpanded } = useSidebarCollapse();
  const { isActive } = useNavigation();

  const isDark = theme === 'dark';
  const colors = getSidebarColors(isDark);
  const sidebarBgColor = getSidebarBgColor(isDark);
  const sidebarCollapsed = !sidebarOpen;

  const { brand, sections, footer } = sidebarConfig;
  // brand.icon is used in collapsed/expanded modes below

  const sidebarContent = (
    <>
      {/* Wave Pattern Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <WavePattern isDark={isDark} />
        <div
          className="absolute inset-0"
          style={{ background: colors.overlayGradient }}
        />
      </div>

      {/* Header - Logo & Brand */}
      <div
        className="relative z-10 h-12 flex items-center justify-between px-3"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        {!sidebarCollapsed ? (
          <>
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <img src="/logo.png" alt="" className="h-7 w-7 shrink-0 object-contain" />
              <div className="flex flex-col min-w-0">
                <span
                  className="text-xs font-semibold tracking-tight"
                  style={{ color: colors.text }}
                >
                  {brand.name}
                </span>
                <span
                  className="text-[9px] uppercase tracking-wider"
                  style={{ color: colors.textSubtle }}
                >
                  {brand.subtitle}
                </span>
              </div>
            </div>
            {/* Collapse button - Desktop only */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors"
              style={{ color: colors.textMuted }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.bgSubtle;
                e.currentTarget.style.color = colors.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.textMuted;
              }}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            {/* Mobile close button */}
            {onMobileClose && (
              <button
                className="lg:hidden p-1.5 rounded"
                style={{ color: colors.textMuted }}
                onClick={onMobileClose}
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="flex h-7 w-7 items-center justify-center rounded mx-auto transition-opacity"
            style={{ backgroundColor: colors.bgSubtle }}
          >
            <ChevronRight
              className="h-4 w-4"
              style={{ color: colors.text }}
              strokeWidth={1.75}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 overflow-y-auto py-2 px-2 scrollbar-hide">
        {sections.map((section, idx) => (
          <div key={section.id} className={idx > 0 ? 'mt-3' : ''}>
            <SidebarSection
              section={section}
              isExpanded={isSectionExpanded(section.id)}
              isCollapsed={sidebarCollapsed}
              colors={colors}
              isDark={isDark}
              language={language}
              onToggle={() => toggleSection(section.id)}
              isItemActive={isActive}
              onNavigate={onMobileClose}
            />
          </div>
        ))}
      </nav>

      {/* System Status */}
      {!sidebarCollapsed && footer.showStatus && <StatusSection colors={colors} language={language} />}

      {/* User Section */}
      <SidebarUser
        name="Quỳnh Nguyễn"
        role="Admin"
        initials="QN"
        isCollapsed={sidebarCollapsed}
        colors={colors}
      />
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen hidden lg:flex flex-col',
          'transition-all duration-200 ease-in-out'
        )}
        style={{
          width: sidebarCollapsed ? 64 : 256,
          backgroundColor: sidebarBgColor,
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 flex flex-col lg:hidden',
          'transition-transform duration-300'
        )}
        style={{
          backgroundColor: sidebarBgColor,
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}
    </>
  );
}
