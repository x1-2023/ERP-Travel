# ══════════════════════════════════════════════════════════════════════════════
#                    📅 WEEK 5: INTEGRATION MODULE
#                         Detailed Implementation Plan
# ══════════════════════════════════════════════════════════════════════════════

## 🎯 WEEK 5 GOALS

| Module | Pages | API Endpoints | Priority |
|--------|-------|---------------|----------|
| ERP Integration | 2 | 6 | 🔴 HIGH |
| DMS Integration | 2 | 5 | 🔴 HIGH |
| Webhooks | 2 | 6 | 🟡 MEDIUM |
| Security & Audit | 3 | 7 | 🔴 HIGH |
| **TOTAL** | **9** | **24** | |

---

## 📁 FILE STRUCTURE TO CREATE

```
apps/web/src/
├── pages/integration/
│   ├── index.tsx                    # Integration Dashboard
│   ├── erp/
│   │   ├── index.tsx                # ERP Connections List
│   │   └── [id].tsx                 # ERP Connection Detail/Config
│   ├── dms/
│   │   ├── index.tsx                # DMS Connections List
│   │   └── [id].tsx                 # DMS Connection Detail/Config
│   ├── webhooks/
│   │   ├── index.tsx                # Webhook Endpoints List
│   │   └── [id].tsx                 # Webhook Config/Logs
│   └── security/
│       ├── index.tsx                # Security Dashboard
│       ├── api-keys.tsx             # API Key Management
│       └── audit-logs.tsx           # Audit Trail
├── components/integration/
│   ├── ERPConnectionCard.tsx
│   ├── ERPConfigForm.tsx
│   ├── ERPSyncStatus.tsx
│   ├── DMSConnectionCard.tsx
│   ├── DMSConfigForm.tsx
│   ├── DMSSyncStatus.tsx
│   ├── WebhookCard.tsx
│   ├── WebhookForm.tsx
│   ├── WebhookLogTable.tsx
│   ├── APIKeyCard.tsx
│   ├── APIKeyForm.tsx
│   ├── AuditLogTable.tsx
│   └── IntegrationStats.tsx
├── hooks/integration/
│   ├── useERP.ts
│   ├── useDMS.ts
│   ├── useWebhooks.ts
│   └── useSecurity.ts
└── types/integration.ts

apps/api/api/integration/
├── erp.ts
├── dms.ts
├── webhooks.ts
└── security.ts
```

---

## 📅 DAY 1-2: ERP INTEGRATION

### 1.1 Business Logic

**ERP Integration là gì?**
- Kết nối với hệ thống SAP, Oracle, Microsoft Dynamics
- Sync master data (Products, Customers)
- Push/Pull transactions (Orders, Invoices, GL entries)

**Supported ERP Systems:**
```
SAP S/4HANA     → RFC/BAPI, OData
SAP ECC         → RFC/BAPI, IDoc
Oracle ERP      → REST API, Web Services
MS Dynamics 365 → REST API
Custom ERP      → REST API, SFTP
```

**Sync Modes:**
- **Real-time**: Immediate sync via API/Webhooks
- **Batch**: Scheduled sync (hourly/daily)
- **Manual**: On-demand sync trigger

### 1.2 Database Models

```prisma
model ERPConnection {
  id              String          @id @default(cuid())
  name            String
  type            ERPType         // SAP, ORACLE, DYNAMICS, CUSTOM
  status          ConnectionStatus // ACTIVE, INACTIVE, ERROR
  config          Json            // Connection config (encrypted)
  lastSyncAt      DateTime?
  lastSyncStatus  SyncStatus?
  syncSchedule    String?         // Cron expression
  mappings        ERPMapping[]
  syncLogs        ERPSyncLog[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  createdById     String
}

model ERPMapping {
  id              String          @id @default(cuid())
  connectionId    String
  connection      ERPConnection   @relation(...)
  entityType      String          // PRODUCT, CUSTOMER, ORDER, GL
  direction       SyncDirection   // INBOUND, OUTBOUND, BIDIRECTIONAL
  localField      String
  remoteField     String
  transformation  Json?           // Value mapping rules
  isActive        Boolean         @default(true)
}

model ERPSyncLog {
  id              String          @id @default(cuid())
  connectionId    String
  connection      ERPConnection   @relation(...)
  syncType        String          // FULL, INCREMENTAL, MANUAL
  entityType      String
  direction       SyncDirection
  status          SyncStatus      // PENDING, RUNNING, COMPLETED, FAILED
  recordsTotal    Int             @default(0)
  recordsSuccess  Int             @default(0)
  recordsFailed   Int             @default(0)
  errors          Json?
  startedAt       DateTime
  completedAt     DateTime?
  duration        Int?            // seconds
}
```

### 1.3 API Endpoints

#### GET /api/integration/erp
```typescript
interface ERPListParams {
  type?: ERPType;
  status?: ConnectionStatus;
  search?: string;
}

interface ERPListResponse {
  success: boolean;
  data: ERPConnection[];
  summary: {
    total: number;
    active: number;
    byType: Record<ERPType, number>;
    lastSyncErrors: number;
  };
}
```

#### POST /api/integration/erp
```typescript
interface CreateERPConnectionRequest {
  name: string;
  type: ERPType;
  config: ERPConfig;
  syncSchedule?: string;
}

interface ERPConfig {
  // SAP
  sapHost?: string;
  sapClient?: string;
  sapUser?: string;
  sapPassword?: string;  // Will be encrypted
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

// Business Logic
async function createERPConnection(data: CreateERPConnectionRequest, userId: string) {
  // 1. Encrypt sensitive config
  const encryptedConfig = await encryptConfig(data.config);
  
  // 2. Test connection
  const testResult = await testERPConnection(data.type, data.config);
  if (!testResult.success) {
    throw new Error(`Connection test failed: ${testResult.error}`);
  }
  
  // 3. Create connection
  const connection = await prisma.eRPConnection.create({
    data: {
      name: data.name,
      type: data.type,
      config: encryptedConfig,
      syncSchedule: data.syncSchedule,
      status: 'ACTIVE',
      createdById: userId
    }
  });
  
  // 4. Schedule sync job if cron provided
  if (data.syncSchedule) {
    await scheduleSyncJob(connection.id, data.syncSchedule);
  }
  
  return connection;
}
```

#### GET /api/integration/erp/:id
```typescript
interface ERPDetailResponse {
  success: boolean;
  data: ERPConnection & {
    mappings: ERPMapping[];
    recentLogs: ERPSyncLog[];
    stats: {
      totalSyncs: number;
      successRate: number;
      avgDuration: number;
      lastErrors: string[];
    };
  };
}
```

#### PUT /api/integration/erp/:id
```typescript
interface UpdateERPConnectionRequest {
  name?: string;
  config?: Partial<ERPConfig>;
  syncSchedule?: string;
  status?: ConnectionStatus;
}
```

#### POST /api/integration/erp/:id/test
```typescript
// Test connection
async function testConnection(id: string) {
  const connection = await prisma.eRPConnection.findUnique({ where: { id } });
  const config = await decryptConfig(connection.config);
  
  try {
    switch (connection.type) {
      case 'SAP':
        return await testSAPConnection(config);
      case 'ORACLE':
        return await testOracleConnection(config);
      case 'DYNAMICS':
        return await testDynamicsConnection(config);
      default:
        return await testRESTConnection(config);
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

#### POST /api/integration/erp/:id/sync
```typescript
interface SyncRequest {
  entityType: 'PRODUCT' | 'CUSTOMER' | 'ORDER' | 'GL' | 'ALL';
  direction?: SyncDirection;
  syncType?: 'FULL' | 'INCREMENTAL';
  dateFrom?: string;  // For incremental
}

// Business Logic
async function triggerSync(connectionId: string, data: SyncRequest, userId: string) {
  const connection = await prisma.eRPConnection.findUnique({
    where: { id: connectionId },
    include: { mappings: true }
  });
  
  if (connection.status !== 'ACTIVE') {
    throw new Error('Connection is not active');
  }

  // Create sync log
  const syncLog = await prisma.eRPSyncLog.create({
    data: {
      connectionId,
      syncType: data.syncType || 'INCREMENTAL',
      entityType: data.entityType,
      direction: data.direction || 'BIDIRECTIONAL',
      status: 'RUNNING',
      startedAt: new Date()
    }
  });

  // Queue sync job (async)
  await queueSyncJob({
    logId: syncLog.id,
    connectionId,
    entityType: data.entityType,
    direction: data.direction,
    syncType: data.syncType,
    dateFrom: data.dateFrom
  });

  return syncLog;
}

// Actual sync implementation (in worker)
async function executeSyncJob(job: SyncJob) {
  const connection = await prisma.eRPConnection.findUnique({
    where: { id: job.connectionId },
    include: { mappings: { where: { entityType: job.entityType, isActive: true } } }
  });
  
  const config = await decryptConfig(connection.config);
  let recordsTotal = 0;
  let recordsSuccess = 0;
  let recordsFailed = 0;
  const errors: string[] = [];

  try {
    // Get data from ERP
    const erpData = await fetchERPData(connection.type, config, job.entityType, job.dateFrom);
    recordsTotal = erpData.length;

    // Transform and sync each record
    for (const record of erpData) {
      try {
        const transformed = transformRecord(record, connection.mappings);
        await upsertLocalRecord(job.entityType, transformed);
        recordsSuccess++;
      } catch (error) {
        recordsFailed++;
        errors.push(`Record ${record.id}: ${error.message}`);
      }
    }

    // Update log
    await prisma.eRPSyncLog.update({
      where: { id: job.logId },
      data: {
        status: recordsFailed === 0 ? 'COMPLETED' : 'COMPLETED_WITH_ERRORS',
        recordsTotal,
        recordsSuccess,
        recordsFailed,
        errors: errors.length > 0 ? errors : null,
        completedAt: new Date(),
        duration: calculateDuration(job.startedAt)
      }
    });

    // Update connection last sync
    await prisma.eRPConnection.update({
      where: { id: job.connectionId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: recordsFailed === 0 ? 'COMPLETED' : 'COMPLETED_WITH_ERRORS'
      }
    });

  } catch (error) {
    await prisma.eRPSyncLog.update({
      where: { id: job.logId },
      data: {
        status: 'FAILED',
        errors: [error.message],
        completedAt: new Date()
      }
    });
  }
}
```

#### GET /api/integration/erp/:id/logs
```typescript
interface SyncLogParams {
  status?: SyncStatus;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}
```

### 1.4 UI Components

#### ERPConnectionCard
```tsx
interface ERPConnectionCardProps {
  connection: ERPConnection;
  onSync: () => void;
  onEdit: () => void;
}

export function ERPConnectionCard({ connection, onSync, onEdit }: ERPConnectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ERPLogo type={connection.type} className="h-10 w-10" />
            <div>
              <CardTitle>{connection.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{connection.type}</p>
            </div>
          </div>
          <ConnectionStatusBadge status={connection.status} />
        </div>
      </CardHeader>
      <CardContent>
        {/* Last Sync Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Sync:</span>
            <span>
              {connection.lastSyncAt 
                ? formatRelativeTime(connection.lastSyncAt)
                : 'Never'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Schedule:</span>
            <span>
              {connection.syncSchedule 
                ? describeCron(connection.syncSchedule)
                : 'Manual'}
            </span>
          </div>
          {connection.lastSyncStatus && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <SyncStatusBadge status={connection.lastSyncStatus} />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onEdit}>
          <Settings className="mr-2 h-4 w-4" />
          Configure
        </Button>
        <Button className="flex-1" onClick={onSync}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync Now
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## 📅 DAY 3: DMS INTEGRATION

### 2.1 Business Logic

**DMS Integration là gì?**
- Kết nối với Distributor Management Systems
- Sync sell-in/sell-out data
- Push promotions, claims to distributors

**Supported DMS:**
```
Misa DMS        → REST API
Fast DMS        → REST API
DMS Việt        → SOAP/REST
Custom DMS      → REST API, File-based
```

**Data Exchange:**
- **Inbound**: Sell-out, Stock, Customer orders
- **Outbound**: Promotions, Price lists, Products

### 2.2 API Endpoints

#### GET /api/integration/dms
```typescript
interface DMSListResponse {
  success: boolean;
  data: DMSConnection[];
  summary: {
    total: number;
    active: number;
    pendingSync: number;
  };
}
```

#### POST /api/integration/dms
```typescript
interface CreateDMSConnectionRequest {
  name: string;
  type: DMSType;
  distributorId: string;  // Link to Customer (distributor)
  config: DMSConfig;
  syncSchedule?: string;
}

interface DMSConfig {
  baseUrl: string;
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
```

#### POST /api/integration/dms/:id/sync
```typescript
interface DMSSyncRequest {
  dataType: 'SELL_OUT' | 'STOCK' | 'ORDERS' | 'ALL';
  periodFrom?: string;
  periodTo?: string;
}

async function syncDMSData(connectionId: string, data: DMSSyncRequest) {
  const connection = await prisma.dMSConnection.findUnique({
    where: { id: connectionId },
    include: { distributor: true }
  });

  // Fetch data from DMS
  let dmsData;
  if (connection.config.fileFormat) {
    // File-based: Download file from FTP
    dmsData = await fetchDMSFile(connection);
  } else {
    // API-based: Call DMS API
    dmsData = await fetchDMSAPI(connection, data);
  }

  // Transform and save to sell tracking
  if (data.dataType === 'SELL_OUT' || data.dataType === 'ALL') {
    for (const record of dmsData.sellOut || []) {
      await prisma.sellTracking.upsert({
        where: {
          customerId_productId_period: {
            customerId: connection.distributorId,
            productId: mapProductId(record.productCode),
            period: record.period
          }
        },
        update: {
          sellOutQty: record.quantity,
          sellOutValue: record.value
        },
        create: {
          customerId: connection.distributorId,
          productId: mapProductId(record.productCode),
          period: record.period,
          sellOutQty: record.quantity,
          sellOutValue: record.value
        }
      });
    }
  }

  return { success: true, recordsSynced: dmsData.length };
}
```

#### POST /api/integration/dms/:id/push
```typescript
interface DMSPushRequest {
  dataType: 'PROMOTIONS' | 'PRODUCTS' | 'PRICE_LIST';
  ids?: string[];  // Specific records to push
}

// Push promotions to distributor DMS
async function pushPromotionsToDMS(connectionId: string, promotionIds?: string[]) {
  const connection = await prisma.dMSConnection.findUnique({ where: { id: connectionId } });
  
  const promotions = await prisma.promotion.findMany({
    where: {
      ...(promotionIds && { id: { in: promotionIds } }),
      status: 'ACTIVE',
      customerId: connection.distributorId
    }
  });

  // Transform to DMS format
  const dmsPromotions = promotions.map(p => ({
    code: p.code,
    name: p.name,
    startDate: p.startDate,
    endDate: p.endDate,
    discountType: p.mechanics?.discountType,
    discountValue: p.mechanics?.discountValue,
    products: p.products?.map(pr => pr.code)
  }));

  // Push to DMS
  return await pushToDMS(connection, 'promotions', dmsPromotions);
}
```

---

## 📅 DAY 4: WEBHOOKS

### 3.1 Business Logic

**Webhooks là gì?**
- Outbound notifications khi có events
- Push data đến external systems
- Configurable per event type

**Supported Events:**
```
promotion.created       promotion.approved      promotion.completed
claim.submitted         claim.approved          claim.paid
delivery.created        delivery.delivered
inventory.low_stock     inventory.near_expiry
```

### 3.2 Database Models

```prisma
model WebhookEndpoint {
  id              String          @id @default(cuid())
  name            String
  url             String
  secret          String          // For signature verification
  events          String[]        // Event types to send
  isActive        Boolean         @default(true)
  headers         Json?           // Custom headers
  retryConfig     Json?           // Retry configuration
  deliveries      WebhookDelivery[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  createdById     String
}

model WebhookDelivery {
  id              String          @id @default(cuid())
  endpointId      String
  endpoint        WebhookEndpoint @relation(...)
  event           String
  payload         Json
  status          DeliveryStatus  // PENDING, DELIVERED, FAILED
  attempts        Int             @default(0)
  lastAttemptAt   DateTime?
  responseStatus  Int?
  responseBody    String?
  error           String?
  createdAt       DateTime        @default(now())
}
```

### 3.3 API Endpoints

#### GET /api/integration/webhooks
```typescript
interface WebhookListResponse {
  success: boolean;
  data: WebhookEndpoint[];
  summary: {
    total: number;
    active: number;
    deliveredToday: number;
    failedToday: number;
  };
}
```

#### POST /api/integration/webhooks
```typescript
interface CreateWebhookRequest {
  name: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
  retryConfig?: {
    maxAttempts: number;
    initialDelay: number;  // seconds
    backoffMultiplier: number;
  };
}

async function createWebhook(data: CreateWebhookRequest, userId: string) {
  // Generate secret for signature
  const secret = generateWebhookSecret();
  
  // Validate URL is accessible
  const testResult = await testWebhookURL(data.url);
  if (!testResult.success) {
    throw new Error(`URL test failed: ${testResult.error}`);
  }
  
  return prisma.webhookEndpoint.create({
    data: {
      ...data,
      secret,
      isActive: true,
      createdById: userId
    }
  });
}
```

#### POST /api/integration/webhooks/:id/test
```typescript
// Send test webhook
async function testWebhook(id: string) {
  const endpoint = await prisma.webhookEndpoint.findUnique({ where: { id } });
  
  const testPayload = {
    event: 'webhook.test',
    timestamp: new Date().toISOString(),
    data: {
      message: 'This is a test webhook delivery'
    }
  };
  
  return await deliverWebhook(endpoint, testPayload);
}
```

#### GET /api/integration/webhooks/:id/deliveries
```typescript
interface DeliveryLogParams {
  status?: DeliveryStatus;
  event?: string;
  dateFrom?: string;
  dateTo?: string;
}
```

#### POST /api/integration/webhooks/:id/deliveries/:deliveryId/retry
```typescript
// Retry failed delivery
async function retryDelivery(deliveryId: string) {
  const delivery = await prisma.webhookDelivery.findUnique({
    where: { id: deliveryId },
    include: { endpoint: true }
  });
  
  if (delivery.status !== 'FAILED') {
    throw new Error('Can only retry failed deliveries');
  }
  
  return await deliverWebhook(delivery.endpoint, delivery.payload, delivery.id);
}
```

### 3.4 Webhook Delivery Service

```typescript
// services/webhook.service.ts
import crypto from 'crypto';

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

async function deliverWebhook(
  endpoint: WebhookEndpoint, 
  payload: WebhookPayload,
  existingDeliveryId?: string
) {
  // Create or update delivery record
  const delivery = existingDeliveryId
    ? await prisma.webhookDelivery.update({
        where: { id: existingDeliveryId },
        data: { attempts: { increment: 1 }, lastAttemptAt: new Date() }
      })
    : await prisma.webhookDelivery.create({
        data: {
          endpointId: endpoint.id,
          event: payload.event,
          payload,
          status: 'PENDING',
          attempts: 1,
          lastAttemptAt: new Date()
        }
      });

  try {
    // Generate signature
    const signature = generateSignature(payload, endpoint.secret);
    
    // Send request
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Delivery': delivery.id,
        ...(endpoint.headers || {})
      },
      body: JSON.stringify(payload),
      timeout: 30000
    });

    // Update delivery status
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: response.ok ? 'DELIVERED' : 'FAILED',
        responseStatus: response.status,
        responseBody: await response.text().catch(() => null)
      }
    });

    return { success: response.ok, status: response.status };

  } catch (error) {
    // Update as failed
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: 'FAILED',
        error: error.message
      }
    });

    // Schedule retry if within limit
    const maxAttempts = endpoint.retryConfig?.maxAttempts || 3;
    if (delivery.attempts < maxAttempts) {
      await scheduleWebhookRetry(delivery.id, endpoint.retryConfig);
    }

    return { success: false, error: error.message };
  }
}

function generateSignature(payload: any, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return `sha256=${hmac.digest('hex')}`;
}

// Trigger webhooks on events
async function triggerWebhooks(event: string, data: any) {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: {
      isActive: true,
      events: { has: event }
    }
  });

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data
  };

  // Queue deliveries (don't await - fire and forget)
  for (const endpoint of endpoints) {
    queueWebhookDelivery(endpoint.id, payload);
  }
}

// Usage example - in promotion service
async function approvePromotion(id: string) {
  const promotion = await prisma.promotion.update({
    where: { id },
    data: { status: 'APPROVED' }
  });

  // Trigger webhook
  await triggerWebhooks('promotion.approved', {
    promotionId: promotion.id,
    code: promotion.code,
    name: promotion.name,
    approvedAt: new Date()
  });

  return promotion;
}
```

---

## 📅 DAY 5: SECURITY & AUDIT

### 4.1 Business Logic

**Security Features:**
- API Key management cho external access
- Role-based access control (RBAC)
- Audit trail cho tất cả thay đổi

**Audit Events:**
```
user.login              user.logout             user.password_change
promotion.create        promotion.update        promotion.delete
claim.submit            claim.approve           claim.reject
settings.change         api_key.create          api_key.revoke
```

### 4.2 Database Models

```prisma
model APIKey {
  id              String          @id @default(cuid())
  name            String
  key             String          @unique  // Hashed
  keyPreview      String          // Last 4 chars for display
  permissions     String[]        // read:promotions, write:claims, etc.
  expiresAt       DateTime?
  lastUsedAt      DateTime?
  isActive        Boolean         @default(true)
  usageCount      Int             @default(0)
  rateLimit       Int?            // requests per minute
  allowedIPs      String[]        // IP whitelist
  createdAt       DateTime        @default(now())
  createdById     String
}

model AuditLog {
  id              String          @id @default(cuid())
  userId          String?
  user            User?           @relation(...)
  action          String          // create, update, delete, login, etc.
  entityType      String          // Promotion, Claim, User, etc.
  entityId        String?
  oldValue        Json?
  newValue        Json?
  ipAddress       String?
  userAgent       String?
  metadata        Json?
  timestamp       DateTime        @default(now())
}
```

### 4.3 API Endpoints

#### GET /api/integration/security/api-keys
```typescript
interface APIKeyListResponse {
  success: boolean;
  data: APIKey[];  // key field is hidden
  summary: {
    total: number;
    active: number;
    expiringSoon: number;  // within 7 days
  };
}
```

#### POST /api/integration/security/api-keys
```typescript
interface CreateAPIKeyRequest {
  name: string;
  permissions: string[];
  expiresAt?: string;
  rateLimit?: number;
  allowedIPs?: string[];
}

async function createAPIKey(data: CreateAPIKeyRequest, userId: string) {
  // Generate key
  const rawKey = generateAPIKey();  // e.g., pm_live_xxxxxxxxxxxx
  const hashedKey = hashAPIKey(rawKey);
  const keyPreview = rawKey.slice(-4);

  const apiKey = await prisma.aPIKey.create({
    data: {
      name: data.name,
      key: hashedKey,
      keyPreview,
      permissions: data.permissions,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      rateLimit: data.rateLimit,
      allowedIPs: data.allowedIPs || [],
      createdById: userId
    }
  });

  // Log audit
  await createAuditLog({
    userId,
    action: 'create',
    entityType: 'APIKey',
    entityId: apiKey.id,
    newValue: { name: data.name, permissions: data.permissions }
  });

  // Return with raw key (only time it's shown)
  return {
    ...apiKey,
    key: rawKey  // Show once
  };
}
```

#### DELETE /api/integration/security/api-keys/:id
```typescript
// Revoke API key
async function revokeAPIKey(id: string, userId: string) {
  const apiKey = await prisma.aPIKey.update({
    where: { id },
    data: { isActive: false }
  });

  await createAuditLog({
    userId,
    action: 'revoke',
    entityType: 'APIKey',
    entityId: id
  });

  return apiKey;
}
```

#### GET /api/integration/security/audit-logs
```typescript
interface AuditLogParams {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

interface AuditLogResponse {
  success: boolean;
  data: AuditLog[];
  pagination: Pagination;
}
```

#### GET /api/integration/security/audit-logs/:entityType/:entityId
```typescript
// Get audit trail for specific entity
async function getEntityAuditTrail(entityType: string, entityId: string) {
  return prisma.auditLog.findMany({
    where: { entityType, entityId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { timestamp: 'desc' }
  });
}
```

### 4.4 Audit Middleware

```typescript
// middleware/audit.ts
import { prisma } from '@/lib/prisma';

interface AuditContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  metadata?: any;
  context?: AuditContext;
}) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId || params.context?.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue,
      newValue: params.newValue,
      ipAddress: params.context?.ipAddress,
      userAgent: params.context?.userAgent,
      metadata: params.metadata
    }
  });
}

// Prisma middleware for automatic auditing
prisma.$use(async (params, next) => {
  const result = await next(params);
  
  const auditableModels = ['Promotion', 'Claim', 'Customer', 'Product', 'Fund'];
  
  if (auditableModels.includes(params.model || '')) {
    const auditActions: Record<string, string> = {
      create: 'create',
      update: 'update',
      delete: 'delete'
    };
    
    const action = auditActions[params.action];
    if (action) {
      await createAuditLog({
        action,
        entityType: params.model!,
        entityId: result?.id,
        newValue: params.action === 'create' ? result : params.args.data,
        oldValue: params.action === 'update' ? await getOldValue(params) : undefined
      });
    }
  }
  
  return result;
});
```

### 4.5 UI Components

#### SecurityDashboard
```tsx
export default function SecurityDashboardPage() {
  const { data: apiKeys } = useAPIKeys();
  const { data: recentLogs } = useAuditLogs({ pageSize: 10 });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Security & Audit</h1>
          <p className="text-muted-foreground">
            Manage API access and view audit trail
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Active API Keys"
          value={apiKeys?.summary.active || 0}
          icon={<Key />}
        />
        <StatCard
          title="Expiring Soon"
          value={apiKeys?.summary.expiringSoon || 0}
          variant="warning"
          icon={<Clock />}
        />
        <StatCard
          title="Today's API Calls"
          value={formatNumber(todayCalls)}
          icon={<Activity />}
        />
        <StatCard
          title="Audit Events Today"
          value={auditEventsToday}
          icon={<FileText />}
        />
      </div>

      {/* API Keys Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>API Keys</CardTitle>
            <Button onClick={() => setShowCreateKey(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys?.data.map(key => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <code className="text-sm">pm_****{key.keyPreview}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {key.permissions.slice(0, 2).map(p => (
                        <Badge key={p} variant="secondary" className="text-xs">
                          {p}
                        </Badge>
                      ))}
                      {key.permissions.length > 2 && (
                        <Badge variant="secondary">+{key.permissions.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {key.lastUsedAt ? formatRelativeTime(key.lastUsedAt) : 'Never'}
                  </TableCell>
                  <TableCell>
                    {key.expiresAt ? formatDate(key.expiresAt) : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={key.isActive ? 'success' : 'secondary'}>
                      {key.isActive ? 'Active' : 'Revoked'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeKey(key.id)}
                      disabled={!key.isActive}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Audit Logs */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="outline" onClick={() => navigate('/integration/security/audit-logs')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AuditLogTable data={recentLogs?.data || []} compact />
        </CardContent>
      </Card>

      <CreateAPIKeyDialog
        open={showCreateKey}
        onClose={() => setShowCreateKey(false)}
      />
    </div>
  );
}
```

---

## ✅ WEEK 5 CHECKLIST

### Day 1
- [ ] ERP API: CRUD endpoints
- [ ] ERP API: Test connection
- [ ] ERP API: Sync trigger & logs
- [ ] ERP: Mapping configuration

### Day 2
- [ ] ERP UI: Connection list & cards
- [ ] ERP UI: Config form
- [ ] ERP UI: Sync status & logs
- [ ] useERP hooks

### Day 3
- [ ] DMS API: CRUD endpoints
- [ ] DMS API: Sync & push
- [ ] Webhook API: CRUD endpoints
- [ ] Webhook: Delivery service

### Day 4
- [ ] DMS UI: Connection management
- [ ] Webhook UI: Endpoint management
- [ ] Webhook UI: Delivery logs
- [ ] useDMS, useWebhooks hooks

### Day 5
- [ ] Security API: API key management
- [ ] Security API: Audit logs
- [ ] Security UI: Dashboard & pages
- [ ] Audit middleware
- [ ] Integration tests

---

## 📝 ACCEPTANCE CRITERIA

### ERP Integration
- ✅ Connect to SAP/Oracle/Custom
- ✅ Test connection works
- ✅ Sync data in/out
- ✅ Field mapping configurable
- ✅ Sync logs tracked

### DMS Integration
- ✅ Connect to distributor DMS
- ✅ Pull sell-out/stock data
- ✅ Push promotions to DMS
- ✅ File-based import supported

### Webhooks
- ✅ Configure webhook endpoints
- ✅ Events trigger deliveries
- ✅ Signature verification
- ✅ Retry on failure
- ✅ Delivery logs viewable

### Security
- ✅ Create/revoke API keys
- ✅ Permission-based access
- ✅ Audit trail complete
- ✅ IP whitelist supported

---

## 🚀 READY FOR WEEK 6

After Week 5: Advanced Features (AI, Voice, BI) + Full Testing
