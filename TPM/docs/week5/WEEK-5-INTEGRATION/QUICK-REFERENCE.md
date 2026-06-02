# 📋 WEEK 5 INTEGRATION - QUICK REFERENCE

## 🗓️ DAILY TASKS

| Day | Focus | Deliverables |
|-----|-------|--------------|
| **Day 1** | ERP API | 6 endpoints + connection test + sync |
| **Day 2** | ERP UI | 2 pages + config form + sync logs |
| **Day 3** | DMS + Webhooks API | 11 endpoints + delivery service |
| **Day 4** | DMS + Webhooks UI | 4 pages + logs |
| **Day 5** | Security & Audit | 7 endpoints + 3 pages |

---

## 🔌 API ENDPOINTS CHECKLIST

### ERP Integration (6)
```
[ ] GET    /api/integration/erp
[ ] POST   /api/integration/erp
[ ] GET    /api/integration/erp/:id
[ ] PUT    /api/integration/erp/:id
[ ] POST   /api/integration/erp/:id/test
[ ] POST   /api/integration/erp/:id/sync
[ ] GET    /api/integration/erp/:id/logs
```

### DMS Integration (5)
```
[ ] GET    /api/integration/dms
[ ] POST   /api/integration/dms
[ ] GET    /api/integration/dms/:id
[ ] PUT    /api/integration/dms/:id
[ ] POST   /api/integration/dms/:id/sync
[ ] POST   /api/integration/dms/:id/push
```

### Webhooks (6)
```
[ ] GET    /api/integration/webhooks
[ ] POST   /api/integration/webhooks
[ ] GET    /api/integration/webhooks/:id
[ ] PUT    /api/integration/webhooks/:id
[ ] DELETE /api/integration/webhooks/:id
[ ] POST   /api/integration/webhooks/:id/test
[ ] GET    /api/integration/webhooks/:id/deliveries
[ ] POST   /api/integration/webhooks/:id/deliveries/:deliveryId/retry
```

### Security (7)
```
[ ] GET    /api/integration/security/api-keys
[ ] POST   /api/integration/security/api-keys
[ ] GET    /api/integration/security/api-keys/:id
[ ] DELETE /api/integration/security/api-keys/:id
[ ] GET    /api/integration/security/audit-logs
[ ] GET    /api/integration/security/audit-logs/:entityType/:entityId
[ ] GET    /api/integration/security/dashboard
```

---

## 📄 PAGES CHECKLIST

### ERP (2)
```
[ ] /integration/erp           → Connection list
[ ] /integration/erp/:id       → Config & sync logs
```

### DMS (2)
```
[ ] /integration/dms           → Connection list
[ ] /integration/dms/:id       → Config & sync
```

### Webhooks (2)
```
[ ] /integration/webhooks      → Endpoint list
[ ] /integration/webhooks/:id  → Config & delivery logs
```

### Security (3)
```
[ ] /integration/security          → Dashboard
[ ] /integration/security/api-keys → Key management
[ ] /integration/security/audit    → Audit trail
```

---

## 🧩 COMPONENTS CHECKLIST

### ERP
```
[ ] ERPConnectionCard.tsx
[ ] ERPConfigForm.tsx
[ ] ERPSyncStatus.tsx
[ ] ERPMappingTable.tsx
[ ] SyncLogTable.tsx
```

### DMS
```
[ ] DMSConnectionCard.tsx
[ ] DMSConfigForm.tsx
[ ] DMSSyncStatus.tsx
```

### Webhooks
```
[ ] WebhookCard.tsx
[ ] WebhookForm.tsx
[ ] WebhookLogTable.tsx
[ ] EventSelector.tsx
```

### Security
```
[ ] APIKeyCard.tsx
[ ] APIKeyForm.tsx
[ ] AuditLogTable.tsx
[ ] PermissionSelector.tsx
```

---

## 🪝 HOOKS CHECKLIST

```
[ ] useERP.ts
    - useERPConnections()
    - useERPConnection(id)
    - useCreateERPConnection()
    - useUpdateERPConnection()
    - useTestERPConnection()
    - useTriggerERPSync()
    - useERPSyncLogs(id)

[ ] useDMS.ts
    - useDMSConnections()
    - useDMSConnection(id)
    - useCreateDMSConnection()
    - useTriggerDMSSync()
    - usePushToDMS()

[ ] useWebhooks.ts
    - useWebhooks()
    - useWebhook(id)
    - useCreateWebhook()
    - useUpdateWebhook()
    - useTestWebhook()
    - useWebhookDeliveries(id)
    - useRetryDelivery()

[ ] useSecurity.ts
    - useAPIKeys()
    - useCreateAPIKey()
    - useRevokeAPIKey()
    - useAuditLogs(params)
    - useEntityAuditTrail(entityType, entityId)
```

---

## 🏢 ERP SYSTEMS SUPPORTED

| System | Connection Method | Auth |
|--------|-------------------|------|
| SAP S/4HANA | OData API | Basic/OAuth |
| SAP ECC | RFC/BAPI | SAP credentials |
| Oracle ERP | REST API | OAuth 2.0 |
| MS Dynamics | REST API | Azure AD |
| Custom | REST/SFTP | API Key/Basic |

---

## 📡 WEBHOOK EVENTS

| Category | Events |
|----------|--------|
| **Promotion** | created, updated, approved, rejected, completed |
| **Claim** | submitted, approved, rejected, paid |
| **Delivery** | created, delivered |
| **Inventory** | low_stock, near_expiry |

### Webhook Payload Format
```json
{
  "event": "promotion.approved",
  "timestamp": "2026-01-25T10:30:00Z",
  "data": {
    "promotionId": "...",
    "code": "PROMO-001",
    "name": "Summer Sale",
    "approvedAt": "2026-01-25T10:30:00Z",
    "approvedBy": "user@example.com"
  }
}
```

### Signature Verification
```typescript
// Verify webhook signature
const signature = req.headers['x-webhook-signature'];
const expectedSig = `sha256=${crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(req.body))
  .digest('hex')}`;

if (signature !== expectedSig) {
  throw new Error('Invalid signature');
}
```

---

## 🔐 API PERMISSIONS

| Permission | Description |
|------------|-------------|
| `read:promotions` | View promotions |
| `write:promotions` | Create/update promotions |
| `read:claims` | View claims |
| `write:claims` | Submit/approve claims |
| `read:customers` | View customers |
| `write:customers` | Create/update customers |
| `read:products` | View products |
| `write:products` | Create/update products |
| `read:reports` | View reports |
| `admin:all` | Full access |

---

## 📊 AUDIT ACTIONS

| Action | Description |
|--------|-------------|
| create | Record created |
| update | Record updated |
| delete | Record deleted |
| approve | Approval action |
| reject | Rejection action |
| login | User login |
| logout | User logout |
| revoke | API key revoked |
| sync | Data sync triggered |
| import | Data imported |
| export | Data exported |

---

## 🔄 SYNC WORKFLOWS

### ERP Sync Flow
```
1. Test connection
2. Configure field mappings
3. Set sync schedule (optional)
4. Trigger sync (manual or scheduled)
5. Monitor sync logs
6. Handle errors/retries
```

### DMS Sync Flow
```
1. Connect to distributor DMS
2. Pull sell-out/stock data (inbound)
3. Transform to internal format
4. Save to SellTracking/Inventory
5. Push promotions (outbound)
```

### Webhook Delivery Flow
```
1. Event occurs in system
2. Find matching webhook endpoints
3. Generate payload with signature
4. Deliver to endpoint URL
5. Log response
6. Retry on failure (exponential backoff)
```

---

## 📁 FILE STRUCTURE

```
apps/web/src/
├── pages/integration/
│   ├── index.tsx
│   ├── erp/
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── dms/
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── webhooks/
│   │   ├── index.tsx
│   │   └── [id].tsx
│   └── security/
│       ├── index.tsx
│       ├── api-keys.tsx
│       └── audit-logs.tsx
├── components/integration/
│   └── [components]
├── hooks/integration/
│   └── [hooks]
└── types/
    └── integration.ts

apps/api/api/integration/
├── erp.ts
├── dms.ts
├── webhooks.ts
└── security.ts
```

---

## 🚀 COMMANDS

```bash
# Start dev
npm run dev

# Generate Prisma client
cd apps/api && npx prisma generate

# Encrypt config (example)
openssl enc -aes-256-cbc -salt -in config.json -out config.enc

# Test webhook delivery
curl -X POST http://localhost:3000/api/integration/webhooks/xxx/test

# Commit progress
git add .
git commit -m "feat(integration): Day X - [description]"
```

---

## ✅ END OF WEEK 5 GOALS

- [ ] All 24 API endpoints working
- [ ] All 9 pages implemented
- [ ] ERP connection & sync works
- [ ] DMS sync & push works
- [ ] Webhook delivery with retry
- [ ] API key management
- [ ] Audit trail complete
- [ ] Tests passing
- [ ] Code committed

---

## 📊 WEEK 5 METRICS TARGET

| Metric | Target |
|--------|--------|
| API Endpoints | 24 |
| Pages | 9 |
| Components | ~15 |
| Hooks | ~25 |
| Test Coverage | >80% |
