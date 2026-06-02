import { Outlet, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './Header';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

// Concentric Circles Background Pattern - Suntory PepsiCo Style
const ConcentricCirclesPattern = ({ isDark }: { isDark: boolean }) => {
  // Light theme: Dark green (matches sidebar), very subtle
  // Dark theme: Cyan (original)
  const strokeColor = isDark ? '#7DD3E8' : '#1B5E20';
  const strokeWidthLarge = 1.5;
  const strokeWidthMedium = 1;

  // Light theme: very low opacity (5-7%) to avoid distraction
  // Dark theme: keep original subtle opacity
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Top-right large circles */}
      <svg
        className="absolute -top-32 -right-32 w-[600px] h-[600px]"
        style={{ opacity: isDark ? 0.05 : 0.06 }}
        viewBox="0 0 400 400"
      >
        <circle cx="200" cy="200" r="190" fill="none" stroke={strokeColor} strokeWidth={strokeWidthLarge} />
        <circle cx="200" cy="200" r="160" fill="none" stroke={strokeColor} strokeWidth={strokeWidthLarge} />
        <circle cx="200" cy="200" r="130" fill="none" stroke={strokeColor} strokeWidth={strokeWidthLarge} />
        <circle cx="200" cy="200" r="100" fill="none" stroke={strokeColor} strokeWidth={strokeWidthLarge} />
        <circle cx="200" cy="200" r="70" fill="none" stroke={strokeColor} strokeWidth={strokeWidthLarge} />
        <circle cx="200" cy="200" r="40" fill="none" stroke={strokeColor} strokeWidth={strokeWidthLarge} />
      </svg>

      {/* Top-left medium circles */}
      <svg
        className="absolute -top-20 left-[20%] w-[400px] h-[400px]"
        style={{ opacity: isDark ? 0.03 : 0.05 }}
        viewBox="0 0 300 300"
      >
        <circle cx="150" cy="150" r="140" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
        <circle cx="150" cy="150" r="110" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
        <circle cx="150" cy="150" r="80" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
        <circle cx="150" cy="150" r="50" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
      </svg>

      {/* Center large circles */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]"
        style={{ opacity: isDark ? 0.04 : 0.05 }}
        viewBox="0 0 400 400"
      >
        <circle cx="200" cy="200" r="195" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
        <circle cx="200" cy="200" r="165" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
        <circle cx="200" cy="200" r="135" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
        <circle cx="200" cy="200" r="105" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
        <circle cx="200" cy="200" r="75" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
        <circle cx="200" cy="200" r="45" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
      </svg>

      {/* Bottom-left circles */}
      <svg
        className="absolute -bottom-48 -left-32 w-[650px] h-[650px]"
        style={{ opacity: isDark ? 0.045 : 0.06 }}
        viewBox="0 0 400 400"
      >
        <circle cx="200" cy="200" r="190" fill="none" stroke={strokeColor} strokeWidth={strokeWidthLarge} />
        <circle cx="200" cy="200" r="155" fill="none" stroke={strokeColor} strokeWidth={strokeWidthLarge} />
        <circle cx="200" cy="200" r="120" fill="none" stroke={strokeColor} strokeWidth={strokeWidthLarge} />
        <circle cx="200" cy="200" r="85" fill="none" stroke={strokeColor} strokeWidth={strokeWidthLarge} />
        <circle cx="200" cy="200" r="50" fill="none" stroke={strokeColor} strokeWidth={strokeWidthLarge} />
      </svg>

      {/* Bottom-right circles */}
      <svg
        className="absolute -bottom-20 right-[15%] w-[450px] h-[450px]"
        style={{ opacity: isDark ? 0.04 : 0.05 }}
        viewBox="0 0 300 300"
      >
        <circle cx="150" cy="150" r="145" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
        <circle cx="150" cy="150" r="115" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
        <circle cx="150" cy="150" r="85" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
        <circle cx="150" cy="150" r="55" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
        <circle cx="150" cy="150" r="25" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
      </svg>

      {/* Right-center small circles */}
      <svg
        className="absolute top-1/3 -right-16 w-[380px] h-[380px]"
        style={{ opacity: isDark ? 0.045 : 0.06 }}
        viewBox="0 0 200 200"
      >
        <circle cx="100" cy="100" r="95" fill="none" stroke={strokeColor} strokeWidth={strokeWidthLarge} />
        <circle cx="100" cy="100" r="70" fill="none" stroke={strokeColor} strokeWidth={strokeWidthLarge} />
        <circle cx="100" cy="100" r="45" fill="none" stroke={strokeColor} strokeWidth={strokeWidthLarge} />
        <circle cx="100" cy="100" r="20" fill="none" stroke={strokeColor} strokeWidth={strokeWidthLarge} />
      </svg>

      {/* Left-center circles */}
      <svg
        className="absolute top-[60%] -left-24 w-[400px] h-[400px]"
        style={{ opacity: isDark ? 0.03 : 0.04 }}
        viewBox="0 0 250 250"
      >
        <circle cx="125" cy="125" r="120" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
        <circle cx="125" cy="125" r="90" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
        <circle cx="125" cy="125" r="60" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
        <circle cx="125" cy="125" r="30" fill="none" stroke={strokeColor} strokeWidth={strokeWidthMedium} />
      </svg>
    </div>
  );
};

export default function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { sidebarOpen, theme } = useUIStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // sidebarOpen = true means expanded, false means collapsed
  const sidebarCollapsed = !sidebarOpen;
  const isDark = theme === 'dark';

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-foreground-muted">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Concentric Circles Background Pattern */}
      <ConcentricCirclesPattern isDark={isDark} />

      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Header */}
      <Header onMobileMenuClick={() => setMobileSidebarOpen(true)} />

      {/* Main Content */}
      <main
        className={cn(
          'pt-12 min-h-screen relative z-10',
          'transition-all duration-200',
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
