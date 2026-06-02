export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
export interface AuditableEntity extends BaseEntity {
    createdBy: string;
    updatedBy: string;
}
export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';
export type Tier = 'basic' | 'pro' | 'enterprise';
export interface User extends BaseEntity {
    email: string;
    name: string;
    role: UserRole;
    tier: Tier;
    tenantId: string;
    avatar?: string;
    isActive: boolean;
}
export interface AuthToken {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
}
export interface AuthContext {
    user: User;
    tenantId: string;
    permissions: string[];
    tier: Tier;
}
export interface Tenant extends BaseEntity {
    name: string;
    slug: string;
    tier: Tier;
    isActive: boolean;
    settings: TenantSettings;
}
export interface TenantSettings {
    locale: string;
    timezone: string;
    currency: string;
    dateFormat: string;
    modules: string[];
}
export interface Customer extends AuditableEntity {
    code: string;
    name: string;
    email?: string;
    phone?: string;
    address?: Address;
    taxCode?: string;
    tenantId: string;
    type: 'individual' | 'company';
    status: 'active' | 'inactive';
}
export interface Product extends AuditableEntity {
    code: string;
    name: string;
    description?: string;
    unit: string;
    category?: string;
    price: number;
    cost: number;
    tenantId: string;
    status: 'active' | 'inactive' | 'discontinued';
}
export interface Employee extends AuditableEntity {
    code: string;
    name: string;
    email: string;
    phone?: string;
    department?: string;
    position?: string;
    tenantId: string;
    status: 'active' | 'inactive' | 'terminated';
    hireDate: Date;
}
export interface Supplier extends AuditableEntity {
    code: string;
    name: string;
    email?: string;
    phone?: string;
    taxCode?: string;
    bankAccount?: string;
    bankName?: string;
    address?: Address;
    contactPerson?: string;
    paymentTermDays: number;
    rating?: number;
    tenantId: string;
    status: 'active' | 'inactive';
}
export interface Address {
    street?: string;
    ward?: string;
    district?: string;
    city: string;
    province?: string;
    country: string;
    postalCode?: string;
}
export interface EventEnvelope<T = unknown> {
    id: string;
    type: string;
    source: string;
    timestamp: string;
    tenantId: string;
    userId: string;
    data: T;
    metadata?: Record<string, string>;
}
export type EventType = 'customer.created' | 'customer.updated' | 'customer.deleted' | 'product.created' | 'product.updated' | 'product.deleted' | 'employee.created' | 'employee.updated' | 'employee.terminated' | 'supplier.created' | 'supplier.updated' | 'supplier.deleted' | 'order.created' | 'order.confirmed' | 'order.shipped' | 'order.completed' | 'order.cancelled' | 'inventory.updated' | 'inventory.low_stock' | 'inventory.transfer' | 'production.started' | 'production.completed' | 'production.failed' | 'invoice.created' | 'invoice.sent' | 'invoice.paid' | 'invoice.overdue' | 'journal.posted' | 'payment.received' | 'payment.made';
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: PaginationMeta;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}
export interface PaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}
export interface PaginationParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}
export interface FeatureFlag {
    key: string;
    name: string;
    description: string;
    enabledTiers: Tier[];
    isEnabled: boolean;
}
export declare const MODULE_TIERS: Record<string, Tier[]>;
//# sourceMappingURL=index.d.ts.map