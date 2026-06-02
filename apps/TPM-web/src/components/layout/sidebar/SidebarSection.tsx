import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarItem } from './SidebarItem';
import { SmartSidebarBadge } from './SidebarBadge';
import type { SidebarSection as SidebarSectionType, SidebarColors } from '@/config/sidebarConfig';

interface SidebarSectionProps {
  section: SidebarSectionType;
  isExpanded: boolean;
  isCollapsed: boolean;
  colors: SidebarColors;
  isDark?: boolean;
  language?: 'vi' | 'en';
  onToggle: () => void;
  isItemActive: (href: string) => boolean;
  onNavigate?: () => void;
}

export function SidebarSection({
  section,
  isExpanded,
  isCollapsed,
  colors,
  isDark = false,
  language = 'vi',
  onToggle,
  isItemActive,
  onNavigate,
}: SidebarSectionProps) {
  // Get the title based on language
  const sectionTitle = language === 'en' && section.titleEn ? section.titleEn : section.title;

  return (
    <div>
      {/* Section Header - Hidden when collapsed */}
      {!isCollapsed && (
        <button
          onClick={onToggle}
          className={cn(
            'flex w-full items-center justify-between px-2.5 py-1.5 mb-1 rounded',
            'text-[11px] font-semibold uppercase tracking-wide',
            'transition-all duration-150'
          )}
          style={{
            color: colors.textMuted,
            background: colors.bgGradient,
            borderLeft: `2px solid ${colors.borderAccent}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.text;
            e.currentTarget.style.borderLeftColor = colors.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.textMuted;
            e.currentTarget.style.borderLeftColor = colors.borderAccent;
          }}
        >
          <span className="flex items-center gap-2">
            {sectionTitle}
            {section.sectionBadge && (
              <SmartSidebarBadge
                badge={section.sectionBadge}
                colors={colors}
                isDark={isDark}
              />
            )}
          </span>
          <ChevronDown
            className={cn(
              'h-3 w-3 transition-transform duration-150',
              isExpanded ? 'rotate-0' : '-rotate-90'
            )}
            strokeWidth={1.75}
          />
        </button>
      )}

      {/* Section Items */}
      {(isExpanded || isCollapsed) && (
        <ul className="mt-0.5 space-y-0">
          {section.items.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              isActive={isItemActive(item.href)}
              colors={colors}
              isDark={isDark}
              language={language}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
