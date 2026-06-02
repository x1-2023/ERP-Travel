# Administrator Guide - Trade Promotion Management System

This guide covers system administration tasks for the TPM system.

---

## Table of Contents

1. [User Management](#user-management)
2. [Role & Permissions](#role--permissions)
3. [System Configuration](#system-configuration)
4. [Master Data Management](#master-data-management)
5. [Approval Workflows](#approval-workflows)
6. [Budget Management](#budget-management)
7. [Integrations](#integrations)
8. [Monitoring & Alerts](#monitoring--alerts)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

---

## User Management

### Creating Users

1. Navigate to **Settings** → **Users** → **Add User**
2. Fill in user details:

| Field | Description | Required |
|-------|-------------|----------|
| Email | Login email address | Yes |
| Full Name | Display name | Yes |
| Phone | Contact number | No |
| Department | Organization unit | Yes |
| Role | User role | Yes |
| Region | Assigned region(s) | Depends on role |
| Manager | Direct manager | No |

3. Click **Create User**
4. System sends welcome email with temporary password

### Bulk User Import

1. Download template: **Users** → **Import** → **Download Template**
2. Fill in user data in CSV format:
   ```csv
   email,fullName,phone,department,role,region,manager
   user@company.com,Nguyen Van A,0901234567,Sales,sales_rep,MB,manager@company.com
   ```
3. Upload file: **Users** → **Import** → **Upload CSV**
4. Review and confirm import

### User Status Management

| Status | Description | Actions |
|--------|-------------|---------|
| Active | Normal access | Deactivate |
| Inactive | No access, preserved data | Activate, Delete |
| Locked | Temporarily blocked | Unlock |
| Pending | Awaiting email verification | Resend, Delete |

### Password Policies

Configure in **Settings** → **Security** → **Password Policy**:

| Setting | Default | Recommended |
|---------|---------|-------------|
| Minimum length | 8 | 12 |
| Require uppercase | Yes | Yes |
| Require lowercase | Yes | Yes |
| Require number | Yes | Yes |
| Require special char | No | Yes |
| Expiry days | 90 | 60 |
| History count | 5 | 10 |

### Session Management

- **Session timeout**: Default 30 minutes of inactivity
- **Concurrent sessions**: Default 3 devices
- **Force logout**: Admin can force logout any user

---

## Role & Permissions

### Default Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| Admin | Full system access | All permissions |
| Finance Manager | Finance operations | Finance module, Reports |
| Regional Manager | Regional oversight | Region data, Approvals |
| Sales Manager | Team management | Team promotions, Claims |
| Sales Rep | Field operations | Create claims, View assigned |
| Viewer | Read-only access | View dashboards, Reports |

### Permission Categories

```
Promotions
├── promotions:create
├── promotions:read
├── promotions:update
├── promotions:delete
├── promotions:approve
└── promotions:export

Claims
├── claims:create
├── claims:read
├── claims:update
├── claims:approve
├── claims:process
└── claims:export

Finance
├── finance:accruals:manage
├── finance:deductions:manage
├── finance:journals:create
├── finance:journals:post
└── finance:reports:view

Admin
├── admin:users:manage
├── admin:roles:manage
├── admin:settings:manage
└── admin:audit:view
```

### Creating Custom Roles

1. Go to **Settings** → **Roles** → **Create Role**
2. Enter role name and description
3. Select permissions:
   - Check individual permissions
   - Use "Select All" for a category
4. Set data access scope:
   - **All**: Access all data
   - **Region**: Only assigned regions
   - **Team**: Only team data
   - **Own**: Only own data
5. Save role

### Data Access Control

Configure row-level security based on:

| Dimension | Options |
|-----------|---------|
| Region | All, Specific regions, Own region |
| Channel | All, Specific channels |
| Customer | All, Assigned customers |
| Promotion | All, Created by user, Team promotions |

---

## System Configuration

### General Settings

**Settings** → **System** → **General**

| Setting | Description |
|---------|-------------|
| Company Name | Displayed in header and emails |
| Logo | Company logo (max 500KB) |
| Timezone | System timezone (Asia/Ho_Chi_Minh) |
| Date Format | DD/MM/YYYY or MM/DD/YYYY |
| Currency | VND, USD |
| Decimal Places | 0 for VND, 2 for USD |

### Email Configuration

**Settings** → **System** → **Email**

```
SMTP Host: smtp.company.com
SMTP Port: 587
Security: TLS
Username: noreply@company.com
From Name: TPM System
```

Email templates can be customized:
- Welcome email
- Password reset
- Approval notifications
- Claim status updates

### Notification Settings

Configure notification channels:

| Event | Email | In-App | Push |
|-------|-------|--------|------|
| Promotion pending approval | Yes | Yes | Optional |
| Promotion approved/rejected | Yes | Yes | Yes |
| Claim submitted | No | Yes | No |
| Claim approved | Yes | Yes | Optional |
| Claim rejected | Yes | Yes | Yes |
| Budget alert | Yes | Yes | Yes |
| System maintenance | Yes | Yes | No |

---

## Master Data Management

### Regions

Manage geographic hierarchy:

```
Company
├── Mien Bac (MB)
│   ├── Ha Noi
│   ├── Hai Phong
│   └── ...
├── Mien Trung (MT)
│   ├── Da Nang
│   └── ...
└── Mien Nam (MN)
    ├── Ho Chi Minh
    ├── Can Tho
    └── ...
```

### Channels

| Code | Name | Description |
|------|------|-------------|
| GT | General Trade | Traditional retail |
| MT | Modern Trade | Supermarkets, convenience stores |
| HORECA | Hotel/Restaurant/Cafe | Hospitality |
| ONLINE | E-commerce | Online channels |

### Products

Maintain product master:

1. **Import products**: Settings → Products → Import
2. **Sync from ERP**: Configure integration
3. **Manual add**: Settings → Products → Add

Product fields:
- SKU, Name, Category, Brand
- Unit, Pack size
- Status (Active/Inactive)

### Customers

Customer master data includes:
- Customer code, Name, Tax code
- Address, Contact info
- Region, Channel classification
- Credit limit, Payment terms

### GL Accounts

Finance → Settings → GL Accounts

| Account | Description |
|---------|-------------|
| 641-001 | Promotion expense - Discount |
| 641-002 | Promotion expense - Rebate |
| 641-003 | Promotion expense - POSM |
| 331-XXX | Customer payables |
| 138-XXX | Accrued expenses |

---

## Approval Workflows

### Configure Approval Matrix

**Settings** → **Workflows** → **Promotion Approval**

| Level | Role | Condition |
|-------|------|-----------|
| 1 | Area Sales Manager | Budget < 50M |
| 2 | Regional Sales Manager | Budget 50M - 200M |
| 3 | National Sales Manager | Budget > 200M |

### Workflow Rules

Configure automatic routing:

```json
{
  "rules": [
    {
      "condition": "budget < 50000000",
      "approvers": ["asm"],
      "escalation": "rsm",
      "sla_hours": 24
    },
    {
      "condition": "budget >= 50000000 && budget < 200000000",
      "approvers": ["rsm"],
      "escalation": "nsm",
      "sla_hours": 48
    },
    {
      "condition": "budget >= 200000000",
      "approvers": ["nsm", "cfo"],
      "escalation": "ceo",
      "sla_hours": 72
    }
  ]
}
```

### SLA Configuration

| Approval Level | SLA | Escalation After |
|----------------|-----|------------------|
| Level 1 | 24 hours | 48 hours |
| Level 2 | 48 hours | 72 hours |
| Level 3 | 72 hours | 96 hours |

### Delegation

Users can delegate approval authority:
1. User goes to **Profile** → **Delegation**
2. Select delegate
3. Set date range
4. System routes approvals to delegate

---

## Budget Management

### Budget Hierarchy

```
Annual Budget
├── Q1 Budget
│   ├── January
│   ├── February
│   └── March
├── Q2 Budget
├── Q3 Budget
└── Q4 Budget
```

### Budget Allocation

**Finance** → **Budget** → **Allocate**

Allocate by:
- Region
- Channel
- Product category
- Promotion type

### Budget Controls

| Control | Action |
|---------|--------|
| Soft limit (80%) | Warning notification |
| Hard limit (100%) | Block new promotions |
| Over-budget | Requires CFO approval |

### Budget Transfers

Transfer budget between:
- Regions (requires RSM approval)
- Channels (requires NSM approval)
- Categories (requires Finance approval)

---

## Integrations

### ERP Integration

Configure SAP/Oracle connection:

**Settings** → **Integrations** → **ERP**

```yaml
type: sap
host: sap.company.com
port: 8443
client: 100
system_id: PRD
username: TPM_INTERFACE
sync_interval: 60  # minutes
```

Synchronized data:
- Customers (daily)
- Products (daily)
- Sales data (hourly)
- GL postings (real-time)

### API Access

Generate API keys for external systems:

1. **Settings** → **Integrations** → **API Keys**
2. Click **Generate New Key**
3. Set permissions and expiry
4. Copy key (shown once only)

API rate limits:
- Standard: 100 requests/minute
- Premium: 1000 requests/minute

### SSO Configuration

Support for:
- SAML 2.0
- OAuth 2.0 / OIDC
- Azure AD
- Google Workspace

---

## Monitoring & Alerts

### System Health

Monitor at `/api/health`:

```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "ok", "latency": 5 },
    "memory": { "status": "ok" },
    "disk": { "status": "ok", "usage": 45 }
  }
}
```

### Performance Metrics

Dashboard shows:
- API response times (p50, p95, p99)
- Database query performance
- Active users
- Error rates

### Alert Configuration

| Alert | Threshold | Action |
|-------|-----------|--------|
| High error rate | > 1% | Email + Slack |
| Slow response | p95 > 2s | Email |
| Database CPU | > 80% | Slack + PagerDuty |
| Disk usage | > 85% | Email |
| Failed logins | > 10/min | Email + Slack |

### Audit Logs

**Settings** → **Audit** → **Logs**

Logged events:
- User login/logout
- Data changes (create, update, delete)
- Permission changes
- Configuration changes
- Export operations

Retention: 2 years

Export audit logs:
- CSV for analysis
- Send to SIEM (Splunk, ELK)

---

## Backup & Recovery

### Automatic Backups

| Type | Frequency | Retention |
|------|-----------|-----------|
| Full | Daily (2 AM) | 30 days |
| Incremental | Hourly | 7 days |
| Transaction log | 15 minutes | 3 days |

### Manual Backup

**Settings** → **System** → **Backup**

1. Click **Create Backup**
2. Select backup type (Full/Partial)
3. Download when complete

### Restore Procedures

1. Contact support or use admin console
2. Select backup point
3. Choose restore type:
   - Full restore (entire database)
   - Partial restore (specific tables)
   - Point-in-time recovery

**Warning**: Restore operations overwrite current data.

### Disaster Recovery

RTO (Recovery Time Objective): 4 hours
RPO (Recovery Point Objective): 1 hour

Procedures:
1. Failover to DR site (automatic)
2. Verify system health
3. Notify users
4. Investigate root cause

---

## Troubleshooting

### Common Issues

#### Users can't log in
1. Check user status (active?)
2. Verify password hasn't expired
3. Check for account lockout
4. Review login error logs

#### Slow performance
1. Check database query times
2. Review active connections
3. Check memory usage
4. Analyze slow query logs

#### Email not sending
1. Verify SMTP configuration
2. Check email queue
3. Review error logs
4. Test SMTP connection

#### Integration sync failed
1. Check external system availability
2. Review sync logs
3. Verify credentials
4. Retry sync manually

### Log Analysis

Log locations:
```
/var/log/tpm/app.log       # Application logs
/var/log/tpm/error.log     # Error logs
/var/log/tpm/access.log    # Access logs
/var/log/tpm/audit.log     # Audit logs
```

Log levels:
- ERROR: Requires immediate attention
- WARN: Potential issues
- INFO: Normal operations
- DEBUG: Detailed debugging (dev only)

### Support Escalation

| Severity | Response Time | Examples |
|----------|---------------|----------|
| Critical | 1 hour | System down, data loss |
| High | 4 hours | Major feature broken |
| Medium | 8 hours | Minor feature issue |
| Low | 24 hours | Questions, enhancements |

Contact:
- Email: admin-support@company.com
- Phone: Internal ext. 1234
- Slack: #tpm-support

---

## Maintenance Windows

| Type | Schedule | Duration | Impact |
|------|----------|----------|--------|
| Patching | Sunday 2-4 AM | 2 hours | Possible downtime |
| Upgrades | First Sunday/month | 4 hours | Downtime |
| Emergency | As needed | Varies | Varies |

Notification:
- 1 week advance for planned maintenance
- 24 hours for urgent patches
- Immediate for emergencies
