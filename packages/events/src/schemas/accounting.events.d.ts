import { z } from 'zod';
/**
 * InvoiceCreated - Tạo mới hóa đơn
 * Kích hoạt: Tạo hóa đơn từ sales order hoặc manual entry
 * Source: CRM (DealWon) hoặc Ecommerce (OrderPlaced)
 */
export declare const InvoiceCreatedSchema: z.ZodObject<{
    invoiceId: z.ZodString;
    invoiceNumber: z.ZodString;
    customerId: z.ZodString;
    customerName: z.ZodString;
    customerEmail: z.ZodOptional<z.ZodString>;
    orderRef: z.ZodOptional<z.ZodString>;
    invoiceDate: z.ZodString;
    dueDate: z.ZodString;
    currency: z.ZodDefault<z.ZodString>;
    totalAmount: z.ZodNumber;
    taxAmount: z.ZodOptional<z.ZodNumber>;
    discountAmount: z.ZodOptional<z.ZodNumber>;
    lineItems: z.ZodArray<z.ZodObject<{
        lineId: z.ZodString;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        lineTotal: z.ZodNumber;
        taxCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        lineId: string;
        taxCode?: string | undefined;
    }, {
        description: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        lineId: string;
        taxCode?: string | undefined;
    }>, "many">;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    dueDate: string;
    customerId: string;
    customerName: string;
    invoiceId: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
    lineItems: {
        description: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        lineId: string;
        taxCode?: string | undefined;
    }[];
    notes?: string | undefined;
    customerEmail?: string | undefined;
    orderRef?: string | undefined;
    taxAmount?: number | undefined;
    discountAmount?: number | undefined;
}, {
    dueDate: string;
    customerId: string;
    customerName: string;
    invoiceId: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
    lineItems: {
        description: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        lineId: string;
        taxCode?: string | undefined;
    }[];
    currency?: string | undefined;
    notes?: string | undefined;
    customerEmail?: string | undefined;
    orderRef?: string | undefined;
    taxAmount?: number | undefined;
    discountAmount?: number | undefined;
}>;
export type InvoiceCreated = z.infer<typeof InvoiceCreatedSchema>;
/**
 * InvoiceApproved - Hóa đơn được phê duyệt
 * Kích hoạt: Người dùng phê duyệt hóa đơn
 */
export declare const InvoiceApprovedSchema: z.ZodObject<{
    invoiceId: z.ZodString;
    invoiceNumber: z.ZodString;
    customerId: z.ZodString;
    totalAmount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    approvedBy: z.ZodString;
    approvedDate: z.ZodString;
    approvalNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    approvedBy: string;
    customerId: string;
    invoiceId: string;
    invoiceNumber: string;
    totalAmount: number;
    approvedDate: string;
    approvalNotes?: string | undefined;
}, {
    approvedBy: string;
    customerId: string;
    invoiceId: string;
    invoiceNumber: string;
    totalAmount: number;
    approvedDate: string;
    currency?: string | undefined;
    approvalNotes?: string | undefined;
}>;
export type InvoiceApproved = z.infer<typeof InvoiceApprovedSchema>;
/**
 * InvoicePaid - Hóa đơn được thanh toán
 * Kích hoạt: Thanh toán được ghi nhận
 */
export declare const InvoicePaidSchema: z.ZodObject<{
    invoiceId: z.ZodString;
    invoiceNumber: z.ZodString;
    customerId: z.ZodString;
    amountPaid: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    paymentDate: z.ZodString;
    paymentMethod: z.ZodEnum<["bank_transfer", "check", "cash", "credit_card", "other"]>;
    referenceNumber: z.ZodOptional<z.ZodString>;
    remainingBalance: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    currency: string;
    customerId: string;
    invoiceId: string;
    invoiceNumber: string;
    amountPaid: number;
    paymentDate: string;
    paymentMethod: "other" | "bank_transfer" | "check" | "cash" | "credit_card";
    remainingBalance: number;
    referenceNumber?: string | undefined;
}, {
    customerId: string;
    invoiceId: string;
    invoiceNumber: string;
    amountPaid: number;
    paymentDate: string;
    paymentMethod: "other" | "bank_transfer" | "check" | "cash" | "credit_card";
    remainingBalance: number;
    currency?: string | undefined;
    referenceNumber?: string | undefined;
}>;
export type InvoicePaid = z.infer<typeof InvoicePaidSchema>;
/**
 * PaymentReceived - Thanh toán được nhận
 * Kích hoạt: Ghi nhận thanh toán từ customer
 * Source: Manual entry hoặc bank integration
 */
export declare const PaymentReceivedSchema: z.ZodObject<{
    paymentId: z.ZodString;
    customerId: z.ZodString;
    customerName: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    paymentDate: z.ZodString;
    paymentMethod: z.ZodEnum<["bank_transfer", "check", "cash", "credit_card", "other"]>;
    bankAccount: z.ZodOptional<z.ZodString>;
    referenceNumber: z.ZodOptional<z.ZodString>;
    invoiceIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    amount: number;
    customerId: string;
    customerName: string;
    paymentDate: string;
    paymentMethod: "other" | "bank_transfer" | "check" | "cash" | "credit_card";
    paymentId: string;
    notes?: string | undefined;
    bankAccount?: string | undefined;
    referenceNumber?: string | undefined;
    invoiceIds?: string[] | undefined;
}, {
    amount: number;
    customerId: string;
    customerName: string;
    paymentDate: string;
    paymentMethod: "other" | "bank_transfer" | "check" | "cash" | "credit_card";
    paymentId: string;
    currency?: string | undefined;
    notes?: string | undefined;
    bankAccount?: string | undefined;
    referenceNumber?: string | undefined;
    invoiceIds?: string[] | undefined;
}>;
export type PaymentReceived = z.infer<typeof PaymentReceivedSchema>;
/**
 * JournalEntryPosted - Bút toán được ghi nhập
 * Kích hoạt: Bút toán được tạo và post
 * Source: Accounting module hoặc từ events khác (e.g., Payroll → Expense)
 */
export declare const JournalEntryPostedSchema: z.ZodObject<{
    journalEntryId: z.ZodString;
    journalNumber: z.ZodString;
    journalDate: z.ZodString;
    postDate: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    sourceEvent: z.ZodEnum<["sales_invoice", "purchase_invoice", "payment", "payroll", "inventory", "depreciation", "accrual", "other"]>;
    sourceDocumentId: z.ZodOptional<z.ZodString>;
    totalDebit: z.ZodNumber;
    totalCredit: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    lines: z.ZodArray<z.ZodObject<{
        lineId: z.ZodString;
        accountCode: z.ZodString;
        accountName: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        debitAmount: z.ZodNumber;
        creditAmount: z.ZodNumber;
        departmentCode: z.ZodOptional<z.ZodString>;
        costCenterCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        lineId: string;
        accountCode: string;
        accountName: string;
        debitAmount: number;
        creditAmount: number;
        description?: string | undefined;
        departmentCode?: string | undefined;
        costCenterCode?: string | undefined;
    }, {
        lineId: string;
        accountCode: string;
        accountName: string;
        debitAmount: number;
        creditAmount: number;
        description?: string | undefined;
        departmentCode?: string | undefined;
        costCenterCode?: string | undefined;
    }>, "many">;
    notes: z.ZodOptional<z.ZodString>;
    postedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    description: string;
    journalEntryId: string;
    journalNumber: string;
    journalDate: string;
    sourceEvent: "other" | "sales_invoice" | "purchase_invoice" | "payment" | "payroll" | "inventory" | "depreciation" | "accrual";
    totalDebit: number;
    totalCredit: number;
    lines: {
        lineId: string;
        accountCode: string;
        accountName: string;
        debitAmount: number;
        creditAmount: number;
        description?: string | undefined;
        departmentCode?: string | undefined;
        costCenterCode?: string | undefined;
    }[];
    notes?: string | undefined;
    postDate?: string | undefined;
    sourceDocumentId?: string | undefined;
    postedBy?: string | undefined;
}, {
    description: string;
    journalEntryId: string;
    journalNumber: string;
    journalDate: string;
    sourceEvent: "other" | "sales_invoice" | "purchase_invoice" | "payment" | "payroll" | "inventory" | "depreciation" | "accrual";
    totalDebit: number;
    totalCredit: number;
    lines: {
        lineId: string;
        accountCode: string;
        accountName: string;
        debitAmount: number;
        creditAmount: number;
        description?: string | undefined;
        departmentCode?: string | undefined;
        costCenterCode?: string | undefined;
    }[];
    currency?: string | undefined;
    notes?: string | undefined;
    postDate?: string | undefined;
    sourceDocumentId?: string | undefined;
    postedBy?: string | undefined;
}>;
export type JournalEntryPosted = z.infer<typeof JournalEntryPostedSchema>;
/**
 * Export all Accounting event schemas
 */
export declare const AccountingEventSchemas: {
    readonly 'accounting.invoice.created': z.ZodObject<{
        invoiceId: z.ZodString;
        invoiceNumber: z.ZodString;
        customerId: z.ZodString;
        customerName: z.ZodString;
        customerEmail: z.ZodOptional<z.ZodString>;
        orderRef: z.ZodOptional<z.ZodString>;
        invoiceDate: z.ZodString;
        dueDate: z.ZodString;
        currency: z.ZodDefault<z.ZodString>;
        totalAmount: z.ZodNumber;
        taxAmount: z.ZodOptional<z.ZodNumber>;
        discountAmount: z.ZodOptional<z.ZodNumber>;
        lineItems: z.ZodArray<z.ZodObject<{
            lineId: z.ZodString;
            description: z.ZodString;
            quantity: z.ZodNumber;
            unitPrice: z.ZodNumber;
            lineTotal: z.ZodNumber;
            taxCode: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
            lineId: string;
            taxCode?: string | undefined;
        }, {
            description: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
            lineId: string;
            taxCode?: string | undefined;
        }>, "many">;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        dueDate: string;
        customerId: string;
        customerName: string;
        invoiceId: string;
        invoiceNumber: string;
        invoiceDate: string;
        totalAmount: number;
        lineItems: {
            description: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
            lineId: string;
            taxCode?: string | undefined;
        }[];
        notes?: string | undefined;
        customerEmail?: string | undefined;
        orderRef?: string | undefined;
        taxAmount?: number | undefined;
        discountAmount?: number | undefined;
    }, {
        dueDate: string;
        customerId: string;
        customerName: string;
        invoiceId: string;
        invoiceNumber: string;
        invoiceDate: string;
        totalAmount: number;
        lineItems: {
            description: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
            lineId: string;
            taxCode?: string | undefined;
        }[];
        currency?: string | undefined;
        notes?: string | undefined;
        customerEmail?: string | undefined;
        orderRef?: string | undefined;
        taxAmount?: number | undefined;
        discountAmount?: number | undefined;
    }>;
    readonly 'accounting.invoice.approved': z.ZodObject<{
        invoiceId: z.ZodString;
        invoiceNumber: z.ZodString;
        customerId: z.ZodString;
        totalAmount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        approvedBy: z.ZodString;
        approvedDate: z.ZodString;
        approvalNotes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        approvedBy: string;
        customerId: string;
        invoiceId: string;
        invoiceNumber: string;
        totalAmount: number;
        approvedDate: string;
        approvalNotes?: string | undefined;
    }, {
        approvedBy: string;
        customerId: string;
        invoiceId: string;
        invoiceNumber: string;
        totalAmount: number;
        approvedDate: string;
        currency?: string | undefined;
        approvalNotes?: string | undefined;
    }>;
    readonly 'accounting.invoice.paid': z.ZodObject<{
        invoiceId: z.ZodString;
        invoiceNumber: z.ZodString;
        customerId: z.ZodString;
        amountPaid: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        paymentDate: z.ZodString;
        paymentMethod: z.ZodEnum<["bank_transfer", "check", "cash", "credit_card", "other"]>;
        referenceNumber: z.ZodOptional<z.ZodString>;
        remainingBalance: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        customerId: string;
        invoiceId: string;
        invoiceNumber: string;
        amountPaid: number;
        paymentDate: string;
        paymentMethod: "other" | "bank_transfer" | "check" | "cash" | "credit_card";
        remainingBalance: number;
        referenceNumber?: string | undefined;
    }, {
        customerId: string;
        invoiceId: string;
        invoiceNumber: string;
        amountPaid: number;
        paymentDate: string;
        paymentMethod: "other" | "bank_transfer" | "check" | "cash" | "credit_card";
        remainingBalance: number;
        currency?: string | undefined;
        referenceNumber?: string | undefined;
    }>;
    readonly 'accounting.payment.received': z.ZodObject<{
        paymentId: z.ZodString;
        customerId: z.ZodString;
        customerName: z.ZodString;
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        paymentDate: z.ZodString;
        paymentMethod: z.ZodEnum<["bank_transfer", "check", "cash", "credit_card", "other"]>;
        bankAccount: z.ZodOptional<z.ZodString>;
        referenceNumber: z.ZodOptional<z.ZodString>;
        invoiceIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        amount: number;
        customerId: string;
        customerName: string;
        paymentDate: string;
        paymentMethod: "other" | "bank_transfer" | "check" | "cash" | "credit_card";
        paymentId: string;
        notes?: string | undefined;
        bankAccount?: string | undefined;
        referenceNumber?: string | undefined;
        invoiceIds?: string[] | undefined;
    }, {
        amount: number;
        customerId: string;
        customerName: string;
        paymentDate: string;
        paymentMethod: "other" | "bank_transfer" | "check" | "cash" | "credit_card";
        paymentId: string;
        currency?: string | undefined;
        notes?: string | undefined;
        bankAccount?: string | undefined;
        referenceNumber?: string | undefined;
        invoiceIds?: string[] | undefined;
    }>;
    readonly 'accounting.journal.posted': z.ZodObject<{
        journalEntryId: z.ZodString;
        journalNumber: z.ZodString;
        journalDate: z.ZodString;
        postDate: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
        sourceEvent: z.ZodEnum<["sales_invoice", "purchase_invoice", "payment", "payroll", "inventory", "depreciation", "accrual", "other"]>;
        sourceDocumentId: z.ZodOptional<z.ZodString>;
        totalDebit: z.ZodNumber;
        totalCredit: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        lines: z.ZodArray<z.ZodObject<{
            lineId: z.ZodString;
            accountCode: z.ZodString;
            accountName: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            debitAmount: z.ZodNumber;
            creditAmount: z.ZodNumber;
            departmentCode: z.ZodOptional<z.ZodString>;
            costCenterCode: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            lineId: string;
            accountCode: string;
            accountName: string;
            debitAmount: number;
            creditAmount: number;
            description?: string | undefined;
            departmentCode?: string | undefined;
            costCenterCode?: string | undefined;
        }, {
            lineId: string;
            accountCode: string;
            accountName: string;
            debitAmount: number;
            creditAmount: number;
            description?: string | undefined;
            departmentCode?: string | undefined;
            costCenterCode?: string | undefined;
        }>, "many">;
        notes: z.ZodOptional<z.ZodString>;
        postedBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        description: string;
        journalEntryId: string;
        journalNumber: string;
        journalDate: string;
        sourceEvent: "other" | "sales_invoice" | "purchase_invoice" | "payment" | "payroll" | "inventory" | "depreciation" | "accrual";
        totalDebit: number;
        totalCredit: number;
        lines: {
            lineId: string;
            accountCode: string;
            accountName: string;
            debitAmount: number;
            creditAmount: number;
            description?: string | undefined;
            departmentCode?: string | undefined;
            costCenterCode?: string | undefined;
        }[];
        notes?: string | undefined;
        postDate?: string | undefined;
        sourceDocumentId?: string | undefined;
        postedBy?: string | undefined;
    }, {
        description: string;
        journalEntryId: string;
        journalNumber: string;
        journalDate: string;
        sourceEvent: "other" | "sales_invoice" | "purchase_invoice" | "payment" | "payroll" | "inventory" | "depreciation" | "accrual";
        totalDebit: number;
        totalCredit: number;
        lines: {
            lineId: string;
            accountCode: string;
            accountName: string;
            debitAmount: number;
            creditAmount: number;
            description?: string | undefined;
            departmentCode?: string | undefined;
            costCenterCode?: string | undefined;
        }[];
        currency?: string | undefined;
        notes?: string | undefined;
        postDate?: string | undefined;
        sourceDocumentId?: string | undefined;
        postedBy?: string | undefined;
    }>;
};
//# sourceMappingURL=accounting.events.d.ts.map