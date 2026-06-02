# Database Operations Runbook

This runbook covers common database administration tasks and emergency procedures.

---

## Table of Contents

1. [Connection Information](#connection-information)
2. [Routine Operations](#routine-operations)
3. [Migration Procedures](#migration-procedures)
4. [Backup & Recovery](#backup--recovery)
5. [Performance Troubleshooting](#performance-troubleshooting)
6. [Emergency Procedures](#emergency-procedures)

---

## Connection Information

### Production Database (Neon)

```bash
# Connection string format
postgresql://user:password@ep-xxx.region.aws.neon.tech/tpm?sslmode=require

# Connect via psql
psql $DATABASE_URL

# Connect via Prisma Studio
pnpm db:studio
```

### Environment Variables

| Environment | Variable | Location |
|-------------|----------|----------|
| Production | DATABASE_URL | Vercel Env |
| Staging | DATABASE_URL | Vercel Env (staging) |
| Development | DATABASE_URL | .env.local |

---

## Routine Operations

### Check Database Health

```sql
-- Connection count
SELECT count(*) FROM pg_stat_activity;

-- Active queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;

-- Table sizes
SELECT relname AS table_name,
       pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

### Check Replication Lag (if using replicas)

```sql
SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn,
       pg_wal_lsn_diff(sent_lsn, replay_lsn) AS byte_lag
FROM pg_stat_replication;
```

### Vacuum Operations

```sql
-- Check when tables were last vacuumed
SELECT relname, last_vacuum, last_autovacuum, last_analyze, last_autoanalyze
FROM pg_stat_user_tables;

-- Manual vacuum (usually not needed with autovacuum)
VACUUM ANALYZE table_name;
```

---

## Migration Procedures

### Running Migrations

```bash
# Development
pnpm db:migrate:dev --name migration_name

# Production (applies pending migrations)
pnpm db:migrate

# Check migration status
pnpm prisma migrate status
```

### Creating Migrations

```bash
# After schema changes
pnpm db:migrate:dev --name add_new_field

# Generate migration without applying
pnpm prisma migrate dev --create-only
```

### Rollback Procedures

**Option 1: Prisma Rollback (if supported)**
```bash
# Check migration history
pnpm prisma migrate status

# Reset to specific migration (DESTRUCTIVE)
pnpm prisma migrate reset
```

**Option 2: Manual Rollback**
```sql
-- Remove from migration history
DELETE FROM _prisma_migrations WHERE migration_name = 'migration_to_rollback';

-- Then manually undo changes
ALTER TABLE promotions DROP COLUMN new_column;
```

### Safe Migration Practices

1. **Always backup before migrations**
   ```bash
   pg_dump $DATABASE_URL > backup-pre-migration.sql
   ```

2. **Test migrations on staging first**

3. **For large tables, use batched operations**
   ```sql
   -- Instead of one big UPDATE
   UPDATE large_table SET column = value WHERE id BETWEEN 1 AND 10000;
   UPDATE large_table SET column = value WHERE id BETWEEN 10001 AND 20000;
   -- etc.
   ```

4. **Add indexes concurrently**
   ```sql
   CREATE INDEX CONCURRENTLY idx_name ON table (column);
   ```

---

## Backup & Recovery

### Manual Backup

```bash
# Full backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Schema only
pg_dump $DATABASE_URL --schema-only > schema.sql

# Data only
pg_dump $DATABASE_URL --data-only > data.sql

# Specific tables
pg_dump $DATABASE_URL -t promotions -t claims > partial-backup.sql

# Compressed backup
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d).sql.gz
```

### Restore from Backup

```bash
# Full restore (CAUTION: overwrites data)
psql $DATABASE_URL < backup.sql

# Restore specific tables
psql $DATABASE_URL < partial-backup.sql

# Restore compressed
gunzip -c backup.sql.gz | psql $DATABASE_URL
```

### Point-in-Time Recovery (Neon)

1. Go to Neon Console
2. Select project
3. Go to "Restore"
4. Select timestamp
5. Create new branch from that point
6. Verify data
7. Promote branch if needed

### Neon Branching for Testing

```bash
# Create branch for testing
neonctl branches create --name test-migration

# Get connection string for branch
neonctl connection-string --branch test-migration

# Test migration on branch
DATABASE_URL="<branch-url>" pnpm db:migrate

# Delete branch when done
neonctl branches delete test-migration
```

---

## Performance Troubleshooting

### Identify Slow Queries

```sql
-- Enable query logging (check Neon dashboard)
-- Or use pg_stat_statements

-- Top 10 slowest queries
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Currently running long queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
  AND now() - pg_stat_activity.query_start > interval '5 seconds';
```

### Analyze Query Performance

```sql
-- Explain query plan
EXPLAIN ANALYZE SELECT * FROM promotions WHERE status = 'ACTIVE';

-- With more details
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM promotions WHERE status = 'ACTIVE';
```

### Index Optimization

```sql
-- Find missing indexes (tables with seq scans)
SELECT schemaname, relname, seq_scan, seq_tup_read,
       idx_scan, idx_tup_fetch
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan
  AND seq_tup_read > 10000
ORDER BY seq_tup_read DESC;

-- Create index
CREATE INDEX CONCURRENTLY idx_promotions_status ON promotions(status);

-- Drop unused indexes
DROP INDEX idx_unused;
```

### Connection Pool Issues

```sql
-- Check current connections
SELECT count(*), state
FROM pg_stat_activity
GROUP BY state;

-- Kill idle connections (use cautiously)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND query_start < now() - interval '10 minutes';
```

---

## Emergency Procedures

### Database Unreachable

1. **Check Neon status**: https://neon.tech/status

2. **Check connection**:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

3. **If Neon issue**: Wait for resolution or use read replica

4. **If network issue**: Check Vercel/DNS status

5. **Failover to replica** (if configured):
   ```bash
   # Update environment to use replica
   vercel env rm DATABASE_URL production
   vercel env add DATABASE_URL production
   # Enter replica URL
   ```

### High CPU/Memory Usage

1. **Identify resource-heavy queries**:
   ```sql
   SELECT pid, query, state, query_start
   FROM pg_stat_activity
   WHERE state = 'active'
   ORDER BY query_start;
   ```

2. **Kill problematic queries**:
   ```sql
   SELECT pg_cancel_backend(pid);  -- Graceful
   SELECT pg_terminate_backend(pid);  -- Force
   ```

3. **Scale database** (via Neon dashboard)

### Data Corruption Suspected

1. **Do NOT write more data**

2. **Create backup immediately**:
   ```bash
   pg_dump $DATABASE_URL > emergency-backup.sql
   ```

3. **Check for corruption**:
   ```sql
   -- Check table
   SELECT count(*) FROM table_name;

   -- Detailed check
   ANALYZE VERBOSE table_name;
   ```

4. **Contact Neon support** if confirmed

### Accidental Data Deletion

1. **Stop the application** (if still running deletes)

2. **Check Neon branches** for recent snapshot

3. **Use point-in-time recovery**:
   - Go to Neon Console
   - Restore to time before deletion
   - Export needed data
   - Import to main branch

4. **If no PITR available**, restore from backup:
   ```bash
   psql $DATABASE_URL < last-known-good-backup.sql
   ```

---

## Useful Scripts

### Export Data for Analysis

```bash
# Export to CSV
psql $DATABASE_URL -c "COPY (SELECT * FROM promotions WHERE created_at > '2024-01-01') TO STDOUT WITH CSV HEADER" > export.csv
```

### Database Size Report

```sql
-- Database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- All tables with sizes
SELECT
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size,
    pg_size_pretty(pg_indexes_size(quote_ident(table_name))) AS index_size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
```

### Clean Up Old Data

```sql
-- Archive old promotions (example)
INSERT INTO promotions_archive
SELECT * FROM promotions
WHERE status = 'COMPLETED'
  AND end_date < now() - interval '2 years';

DELETE FROM promotions
WHERE status = 'COMPLETED'
  AND end_date < now() - interval '2 years';

-- Vacuum after large deletes
VACUUM ANALYZE promotions;
```

---

## Contact

- **Neon Support**: support@neon.tech
- **DBA On-Call**: [PagerDuty schedule]
- **Escalation**: VP Engineering
