import type { DealWon } from '../schemas/crm.events';
import type { InvoiceCreated } from '../schemas/accounting.events';
import type { BaseEvent } from '../types';
/**
 * Map DealWon event to InvoiceCreated payload
 * Chuyển đổi sự kiện DealWon sang InvoiceCreated
 *
 * Logic:
 * - Deal amount → Invoice total
 * - Customer info → Billing info
 * - Products → Invoice line items
 * - Deal description → Invoice notes
 */
export declare function mapDealWonToInvoice(dealWonEvent: BaseEvent<DealWon>): Promise<InvoiceCreated>;
/**
 * Event flow metadata for CRM → Accounting
 */
export declare const CRMToAccountingFlow: {
    triggers: string[];
    target: string;
    mapper: typeof mapDealWonToInvoice;
};
/**
 * Validate mapping output
 * Kiểm tra output của mapping
 */
export declare function validateInvoiceMapping(invoice: InvoiceCreated): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=crm-to-accounting.d.ts.map