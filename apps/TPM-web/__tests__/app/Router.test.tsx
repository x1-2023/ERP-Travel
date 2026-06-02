/**
 * Router Tests
 * Tests for src/router.tsx - the app router with lazy-loaded routes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import AppRouter from '@/router';

// Mock all lazy-loaded page components as simple stubs
const createPageMock = (name: string) => {
  const Component = () => <div data-testid={`page-${name}`}>{name} Page</div>;
  Component.displayName = name;
  return Component;
};

// Auth pages
vi.mock('@/pages/auth/Login', () => ({ default: createPageMock('Login') }));
vi.mock('@/pages/auth/Register', () => ({ default: createPageMock('Register') }));
vi.mock('@/pages/auth/ForgotPassword', () => ({ default: createPageMock('ForgotPassword') }));

// Dashboard
vi.mock('@/pages/dashboard/Dashboard', () => ({ default: createPageMock('Dashboard') }));

// Promotions
vi.mock('@/pages/promotions/PromotionList', () => ({ default: createPageMock('PromotionList') }));
vi.mock('@/pages/promotions/PromotionDetail', () => ({ default: createPageMock('PromotionDetail') }));
vi.mock('@/pages/promotions/PromotionNew', () => ({ default: createPageMock('PromotionNew') }));
vi.mock('@/pages/promotions/PromotionEdit', () => ({ default: createPageMock('PromotionEdit') }));
vi.mock('@/pages/promotions/Efficiency', () => ({ default: createPageMock('PromotionEfficiency') }));
vi.mock('@/pages/promotions/Deployment', () => ({ default: createPageMock('PromotionDeployment') }));
vi.mock('@/pages/promotions/Mechanics', () => ({ default: createPageMock('PromotionMechanics') }));

// Claims
vi.mock('@/pages/claims/ClaimList', () => ({ default: createPageMock('ClaimList') }));
vi.mock('@/pages/claims/ClaimDetail', () => ({ default: createPageMock('ClaimDetail') }));
vi.mock('@/pages/claims/ClaimNew', () => ({ default: createPageMock('ClaimNew') }));
vi.mock('@/pages/claims/Settlement', () => ({ default: createPageMock('ClaimSettlement') }));
vi.mock('@/pages/claims/Payment', () => ({ default: createPageMock('ClaimsPayment') }));

// Funds
vi.mock('@/pages/funds/FundList', () => ({ default: createPageMock('FundList') }));
vi.mock('@/pages/funds/FundDetail', () => ({ default: createPageMock('FundDetail') }));
vi.mock('@/pages/funds/FundNew', () => ({ default: createPageMock('FundNew') }));
vi.mock('@/pages/funds/FundEdit', () => ({ default: createPageMock('FundEdit') }));

// Customers / Products
vi.mock('@/pages/customers/CustomerList', () => ({ default: createPageMock('CustomerList') }));
vi.mock('@/pages/customers/CustomerDetail', () => ({ default: createPageMock('CustomerDetail') }));
vi.mock('@/pages/products/ProductList', () => ({ default: createPageMock('ProductList') }));
vi.mock('@/pages/products/ProductDetail', () => ({ default: createPageMock('ProductDetail') }));

// Reports / Settings
vi.mock('@/pages/reports/ReportList', () => ({ default: createPageMock('ReportList') }));
vi.mock('@/pages/reports/WeeklyKPI', () => ({ default: createPageMock('WeeklyKPI') }));
vi.mock('@/pages/settings/Settings', () => ({ default: createPageMock('Settings') }));

// Analytics / Budgets
vi.mock('@/pages/analytics/Analytics', () => ({ default: createPageMock('Analytics') }));
vi.mock('@/pages/budgets/BudgetList', () => ({ default: createPageMock('BudgetList') }));
vi.mock('@/pages/budgets/BudgetNew', () => ({ default: createPageMock('BudgetNew') }));
vi.mock('@/pages/budgets/BudgetAllocation', () => ({ default: createPageMock('BudgetAllocation') }));

// Budget Management
vi.mock('@/pages/budget/Overview', () => ({ default: createPageMock('BudgetOverview') }));
vi.mock('@/pages/budget/Definition', () => ({ default: createPageMock('BudgetDefinition') }));
vi.mock('@/pages/budget/Monitoring', () => ({ default: createPageMock('BudgetMonitoring') }));
vi.mock('@/pages/budget/Approval', () => ({ default: createPageMock('BudgetApproval') }));
vi.mock('@/pages/budget/Allocation', () => ({ default: createPageMock('BudgetAllocationNew') }));

// Calendar / Targets / Baselines
vi.mock('@/pages/calendar/CalendarView', () => ({ default: createPageMock('CalendarView') }));
vi.mock('@/pages/targets/TargetList', () => ({ default: createPageMock('TargetList') }));
vi.mock('@/pages/targets/TargetNew', () => ({ default: createPageMock('TargetNew') }));
vi.mock('@/pages/targets/TargetAllocation', () => ({ default: createPageMock('TargetAllocation') }));
vi.mock('@/pages/baselines/BaselineList', () => ({ default: createPageMock('BaselineList') }));
vi.mock('@/pages/baselines/BaselineNew', () => ({ default: createPageMock('BaselineNew') }));

// Finance pages
vi.mock('@/pages/finance/accruals/AccrualList', () => ({ default: createPageMock('AccrualList') }));
vi.mock('@/pages/finance/accruals/AccrualDetail', () => ({ default: createPageMock('AccrualDetail') }));
vi.mock('@/pages/finance/accruals/AccrualCalculate', () => ({ default: createPageMock('AccrualCalculate') }));
vi.mock('@/pages/finance/deductions/DeductionList', () => ({ default: createPageMock('DeductionList') }));
vi.mock('@/pages/finance/deductions/DeductionDetail', () => ({ default: createPageMock('DeductionDetail') }));
vi.mock('@/pages/finance/deductions/DeductionMatching', () => ({ default: createPageMock('DeductionMatching') }));
vi.mock('@/pages/finance/journals/JournalList', () => ({ default: createPageMock('JournalList') }));
vi.mock('@/pages/finance/journals/JournalDetail', () => ({ default: createPageMock('JournalDetail') }));
vi.mock('@/pages/finance/cheques/ChequeList', () => ({ default: createPageMock('ChequeList') }));
vi.mock('@/pages/finance/cheques/ChequeDetail', () => ({ default: createPageMock('ChequeDetail') }));

// Planning pages
vi.mock('@/pages/planning/templates/TemplateList', () => ({ default: createPageMock('TemplateList') }));
vi.mock('@/pages/planning/templates/TemplateDetail', () => ({ default: createPageMock('TemplateDetail') }));
vi.mock('@/pages/planning/templates/TemplateBuilder', () => ({ default: createPageMock('TemplateBuilder') }));
vi.mock('@/pages/planning/scenarios/ScenarioList', () => ({ default: createPageMock('ScenarioList') }));
vi.mock('@/pages/planning/scenarios/ScenarioDetail', () => ({ default: createPageMock('ScenarioDetail') }));
vi.mock('@/pages/planning/scenarios/ScenarioBuilder', () => ({ default: createPageMock('ScenarioBuilder') }));
vi.mock('@/pages/planning/scenarios/ScenarioCompare', () => ({ default: createPageMock('ScenarioCompare') }));
vi.mock('@/pages/planning/clashes/ClashList', () => ({ default: createPageMock('ClashList') }));
vi.mock('@/pages/planning/clashes/ClashDetail', () => ({ default: createPageMock('ClashDetail') }));
vi.mock('@/pages/planning/TPO', () => ({ default: createPageMock('PlanningTPO') }));

// Execution pages
vi.mock('@/pages/execution/PSPBudget', () => ({ default: createPageMock('ExecutionPSPBudget') }));
vi.mock('@/pages/execution/Spending', () => ({ default: createPageMock('ExecutionSpending') }));
vi.mock('@/pages/execution/Reallocation', () => ({ default: createPageMock('ExecutionReallocation') }));

// Operations pages
vi.mock('@/pages/operations/delivery/DeliveryList', () => ({ default: createPageMock('DeliveryList') }));
vi.mock('@/pages/operations/delivery/DeliveryDetail', () => ({ default: createPageMock('DeliveryDetail') }));
vi.mock('@/pages/operations/delivery/DeliveryNew', () => ({ default: createPageMock('DeliveryNew') }));
vi.mock('@/pages/operations/delivery/DeliveryCalendarPage', () => ({ default: createPageMock('DeliveryCalendarPage') }));
vi.mock('@/pages/operations/sell-tracking/SellTrackingList', () => ({ default: createPageMock('SellTrackingList') }));
vi.mock('@/pages/operations/sell-tracking/SellTrackingNew', () => ({ default: createPageMock('SellTrackingNew') }));
vi.mock('@/pages/operations/sell-tracking/SellTrackingImport', () => ({ default: createPageMock('SellTrackingImport') }));
vi.mock('@/pages/operations/sell-tracking/SellInPage', () => ({ default: createPageMock('SellInPage') }));
vi.mock('@/pages/operations/sell-tracking/SellOutPage', () => ({ default: createPageMock('SellOutPage') }));
vi.mock('@/pages/operations/inventory/InventoryList', () => ({ default: createPageMock('InventoryList') }));
vi.mock('@/pages/operations/inventory/InventoryNew', () => ({ default: createPageMock('InventoryNew') }));
vi.mock('@/pages/operations/inventory/InventoryImport', () => ({ default: createPageMock('InventoryImport') }));
vi.mock('@/pages/operations/inventory/InventoryDetail', () => ({ default: createPageMock('InventoryDetail') }));
vi.mock('@/pages/operations/inventory/InventorySnapshots', () => ({ default: createPageMock('InventorySnapshots') }));

// Integration pages
vi.mock('@/pages/integration/IntegrationDashboard', () => ({ default: createPageMock('IntegrationDashboard') }));
vi.mock('@/pages/integration/erp/ERPList', () => ({ default: createPageMock('ERPList') }));
vi.mock('@/pages/integration/erp/ERPDetail', () => ({ default: createPageMock('ERPDetail') }));
vi.mock('@/pages/integration/dms/DMSList', () => ({ default: createPageMock('DMSList') }));
vi.mock('@/pages/integration/dms/DMSDetail', () => ({ default: createPageMock('DMSDetail') }));
vi.mock('@/pages/integration/webhooks/WebhookList', () => ({ default: createPageMock('WebhookList') }));
vi.mock('@/pages/integration/webhooks/WebhookDetail', () => ({ default: createPageMock('WebhookDetail') }));
vi.mock('@/pages/integration/security/SecurityDashboard', () => ({ default: createPageMock('SecurityDashboard') }));
vi.mock('@/pages/integration/security/APIKeysList', () => ({ default: createPageMock('APIKeysList') }));
vi.mock('@/pages/integration/security/AuditLogsList', () => ({ default: createPageMock('AuditLogsList') }));

// AI pages
vi.mock('@/pages/ai/AIDashboard', () => ({ default: createPageMock('AIDashboard') }));
vi.mock('@/pages/ai/InsightsList', () => ({ default: createPageMock('InsightsList') }));
vi.mock('@/pages/ai/RecommendationsList', () => ({ default: createPageMock('RecommendationsList') }));
vi.mock('@/pages/ai/Suggestions', () => ({ default: createPageMock('AISuggestions') }));
vi.mock('@/pages/ai/ClaimsAI', () => ({ default: createPageMock('ClaimsAI') }));

// Pepsi V3 pages
vi.mock('@/pages/contracts/ContractList', () => ({ default: createPageMock('ContractList') }));
vi.mock('@/pages/contracts/ContractDetail', () => ({ default: createPageMock('ContractDetail') }));
vi.mock('@/pages/contracts/ContractCreate', () => ({ default: createPageMock('ContractCreate') }));
vi.mock('@/pages/monitoring/LiveDashboard', () => ({ default: createPageMock('LiveDashboard') }));
vi.mock('@/pages/monitoring/Alerts', () => ({ default: createPageMock('AlertsPage') }));

// Voice pages
vi.mock('@/pages/voice/VoiceCommandCenter', () => ({ default: createPageMock('VoiceCommandCenter') }));

// BI pages
vi.mock('@/pages/bi/BIDashboard', () => ({ default: createPageMock('BIDashboard') }));
vi.mock('@/pages/bi/ReportBuilder', () => ({ default: createPageMock('ReportBuilder') }));
vi.mock('@/pages/bi/AnalyticsDashboard', () => ({ default: createPageMock('AnalyticsDashboard') }));
vi.mock('@/pages/bi/ExportCenter', () => ({ default: createPageMock('ExportCenter') }));

// Analysis pages
vi.mock('@/pages/analysis/ROI', () => ({ default: createPageMock('AnalysisROI') }));
vi.mock('@/pages/analysis/Efficiency', () => ({ default: createPageMock('AnalysisEfficiency') }));
vi.mock('@/pages/analysis/WhatIf', () => ({ default: createPageMock('AnalysisWhatIf') }));

// Error pages
vi.mock('@/pages/errors/NotFound', () => ({ default: createPageMock('NotFound') }));

// Mock layouts
vi.mock('@/components/layout/DashboardLayout', () => {
  const { Outlet } = require('react-router-dom');
  return { default: () => <div data-testid="dashboard-layout"><Outlet /></div> };
});

vi.mock('@/components/layout/AuthLayout', () => {
  const { Outlet } = require('react-router-dom');
  return { default: () => <div data-testid="auth-layout"><Outlet /></div> };
});

// Mock ProtectedRoute - let it pass through by default
const mockIsAuthenticated = vi.fn(() => true);
const mockFetchUser = vi.fn();

vi.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => {
    if (!mockIsAuthenticated()) {
      const { Navigate } = require('react-router-dom');
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  },
}));

// Mock LoadingSpinner
vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: ({ fullScreen }: { fullScreen?: boolean }) => (
    <div data-testid="loading-spinner">{fullScreen ? 'Loading...' : 'Loading'}</div>
  ),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

function renderWithRouter(initialEntries: string[] = ['/']) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <AppRouter />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AppRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated.mockReturnValue(true);
  });

  describe('Public routes', () => {
    it('renders Login page at /login', async () => {
      mockIsAuthenticated.mockReturnValue(false);
      renderWithRouter(['/login']);

      await waitFor(() => {
        expect(screen.getByTestId('page-Login')).toBeInTheDocument();
      });
    });

    it('renders Register page at /register', async () => {
      mockIsAuthenticated.mockReturnValue(false);
      renderWithRouter(['/register']);

      await waitFor(() => {
        expect(screen.getByTestId('page-Register')).toBeInTheDocument();
      });
    });

    it('renders ForgotPassword page at /forgot-password', async () => {
      mockIsAuthenticated.mockReturnValue(false);
      renderWithRouter(['/forgot-password']);

      await waitFor(() => {
        expect(screen.getByTestId('page-ForgotPassword')).toBeInTheDocument();
      });
    });

    it('wraps public routes in AuthLayout', async () => {
      mockIsAuthenticated.mockReturnValue(false);
      renderWithRouter(['/login']);

      await waitFor(() => {
        expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
      });
    });
  });

  describe('Protected routes - Dashboard', () => {
    it('renders Dashboard at /dashboard', async () => {
      renderWithRouter(['/dashboard']);

      await waitFor(() => {
        expect(screen.getByTestId('page-Dashboard')).toBeInTheDocument();
      });
    });

    it('redirects / to /dashboard', async () => {
      renderWithRouter(['/']);

      await waitFor(() => {
        expect(screen.getByTestId('page-Dashboard')).toBeInTheDocument();
      });
    });

    it('wraps protected routes in DashboardLayout', async () => {
      renderWithRouter(['/dashboard']);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
      });
    });
  });

  describe('Protected routes - Promotions', () => {
    it('renders PromotionList at /promotions', async () => {
      renderWithRouter(['/promotions']);

      await waitFor(() => {
        expect(screen.getByTestId('page-PromotionList')).toBeInTheDocument();
      });
    });

    it('renders PromotionNew at /promotions/new', async () => {
      renderWithRouter(['/promotions/new']);

      await waitFor(() => {
        expect(screen.getByTestId('page-PromotionNew')).toBeInTheDocument();
      });
    });

    it('renders PromotionDetail at /promotions/:id', async () => {
      renderWithRouter(['/promotions/123']);

      await waitFor(() => {
        expect(screen.getByTestId('page-PromotionDetail')).toBeInTheDocument();
      });
    });

    it('renders PromotionEfficiency at /promotions/efficiency', async () => {
      renderWithRouter(['/promotions/efficiency']);

      await waitFor(() => {
        expect(screen.getByTestId('page-PromotionEfficiency')).toBeInTheDocument();
      });
    });
  });

  describe('Protected routes - Claims', () => {
    it('renders ClaimList at /claims', async () => {
      renderWithRouter(['/claims']);

      await waitFor(() => {
        expect(screen.getByTestId('page-ClaimList')).toBeInTheDocument();
      });
    });

    it('renders ClaimNew at /claims/new', async () => {
      renderWithRouter(['/claims/new']);

      await waitFor(() => {
        expect(screen.getByTestId('page-ClaimNew')).toBeInTheDocument();
      });
    });

    it('renders ClaimsPayment at /claims/payment', async () => {
      renderWithRouter(['/claims/payment']);

      await waitFor(() => {
        expect(screen.getByTestId('page-ClaimsPayment')).toBeInTheDocument();
      });
    });
  });

  describe('Protected routes - Funds', () => {
    it('renders FundList at /funds', async () => {
      renderWithRouter(['/funds']);

      await waitFor(() => {
        expect(screen.getByTestId('page-FundList')).toBeInTheDocument();
      });
    });
  });

  describe('Protected routes - Finance', () => {
    it('renders AccrualList at /finance/accruals', async () => {
      renderWithRouter(['/finance/accruals']);

      await waitFor(() => {
        expect(screen.getByTestId('page-AccrualList')).toBeInTheDocument();
      });
    });

    it('renders DeductionList at /finance/deductions', async () => {
      renderWithRouter(['/finance/deductions']);

      await waitFor(() => {
        expect(screen.getByTestId('page-DeductionList')).toBeInTheDocument();
      });
    });

    it('renders JournalList at /finance/journals', async () => {
      renderWithRouter(['/finance/journals']);

      await waitFor(() => {
        expect(screen.getByTestId('page-JournalList')).toBeInTheDocument();
      });
    });

    it('renders ChequeList at /finance/cheques', async () => {
      renderWithRouter(['/finance/cheques']);

      await waitFor(() => {
        expect(screen.getByTestId('page-ChequeList')).toBeInTheDocument();
      });
    });
  });

  describe('Protected routes - Planning', () => {
    it('renders TemplateList at /planning/templates', async () => {
      renderWithRouter(['/planning/templates']);

      await waitFor(() => {
        expect(screen.getByTestId('page-TemplateList')).toBeInTheDocument();
      });
    });

    it('renders ScenarioList at /planning/scenarios', async () => {
      renderWithRouter(['/planning/scenarios']);

      await waitFor(() => {
        expect(screen.getByTestId('page-ScenarioList')).toBeInTheDocument();
      });
    });

    it('renders PlanningTPO at /planning/tpo', async () => {
      renderWithRouter(['/planning/tpo']);

      await waitFor(() => {
        expect(screen.getByTestId('page-PlanningTPO')).toBeInTheDocument();
      });
    });
  });

  describe('Protected routes - AI', () => {
    it('renders AIDashboard at /ai', async () => {
      renderWithRouter(['/ai']);

      await waitFor(() => {
        expect(screen.getByTestId('page-AIDashboard')).toBeInTheDocument();
      });
    });

    it('renders AISuggestions at /ai/suggestions', async () => {
      renderWithRouter(['/ai/suggestions']);

      await waitFor(() => {
        expect(screen.getByTestId('page-AISuggestions')).toBeInTheDocument();
      });
    });
  });

  describe('Protected routes - Contracts (Pepsi V3)', () => {
    it('renders ContractList at /contracts', async () => {
      renderWithRouter(['/contracts']);

      await waitFor(() => {
        expect(screen.getByTestId('page-ContractList')).toBeInTheDocument();
      });
    });

    it('renders ContractCreate at /contracts/create', async () => {
      renderWithRouter(['/contracts/create']);

      await waitFor(() => {
        expect(screen.getByTestId('page-ContractCreate')).toBeInTheDocument();
      });
    });
  });

  describe('Protected routes - Monitoring (Pepsi V3)', () => {
    it('renders LiveDashboard at /monitoring/live', async () => {
      renderWithRouter(['/monitoring/live']);

      await waitFor(() => {
        expect(screen.getByTestId('page-LiveDashboard')).toBeInTheDocument();
      });
    });

    it('renders AlertsPage at /monitoring/alerts', async () => {
      renderWithRouter(['/monitoring/alerts']);

      await waitFor(() => {
        expect(screen.getByTestId('page-AlertsPage')).toBeInTheDocument();
      });
    });
  });

  describe('Protected routes - Voice', () => {
    it('renders VoiceCommandCenter at /voice', async () => {
      renderWithRouter(['/voice']);

      await waitFor(() => {
        expect(screen.getByTestId('page-VoiceCommandCenter')).toBeInTheDocument();
      });
    });
  });

  describe('Protected routes - BI', () => {
    it('renders BIDashboard at /bi', async () => {
      renderWithRouter(['/bi']);

      await waitFor(() => {
        expect(screen.getByTestId('page-BIDashboard')).toBeInTheDocument();
      });
    });

    it('renders ReportBuilder at /bi/reports', async () => {
      renderWithRouter(['/bi/reports']);

      await waitFor(() => {
        expect(screen.getByTestId('page-ReportBuilder')).toBeInTheDocument();
      });
    });
  });

  describe('Protected routes - Settings', () => {
    it('renders Settings at /settings', async () => {
      renderWithRouter(['/settings']);

      await waitFor(() => {
        expect(screen.getByTestId('page-Settings')).toBeInTheDocument();
      });
    });
  });

  describe('Protected route behavior', () => {
    it('redirects unauthenticated users to /login for protected routes', async () => {
      mockIsAuthenticated.mockReturnValue(false);
      renderWithRouter(['/dashboard']);

      await waitFor(() => {
        expect(screen.getByTestId('page-Login')).toBeInTheDocument();
      });
    });
  });

  describe('404 Not Found', () => {
    it('renders NotFound page for unknown routes', async () => {
      renderWithRouter(['/this-does-not-exist']);

      await waitFor(() => {
        expect(screen.getByTestId('page-NotFound')).toBeInTheDocument();
      });
    });
  });
});
