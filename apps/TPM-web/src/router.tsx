/**
 * React Router Configuration
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layouts
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthLayout from '@/components/layout/AuthLayout';

// Auth guard
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Loading fallback
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Lazy load pages for code splitting
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));

const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));

const PromotionList = lazy(() => import('@/pages/promotions/PromotionList'));
const PromotionDetail = lazy(() => import('@/pages/promotions/PromotionDetail'));
const PromotionNew = lazy(() => import('@/pages/promotions/PromotionNew'));
const PromotionEdit = lazy(() => import('@/pages/promotions/PromotionEdit'));
const PromotionEfficiency = lazy(() => import('@/pages/promotions/Efficiency'));
const PromotionDeployment = lazy(() => import('@/pages/promotions/Deployment'));
const PromotionMechanics = lazy(() => import('@/pages/promotions/Mechanics'));

const ClaimList = lazy(() => import('@/pages/claims/ClaimList'));
const ClaimDetail = lazy(() => import('@/pages/claims/ClaimDetail'));
const ClaimNew = lazy(() => import('@/pages/claims/ClaimNew'));
const ClaimSettlement = lazy(() => import('@/pages/claims/Settlement'));

const FundList = lazy(() => import('@/pages/funds/FundList'));
const FundDetail = lazy(() => import('@/pages/funds/FundDetail'));
const FundNew = lazy(() => import('@/pages/funds/FundNew'));
const FundEdit = lazy(() => import('@/pages/funds/FundEdit'));

const CustomerList = lazy(() => import('@/pages/customers/CustomerList'));
const CustomerDetail = lazy(() => import('@/pages/customers/CustomerDetail'));

const ProductList = lazy(() => import('@/pages/products/ProductList'));
const ProductDetail = lazy(() => import('@/pages/products/ProductDetail'));

const ReportList = lazy(() => import('@/pages/reports/ReportList'));
const WeeklyKPI = lazy(() => import('@/pages/reports/WeeklyKPI'));
const Settings = lazy(() => import('@/pages/settings/Settings'));

// New pages
const Analytics = lazy(() => import('@/pages/analytics/Analytics'));
const BudgetList = lazy(() => import('@/pages/budgets/BudgetList'));
const BudgetNew = lazy(() => import('@/pages/budgets/BudgetNew'));
const BudgetAllocation = lazy(() => import('@/pages/budgets/BudgetAllocation'));

// New Budget Management pages (Phase 2)
const BudgetOverview = lazy(() => import('@/pages/budget/Overview'));
const BudgetDefinition = lazy(() => import('@/pages/budget/Definition'));
const BudgetMonitoring = lazy(() => import('@/pages/budget/Monitoring'));
const BudgetApproval = lazy(() => import('@/pages/budget/Approval'));
const CalendarView = lazy(() => import('@/pages/calendar/CalendarView'));
const TargetList = lazy(() => import('@/pages/targets/TargetList'));
const TargetNew = lazy(() => import('@/pages/targets/TargetNew'));
const TargetAllocation = lazy(() => import('@/pages/targets/TargetAllocation'));
const BaselineList = lazy(() => import('@/pages/baselines/BaselineList'));
const BaselineNew = lazy(() => import('@/pages/baselines/BaselineNew'));

// Finance pages - Accruals
const AccrualList = lazy(() => import('@/pages/finance/accruals/AccrualList'));
const AccrualDetail = lazy(() => import('@/pages/finance/accruals/AccrualDetail'));
const AccrualCalculate = lazy(() => import('@/pages/finance/accruals/AccrualCalculate'));

// Finance pages - Deductions
const DeductionList = lazy(() => import('@/pages/finance/deductions/DeductionList'));
const DeductionDetail = lazy(() => import('@/pages/finance/deductions/DeductionDetail'));
const DeductionMatching = lazy(() => import('@/pages/finance/deductions/DeductionMatching'));

// Finance pages - GL Journals
const JournalList = lazy(() => import('@/pages/finance/journals/JournalList'));
const JournalDetail = lazy(() => import('@/pages/finance/journals/JournalDetail'));

// Finance pages - Cheques
const ChequeList = lazy(() => import('@/pages/finance/cheques/ChequeList'));
const ChequeDetail = lazy(() => import('@/pages/finance/cheques/ChequeDetail'));

// Planning pages - Templates
const TemplateList = lazy(() => import('@/pages/planning/templates/TemplateList'));
const TemplateDetail = lazy(() => import('@/pages/planning/templates/TemplateDetail'));
const TemplateBuilder = lazy(() => import('@/pages/planning/templates/TemplateBuilder'));

// Planning pages - Scenarios
const ScenarioList = lazy(() => import('@/pages/planning/scenarios/ScenarioList'));
const ScenarioDetail = lazy(() => import('@/pages/planning/scenarios/ScenarioDetail'));
const ScenarioBuilder = lazy(() => import('@/pages/planning/scenarios/ScenarioBuilder'));
const ScenarioCompare = lazy(() => import('@/pages/planning/scenarios/ScenarioCompare'));

// Planning pages - Clash Detection
const ClashList = lazy(() => import('@/pages/planning/clashes/ClashList'));
const ClashDetail = lazy(() => import('@/pages/planning/clashes/ClashDetail'));

// Planning pages - TPO (Trade Promotion Optimization)
const PlanningTPO = lazy(() => import('@/pages/planning/TPO'));

// Budget Allocation (New - Phase 2)
const BudgetAllocationNew = lazy(() => import('@/pages/budget/Allocation'));

// Claims Payment (New - Phase 2)
const ClaimsPayment = lazy(() => import('@/pages/claims/Payment'));

// Analysis pages (New - Phase 2)
const AnalysisROI = lazy(() => import('@/pages/analysis/ROI'));
const AnalysisEfficiency = lazy(() => import('@/pages/analysis/Efficiency'));
const AnalysisWhatIf = lazy(() => import('@/pages/analysis/WhatIf'));

// Execution pages
const ExecutionPSPBudget = lazy(() => import('@/pages/execution/PSPBudget'));
const ExecutionSpending = lazy(() => import('@/pages/execution/Spending'));
const ExecutionReallocation = lazy(() => import('@/pages/execution/Reallocation'));

// Operations pages - Delivery
const DeliveryList = lazy(() => import('@/pages/operations/delivery/DeliveryList'));
const DeliveryDetail = lazy(() => import('@/pages/operations/delivery/DeliveryDetail'));
const DeliveryNew = lazy(() => import('@/pages/operations/delivery/DeliveryNew'));
const DeliveryCalendarPage = lazy(() => import('@/pages/operations/delivery/DeliveryCalendarPage'));

// Operations pages - Sell Tracking
const SellTrackingList = lazy(() => import('@/pages/operations/sell-tracking/SellTrackingList'));
const SellTrackingNew = lazy(() => import('@/pages/operations/sell-tracking/SellTrackingNew'));
const SellTrackingImport = lazy(() => import('@/pages/operations/sell-tracking/SellTrackingImport'));
const SellInPage = lazy(() => import('@/pages/operations/sell-tracking/SellInPage'));
const SellOutPage = lazy(() => import('@/pages/operations/sell-tracking/SellOutPage'));

// Operations pages - Inventory
const InventoryList = lazy(() => import('@/pages/operations/inventory/InventoryList'));
const InventoryNew = lazy(() => import('@/pages/operations/inventory/InventoryNew'));
const InventoryImport = lazy(() => import('@/pages/operations/inventory/InventoryImport'));
const InventoryDetail = lazy(() => import('@/pages/operations/inventory/InventoryDetail'));
const InventorySnapshots = lazy(() => import('@/pages/operations/inventory/InventorySnapshots'));

// Integration pages
const IntegrationDashboard = lazy(() => import('@/pages/integration/IntegrationDashboard'));
const ERPList = lazy(() => import('@/pages/integration/erp/ERPList'));
const ERPDetail = lazy(() => import('@/pages/integration/erp/ERPDetail'));
const DMSList = lazy(() => import('@/pages/integration/dms/DMSList'));
const DMSDetail = lazy(() => import('@/pages/integration/dms/DMSDetail'));
const WebhookList = lazy(() => import('@/pages/integration/webhooks/WebhookList'));
const WebhookDetail = lazy(() => import('@/pages/integration/webhooks/WebhookDetail'));
const SecurityDashboard = lazy(() => import('@/pages/integration/security/SecurityDashboard'));
const APIKeysList = lazy(() => import('@/pages/integration/security/APIKeysList'));
const AuditLogsList = lazy(() => import('@/pages/integration/security/AuditLogsList'));

// AI pages
const AIDashboard = lazy(() => import('@/pages/ai/AIDashboard'));
const InsightsList = lazy(() => import('@/pages/ai/InsightsList'));
const RecommendationsList = lazy(() => import('@/pages/ai/RecommendationsList'));

// Pepsi V3 pages
const ContractList = lazy(() => import('@/pages/contracts/ContractList'));
const ContractDetail = lazy(() => import('@/pages/contracts/ContractDetail'));
const ContractCreate = lazy(() => import('@/pages/contracts/ContractCreate'));
const AISuggestions = lazy(() => import('@/pages/ai/Suggestions'));
const ClaimsAI = lazy(() => import('@/pages/ai/ClaimsAI'));
const LiveDashboard = lazy(() => import('@/pages/monitoring/LiveDashboard'));
const AlertsPage = lazy(() => import('@/pages/monitoring/Alerts'));

// Voice pages
const VoiceCommandCenter = lazy(() => import('@/pages/voice/VoiceCommandCenter'));

// BI pages
const BIDashboard = lazy(() => import('@/pages/bi/BIDashboard'));
const ReportBuilder = lazy(() => import('@/pages/bi/ReportBuilder'));
const AnalyticsDashboard = lazy(() => import('@/pages/bi/AnalyticsDashboard'));
const ExportCenter = lazy(() => import('@/pages/bi/ExportCenter'));

const NotFound = lazy(() => import('@/pages/errors/NotFound'));

// Suspense wrapper
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner fullScreen />}>
    {children}
  </Suspense>
);

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes - Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          <SuspenseWrapper><Login /></SuspenseWrapper>
        } />
        <Route path="/register" element={
          <SuspenseWrapper><Register /></SuspenseWrapper>
        } />
        <Route path="/forgot-password" element={
          <SuspenseWrapper><ForgotPassword /></SuspenseWrapper>
        } />
      </Route>

      {/* Protected routes - Dashboard */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        {/* Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <SuspenseWrapper><Dashboard /></SuspenseWrapper>
        } />

        {/* Promotions */}
        <Route path="/promotions" element={
          <SuspenseWrapper><PromotionList /></SuspenseWrapper>
        } />
        <Route path="/promotions/new" element={
          <SuspenseWrapper><PromotionNew /></SuspenseWrapper>
        } />
        <Route path="/promotions/:id" element={
          <SuspenseWrapper><PromotionDetail /></SuspenseWrapper>
        } />
        <Route path="/promotions/:id/edit" element={
          <SuspenseWrapper><PromotionEdit /></SuspenseWrapper>
        } />
        <Route path="/promotions/efficiency" element={
          <SuspenseWrapper><PromotionEfficiency /></SuspenseWrapper>
        } />
        <Route path="/promotions/deployment" element={
          <SuspenseWrapper><PromotionDeployment /></SuspenseWrapper>
        } />
        <Route path="/promotions/mechanics" element={
          <SuspenseWrapper><PromotionMechanics /></SuspenseWrapper>
        } />

        {/* Claims */}
        <Route path="/claims" element={
          <SuspenseWrapper><ClaimList /></SuspenseWrapper>
        } />
        <Route path="/claims/new" element={
          <SuspenseWrapper><ClaimNew /></SuspenseWrapper>
        } />
        <Route path="/claims/:id" element={
          <SuspenseWrapper><ClaimDetail /></SuspenseWrapper>
        } />
        <Route path="/claims/settlement" element={
          <SuspenseWrapper><ClaimSettlement /></SuspenseWrapper>
        } />
        <Route path="/claims/payment" element={
          <SuspenseWrapper><ClaimsPayment /></SuspenseWrapper>
        } />

        {/* Funds */}
        <Route path="/funds" element={
          <SuspenseWrapper><FundList /></SuspenseWrapper>
        } />
        <Route path="/funds/new" element={
          <SuspenseWrapper><FundNew /></SuspenseWrapper>
        } />
        <Route path="/funds/:id" element={
          <SuspenseWrapper><FundDetail /></SuspenseWrapper>
        } />
        <Route path="/funds/:id/edit" element={
          <SuspenseWrapper><FundEdit /></SuspenseWrapper>
        } />

        {/* Customers */}
        <Route path="/customers" element={
          <SuspenseWrapper><CustomerList /></SuspenseWrapper>
        } />
        <Route path="/customers/:id" element={
          <SuspenseWrapper><CustomerDetail /></SuspenseWrapper>
        } />

        {/* Products */}
        <Route path="/products" element={
          <SuspenseWrapper><ProductList /></SuspenseWrapper>
        } />
        <Route path="/products/:id" element={
          <SuspenseWrapper><ProductDetail /></SuspenseWrapper>
        } />

        {/* Reports */}
        <Route path="/reports" element={
          <SuspenseWrapper><ReportList /></SuspenseWrapper>
        } />
        <Route path="/weekly-kpi" element={
          <SuspenseWrapper><WeeklyKPI /></SuspenseWrapper>
        } />

        {/* Analytics */}
        <Route path="/analytics" element={
          <SuspenseWrapper><Analytics /></SuspenseWrapper>
        } />

        {/* Calendar */}
        <Route path="/calendar" element={
          <SuspenseWrapper><CalendarView /></SuspenseWrapper>
        } />

        {/* Budgets (Legacy) */}
        <Route path="/budgets" element={
          <SuspenseWrapper><BudgetList /></SuspenseWrapper>
        } />
        <Route path="/budgets/new" element={
          <SuspenseWrapper><BudgetNew /></SuspenseWrapper>
        } />
        <Route path="/budgets/allocation" element={
          <SuspenseWrapper><BudgetAllocation /></SuspenseWrapper>
        } />

        {/* Budget Management (New) */}
        <Route path="/budget" element={
          <SuspenseWrapper><BudgetOverview /></SuspenseWrapper>
        } />
        <Route path="/budget/definition" element={
          <SuspenseWrapper><BudgetDefinition /></SuspenseWrapper>
        } />
        <Route path="/budget/allocation" element={
          <SuspenseWrapper><BudgetAllocationNew /></SuspenseWrapper>
        } />
        <Route path="/budget/monitoring" element={
          <SuspenseWrapper><BudgetMonitoring /></SuspenseWrapper>
        } />
        <Route path="/budget/approval" element={
          <SuspenseWrapper><BudgetApproval /></SuspenseWrapper>
        } />

        {/* Targets */}
        <Route path="/targets" element={
          <SuspenseWrapper><TargetList /></SuspenseWrapper>
        } />
        <Route path="/targets/new" element={
          <SuspenseWrapper><TargetNew /></SuspenseWrapper>
        } />
        <Route path="/targets/allocation" element={
          <SuspenseWrapper><TargetAllocation /></SuspenseWrapper>
        } />

        {/* Baselines */}
        <Route path="/baselines" element={
          <SuspenseWrapper><BaselineList /></SuspenseWrapper>
        } />
        <Route path="/baselines/new" element={
          <SuspenseWrapper><BaselineNew /></SuspenseWrapper>
        } />

        {/* Finance - Accruals */}
        <Route path="/finance/accruals" element={
          <SuspenseWrapper><AccrualList /></SuspenseWrapper>
        } />
        <Route path="/finance/accruals/calculate" element={
          <SuspenseWrapper><AccrualCalculate /></SuspenseWrapper>
        } />
        <Route path="/finance/accruals/:id" element={
          <SuspenseWrapper><AccrualDetail /></SuspenseWrapper>
        } />

        {/* Finance - Deductions */}
        <Route path="/finance/deductions" element={
          <SuspenseWrapper><DeductionList /></SuspenseWrapper>
        } />
        <Route path="/finance/deductions/:id" element={
          <SuspenseWrapper><DeductionDetail /></SuspenseWrapper>
        } />
        <Route path="/finance/deductions/:id/match" element={
          <SuspenseWrapper><DeductionMatching /></SuspenseWrapper>
        } />

        {/* Finance - GL Journals */}
        <Route path="/finance/journals" element={
          <SuspenseWrapper><JournalList /></SuspenseWrapper>
        } />
        <Route path="/finance/journals/:id" element={
          <SuspenseWrapper><JournalDetail /></SuspenseWrapper>
        } />

        {/* Finance - Cheques */}
        <Route path="/finance/cheques" element={
          <SuspenseWrapper><ChequeList /></SuspenseWrapper>
        } />
        <Route path="/finance/cheques/:id" element={
          <SuspenseWrapper><ChequeDetail /></SuspenseWrapper>
        } />

        {/* Planning - Templates */}
        <Route path="/planning/templates" element={
          <SuspenseWrapper><TemplateList /></SuspenseWrapper>
        } />
        <Route path="/planning/templates/builder" element={
          <SuspenseWrapper><TemplateBuilder /></SuspenseWrapper>
        } />
        <Route path="/planning/templates/:id" element={
          <SuspenseWrapper><TemplateDetail /></SuspenseWrapper>
        } />

        {/* Planning - Scenarios */}
        <Route path="/planning/scenarios" element={
          <SuspenseWrapper><ScenarioList /></SuspenseWrapper>
        } />
        <Route path="/planning/scenarios/new" element={
          <SuspenseWrapper><ScenarioBuilder /></SuspenseWrapper>
        } />
        <Route path="/planning/scenarios/compare" element={
          <SuspenseWrapper><ScenarioCompare /></SuspenseWrapper>
        } />
        <Route path="/planning/scenarios/:id" element={
          <SuspenseWrapper><ScenarioDetail /></SuspenseWrapper>
        } />
        <Route path="/planning/scenarios/:id/edit" element={
          <SuspenseWrapper><ScenarioBuilder /></SuspenseWrapper>
        } />

        {/* Planning - Clash Detection */}
        <Route path="/planning/clashes" element={
          <SuspenseWrapper><ClashList /></SuspenseWrapper>
        } />
        <Route path="/planning/clashes/:id" element={
          <SuspenseWrapper><ClashDetail /></SuspenseWrapper>
        } />

        {/* Planning - TPO (Trade Promotion Optimization) */}
        <Route path="/planning/tpo" element={
          <SuspenseWrapper><PlanningTPO /></SuspenseWrapper>
        } />

        {/* Execution */}
        <Route path="/execution/psp-budget" element={
          <SuspenseWrapper><ExecutionPSPBudget /></SuspenseWrapper>
        } />
        <Route path="/execution/spending" element={
          <SuspenseWrapper><ExecutionSpending /></SuspenseWrapper>
        } />
        <Route path="/execution/reallocation" element={
          <SuspenseWrapper><ExecutionReallocation /></SuspenseWrapper>
        } />

        {/* Operations - Delivery */}
        <Route path="/operations/delivery" element={
          <SuspenseWrapper><DeliveryList /></SuspenseWrapper>
        } />
        <Route path="/operations/delivery/new" element={
          <SuspenseWrapper><DeliveryNew /></SuspenseWrapper>
        } />
        <Route path="/operations/delivery/calendar" element={
          <SuspenseWrapper><DeliveryCalendarPage /></SuspenseWrapper>
        } />
        <Route path="/operations/delivery/:id" element={
          <SuspenseWrapper><DeliveryDetail /></SuspenseWrapper>
        } />

        {/* Operations - Sell Tracking */}
        <Route path="/operations/sell-tracking" element={
          <SuspenseWrapper><SellTrackingList /></SuspenseWrapper>
        } />
        <Route path="/operations/sell-tracking/new" element={
          <SuspenseWrapper><SellTrackingNew /></SuspenseWrapper>
        } />
        <Route path="/operations/sell-tracking/import" element={
          <SuspenseWrapper><SellTrackingImport /></SuspenseWrapper>
        } />
        <Route path="/operations/sell-tracking/sell-in" element={
          <SuspenseWrapper><SellInPage /></SuspenseWrapper>
        } />
        <Route path="/operations/sell-tracking/sell-out" element={
          <SuspenseWrapper><SellOutPage /></SuspenseWrapper>
        } />

        {/* Operations - Inventory */}
        <Route path="/operations/inventory" element={
          <SuspenseWrapper><InventoryList /></SuspenseWrapper>
        } />
        <Route path="/operations/inventory/new" element={
          <SuspenseWrapper><InventoryNew /></SuspenseWrapper>
        } />
        <Route path="/operations/inventory/import" element={
          <SuspenseWrapper><InventoryImport /></SuspenseWrapper>
        } />
        <Route path="/operations/inventory/snapshots" element={
          <SuspenseWrapper><InventorySnapshots /></SuspenseWrapper>
        } />
        <Route path="/operations/inventory/:id" element={
          <SuspenseWrapper><InventoryDetail /></SuspenseWrapper>
        } />

        {/* Integration - Dashboard */}
        <Route path="/integration" element={
          <SuspenseWrapper><IntegrationDashboard /></SuspenseWrapper>
        } />

        {/* Integration - ERP */}
        <Route path="/integration/erp" element={
          <SuspenseWrapper><ERPList /></SuspenseWrapper>
        } />
        <Route path="/integration/erp/:id" element={
          <SuspenseWrapper><ERPDetail /></SuspenseWrapper>
        } />

        {/* Integration - DMS */}
        <Route path="/integration/dms" element={
          <SuspenseWrapper><DMSList /></SuspenseWrapper>
        } />
        <Route path="/integration/dms/:id" element={
          <SuspenseWrapper><DMSDetail /></SuspenseWrapper>
        } />

        {/* Integration - Webhooks */}
        <Route path="/integration/webhooks" element={
          <SuspenseWrapper><WebhookList /></SuspenseWrapper>
        } />
        <Route path="/integration/webhooks/:id" element={
          <SuspenseWrapper><WebhookDetail /></SuspenseWrapper>
        } />

        {/* Integration - Security */}
        <Route path="/integration/security" element={
          <SuspenseWrapper><SecurityDashboard /></SuspenseWrapper>
        } />
        <Route path="/integration/security/api-keys" element={
          <SuspenseWrapper><APIKeysList /></SuspenseWrapper>
        } />
        <Route path="/integration/security/audit-logs" element={
          <SuspenseWrapper><AuditLogsList /></SuspenseWrapper>
        } />

        {/* Volume Contracts (Pepsi V3) */}
        <Route path="/contracts" element={
          <SuspenseWrapper><ContractList /></SuspenseWrapper>
        } />
        <Route path="/contracts/create" element={
          <SuspenseWrapper><ContractCreate /></SuspenseWrapper>
        } />
        <Route path="/contracts/:id" element={
          <SuspenseWrapper><ContractDetail /></SuspenseWrapper>
        } />

        {/* AI */}
        <Route path="/ai" element={
          <SuspenseWrapper><AIDashboard /></SuspenseWrapper>
        } />
        <Route path="/ai/insights" element={
          <SuspenseWrapper><InsightsList /></SuspenseWrapper>
        } />
        <Route path="/ai/recommendations" element={
          <SuspenseWrapper><RecommendationsList /></SuspenseWrapper>
        } />
        <Route path="/ai/suggestions" element={
          <SuspenseWrapper><AISuggestions /></SuspenseWrapper>
        } />
        <Route path="/ai/claims-ai" element={
          <SuspenseWrapper><ClaimsAI /></SuspenseWrapper>
        } />

        {/* Live Monitoring (Pepsi V3) */}
        <Route path="/monitoring/live" element={
          <SuspenseWrapper><LiveDashboard /></SuspenseWrapper>
        } />
        <Route path="/monitoring/alerts" element={
          <SuspenseWrapper><AlertsPage /></SuspenseWrapper>
        } />

        {/* Voice */}
        <Route path="/voice" element={
          <SuspenseWrapper><VoiceCommandCenter /></SuspenseWrapper>
        } />

        {/* BI */}
        <Route path="/bi" element={
          <SuspenseWrapper><BIDashboard /></SuspenseWrapper>
        } />
        <Route path="/bi/reports" element={
          <SuspenseWrapper><ReportBuilder /></SuspenseWrapper>
        } />
        <Route path="/bi/analytics" element={
          <SuspenseWrapper><AnalyticsDashboard /></SuspenseWrapper>
        } />
        <Route path="/bi/export" element={
          <SuspenseWrapper><ExportCenter /></SuspenseWrapper>
        } />

        {/* Analysis (New - Phase 2) */}
        <Route path="/analysis/roi" element={
          <SuspenseWrapper><AnalysisROI /></SuspenseWrapper>
        } />
        <Route path="/analysis/efficiency" element={
          <SuspenseWrapper><AnalysisEfficiency /></SuspenseWrapper>
        } />
        <Route path="/analysis/what-if" element={
          <SuspenseWrapper><AnalysisWhatIf /></SuspenseWrapper>
        } />

        {/* Settings */}
        <Route path="/settings" element={
          <SuspenseWrapper><Settings /></SuspenseWrapper>
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={
        <SuspenseWrapper><NotFound /></SuspenseWrapper>
      } />
    </Routes>
  );
}
