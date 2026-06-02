// ══════════════════════════════════════════════════════════════════════════════
//                    PROMO MASTER - SHARED TYPES & UTILITIES
// ══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// STATUS ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type PromotionStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export type ClaimStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID';

export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'USER';

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTITY TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: PromotionStatus;
  budget: number;
  actualSpend: number;
  startDate: string;
  endDate: string;
  customerId?: string;
  fundId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: string;
  code: string;
  promotionId: string;
  claimAmount: number;
  status: ClaimStatus;
  description?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Fund {
  id: string;
  code: string;
  name: string;
  totalBudget: number;
  allocatedBudget: number;
  usedBudget: number;
  availableBudget: number;
  fiscalYear: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  channel: string;
  region?: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalPromotions: number;
  activePromotions: number;
  totalBudget: number;
  usedBudget: number;
  budgetUtilization: number;
  pendingClaims: number;
  pendingClaimsAmount: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface SpendTrendData {
  month: string;
  budget: number;
  actual: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number, locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, locale = 'vi-VN'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function calculateUtilization(used: number, total: number): number {
  if (total === 0) return 0;
  return (used / total) * 100;
}
