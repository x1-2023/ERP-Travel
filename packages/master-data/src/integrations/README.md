# Master Data Integration Guide

## How modules integrate with @erp/master-data

### 1. HRM → Master Data (Employee sync)

HRM is the **source of truth** for employee data. When HRM creates/updates/terminates an employee, it publishes events via `@erp/events`. The Master Data Service listens and syncs.

```typescript
// In HRM module — already implemented in HRM-unified/src/lib/erp-integration/master-data.ts
import { syncEmployeeToMasterData } from './erp-integration/master-data';

// After creating an employee in HRM
await syncEmployeeToMasterData(employee, 'create', { tenantId, userId });
```

### 2. CRM → Master Data (Customer sync)

CRM is the **source of truth** for customer data.

```typescript
// In CRM module
import { publish } from '@erp/events';
import { EVENT_SUBJECTS } from '@erp/shared';

// After creating a customer in CRM
await publish(EVENT_SUBJECTS.CUSTOMER.CREATED, customerData, { tenantId, userId, source: 'crm' });
```

### 3. MRP → Master Data (Product sync)

MRP is the **source of truth** for product/material data.

```typescript
// In MRP module
import { publish } from '@erp/events';
import { EVENT_SUBJECTS } from '@erp/shared';

// After creating a product in MRP
await publish(EVENT_SUBJECTS.PRODUCT.CREATED, productData, { tenantId, userId, source: 'mrp' });
```

### 4. Any module reading master data

```typescript
// Direct service call
import { customerService, productService, employeeService } from '@erp/master-data';

const customers = await customerService.list({ tenantId, search: 'abc', page: 1, pageSize: 20 });
const product = await productService.getByCode('SP001', tenantId);

// Or via API routes (Next.js)
import { createEntityRoutes } from '@erp/master-data/api';
export const { GET, POST, PUT, DELETE } = createEntityRoutes('customer');
```

### 5. Startup initialization

```typescript
// In any module's startup (e.g., instrumentation.ts or app init)
import { startMasterDataSync } from '@erp/master-data';

// Only needed in one process (the master-data service or a designated sync worker)
await startMasterDataSync();
```

## Event Flow

```
HRM creates employee
  → publishes erp.employee.created via NATS
  → Master Data handler receives event
  → Creates/updates in shared DB
  → Other modules subscribed to employee events get notified

CRM creates customer
  → publishes erp.customer.created via NATS
  → Master Data handler receives event
  → Creates/updates in shared DB
  → OTB, Accounting get customer data

Master Data API creates product
  → Writes to DB
  → Publishes erp.product.created via NATS
  → MRP, OTB get product data
```

## Conflict Resolution

When the same entity is modified by multiple modules simultaneously:
- **Version-based**: Higher version number wins
- **Same version**: Fields are merged (non-null values from source)
- **Lower version**: Target (master data) keeps its version

All conflicts are logged for audit purposes.
