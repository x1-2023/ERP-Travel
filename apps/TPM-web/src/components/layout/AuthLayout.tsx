/**
 * Auth Layout - For login, register pages
 */

import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <img src="/logo.png" alt="Promo Master" className="mx-auto h-16 w-16 object-contain" />
          <h2 className="mt-4 text-2xl font-bold text-foreground">PROMO MASTER</h2>
          <p className="mt-1 text-sm text-foreground-muted">Trade Promotion Management System</p>
        </div>

        {/* Auth form */}
        <div className="bg-card py-8 px-6 shadow rounded-lg border border-surface-border">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
