// ══════════════════════════════════════════════════════════════════════════════
//                    🔌 INTEGRATION MODULE - TYPE DEFINITIONS
//                         File: types/integration.ts
// ══════════════════════════════════════════════════════════════════════════════

import type { User } from '@vierp/tpm-shared';

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export enum ERPType {
  SAP = 'SAP',
  ORACLE = 'ORACLE',
  DYNAMICS = 'DYNAMICS',
  CUSTOM = 'CUSTOM',
}

export enum DMSType {
  MISA = 'MISA',
  FAST = 'FAST',
  DMS_VIET = 'DMS_VIET',
  CUSTOM = 'CUSTOM',
}

export enum ConnectionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
}

export enum SyncStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  COMPLETED_WITH_ERRORS = 'COMPLETED_WITH_ERRORS',
  FAILED = 'FAILED',
}

export enum SyncDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  BIDIRECTIONAL = 'BIDIRECTIONAL',
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERP TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ERPConnection {
  id: string;
  name: string;
  type: ERPType;
  status: ConnectionStatus;
  config: ERPConfig;
  lastSyncAt?: Date;
  lastSyncStatus?: SyncStatus;
  syncSchedule?: string;
  mappings?: ERPMapping[];
  syncLogs?: ERPSyncLog[];
  createdAt: Date;
  updatedAt: Date;
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
  authCredentials?: any;
  
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
  transformation?: any;
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
  startedAt: Date;
  completedAt?: Date;
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
  distributor?: any; // Customer
  status: ConnectionStatus;
  config: DMSConfig;
  lastSyncAt?: Date;
  lastSyncStatus?: SyncStatus;
  syncSchedule?: string;
  createdAt: Date;
  updatedAt: Date;
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
  secret: string;
  events: string[];
  isActive: boolean;
  headers?: Record<string, string>;
  retryConfig?: RetryConfig;
  deliveries?: WebhookDelivery[];
  createdAt: Date;
  updatedAt: Date;
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
  payload: any;
  status: DeliveryStatus;
  attempts: number;
  lastAttemptAt?: Date;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
  createdAt: Date;
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
  data: any;
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
  expiresAt?: Date;
  lastUsedAt?: Date;
  isActive: boolean;
  usageCount: number;
  rateLimit?: number;
  allowedIPs: string[];
  createdAt: Date;
  createdById: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: User;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  timestamp: Date;
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
// SHARED TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TestConnectionResult {
  success: boolean;
  message?: string;
  error?: string;
  latency?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const ERP_TYPE_LABELS: Record<ERPType, string> = {
  [ERPType.SAP]: 'SAP',
  [ERPType.ORACLE]: 'Oracle',
  [ERPType.DYNAMICS]: 'Microsoft Dynamics',
  [ERPType.CUSTOM]: 'Custom',
};

export const DMS_TYPE_LABELS: Record<DMSType, string> = {
  [DMSType.MISA]: 'Misa DMS',
  [DMSType.FAST]: 'Fast DMS',
  [DMSType.DMS_VIET]: 'DMS Việt',
  [DMSType.CUSTOM]: 'Custom',
};

export const CONNECTION_STATUS_LABELS: Record<ConnectionStatus, string> = {
  [ConnectionStatus.ACTIVE]: 'Active',
  [ConnectionStatus.INACTIVE]: 'Inactive',
  [ConnectionStatus.ERROR]: 'Error',
};

export const SYNC_STATUS_LABELS: Record<SyncStatus, string> = {
  [SyncStatus.PENDING]: 'Pending',
  [SyncStatus.RUNNING]: 'Running',
  [SyncStatus.COMPLETED]: 'Completed',
  [SyncStatus.COMPLETED_WITH_ERRORS]: 'Completed with Errors',
  [SyncStatus.FAILED]: 'Failed',
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
