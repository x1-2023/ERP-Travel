// tests/pages/index.ts

/**
 * LAC VIET HR - Page Objects Index
 * Export all page objects for easy import
 */

export { BasePage } from './BasePage';
export { LoginPage } from './LoginPage';
export { EmployeePage, type EmployeeFormData } from './EmployeePage';
export { LeavePage, type LeaveRequestFormData } from './LeavePage';
export { AttendancePage } from './AttendancePage';
export { PayrollPage, type PayrollAdjustment } from './PayrollPage';

// Re-export types
export type { Page, Locator } from '@playwright/test';
