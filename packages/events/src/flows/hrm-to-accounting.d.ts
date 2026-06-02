import type { PayrollProcessed } from '../schemas/hrm.events';
import type { JournalEntryPosted } from '../schemas/accounting.events';
import type { BaseEvent } from '../types';
/**
 * Map PayrollProcessed event to JournalEntryPosted
 * Chuyển đổi sự kiện PayrollProcessed sang JournalEntryPosted
 *
 * Creates accounting entries:
 * Dr. Salary Expense → Cr. Salaries Payable (gross salary)
 * Dr. Income Tax Payable → Cr. Salaries Payable (income tax)
 * Dr. Social/Health Insurance → Cr. Salaries Payable (insurance)
 * Dr. Cash at Bank → Cr. Salaries Payable (actual payment)
 */
export declare function mapPayrollToJournalEntry(payrollEvent: BaseEvent<PayrollProcessed>): Promise<JournalEntryPosted>;
/**
 * Event flow metadata for HRM → Accounting
 */
export declare const HRMToAccountingFlow: {
    triggers: string[];
    target: string;
    mapper: typeof mapPayrollToJournalEntry;
};
/**
 * Validate journal entry from payroll
 */
export declare function validatePayrollJournal(entry: JournalEntryPosted): {
    valid: boolean;
    errors: string[];
};
/**
 * Get account reconciliation info
 * Thông tin đối soát tài khoản
 */
export declare function getAccountReconciliation(entry: JournalEntryPosted): {
    accountCode: string;
    debitTotal: number;
    creditTotal: number;
} | null;
//# sourceMappingURL=hrm-to-accounting.d.ts.map