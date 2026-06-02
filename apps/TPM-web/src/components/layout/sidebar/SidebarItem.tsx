import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SidebarBadge, SmartSidebarBadge } from './SidebarBadge';
import type { SidebarItem as SidebarItemType, SidebarColors } from '@/config/sidebarConfig';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarItemProps {
  item: SidebarItemType;
  isCollapsed: boolean;
  isActive: boolean;
  colors: SidebarColors;
  isDark?: boolean;
  language?: 'vi' | 'en';
  onNavigate?: () => void;
}

export function SidebarItem({
  item,
  isCollapsed,
  isActive,
  colors,
  isDark = false,
  language = 'vi',
  onNavigate,
}: SidebarItemProps) {
  const Icon = item.icon;
  // Get the title based on language
  const itemTitle = language === 'vi' && item.titleVi ? item.titleVi : item.title;

  const linkContent = (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center rounded transition-all duration-100',
        isCollapsed
          ? 'justify-center px-2 py-1.5'
          : 'gap-2.5 px-2.5 py-1.5 text-sm font-medium',
        item.isPrimary && !isActive && 'font-semibold'
      )}
      style={{
        backgroundColor: isActive ? colors.bgActive : 'transparent',
        color: isActive ? colors.text : colors.textMuted,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = colors.bgHover;
          e.currentTarget.style.color = colors.text;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = colors.textMuted;
        }
      }}
    >
      <Icon
        className={cn('shrink-0', isCollapsed ? 'h-[18px] w-[18px]' : 'h-4 w-4')}
        strokeWidth={1.75}
      />
      {!isCollapsed && (
        <>
          <div className="flex-1 min-w-0">
            <span className="block truncate">{itemTitle}</span>
            {item.sublabel && (
              <span
                className="block text-[10px] truncate opacity-60"
                style={{ color: colors.textSubtle }}
              >
                {item.sublabel}
              </span>
            )}
          </div>

          {/* Keyboard shortcut */}
          {item.shortcut && (
            <span
              className="text-[9px] font-mono px-1 py-0.5 rounded opacity-50 shrink-0"
              style={{ backgroundColor: colors.bgSubtle }}
            >
              {item.shortcut}
            </span>
          )}

          {/* Smart Badge (preferred) */}
          {item.smartBadge && (
            <SmartSidebarBadge
              badge={item.smartBadge}
              colors={colors}
              isDark={isDark}
            />
          )}

          {/* Legacy badge (fallback) */}
          {!item.smartBadge && item.badge !== undefined && (
            <SidebarBadge
              value={item.badge}
              variant={item.badgeVariant}
              colors={colors}
            />
          )}
        </>
      )}
    </Link>
  );

  // If collapsed or has enhanced tooltip, wrap with tooltip
  if (isCollapsed || item.tooltip) {
    return (
      <li>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
            <TooltipContent
              side={isCollapsed ? 'right' : 'top'}
              className="max-w-[250px]"
            >
              <div className="space-y-1">
                <p className="font-semibold text-sm">
                  {item.tooltip?.title || itemTitle}
                </p>
                {item.tooltip?.description && (
                  <p className="text-xs text-muted-foreground">
                    {item.tooltip.description}
                  </p>
                )}
                {item.tooltip?.features && item.tooltip.features.length > 0 && (
                  <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    {item.tooltip.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                )}
                {item.shortcut && !isCollapsed && (
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                    Shortcut: {item.shortcut}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </li>
    );
  }

  return <li>{linkContent}</li>;
}
