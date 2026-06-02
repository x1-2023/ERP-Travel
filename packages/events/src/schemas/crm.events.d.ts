import { z } from 'zod';
/**
 * LeadCreated - Tạo mới một lead
 * Kích hoạt: User tạo lead mới trong CRM
 */
export declare const LeadCreatedSchema: z.ZodObject<{
    leadId: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    company: z.ZodOptional<z.ZodString>;
    source: z.ZodString;
    score: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    email: string;
    score: number;
    phone: string;
    source: string;
    leadId: string;
    firstName: string;
    lastName: string;
    company?: string | undefined;
}, {
    email: string;
    phone: string;
    source: string;
    leadId: string;
    firstName: string;
    lastName: string;
    company?: string | undefined;
    score?: number | undefined;
}>;
export type LeadCreated = z.infer<typeof LeadCreatedSchema>;
/**
 * LeadScored - Lead được đánh giá/cập nhật điểm
 * Kích hoạt: Hệ thống tự động hoặc manual scoring
 */
export declare const LeadScoredSchema: z.ZodObject<{
    leadId: z.ZodString;
    score: z.ZodNumber;
    previousScore: z.ZodNumber;
    scoringCriteria: z.ZodArray<z.ZodObject<{
        criterion: z.ZodString;
        points: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        criterion: string;
        points: number;
    }, {
        criterion: string;
        points: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    score: number;
    leadId: string;
    previousScore: number;
    scoringCriteria: {
        criterion: string;
        points: number;
    }[];
}, {
    score: number;
    leadId: string;
    previousScore: number;
    scoringCriteria: {
        criterion: string;
        points: number;
    }[];
}>;
export type LeadScored = z.infer<typeof LeadScoredSchema>;
/**
 * LeadConverted - Lead được chuyển đổi thành Opportunity/Contact
 * Kích hoạt: Người dùng chuyển lead sang stage tiếp theo
 */
export declare const LeadConvertedSchema: z.ZodObject<{
    leadId: z.ZodString;
    convertedToType: z.ZodEnum<["contact", "opportunity"]>;
    contactId: z.ZodOptional<z.ZodString>;
    opportunityId: z.ZodOptional<z.ZodString>;
    dealAmount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    leadId: string;
    convertedToType: "contact" | "opportunity";
    contactId?: string | undefined;
    opportunityId?: string | undefined;
    dealAmount?: number | undefined;
}, {
    leadId: string;
    convertedToType: "contact" | "opportunity";
    contactId?: string | undefined;
    opportunityId?: string | undefined;
    dealAmount?: number | undefined;
}>;
export type LeadConverted = z.infer<typeof LeadConvertedSchema>;
/**
 * DealWon - Thương vụ được thắng/hoàn tất
 * Kích hoạt: Opportunity được đánh dấu là Won
 * Trigger: Tạo hóa đơn trong Accounting
 */
export declare const DealWonSchema: z.ZodObject<{
    dealId: z.ZodString;
    opportunityId: z.ZodString;
    customerId: z.ZodString;
    customerEmail: z.ZodString;
    customerName: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    dealDescription: z.ZodOptional<z.ZodString>;
    closedDate: z.ZodString;
    products: z.ZodOptional<z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        name: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        lineTotal: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
    }, {
        name: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    amount: number;
    opportunityId: string;
    dealId: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    closedDate: string;
    dealDescription?: string | undefined;
    products?: {
        name: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
    }[] | undefined;
}, {
    amount: number;
    opportunityId: string;
    dealId: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    closedDate: string;
    currency?: string | undefined;
    dealDescription?: string | undefined;
    products?: {
        name: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
    }[] | undefined;
}>;
export type DealWon = z.infer<typeof DealWonSchema>;
/**
 * DealLost - Thương vụ bị mất/đóng không thành công
 * Kích hoạt: Opportunity được đánh dấu là Lost
 */
export declare const DealLostSchema: z.ZodObject<{
    dealId: z.ZodString;
    opportunityId: z.ZodString;
    customerId: z.ZodString;
    amount: z.ZodNumber;
    lostReason: z.ZodString;
    competitorName: z.ZodOptional<z.ZodString>;
    lostDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    amount: number;
    opportunityId: string;
    dealId: string;
    customerId: string;
    lostReason: string;
    lostDate: string;
    competitorName?: string | undefined;
}, {
    amount: number;
    opportunityId: string;
    dealId: string;
    customerId: string;
    lostReason: string;
    lostDate: string;
    competitorName?: string | undefined;
}>;
export type DealLost = z.infer<typeof DealLostSchema>;
/**
 * Export all CRM event schemas
 */
export declare const CRMEventSchemas: {
    readonly 'crm.lead.created': z.ZodObject<{
        leadId: z.ZodString;
        email: z.ZodString;
        phone: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        source: z.ZodString;
        score: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        score: number;
        phone: string;
        source: string;
        leadId: string;
        firstName: string;
        lastName: string;
        company?: string | undefined;
    }, {
        email: string;
        phone: string;
        source: string;
        leadId: string;
        firstName: string;
        lastName: string;
        company?: string | undefined;
        score?: number | undefined;
    }>;
    readonly 'crm.lead.scored': z.ZodObject<{
        leadId: z.ZodString;
        score: z.ZodNumber;
        previousScore: z.ZodNumber;
        scoringCriteria: z.ZodArray<z.ZodObject<{
            criterion: z.ZodString;
            points: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            criterion: string;
            points: number;
        }, {
            criterion: string;
            points: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        score: number;
        leadId: string;
        previousScore: number;
        scoringCriteria: {
            criterion: string;
            points: number;
        }[];
    }, {
        score: number;
        leadId: string;
        previousScore: number;
        scoringCriteria: {
            criterion: string;
            points: number;
        }[];
    }>;
    readonly 'crm.lead.converted': z.ZodObject<{
        leadId: z.ZodString;
        convertedToType: z.ZodEnum<["contact", "opportunity"]>;
        contactId: z.ZodOptional<z.ZodString>;
        opportunityId: z.ZodOptional<z.ZodString>;
        dealAmount: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        leadId: string;
        convertedToType: "contact" | "opportunity";
        contactId?: string | undefined;
        opportunityId?: string | undefined;
        dealAmount?: number | undefined;
    }, {
        leadId: string;
        convertedToType: "contact" | "opportunity";
        contactId?: string | undefined;
        opportunityId?: string | undefined;
        dealAmount?: number | undefined;
    }>;
    readonly 'crm.deal.won': z.ZodObject<{
        dealId: z.ZodString;
        opportunityId: z.ZodString;
        customerId: z.ZodString;
        customerEmail: z.ZodString;
        customerName: z.ZodString;
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        dealDescription: z.ZodOptional<z.ZodString>;
        closedDate: z.ZodString;
        products: z.ZodOptional<z.ZodArray<z.ZodObject<{
            productId: z.ZodString;
            name: z.ZodString;
            quantity: z.ZodNumber;
            unitPrice: z.ZodNumber;
            lineTotal: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            productId: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
        }, {
            name: string;
            productId: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        amount: number;
        opportunityId: string;
        dealId: string;
        customerId: string;
        customerEmail: string;
        customerName: string;
        closedDate: string;
        dealDescription?: string | undefined;
        products?: {
            name: string;
            productId: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
        }[] | undefined;
    }, {
        amount: number;
        opportunityId: string;
        dealId: string;
        customerId: string;
        customerEmail: string;
        customerName: string;
        closedDate: string;
        currency?: string | undefined;
        dealDescription?: string | undefined;
        products?: {
            name: string;
            productId: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
        }[] | undefined;
    }>;
    readonly 'crm.deal.lost': z.ZodObject<{
        dealId: z.ZodString;
        opportunityId: z.ZodString;
        customerId: z.ZodString;
        amount: z.ZodNumber;
        lostReason: z.ZodString;
        competitorName: z.ZodOptional<z.ZodString>;
        lostDate: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        opportunityId: string;
        dealId: string;
        customerId: string;
        lostReason: string;
        lostDate: string;
        competitorName?: string | undefined;
    }, {
        amount: number;
        opportunityId: string;
        dealId: string;
        customerId: string;
        lostReason: string;
        lostDate: string;
        competitorName?: string | undefined;
    }>;
};
//# sourceMappingURL=crm.events.d.ts.map