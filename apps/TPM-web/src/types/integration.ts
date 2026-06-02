/**
 * Integration Module - Type Definitions
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export type ERPType = 'SAP' | 'ORACLE' | 'DYNAMICS' | 'CUSTOM';

export type DMSType = 'MISA' | 'FAST' | 'DMS_VIET' | 'CUSTOM';

export type ConnectionStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';

export type SyncStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'COMPLETED_WITH_ERRORS' | 'FAILED';

export type SyncDirection = 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';

export type WebhookDeliveryStatus = 'PENDING' | 'DELIVERED' | 'FAILED';

// ═══════════════════════════════════════════════════════════════════════════════
// ERP TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ERPConnection {
  id: string;
  name: string;
  type: ERPType;
  status: ConnectionStatus;
  config?: ERPConfig;
  lastSyncAt?: string;
  lastSyncStatus?: SyncStatus;
  syncSchedule?: string;
  mappings?: ERPMapping[];
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

export interface ERPConfig {
  // SAP
  sapHost?: string;
  sapClient?: string;
  sapUser?: string;
  sapPassword?: string;
  sapSystemId?: string;

  // Oracle
  oracleHost?: string;
  oracleUsername?: string;
  oraclePassword?: string;
  oracleServiceName?: string;

  // Generic REST
  baseUrl?: string;
  apiKey?: string;
  authType?: 'BASIC' | 'BEARER' | 'OAUTH2';
  authCredentials?: Record<string, string>;

  // SFTP
  sftpHost?: string;
  sftpPort?: number;
  sftpUser?: string;
  sftpKey?: string;
  sftpPath?: string;
}

export interface ERPMapping {
  id: string;
  connectionId: string;
  entityType: string;
  direction: SyncDirection;
  localField: string;
  remoteField: string;
  transformation?: Record<string, unknown>;
  isActive: boolean;
}

export interface ERPSyncLog {
  id: string;
  connectionId: string;
  syncType: 'FULL' | 'INCREMENTAL' | 'MANUAL';
  entityType: string;
  direction: SyncDirection;
  status: SyncStatus;
  recordsTotal: number;
  recordsSuccess: number;
  recordsFailed: number;
  errors?: string[];
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

export interface ERPListParams {
  type?: ERPType;
  status?: ConnectionStatus;
  search?: string;
}

export interface CreateERPConnectionRequest {
  name: string;
  type: ERPType;
  config: ERPConfig;
  syncSchedule?: string;
}

export interface UpdateERPConnectionRequest {
  name?: string;
  config?: Partial<ERPConfig>;
  syncSchedule?: string;
  status?: ConnectionStatus;
}

export interface SyncRequest {
  entityType: 'PRODUCT' | 'CUSTOMER' | 'ORDER' | 'GL' | 'ALL';
  direction?: SyncDirection;
  syncType?: 'FULL' | 'INCREMENTAL';
  dateFrom?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DMS TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DMSConnection {
  id: string;
  name: string;
  type: DMSType;
  distributorId: string;
  distributor?: {
    id: string;
    name: string;
    code: string;
  };
  status: ConnectionStatus;
  config?: DMSConfig;
  lastSyncAt?: string;
  lastSyncStatus?: SyncStatus;
  syncSchedule?: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

export interface DMSConfig {
  baseUrl?: string;
  apiKey?: string;
  username?: string;
  password?: string;

  // File-based config
  fileFormat?: 'CSV' | 'EXCEL' | 'XML';
  ftpHost?: string;
  ftpUser?: string;
  ftpPassword?: string;
  ftpPath?: string;

  // Data mapping
  sellOutMapping?: FieldMapping[];
  stockMapping?: FieldMapping[];
}

export interface FieldMapping {
  localField: string;
  remoteField: string;
  transformation?: string;
}

export interface CreateDMSConnectionRequest {
  name: string;
  type: DMSType;
  distributorId: string;
  config: DMSConfig;
  syncSchedule?: string;
}

export interface DMSSyncRequest {
  dataType: 'SELL_OUT' | 'STOCK' | 'ORDERS' | 'ALL';
  periodFrom?: string;
  periodTo?: string;
}

export interface DMSPushRequest {
  dataType: 'PROMOTIONS' | 'PRODUCTS' | 'PRICE_LIST';
  ids?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEBHOOK TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  isActive: boolean;
  headers?: Record<string, string>;
  retryConfig?: RetryConfig;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  backoffMultiplier: number;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  event: string;
  payload: Record<string, unknown>;
  status: WebhookDeliveryStatus;
  attempts: number;
  lastAttemptAt?: string;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
  createdAt: string;
}

export interface CreateWebhookRequest {
  name: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
  retryConfig?: RetryConfig;
}

export interface UpdateWebhookRequest {
  name?: string;
  url?: string;
  events?: string[];
  headers?: Record<string, string>;
  retryConfig?: RetryConfig;
  isActive?: boolean;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface APIKey {
  id: string;
  name: string;
  key?: string; // Only shown on creation
  keyPreview: string;
  permissions: string[];
  expiresAt?: string;
  lastUsedAt?: string;
  isActive: boolean;
  usageCount: number;
  rateLimit?: number;
  allowedIPs: string[];
  createdAt: string;
  createdById: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface CreateAPIKeyRequest {
  name: string;
  permissions: string[];
  expiresAt?: string;
  rateLimit?: number;
  allowedIPs?: string[];
}

export interface AuditLogParams {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface TestConnectionResult {
  success: boolean;
  message?: string;
  error?: string;
  latency?: number;
}

export interface ERPListResponse {
  data: ERPConnection[];
  summary: {
    total: number;
    active: number;
    byType: Record<string, number>;
    lastSyncErrors: number;
  };
}

export interface DMSListResponse {
  data: DMSConnection[];
  summary: {
    total: number;
    active: number;
    pendingSync: number;
  };
}

export interface WebhookListResponse {
  data: WebhookEndpoint[];
  summary: {
    total: number;
    active: number;
    deliveredToday: number;
    failedToday: number;
  };
}

export interface APIKeyListResponse {
  data: APIKey[];
  summary: {
    total: number;
    active: number;
    expiringSoon: number;
  };
}

export interface AuditLogResponse {
  data: AuditLog[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const ERP_TYPE_LABELS: Record<ERPType, string> = {
  SAP: 'SAP',
  ORACLE: 'Oracle',
  DYNAMICS: 'Microsoft Dynamics',
  CUSTOM: 'Custom',
};

export const DMS_TYPE_LABELS: Record<DMSType, string> = {
  MISA: 'Misa DMS',
  FAST: 'Fast DMS',
  DMS_VIET: 'DMS Việt',
  CUSTOM: 'Custom',
};

export const CONNECTION_STATUS_CONFIG: Record<ConnectionStatus, { label: string; color: string; bgColor: string }> = {
  ACTIVE: { label: 'Active', color: 'text-white', bgColor: 'bg-emerald-600 dark:bg-emerald-500' },
  INACTIVE: { label: 'Inactive', color: 'text-white', bgColor: 'bg-slate-500 dark:bg-slate-600' },
  ERROR: { label: 'Error', color: 'text-white', bgColor: 'bg-red-500 dark:bg-red-600' },
};

export const SYNC_STATUS_CONFIG: Record<SyncStatus, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Pending', color: 'text-white', bgColor: 'bg-slate-500 dark:bg-slate-600' },
  RUNNING: { label: 'Running', color: 'text-white', bgColor: 'bg-blue-500 dark:bg-blue-600' },
  COMPLETED: { label: 'Completed', color: 'text-white', bgColor: 'bg-emerald-600 dark:bg-emerald-500' },
  COMPLETED_WITH_ERRORS: { label: 'Completed with Errors', color: 'text-white', bgColor: 'bg-amber-500 dark:bg-amber-600' },
  FAILED: { label: 'Failed', color: 'text-white', bgColor: 'bg-red-500 dark:bg-red-600' },
};

export const WEBHOOK_EVENTS = [
  'promotion.created',
  'promotion.updated',
  'promotion.approved',
  'promotion.rejected',
  'promotion.completed',
  'claim.submitted',
  'claim.approved',
  'claim.rejected',
  'claim.paid',
  'delivery.created',
  'delivery.delivered',
  'inventory.low_stock',
  'inventory.near_expiry',
] as const;

export type WebhookEvent = typeof WEBHOOK_EVENTS[number];

export const API_PERMISSIONS = [
  'read:promotions',
  'write:promotions',
  'read:claims',
  'write:claims',
  'read:customers',
  'write:customers',
  'read:products',
  'write:products',
  'read:reports',
  'admin:all',
] as const;

export type APIPermission = typeof API_PERMISSIONS[number];

export const AUDIT_ACTIONS = [
  'create',
  'update',
  'delete',
  'approve',
  'reject',
  'login',
  'logout',
  'revoke',
  'sync',
  'import',
  'export',
] as const;

export type AuditAction = typeof AUDIT_ACTIONS[number];

// Constants for form selects
export const ERP_TYPES: ERPType[] = ['SAP', 'ORACLE', 'DYNAMICS', 'CUSTOM'];
export const DMS_TYPES: DMSType[] = ['MISA', 'FAST', 'DMS_VIET', 'CUSTOM'];
export const DMS_SYNC_TYPES = ['SELL_OUT', 'STOCK', 'ORDERS', 'ALL'] as const;
export type DMSSyncType = typeof DMS_SYNC_TYPES[number];
