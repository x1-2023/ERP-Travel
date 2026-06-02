export { mapDealWonToInvoice, CRMToAccountingFlow, validateInvoiceMapping, } from './crm-to-accounting';
export { checkInventoryAndCreateProductionOrder, mapProductionCompletedToInventory, EcommerceToMRPFlows, validateProductionOrder, validateInventoryUpdate, } from './ecommerce-to-mrp';
export { mapPayrollToJournalEntry, HRMToAccountingFlow, validatePayrollJournal, getAccountReconciliation, } from './hrm-to-accounting';
/**
 * All registered event flows
 * Các luồng sự kiện đã đăng ký
 */
export declare const AllEventFlows: {
    id: string;
    triggers: string[];
    target: string;
    mapper: (event: any) => any;
    description: string;
}[];
/**
 * Get flows triggered by event type
 * Lấy các flow được kích hoạt bởi event type
 */
export declare function getFlowsByTrigger(eventType: string): {
    id: string;
    triggers: string[];
    target: string;
    mapper: (event: any) => any;
    description: string;
}[];
/**
 * Flow registry for runtime lookup
 */
export declare const FlowRegistry: Map<string, {
    id: string;
    triggers: string[];
    target: string;
    mapper: (event: any) => any;
    description: string;
}>;
//# sourceMappingURL=index.d.ts.map