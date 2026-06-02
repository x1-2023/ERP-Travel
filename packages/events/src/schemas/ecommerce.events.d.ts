import { z } from 'zod';
/**
 * OrderPlaced - Đơn hàng được tạo
 * Kích hoạt: Customer hoàn tất checkout
 * Flow: Check inventory → MRP (nếu stock thấp)
 */
export declare const OrderPlacedSchema: z.ZodObject<{
    orderId: z.ZodString;
    orderNumber: z.ZodString;
    customerId: z.ZodString;
    customerName: z.ZodString;
    customerEmail: z.ZodString;
    customerPhone: z.ZodOptional<z.ZodString>;
    shippingAddress: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        province: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    }, {
        street: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    }>;
    billingAddress: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        province: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    }, {
        street: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    }>>;
    orderDate: z.ZodString;
    currency: z.ZodDefault<z.ZodString>;
    subtotal: z.ZodNumber;
    shippingCost: z.ZodNumber;
    taxAmount: z.ZodOptional<z.ZodNumber>;
    discountAmount: z.ZodOptional<z.ZodNumber>;
    totalAmount: z.ZodNumber;
    lineItems: z.ZodArray<z.ZodObject<{
        lineId: z.ZodString;
        productId: z.ZodString;
        productName: z.ZodString;
        sku: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        lineTotal: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        lineId: string;
        productName: string;
        sku?: string | undefined;
    }, {
        productId: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        lineId: string;
        productName: string;
        sku?: string | undefined;
    }>, "many">;
    paymentMethod: z.ZodEnum<["credit_card", "bank_transfer", "wallet", "cash_on_delivery", "other"]>;
    shippingMethod: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    totalAmount: number;
    lineItems: {
        productId: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        lineId: string;
        productName: string;
        sku?: string | undefined;
    }[];
    paymentMethod: "other" | "bank_transfer" | "credit_card" | "wallet" | "cash_on_delivery";
    orderId: string;
    orderNumber: string;
    shippingAddress: {
        street: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    };
    orderDate: string;
    subtotal: number;
    shippingCost: number;
    shippingMethod: string;
    notes?: string | undefined;
    taxAmount?: number | undefined;
    discountAmount?: number | undefined;
    customerPhone?: string | undefined;
    billingAddress?: {
        street: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    } | undefined;
}, {
    customerId: string;
    customerEmail: string;
    customerName: string;
    totalAmount: number;
    lineItems: {
        productId: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        lineId: string;
        productName: string;
        sku?: string | undefined;
    }[];
    paymentMethod: "other" | "bank_transfer" | "credit_card" | "wallet" | "cash_on_delivery";
    orderId: string;
    orderNumber: string;
    shippingAddress: {
        street: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    };
    orderDate: string;
    subtotal: number;
    shippingCost: number;
    shippingMethod: string;
    currency?: string | undefined;
    notes?: string | undefined;
    taxAmount?: number | undefined;
    discountAmount?: number | undefined;
    customerPhone?: string | undefined;
    billingAddress?: {
        street: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    } | undefined;
}>;
export type OrderPlaced = z.infer<typeof OrderPlacedSchema>;
/**
 * OrderShipped - Đơn hàng được gửi đi
 * Kích hoạt: Admin xác nhận gửi hàng
 */
export declare const OrderShippedSchema: z.ZodObject<{
    orderId: z.ZodString;
    orderNumber: z.ZodString;
    customerId: z.ZodString;
    shippedDate: z.ZodString;
    trackingNumber: z.ZodOptional<z.ZodString>;
    carrier: z.ZodOptional<z.ZodString>;
    estimatedDelivery: z.ZodOptional<z.ZodString>;
    shippingCost: z.ZodNumber;
    lineItems: z.ZodOptional<z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
    }, {
        productId: string;
        quantity: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    orderId: string;
    orderNumber: string;
    shippingCost: number;
    shippedDate: string;
    lineItems?: {
        productId: string;
        quantity: number;
    }[] | undefined;
    trackingNumber?: string | undefined;
    carrier?: string | undefined;
    estimatedDelivery?: string | undefined;
}, {
    customerId: string;
    orderId: string;
    orderNumber: string;
    shippingCost: number;
    shippedDate: string;
    lineItems?: {
        productId: string;
        quantity: number;
    }[] | undefined;
    trackingNumber?: string | undefined;
    carrier?: string | undefined;
    estimatedDelivery?: string | undefined;
}>;
export type OrderShipped = z.infer<typeof OrderShippedSchema>;
/**
 * OrderDelivered - Đơn hàng được giao
 * Kích hoạt: Hệ thống tracking xác nhận delivery hoặc manual confirmation
 */
export declare const OrderDeliveredSchema: z.ZodObject<{
    orderId: z.ZodString;
    orderNumber: z.ZodString;
    customerId: z.ZodString;
    deliveredDate: z.ZodString;
    trackingNumber: z.ZodOptional<z.ZodString>;
    recipientName: z.ZodOptional<z.ZodString>;
    deliveryNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    orderId: string;
    orderNumber: string;
    deliveredDate: string;
    trackingNumber?: string | undefined;
    recipientName?: string | undefined;
    deliveryNotes?: string | undefined;
}, {
    customerId: string;
    orderId: string;
    orderNumber: string;
    deliveredDate: string;
    trackingNumber?: string | undefined;
    recipientName?: string | undefined;
    deliveryNotes?: string | undefined;
}>;
export type OrderDelivered = z.infer<typeof OrderDeliveredSchema>;
/**
 * OrderCancelled - Đơn hàng bị hủy
 * Kích hoạt: Customer hoặc admin hủy đơn
 */
export declare const OrderCancelledSchema: z.ZodObject<{
    orderId: z.ZodString;
    orderNumber: z.ZodString;
    customerId: z.ZodString;
    cancelledDate: z.ZodString;
    reason: z.ZodString;
    refundAmount: z.ZodNumber;
    refundStatus: z.ZodOptional<z.ZodEnum<["pending", "processed", "failed"]>>;
    lineItems: z.ZodOptional<z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
    }, {
        productId: string;
        quantity: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    customerId: string;
    orderId: string;
    orderNumber: string;
    cancelledDate: string;
    refundAmount: number;
    lineItems?: {
        productId: string;
        quantity: number;
    }[] | undefined;
    refundStatus?: "pending" | "processed" | "failed" | undefined;
}, {
    reason: string;
    customerId: string;
    orderId: string;
    orderNumber: string;
    cancelledDate: string;
    refundAmount: number;
    lineItems?: {
        productId: string;
        quantity: number;
    }[] | undefined;
    refundStatus?: "pending" | "processed" | "failed" | undefined;
}>;
export type OrderCancelled = z.infer<typeof OrderCancelledSchema>;
/**
 * PaymentCompleted - Thanh toán đơn hàng hoàn tất
 * Kích hoạt: Payment gateway xác nhận thành công
 */
export declare const PaymentCompletedSchema: z.ZodObject<{
    orderId: z.ZodString;
    orderNumber: z.ZodString;
    customerId: z.ZodString;
    paymentId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    paymentDate: z.ZodString;
    paymentMethod: z.ZodEnum<["credit_card", "bank_transfer", "wallet", "cash_on_delivery", "other"]>;
    transactionId: z.ZodOptional<z.ZodString>;
    paymentGateway: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    amount: number;
    customerId: string;
    paymentDate: string;
    paymentMethod: "other" | "bank_transfer" | "credit_card" | "wallet" | "cash_on_delivery";
    paymentId: string;
    orderId: string;
    orderNumber: string;
    metadata?: Record<string, unknown> | undefined;
    transactionId?: string | undefined;
    paymentGateway?: string | undefined;
}, {
    amount: number;
    customerId: string;
    paymentDate: string;
    paymentMethod: "other" | "bank_transfer" | "credit_card" | "wallet" | "cash_on_delivery";
    paymentId: string;
    orderId: string;
    orderNumber: string;
    currency?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    transactionId?: string | undefined;
    paymentGateway?: string | undefined;
}>;
export type PaymentCompleted = z.infer<typeof PaymentCompletedSchema>;
/**
 * Export all Ecommerce event schemas
 */
export declare const EcommerceEventSchemas: {
    readonly 'ecommerce.order.placed': z.ZodObject<{
        orderId: z.ZodString;
        orderNumber: z.ZodString;
        customerId: z.ZodString;
        customerName: z.ZodString;
        customerEmail: z.ZodString;
        customerPhone: z.ZodOptional<z.ZodString>;
        shippingAddress: z.ZodObject<{
            street: z.ZodString;
            city: z.ZodString;
            province: z.ZodString;
            postalCode: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            street: string;
            city: string;
            province: string;
            postalCode: string;
            country: string;
        }, {
            street: string;
            city: string;
            province: string;
            postalCode: string;
            country: string;
        }>;
        billingAddress: z.ZodOptional<z.ZodObject<{
            street: z.ZodString;
            city: z.ZodString;
            province: z.ZodString;
            postalCode: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            street: string;
            city: string;
            province: string;
            postalCode: string;
            country: string;
        }, {
            street: string;
            city: string;
            province: string;
            postalCode: string;
            country: string;
        }>>;
        orderDate: z.ZodString;
        currency: z.ZodDefault<z.ZodString>;
        subtotal: z.ZodNumber;
        shippingCost: z.ZodNumber;
        taxAmount: z.ZodOptional<z.ZodNumber>;
        discountAmount: z.ZodOptional<z.ZodNumber>;
        totalAmount: z.ZodNumber;
        lineItems: z.ZodArray<z.ZodObject<{
            lineId: z.ZodString;
            productId: z.ZodString;
            productName: z.ZodString;
            sku: z.ZodOptional<z.ZodString>;
            quantity: z.ZodNumber;
            unitPrice: z.ZodNumber;
            lineTotal: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            productId: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
            lineId: string;
            productName: string;
            sku?: string | undefined;
        }, {
            productId: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
            lineId: string;
            productName: string;
            sku?: string | undefined;
        }>, "many">;
        paymentMethod: z.ZodEnum<["credit_card", "bank_transfer", "wallet", "cash_on_delivery", "other"]>;
        shippingMethod: z.ZodString;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        customerId: string;
        customerEmail: string;
        customerName: string;
        totalAmount: number;
        lineItems: {
            productId: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
            lineId: string;
            productName: string;
            sku?: string | undefined;
        }[];
        paymentMethod: "other" | "bank_transfer" | "credit_card" | "wallet" | "cash_on_delivery";
        orderId: string;
        orderNumber: string;
        shippingAddress: {
            street: string;
            city: string;
            province: string;
            postalCode: string;
            country: string;
        };
        orderDate: string;
        subtotal: number;
        shippingCost: number;
        shippingMethod: string;
        notes?: string | undefined;
        taxAmount?: number | undefined;
        discountAmount?: number | undefined;
        customerPhone?: string | undefined;
        billingAddress?: {
            street: string;
            city: string;
            province: string;
            postalCode: string;
            country: string;
        } | undefined;
    }, {
        customerId: string;
        customerEmail: string;
        customerName: string;
        totalAmount: number;
        lineItems: {
            productId: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
            lineId: string;
            productName: string;
            sku?: string | undefined;
        }[];
        paymentMethod: "other" | "bank_transfer" | "credit_card" | "wallet" | "cash_on_delivery";
        orderId: string;
        orderNumber: string;
        shippingAddress: {
            street: string;
            city: string;
            province: string;
            postalCode: string;
            country: string;
        };
        orderDate: string;
        subtotal: number;
        shippingCost: number;
        shippingMethod: string;
        currency?: string | undefined;
        notes?: string | undefined;
        taxAmount?: number | undefined;
        discountAmount?: number | undefined;
        customerPhone?: string | undefined;
        billingAddress?: {
            street: string;
            city: string;
            province: string;
            postalCode: string;
            country: string;
        } | undefined;
    }>;
    readonly 'ecommerce.order.shipped': z.ZodObject<{
        orderId: z.ZodString;
        orderNumber: z.ZodString;
        customerId: z.ZodString;
        shippedDate: z.ZodString;
        trackingNumber: z.ZodOptional<z.ZodString>;
        carrier: z.ZodOptional<z.ZodString>;
        estimatedDelivery: z.ZodOptional<z.ZodString>;
        shippingCost: z.ZodNumber;
        lineItems: z.ZodOptional<z.ZodArray<z.ZodObject<{
            productId: z.ZodString;
            quantity: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            productId: string;
            quantity: number;
        }, {
            productId: string;
            quantity: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        customerId: string;
        orderId: string;
        orderNumber: string;
        shippingCost: number;
        shippedDate: string;
        lineItems?: {
            productId: string;
            quantity: number;
        }[] | undefined;
        trackingNumber?: string | undefined;
        carrier?: string | undefined;
        estimatedDelivery?: string | undefined;
    }, {
        customerId: string;
        orderId: string;
        orderNumber: string;
        shippingCost: number;
        shippedDate: string;
        lineItems?: {
            productId: string;
            quantity: number;
        }[] | undefined;
        trackingNumber?: string | undefined;
        carrier?: string | undefined;
        estimatedDelivery?: string | undefined;
    }>;
    readonly 'ecommerce.order.delivered': z.ZodObject<{
        orderId: z.ZodString;
        orderNumber: z.ZodString;
        customerId: z.ZodString;
        deliveredDate: z.ZodString;
        trackingNumber: z.ZodOptional<z.ZodString>;
        recipientName: z.ZodOptional<z.ZodString>;
        deliveryNotes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        customerId: string;
        orderId: string;
        orderNumber: string;
        deliveredDate: string;
        trackingNumber?: string | undefined;
        recipientName?: string | undefined;
        deliveryNotes?: string | undefined;
    }, {
        customerId: string;
        orderId: string;
        orderNumber: string;
        deliveredDate: string;
        trackingNumber?: string | undefined;
        recipientName?: string | undefined;
        deliveryNotes?: string | undefined;
    }>;
    readonly 'ecommerce.order.cancelled': z.ZodObject<{
        orderId: z.ZodString;
        orderNumber: z.ZodString;
        customerId: z.ZodString;
        cancelledDate: z.ZodString;
        reason: z.ZodString;
        refundAmount: z.ZodNumber;
        refundStatus: z.ZodOptional<z.ZodEnum<["pending", "processed", "failed"]>>;
        lineItems: z.ZodOptional<z.ZodArray<z.ZodObject<{
            productId: z.ZodString;
            quantity: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            productId: string;
            quantity: number;
        }, {
            productId: string;
            quantity: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        reason: string;
        customerId: string;
        orderId: string;
        orderNumber: string;
        cancelledDate: string;
        refundAmount: number;
        lineItems?: {
            productId: string;
            quantity: number;
        }[] | undefined;
        refundStatus?: "pending" | "processed" | "failed" | undefined;
    }, {
        reason: string;
        customerId: string;
        orderId: string;
        orderNumber: string;
        cancelledDate: string;
        refundAmount: number;
        lineItems?: {
            productId: string;
            quantity: number;
        }[] | undefined;
        refundStatus?: "pending" | "processed" | "failed" | undefined;
    }>;
    readonly 'ecommerce.payment.completed': z.ZodObject<{
        orderId: z.ZodString;
        orderNumber: z.ZodString;
        customerId: z.ZodString;
        paymentId: z.ZodString;
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        paymentDate: z.ZodString;
        paymentMethod: z.ZodEnum<["credit_card", "bank_transfer", "wallet", "cash_on_delivery", "other"]>;
        transactionId: z.ZodOptional<z.ZodString>;
        paymentGateway: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        amount: number;
        customerId: string;
        paymentDate: string;
        paymentMethod: "other" | "bank_transfer" | "credit_card" | "wallet" | "cash_on_delivery";
        paymentId: string;
        orderId: string;
        orderNumber: string;
        metadata?: Record<string, unknown> | undefined;
        transactionId?: string | undefined;
        paymentGateway?: string | undefined;
    }, {
        amount: number;
        customerId: string;
        paymentDate: string;
        paymentMethod: "other" | "bank_transfer" | "credit_card" | "wallet" | "cash_on_delivery";
        paymentId: string;
        orderId: string;
        orderNumber: string;
        currency?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
        transactionId?: string | undefined;
        paymentGateway?: string | undefined;
    }>;
};
//# sourceMappingURL=ecommerce.events.d.ts.map