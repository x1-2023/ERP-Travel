export { LeadCreatedSchema, LeadScoredSchema, LeadConvertedSchema, DealWonSchema, DealLostSchema, CRMEventSchemas, } from './crm.events';
export type { LeadCreated, LeadScored, LeadConverted, DealWon, DealLost, } from './crm.events';
export { InvoiceCreatedSchema, InvoiceApprovedSchema, InvoicePaidSchema, PaymentReceivedSchema, JournalEntryPostedSchema, AccountingEventSchemas, } from './accounting.events';
export type { InvoiceCreated, InvoiceApproved, InvoicePaid, PaymentReceived, JournalEntryPosted, } from './accounting.events';
export { OrderPlacedSchema, OrderShippedSchema, OrderDeliveredSchema, OrderCancelledSchema, PaymentCompletedSchema, EcommerceEventSchemas, } from './ecommerce.events';
export type { OrderPlaced, OrderShipped, OrderDelivered, OrderCancelled, PaymentCompleted, } from './ecommerce.events';
export { ProductionOrderCreatedSchema, ProductionCompletedSchema, InventoryUpdatedSchema, StockLowSchema, QualityCheckPassedSchema, MRPEventSchemas, } from './mrp.events';
export type { ProductionOrderCreated, ProductionCompleted, InventoryUpdated, StockLow, QualityCheckPassed, } from './mrp.events';
export { EmployeeOnboardedSchema, LeaveRequestedSchema, LeaveApprovedSchema, PayrollProcessedSchema, AttendanceRecordedSchema, HRMEventSchemas, } from './hrm.events';
export type { EmployeeOnboarded, LeaveRequested, LeaveApproved, PayrollProcessed, AttendanceRecorded, } from './hrm.events';
/**
 * Unified event schema registry
 * Dùng để lookup schema theo event type
 */
export declare const AllEventSchemas: any;
export type AllEventTypes = keyof typeof CRMEventSchemas | keyof typeof AccountingEventSchemas | keyof typeof EcommerceEventSchemas | keyof typeof MRPEventSchemas | keyof typeof HRMEventSchemas;
//# sourceMappingURL=index.d.ts.map