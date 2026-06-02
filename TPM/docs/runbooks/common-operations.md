# Common Operations Runbook

This runbook covers day-to-day operational tasks for the TPM system.

---

## Table of Contents

1. [Deployment Operations](#deployment-operations)
2. [User Management](#user-management)
3. [Cache Operations](#cache-operations)
4. [Log Analysis](#log-analysis)
5. [Feature Flags](#feature-flags)
6. [Scheduled Tasks](#scheduled-tasks)

---

## Deployment Operations

### Deploy to Staging

```bash
# Automatic: Push to develop branch
git push origin develop

# Manual deploy
vercel --scope team-name
```

### Deploy to Production

```bash
# Automatic: Push to main branch
git push origin main

# Manual deploy
vercel --prod --scope team-name

# With specific commit
git checkout <commit-sha>
vercel --prod
```

### Verify Deployment

```bash
# Check deployment status
vercel ls --prod

# Check application health
curl -s https://tpm.company.com/api/health | jq .

# Check version
curl -s https://tpm.company.com/api/health | jq '.version'
```

### Rollback Deployment

```bash
# List recent deployments
vercel ls --prod

# Rollback to specific deployment
vercel rollback <deployment-url>

# Or via dashboard:
# 1. Go to Vercel Dashboard > Project > Deployments
# 2. Find previous working deployment
# 3. Click "..." > "Promote to Production"
```

### Environment Variables

```bash
# List environment variables
vercel env ls

# Add new variable
vercel env add VAR_NAME production

# Remove variable
vercel env rm VAR_NAME production

# Pull variables to local
vercel env pull .env.local
```

---

## User Management

### Create User (via API)

```bash
# Admin creates user via API
curl -X POST https://api.tpm.company.com/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@company.com",
    "name": "New User",
    "role": "SALES_REP",
    "region": "MB"
  }'
```

### Reset User Password

```bash
# Generate password reset link
curl -X POST https://api.tpm.company.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@company.com"}'
```

### Unlock User Account

```bash
# Via database
psql $DATABASE_URL -c "
  UPDATE users
  SET failed_login_attempts = 0,
      locked_until = NULL
  WHERE email = 'user@company.com'
"
```

### Disable User

```bash
curl -X PATCH https://api.tpm.company.com/api/admin/users/{userId} \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "INACTIVE"}'
```

### Bulk User Import

```bash
# Prepare CSV file
cat > users.csv << EOF
email,name,role,region
user1@company.com,User One,SALES_REP,MB
user2@company.com,User Two,SALES_REP,MN
EOF

# Import via admin API
curl -X POST https://api.tpm.company.com/api/admin/users/import \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "file=@users.csv"
```

---

## Cache Operations

### Redis Operations

```bash
# Connect to Redis
redis-cli -u $REDIS_URL

# Check Redis status
redis-cli -u $REDIS_URL INFO

# List all keys (use with caution in production)
redis-cli -u $REDIS_URL KEYS "*"

# Get specific key
redis-cli -u $REDIS_URL GET "session:user123"

# Delete specific key
redis-cli -u $REDIS_URL DEL "cache:promotions:list"

# Clear all cache (use with caution)
redis-cli -u $REDIS_URL FLUSHDB
```

### Clear Application Cache

```bash
# Clear user session
redis-cli -u $REDIS_URL DEL "session:{userId}"

# Clear promotion cache
redis-cli -u $REDIS_URL KEYS "cache:promotion:*" | xargs redis-cli -u $REDIS_URL DEL

# Clear rate limit for user
redis-cli -u $REDIS_URL DEL "ratelimit:{ip}"
```

### Cache Warm-up

```bash
# Trigger cache warm-up for common data
curl -X POST https://api.tpm.company.com/api/admin/cache/warmup \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Log Analysis

### Vercel Logs

```bash
# Real-time logs
vercel logs --follow

# Production logs
vercel logs --prod

# Filter by time
vercel logs --since 1h

# Filter by status
vercel logs --prod | grep "ERROR"
```

### Common Log Patterns

```bash
# Find all errors
vercel logs --prod | grep -E "ERROR|error|Error"

# Find slow requests (>2s)
vercel logs --prod | grep -E "duration.*[2-9][0-9]{3}ms"

# Find authentication failures
vercel logs --prod | grep "AUTH_"

# Find rate limit hits
vercel logs --prod | grep "429"
```

### Sentry Error Analysis

1. Go to https://sentry.io/organizations/company/issues/
2. Filter by:
   - Project: tpm-api or tpm-web
   - Environment: production
   - Time range: Last 24 hours
3. Sort by frequency or users affected
4. Click issue for stack trace and context

### Export Logs

```bash
# Export to file
vercel logs --prod --since 24h > logs-$(date +%Y%m%d).txt

# Export with JSON format (if supported)
vercel logs --prod --output json > logs.json
```

---

## Feature Flags

### Check Feature Flag Status

```bash
# Via API
curl -s https://api.tpm.company.com/api/admin/features \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

### Toggle Feature Flag

```bash
# Enable feature
curl -X PATCH https://api.tpm.company.com/api/admin/features/AI_INSIGHTS \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'

# Disable feature
curl -X PATCH https://api.tpm.company.com/api/admin/features/AI_INSIGHTS \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

### Feature Flag via Environment

```bash
# Set via Vercel
vercel env add ENABLE_AI_FEATURES production
# Enter: true

# Redeploy to apply
vercel --prod
```

### Gradual Rollout

```bash
# Enable for percentage of users
curl -X PATCH https://api.tpm.company.com/api/admin/features/NEW_DASHBOARD \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "rolloutPercentage": 10
  }'
```

---

## Scheduled Tasks

### Manual Trigger of Scheduled Jobs

```bash
# Trigger accrual calculation
curl -X POST https://api.tpm.company.com/api/admin/jobs/calculate-accruals \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Trigger report generation
curl -X POST https://api.tpm.company.com/api/admin/jobs/generate-reports \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reportType": "monthly", "period": "2024-01"}'

# Trigger data sync
curl -X POST https://api.tpm.company.com/api/admin/jobs/sync-erp \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Check Job Status

```bash
# List recent jobs
curl -s https://api.tpm.company.com/api/admin/jobs \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Get specific job status
curl -s https://api.tpm.company.com/api/admin/jobs/{jobId} \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

### Scheduled Job Schedule

| Job | Schedule | Description |
|-----|----------|-------------|
| Accrual Calculation | Daily 2:00 AM | Calculate daily accruals |
| Report Generation | Monthly 1st, 6:00 AM | Generate monthly reports |
| Data Cleanup | Weekly Sunday, 3:00 AM | Archive old data |
| ERP Sync | Hourly | Sync customer/product data |
| Email Digest | Daily 8:00 AM | Send pending notifications |

---

## Health Checks

### Full System Check

```bash
#!/bin/bash
# health-check.sh

echo "=== TPM Health Check ==="

# API Health
echo -n "API: "
curl -s https://api.tpm.company.com/api/health | jq -r '.status'

# Database
echo -n "Database: "
curl -s https://api.tpm.company.com/api/health | jq -r '.checks.database.status'

# Memory
echo -n "Memory: "
curl -s https://api.tpm.company.com/api/health | jq -r '.checks.memory.status'

# Redis
echo -n "Redis: "
redis-cli -u $REDIS_URL PING

# SSL Certificate
echo -n "SSL Expiry: "
echo | openssl s_client -servername tpm.company.com -connect tpm.company.com:443 2>/dev/null | openssl x509 -noout -enddate

echo "=== Check Complete ==="
```

### Monitoring Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/api/health` | Full health status | `{"status": "healthy"}` |
| `/api/health/live` | Liveness probe | `{"status": "ok"}` |
| `/api/health/ready` | Readiness probe | `{"status": "ready"}` |

---

## Quick Reference

### Common URLs

| Environment | Web | API |
|-------------|-----|-----|
| Production | https://tpm.company.com | https://api.tpm.company.com |
| Staging | https://staging.tpm.company.com | https://api-staging.tpm.company.com |
| Local | http://localhost:5173 | http://localhost:3001 |

### Common Commands

```bash
# Development
pnpm dev                    # Start dev servers
pnpm test                   # Run tests
pnpm lint                   # Lint code
pnpm db:studio              # Open Prisma Studio

# Deployment
vercel --prod               # Deploy to production
vercel logs --prod          # View production logs
vercel rollback <url>       # Rollback deployment

# Database
pnpm db:migrate             # Run migrations
pnpm db:seed                # Seed data
psql $DATABASE_URL          # Connect to database

# Cache
redis-cli -u $REDIS_URL     # Connect to Redis
```

### Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| On-Call | Rotating | PagerDuty |
| DevOps Lead | [Name] | [Phone] |
| Engineering Lead | [Name] | [Phone] |
