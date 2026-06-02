# Incident Response Runbook

This runbook provides procedures for handling production incidents.

---

## Severity Levels

| Severity | Description | Response Time | Examples |
|----------|-------------|---------------|----------|
| **SEV1** | Critical - System down | 15 minutes | Complete outage, data loss |
| **SEV2** | High - Major feature broken | 1 hour | Authentication failing, payments broken |
| **SEV3** | Medium - Feature degraded | 4 hours | Slow performance, minor feature broken |
| **SEV4** | Low - Minor issue | 24 hours | UI glitch, non-critical bug |

---

## Incident Commander Responsibilities

1. Assess severity and declare incident
2. Assemble response team
3. Coordinate communication
4. Make decisions on mitigation
5. Ensure incident closure and postmortem

---

## Response Procedures

### SEV1: System Down

**Immediate Actions (0-15 min)**

```bash
# 1. Check system status
curl -s https://api.tpm.company.com/api/health | jq .

# 2. Check Vercel status
# Visit: https://www.vercel-status.com/

# 3. Check database connectivity
# Visit Neon dashboard or run:
psql $DATABASE_URL -c "SELECT 1"

# 4. Check recent deployments
vercel ls --prod

# 5. If recent deployment is suspect, rollback
vercel rollback <previous-deployment-url>
```

**Communication**
- Slack: Post in #incidents with severity
- Status page: Update status to "Investigating"
- Stakeholders: Notify via email if > 30 min

**Escalation**
- 15 min: Page on-call engineer
- 30 min: Page team lead
- 1 hour: Page engineering director

---

### SEV2: Major Feature Broken

**Diagnosis Checklist**

- [ ] Check error logs in Vercel/Sentry
- [ ] Check API error rates
- [ ] Check database query performance
- [ ] Check external service status
- [ ] Review recent code changes

**Common Fixes**

1. **Database connection issues**
   ```bash
   # Check connection pool
   psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity"

   # If exhausted, restart API
   vercel redeploy --prod
   ```

2. **Memory issues**
   ```bash
   # Check memory usage via health endpoint
   curl -s https://api.tpm.company.com/api/health | jq '.metrics.memoryUsage'

   # If high, restart
   vercel redeploy --prod
   ```

3. **Rate limiting issues**
   ```bash
   # Check Redis
   redis-cli -u $REDIS_URL info clients

   # Clear rate limit if needed (use cautiously)
   redis-cli -u $REDIS_URL FLUSHDB
   ```

---

## Common Scenarios

### 1. API Returning 500 Errors

**Symptoms**: Users seeing "Something went wrong" messages

**Diagnosis**:
```bash
# Check Sentry for errors
# Visit: https://sentry.io/organizations/company/issues/

# Check API logs
vercel logs --prod

# Check specific endpoint
curl -v https://api.tpm.company.com/api/promotions
```

**Resolution**:
1. Identify error in logs
2. If database issue, check Neon status
3. If code issue, identify bad deployment and rollback
4. If external service, enable fallback/circuit breaker

---

### 2. Login Not Working

**Symptoms**: Users cannot authenticate

**Diagnosis**:
```bash
# Test auth endpoint
curl -X POST https://api.tpm.company.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

# Check JWT secret is set
vercel env ls | grep JWT

# Check Redis (for sessions)
redis-cli -u $REDIS_URL PING
```

**Resolution**:
1. If JWT_SECRET missing, restore from secrets manager
2. If Redis down, restart or failover
3. If database down, see database recovery runbook

---

### 3. Slow Performance

**Symptoms**: Pages taking > 5 seconds to load

**Diagnosis**:
```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.tpm.company.com/api/health

# Check database query times
# Via Neon dashboard → Monitoring

# Check for N+1 queries in logs
vercel logs --prod | grep "prisma:query"
```

**Resolution**:
1. Identify slow queries
2. Add missing indexes
3. Enable query caching
4. Scale database if needed

---

### 4. High Error Rates

**Symptoms**: Error rate > 1% in monitoring

**Diagnosis**:
```bash
# Get error distribution
# Via Sentry dashboard

# Check specific error types
curl -s https://api.tpm.company.com/api/health
```

**Resolution**:
1. Identify most common error
2. Check if validation error (400) vs server error (500)
3. For 500s, check logs and fix root cause
4. For 400s, check client code or data quality

---

## Post-Incident

### Incident Closure Checklist

- [ ] Service restored to normal
- [ ] Monitoring shows healthy metrics
- [ ] Users notified of resolution
- [ ] Status page updated
- [ ] Timeline documented

### Postmortem Template

```markdown
# Incident Postmortem: [TITLE]

**Date**: YYYY-MM-DD
**Duration**: X hours Y minutes
**Severity**: SEVX
**Author**: [Name]

## Summary
Brief description of what happened.

## Impact
- Users affected: X
- Revenue impact: $Y
- SLA impact: Z%

## Timeline
- HH:MM - First alert
- HH:MM - Incident declared
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Service restored

## Root Cause
Technical explanation of what caused the incident.

## Resolution
What was done to fix the issue.

## Lessons Learned
What went well:
- Item 1
- Item 2

What could be improved:
- Item 1
- Item 2

## Action Items
| Item | Owner | Due Date |
|------|-------|----------|
| Add monitoring for X | @engineer | YYYY-MM-DD |
| Improve runbook for Y | @sre | YYYY-MM-DD |
```

---

## Contact Information

| Role | Name | Contact |
|------|------|---------|
| On-Call Engineer | Rotating | PagerDuty |
| Engineering Lead | [Name] | [Phone] |
| DevOps Lead | [Name] | [Phone] |
| VP Engineering | [Name] | [Phone] |

### External Support

| Service | Support URL | Account ID |
|---------|------------|------------|
| Vercel | https://vercel.com/support | team_xxx |
| Neon | https://neon.tech/support | org_xxx |
| CloudFlare | https://support.cloudflare.com | xxx |
