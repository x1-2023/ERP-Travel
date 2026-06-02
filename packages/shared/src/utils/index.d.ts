import type { ApiResponse, PaginationMeta, EventEnvelope, Tier } from '../types';
export declare function successResponse<T>(data: T, meta?: PaginationMeta): ApiResponse<T>;
export declare function errorResponse(code: string, message: string, details?: Record<string, string[]>): ApiResponse<never>;
export declare function paginationMeta(page: number, pageSize: number, total: number): PaginationMeta;
export declare function createEvent<T>(type: string, source: string, data: T, context: {
    tenantId: string;
    userId: string;
}): EventEnvelope<T>;
export declare function generateId(): string;
export declare function generateCode(prefix: string, sequence: number, padLength?: number): string;
export declare function isTierAllowed(requiredTiers: Tier[], userTier: Tier): boolean;
export declare function getTierLevel(tier: Tier): number;
export declare function isAtLeastTier(userTier: Tier, requiredTier: Tier): boolean;
export declare function formatCurrency(amount: number, currency?: string, locale?: string): string;
export declare function formatDate(date: Date | string, locale?: string): string;
export declare function formatNumber(num: number, locale?: string): string;
export declare function isValidEmail(email: string): boolean;
export declare function isValidTaxCode(taxCode: string): boolean;
export declare function isValidPhone(phone: string): boolean;
export declare function slugify(text: string): string;
export declare function truncate(text: string, maxLength: number, suffix?: string): string;
//# sourceMappingURL=index.d.ts.map