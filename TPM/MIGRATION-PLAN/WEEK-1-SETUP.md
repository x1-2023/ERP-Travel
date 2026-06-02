# ══════════════════════════════════════════════════════════════════════════════
#                    📅 WEEK 1: SETUP & CORE INFRASTRUCTURE
#                         Detailed Sprint Tasks
# ══════════════════════════════════════════════════════════════════════════════

## 🎯 SPRINT GOALS

1. ✅ Clean workspace (archive/delete unused dirs)
2. ⬜ Sync database schema (add 16 missing models)
3. ⬜ Create API folder structure
4. ⬜ Setup shared utilities
5. ⬜ Create migration branch

---

## 📋 DAY 1: CLEANUP & PREPARATION

### Task 1.1: Run Cleanup Script
```bash
cd /Users/mac/TPM-TPO
chmod +x cleanup.sh
./cleanup.sh
```

**Expected Result:**
```
TPM-TPO/
├── vierp-tpm/        ✅ KEEP (reference)
├── vierp-tpm-web/     ✅ KEEP (main)
└── _archive/
    └── vierp-tpm-lambda-20260125/
```

### Task 1.2: Create Migration Branch
```bash
cd /Users/mac/TPM-TPO/vierp-tpm-web
git checkout main
git pull origin main
git checkout -b feature/full-migration
```

### Task 1.3: Verify Current State
```bash
# Check v2 structure
ls -la apps/
ls -la packages/

# Check database connection
cd apps/api
npx prisma db pull
npx prisma studio
```

---

## 📋 DAY 2: DATABASE SCHEMA ANALYSIS

### Task 2.1: Export Both Schemas
```bash
# Export old schema
cat /Users/mac/TPM-TPO/vierp-tpm/packages/database/prisma/schema.prisma > /tmp/schema-old.prisma

# Export new schema
cat /Users/mac/TPM-TPO/vierp-tpm-web/apps/api/prisma/schema.prisma > /tmp/schema-new.prisma

# Compare
diff /tmp/schema-old.prisma /tmp/schema-new.prisma > /tmp/schema-diff.txt
```

### Task 2.2: Identify Missing Models

**Models in OLD (86) but not in NEW (70) - Need to Add:**

```prisma
// ═══════════════════════════════════════════════════════════════════════════
// FINANCE MODELS
// ═══════════════════════════════════════════════════════════════════════════

model AccrualEntry {
  id            String   @id @default(cuid())
  promotionId   String
  promotion     Promotion @relation(fields: [promotionId], references: [id])
  period        String   // e.g., "2026-01"
  amount        Decimal  @db.Decimal(15, 2)
  status        AccrualStatus @default(PENDING)
  postedToGL    Boolean  @default(false)
  glJournalId   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])
}

model Deduction {
  id              String   @id @default(cuid())
  code            String   @unique
  customerId      String
  customer        Customer @relation(fields: [customerId], references: [id])
  invoiceNumber   String
  invoiceDate     DateTime
  amount          Decimal  @db.Decimal(15, 2)
  reason          String?
  status          DeductionStatus @default(OPEN)
  matchedClaimId  String?
  matchedClaim    Claim?   @relation(fields: [matchedClaimId], references: [id])
  disputeReason   String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model GLJournal {
  id            String   @id @default(cuid())
  entryNumber   String   @unique
  entryDate     DateTime
  description   String
  debitAccount  String
  creditAccount String
  amount        Decimal  @db.Decimal(15, 2)
  reference     String?
  sourceType    String   // ACCRUAL, CLAIM, DEDUCTION
  sourceId      String
  status        GLStatus @default(PENDING)
  postedAt      DateTime?
  createdAt     DateTime @default(now())
}

model ChequebookEntry {
  id            String   @id @default(cuid())
  chequeNumber  String   @unique
  payeeId       String
  payee         Customer @relation(fields: [payeeId], references: [id])
  amount        Decimal  @db.Decimal(15, 2)
  issueDate     DateTime
  dueDate       DateTime
  status        ChequeStatus @default(ISSUED)
  clearedAt     DateTime?
  voidedAt      DateTime?
  voidReason    String?
  claimId       String?
  claim         Claim?   @relation(fields: [claimId], references: [id])
  createdAt     DateTime @default(now())
}

// ═══════════════════════════════════════════════════════════════════════════
// PLANNING MODELS
// ═══════════════════════════════════════════════════════════════════════════

model PromotionTemplate {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  description String?
  type        PromotionType
  category    String?
  defaultDuration Int? // days
  defaultBudget   Decimal? @db.Decimal(15, 2)
  mechanics   Json?    // template mechanics
  isActive    Boolean  @default(true)
  versions    TemplateVersion[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])
}

model TemplateVersion {
  id          String   @id @default(cuid())
  templateId  String
  template    PromotionTemplate @relation(fields: [templateId], references: [id])
  version     Int
  changes     Json?
  createdAt   DateTime @default(now())
  createdById String
}

model Scenario {
  id          String   @id @default(cuid())
  name        String
  description String?
  baselineId  String?
  baseline    Baseline? @relation(fields: [baselineId], references: [id])
  status      ScenarioStatus @default(DRAFT)
  parameters  Json     // scenario parameters
  results     Json?    // calculated results
  versions    ScenarioVersion[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])
}

model ScenarioVersion {
  id          String   @id @default(cuid())
  scenarioId  String
  scenario    Scenario @relation(fields: [scenarioId], references: [id])
  version     Int
  parameters  Json
  results     Json?
  createdAt   DateTime @default(now())
}

model ClashDetection {
  id            String   @id @default(cuid())
  promotionId   String
  promotion     Promotion @relation(fields: [promotionId], references: [id])
  clashWithId   String
  clashWith     Promotion @relation("ClashWith", fields: [clashWithId], references: [id])
  clashType     ClashType
  severity      ClashSeverity
  description   String?
  resolution    String?
  resolvedAt    DateTime?
  resolvedById  String?
  createdAt     DateTime @default(now())
}

// ═══════════════════════════════════════════════════════════════════════════
// OPERATIONS MODELS
// ═══════════════════════════════════════════════════════════════════════════

model DeliveryOrder {
  id            String   @id @default(cuid())
  orderNumber   String   @unique
  promotionId   String
  promotion     Promotion @relation(fields: [promotionId], references: [id])
  customerId    String
  customer      Customer @relation(fields: [customerId], references: [id])
  status        DeliveryStatus @default(PENDING)
  scheduledDate DateTime
  deliveredAt   DateTime?
  lines         DeliveryLine[]
  trackingInfo  Json?
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model DeliveryLine {
  id              String   @id @default(cuid())
  deliveryOrderId String
  deliveryOrder   DeliveryOrder @relation(fields: [deliveryOrderId], references: [id])
  productId       String
  product         Product @relation(fields: [productId], references: [id])
  quantity        Int
  deliveredQty    Int      @default(0)
  status          LineStatus @default(PENDING)
}

model SellTracking {
  id          String   @id @default(cuid())
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
  productId   String
  product     Product @relation(fields: [productId], references: [id])
  period      String   // e.g., "2026-01"
  sellInQty   Int      @default(0)
  sellInValue Decimal  @db.Decimal(15, 2) @default(0)
  sellOutQty  Int      @default(0)
  sellOutValue Decimal @db.Decimal(15, 2) @default(0)
  stockQty    Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([customerId, productId, period])
}

model InventorySnapshot {
  id          String   @id @default(cuid())
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
  productId   String
  product     Product @relation(fields: [productId], references: [id])
  snapshotDate DateTime
  quantity    Int
  value       Decimal  @db.Decimal(15, 2)
  createdAt   DateTime @default(now())
}

// ═══════════════════════════════════════════════════════════════════════════
// AI MODELS
// ═══════════════════════════════════════════════════════════════════════════

model AIInsight {
  id          String   @id @default(cuid())
  type        InsightType
  title       String
  description String
  data        Json?
  confidence  Float    @default(0)
  actionable  Boolean  @default(false)
  action      String?
  entityType  String?  // PROMOTION, CUSTOMER, PRODUCT
  entityId    String?
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
}

model VoiceCommand {
  id          String   @id @default(cuid())
  transcript  String
  intent      String?
  entities    Json?
  action      String?
  status      CommandStatus @default(PENDING)
  result      Json?
  createdAt   DateTime @default(now())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
}

// ═══════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════

enum AccrualStatus {
  PENDING
  CALCULATED
  POSTED
  REVERSED
}

enum DeductionStatus {
  OPEN
  MATCHED
  DISPUTED
  RESOLVED
  WRITTEN_OFF
}

enum GLStatus {
  PENDING
  POSTED
  REVERSED
}

enum ChequeStatus {
  ISSUED
  CLEARED
  BOUNCED
  VOIDED
  EXPIRED
}

enum ScenarioStatus {
  DRAFT
  RUNNING
  COMPLETED
  ARCHIVED
}

enum ClashType {
  DATE_OVERLAP
  CUSTOMER_OVERLAP
  PRODUCT_OVERLAP
  BUDGET_CONFLICT
}

enum ClashSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum DeliveryStatus {
  PENDING
  SCHEDULED
  IN_TRANSIT
  DELIVERED
  PARTIAL
  CANCELLED
}

enum LineStatus {
  PENDING
  DELIVERED
  PARTIAL
  CANCELLED
}

enum InsightType {
  TREND
  ANOMALY
  RECOMMENDATION
  FORECAST
  ALERT
}

enum CommandStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## 📋 DAY 3: APPLY SCHEMA CHANGES

### Task 3.1: Update schema.prisma
```bash
cd /Users/mac/TPM-TPO/vierp-tpm-web/apps/api

# Backup current schema
cp prisma/schema.prisma prisma/schema.prisma.backup

# Add new models to schema.prisma
# (copy from above or use provided migration file)
```

### Task 3.2: Generate Migration
```bash
# Create migration
npx prisma migrate dev --name add_finance_planning_operations_models

# If errors, use push for development
npx prisma db push

# Generate client
npx prisma generate
```

### Task 3.3: Verify Schema
```bash
# Open Prisma Studio
npx prisma studio

# Check all tables exist
# Verify relations are correct
```

---

## 📋 DAY 4: API STRUCTURE SETUP

### Task 4.1: Create API Folder Structure
```bash
cd /Users/mac/TPM-TPO/vierp-tpm-web/apps/api/src

# Create module folders
mkdir -p api/finance
mkdir -p api/planning
mkdir -p api/operations
mkdir -p api/integration
mkdir -p api/ai

# Create placeholder files
touch api/finance/accruals.ts
touch api/finance/deductions.ts
touch api/finance/gl-journals.ts
touch api/finance/chequebook.ts

touch api/planning/templates.ts
touch api/planning/scenarios.ts
touch api/planning/clash-detection.ts

touch api/operations/delivery.ts
touch api/operations/sell-tracking.ts
touch api/operations/inventory.ts

touch api/integration/erp.ts
touch api/integration/dms.ts
touch api/integration/webhooks.ts

touch api/ai/insights.ts
touch api/ai/voice.ts
```

### Task 4.2: Create Route Index Files
```typescript
// api/finance/index.ts
export * from './accruals';
export * from './deductions';
export * from './gl-journals';
export * from './chequebook';
```

---

## 📋 DAY 5: SHARED UTILITIES & TESTING

### Task 5.1: Create Shared Types
```bash
cd /Users/mac/TPM-TPO/vierp-tpm-web/packages/shared/src

# Add new type definitions
# (These will be shared between web and api)
```

### Task 5.2: Verify Everything Works
```bash
# Run development servers
cd /Users/mac/TPM-TPO/vierp-tpm-web
npm run dev

# Test API health
curl http://localhost:3000/api/health

# Test existing endpoints still work
curl http://localhost:3000/api/promotions
```

### Task 5.3: Commit Week 1 Progress
```bash
git add .
git commit -m "feat: Week 1 - Setup migration infrastructure

- Add 16 new database models (Finance, Planning, Operations, AI)
- Create API folder structure for new modules
- Update shared types
- Ready for Week 2 feature implementation"

git push origin feature/full-migration
```

---

## ✅ WEEK 1 CHECKLIST

### Day 1
- [ ] Run cleanup script
- [ ] Verify only 2 directories remain
- [ ] Create feature/full-migration branch

### Day 2
- [ ] Export both schemas
- [ ] Identify 16 missing models
- [ ] Document schema differences

### Day 3
- [ ] Add new models to schema.prisma
- [ ] Run prisma migrate/push
- [ ] Verify in Prisma Studio

### Day 4
- [ ] Create API folder structure
- [ ] Create placeholder files
- [ ] Setup route indexes

### Day 5
- [ ] Add shared types
- [ ] Test everything works
- [ ] Commit and push

---

## 📊 WEEK 1 METRICS

| Metric | Target | Actual |
|--------|--------|--------|
| Directories cleaned | 2 | |
| Models added | 16 | |
| API folders created | 5 | |
| Tests passing | 100% | |
| Commit pushed | ✅ | |

---

## 🚀 READY FOR WEEK 2

After completing Week 1, you're ready to start implementing:
- **Week 2: Finance Module** (Accrual, Deductions, GL, Chequebook)

See `WEEK-2-FINANCE.md` for detailed tasks.
