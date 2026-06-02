export declare const ERP_MODULES: {
    readonly MRP: {
        readonly id: "mrp";
        readonly name: "Material Requirements Planning";
        readonly port: 3001;
        readonly path: "/mrp";
    };
    readonly HRM: {
        readonly id: "hrm";
        readonly name: "Human Resource Management";
        readonly port: 3002;
        readonly path: "/hrm";
    };
    readonly CRM: {
        readonly id: "crm";
        readonly name: "Customer Relationship Management";
        readonly port: 3003;
        readonly path: "/crm";
    };
    readonly TPM: {
        readonly id: "tpm";
        readonly name: "Trade Promotion Management";
        readonly port: 3004;
        readonly path: "/tpm";
    };
    readonly OTB: {
        readonly id: "otb";
        readonly name: "Order-to-Bill";
        readonly port: 3005;
        readonly path: "/otb";
    };
    readonly PM: {
        readonly id: "pm";
        readonly name: "Project Management";
        readonly port: 3006;
        readonly path: "/pm";
    };
    readonly ACC: {
        readonly id: "acc";
        readonly name: "Accounting & Finance";
        readonly port: 3007;
        readonly path: "/acc";
    };
    readonly XAI: {
        readonly id: "xai";
        readonly name: "ExcelAI";
        readonly port: 3008;
        readonly path: "/excel-ai";
    };
};
export declare const EVENT_SUBJECTS: {
    readonly CUSTOMER: {
        readonly CREATED: "erp.customer.created";
        readonly UPDATED: "erp.customer.updated";
        readonly DELETED: "erp.customer.deleted";
    };
    readonly PRODUCT: {
        readonly CREATED: "erp.product.created";
        readonly UPDATED: "erp.product.updated";
        readonly DELETED: "erp.product.deleted";
    };
    readonly EMPLOYEE: {
        readonly CREATED: "erp.employee.created";
        readonly UPDATED: "erp.employee.updated";
        readonly TERMINATED: "erp.employee.terminated";
    };
    readonly SUPPLIER: {
        readonly CREATED: "erp.supplier.created";
        readonly UPDATED: "erp.supplier.updated";
        readonly DELETED: "erp.supplier.deleted";
    };
    readonly ORDER: {
        readonly CREATED: "erp.order.created";
        readonly CONFIRMED: "erp.order.confirmed";
        readonly SHIPPED: "erp.order.shipped";
        readonly COMPLETED: "erp.order.completed";
        readonly CANCELLED: "erp.order.cancelled";
    };
    readonly INVENTORY: {
        readonly UPDATED: "erp.inventory.updated";
        readonly LOW_STOCK: "erp.inventory.low_stock";
        readonly TRANSFER: "erp.inventory.transfer";
    };
    readonly PRODUCTION: {
        readonly STARTED: "erp.production.started";
        readonly COMPLETED: "erp.production.completed";
        readonly FAILED: "erp.production.failed";
    };
    readonly INVOICE: {
        readonly CREATED: "erp.invoice.created";
        readonly SENT: "erp.invoice.sent";
        readonly PAID: "erp.invoice.paid";
        readonly OVERDUE: "erp.invoice.overdue";
    };
    readonly ACCOUNTING: {
        readonly JOURNAL_POSTED: "erp.accounting.journal_posted";
        readonly PAYMENT_RECEIVED: "erp.accounting.payment_received";
        readonly PAYMENT_MADE: "erp.accounting.payment_made";
    };
};
export declare const API_BASE = "/api/v1";
export declare const API_GATEWAY_URL: string;
export declare const SSO_URL: string;
export declare const NATS_URL: string;
export declare const VAS_ACCOUNT_TYPES: {
    readonly ASSET: "1";
    readonly LIABILITY: "3";
    readonly EQUITY: "4";
    readonly REVENUE: "5";
    readonly OTHER_REVENUE: "7";
    readonly EXPENSE: "6";
    readonly OTHER_EXPENSE: "8";
    readonly COST: "6";
};
export declare const TAX_RATES: {
    readonly VAT_STANDARD: 0.1;
    readonly VAT_REDUCED: 0.05;
    readonly VAT_EXEMPT: 0;
    readonly CIT_STANDARD: 0.2;
    readonly PIT_RATES: readonly [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35];
};
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 100;
export declare const DATE_FORMAT_VN = "dd/MM/yyyy";
export declare const DATETIME_FORMAT_VN = "dd/MM/yyyy HH:mm";
export declare const DATE_FORMAT_ISO = "yyyy-MM-dd";
//# sourceMappingURL=index.d.ts.map