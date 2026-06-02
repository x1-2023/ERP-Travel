import { cn } from '@/lib/utils';
import type { SidebarColors, SmartBadge } from '@/config/sidebarConfig';
import { getBadgeColors } from '@/config/sidebarConfig';

// Legacy badge props (backwards compatibility)
interface LegacyBadgeProps {
  value: string | number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  colors: SidebarColors;
  isDark?: boolean;
}

// Smart badge props
interface SmartBadgeProps {
  badge: SmartBadge;
  colors: SidebarColors;
  isDark?: boolean;
}

// Legacy Badge Component (for backwards compatibility)
export function SidebarBadge({ value, variant = 'default', colors }: LegacyBadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: colors.statusOnline,
          color: '#ffffff',
        };
      case 'warning':
        return {
          backgroundColor: colors.statusSyncing,
          color: '#ffffff',
        };
      case 'danger':
        return {
          backgroundColor: colors.statusOffline,
          color: '#ffffff',
        };
      default:
        return {
          backgroundColor: colors.bgActive,
          color: colors.text,
        };
    }
  };

  return (
    <span
      className={cn(
        'px-1.5 py-0.5 text-[10px] font-semibold rounded',
        'shrink-0'
      )}
      style={getVariantStyles()}
    >
      {value}
    </span>
  );
}

// Smart Badge Component
export function SmartSidebarBadge({ badge, colors: _colors, isDark = false }: SmartBadgeProps) {
  const badgeColors = getBadgeColors(badge.variant, isDark);

  // Dot badge - small circle indicator
  if (badge.type === 'dot') {
    return (
      <span
        className={cn(
          'w-2 h-2 rounded-full shrink-0',
          badge.animate && 'animate-pulse'
        )}
        style={{ backgroundColor: badgeColors.text }}
      />
    );
  }

  // Pulse badge - animated dot with ring effect
  if (badge.type === 'pulse') {
    return (
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: badgeColors.text }}
        />
        <span
          className="relative inline-flex rounded-full h-2.5 w-2.5"
          style={{ backgroundColor: badgeColors.text }}
        />
      </span>
    );
  }

  // Text badge - label like "AI", "NEW", "BETA"
  if (badge.type === 'text') {
    return (
      <span
        className={cn(
          'px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wide',
          'shrink-0'
        )}
        style={{
          backgroundColor: badgeColors.bg,
          color: badgeColors.text,
        }}
      >
        {badge.value}
      </span>
    );
  }

  // Count badge - number display (default)
  return (
    <span
      className={cn(
        'px-1.5 py-0.5 text-[10px] font-semibold rounded min-w-[18px] text-center',
        'shrink-0'
      )}
      style={{
        backgroundColor: badgeColors.bg,
        color: badgeColors.text,
      }}
    >
      {badge.value}
    </span>
  );
}
