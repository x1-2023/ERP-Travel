import type { SidebarColors } from '@/config/sidebarConfig';

interface SidebarUserProps {
  name: string;
  role: string;
  initials: string;
  isCollapsed: boolean;
  colors: SidebarColors;
}

export function SidebarUser({
  name,
  role,
  initials,
  isCollapsed,
  colors,
}: SidebarUserProps) {
  return (
    <div
      className="relative z-10 flex items-center gap-2 px-3 py-2"
      style={{
        borderTop: `1px solid ${colors.border}`,
        justifyContent: isCollapsed ? 'center' : 'flex-start',
      }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
        style={{ backgroundColor: colors.bgSubtle, color: colors.text }}
      >
        {initials}
      </div>
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <div
            className="text-xs font-semibold truncate"
            style={{ color: colors.text }}
          >
            {name}
          </div>
          <div className="text-[10px]" style={{ color: colors.textSubtle }}>
            {role}
          </div>
        </div>
      )}
    </div>
  );
}
