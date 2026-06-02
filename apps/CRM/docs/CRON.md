# Scheduled Tasks (Cron Jobs)

Prismy CRM uses scheduled endpoints that need to be called periodically via cron jobs.

## Endpoints

### 1. Process Scheduled Campaigns

Sends campaigns that have reached their `scheduledAt` time.

```
POST /api/campaigns/process-scheduled
```

- Finds campaigns with `status = SCHEDULED` and `scheduledAt <= now()`
- Triggers the send flow for each due campaign
- Requires ADMIN permission (manage_settings)

### 2. Check Quote Expiry

Marks quotes past their `validUntil` date as EXPIRED.

```
POST /api/quotes/check-expiry
```

## Setup

### Vercel Cron

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/campaigns/process-scheduled",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/quotes/check-expiry",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### External Cron (crontab, EasyCron, etc.)

Call endpoints every 5 minutes:

```bash
# Scheduled campaigns
*/5 * * * * curl -s -X POST https://your-domain.com/api/campaigns/process-scheduled \
  -H "Authorization: Bearer YOUR_API_KEY"

# Quote expiry
*/5 * * * * curl -s -X POST https://your-domain.com/api/quotes/check-expiry
```

## Notes

- Both endpoints are idempotent and safe to call frequently
- Scheduled campaigns transition: SCHEDULED -> SENDING -> SENT
- Processing interval determines maximum delay between scheduled time and actual send (default: up to 5 minutes)
