# Deployment Guide - Trade Promotion Management System

This guide covers deployment procedures for various environments.

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Vercel Deployment](#vercel-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Database Setup](#database-setup)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Monitoring Setup](#monitoring-setup)
9. [SSL/TLS Configuration](#ssltls-configuration)
10. [Rollback Procedures](#rollback-procedures)

---

## Deployment Overview

### Architecture

```
                    ┌─────────────────┐
                    │   CloudFlare    │
                    │   (CDN + WAF)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐
       │   Vercel    │ │  Vercel   │ │  Railway  │
       │   (Web)     │ │  (API)    │ │ (Workers) │
       └──────┬──────┘ └─────┬─────┘ └─────┬─────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐
       │  Neon DB    │ │  Upstash  │ │    S3     │
       │ (PostgreSQL)│ │  (Redis)  │ │ (Storage) │
       └─────────────┘ └───────────┘ └───────────┘
```

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | localhost:5173 | Local development |
| Staging | staging.tpm.company.com | Testing, QA |
| Production | tpm.company.com | Live system |

---

## Prerequisites

### Required Accounts

- [ ] GitHub account with repository access
- [ ] Vercel account (Team plan recommended)
- [ ] Neon database account
- [ ] Upstash Redis account
- [ ] CloudFlare account (optional but recommended)

### CLI Tools

```bash
# Install Vercel CLI
npm i -g vercel

# Install Railway CLI (if using Railway)
npm i -g @railway/cli

# Verify installations
vercel --version
```

---

## Environment Configuration

### Required Environment Variables

```env
# Application
NODE_ENV=production
APP_URL=https://tpm.company.com
API_URL=https://api.tpm.company.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require

# Redis
REDIS_URL=redis://default:pass@host:6379

# Authentication
JWT_SECRET=<64-character-random-string>
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_IN=7d

# Security
CORS_ORIGIN=https://tpm.company.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# External Services (optional)
SENTRY_DSN=https://xxx@sentry.io/xxx
POSTHOG_API_KEY=phc_xxx

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_ANALYTICS=true
```

### Generating Secrets

```bash
# Generate JWT secret
openssl rand -base64 48

# Generate secure password
openssl rand -base64 32
```

---

## Vercel Deployment

### Initial Setup

1. **Connect Repository**:
   ```bash
   cd vierp-tpm-web
   vercel link
   ```

2. **Configure Project**:
   - Framework: Vite (auto-detected)
   - Build Command: `pnpm build`
   - Output Directory: `apps/web/dist`
   - Install Command: `pnpm install`

3. **Set Environment Variables**:
   ```bash
   # Set production variables
   vercel env add DATABASE_URL production
   vercel env add JWT_SECRET production
   # ... add all required variables
   ```

### Web App Deployment

`vercel.json` for web app:

```json
{
  "framework": "vite",
  "buildCommand": "pnpm --filter web build",
  "outputDirectory": "apps/web/dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### API Deployment

For serverless API on Vercel:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/api/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/api/src/index.ts"
    }
  ]
}
```

### Deploy Commands

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# Deploy specific branch
vercel --prod --scope your-team
```

---

## Docker Deployment

### Building Images

```bash
# Build all images
docker compose -f docker/docker-compose.yml build

# Build specific service
docker build -f docker/Dockerfile.web -t tpm-web:latest .
docker build -f docker/Dockerfile.api -t tpm-api:latest .
```

### Docker Compose (Production)

```yaml
# docker/docker-compose.prod.yml
version: '3.8'

services:
  web:
    image: tpm-web:${VERSION:-latest}
    ports:
      - "80:80"
      - "443:443"
    environment:
      - VITE_API_URL=${API_URL}
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  api:
    image: tpm-api:${VERSION:-latest}
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tpm-api
  namespace: tpm
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tpm-api
  template:
    metadata:
      labels:
        app: tpm-api
    spec:
      containers:
        - name: api
          image: registry.company.com/tpm-api:latest
          ports:
            - containerPort: 3001
          envFrom:
            - secretRef:
                name: tpm-secrets
            - configMapRef:
                name: tpm-config
          resources:
            requests:
              memory: "256Mi"
              cpu: "200m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          readinessProbe:
            httpGet:
              path: /api/health/ready
              port: 3001
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /api/health/live
              port: 3001
            initialDelaySeconds: 15
            periodSeconds: 10
```

---

## Database Setup

### Neon PostgreSQL

1. **Create Database**:
   - Log into Neon console
   - Create new project: `tpm-production`
   - Create database: `tpm`

2. **Get Connection String**:
   ```
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/tpm?sslmode=require
   ```

3. **Run Migrations**:
   ```bash
   # Set DATABASE_URL
   export DATABASE_URL="postgresql://..."

   # Run migrations
   pnpm db:migrate

   # Verify
   pnpm db:studio
   ```

### Database Backups

Neon provides automatic backups. For additional protection:

```bash
# Manual backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20240101.sql
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline is configured in `.github/workflows/`:

1. **CI Pipeline** (`ci.yml`):
   - Runs on all PRs and pushes
   - Linting, type checking, unit tests
   - E2E tests with Playwright
   - Security scanning

2. **Staging Deployment** (`cd-staging.yml`):
   - Triggers on push to `develop`
   - Deploys to staging environment
   - Runs smoke tests

3. **Production Deployment** (`cd-production.yml`):
   - Triggers on push to `main`
   - Requires manual approval
   - Creates GitHub release
   - Deploys to production

### Triggering Deployments

```bash
# Deploy to staging
git push origin develop

# Deploy to production
git push origin main

# Or create release
git tag v1.2.3
git push origin v1.2.3
```

### Environment Protection

Configure in GitHub Settings → Environments:

- **staging**: Auto-deploy on `develop`
- **production**: Require 1+ approvals, limit to main branch

---

## Monitoring Setup

### Health Checks

Endpoints:
- `/api/health` - Full health status
- `/api/health/live` - Liveness probe
- `/api/health/ready` - Readiness probe

### Uptime Monitoring

Configure monitoring service (e.g., Better Uptime, Pingdom):

| Check | URL | Interval | Alert Threshold |
|-------|-----|----------|-----------------|
| Web | https://tpm.company.com | 1 min | 2 failures |
| API | https://api.tpm.company.com/api/health | 1 min | 2 failures |
| Database | Via API health check | 5 min | 1 failure |

### Error Tracking (Sentry)

```typescript
// In API entry point
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Logging

Logs are structured JSON and can be shipped to:
- CloudWatch Logs
- Datadog
- Elastic/Kibana

```json
{
  "level": "info",
  "time": "2024-01-15T10:30:00.000Z",
  "service": "tpm-api",
  "requestId": "abc123",
  "method": "POST",
  "path": "/api/promotions",
  "statusCode": 201,
  "duration": 45
}
```

---

## SSL/TLS Configuration

### Vercel (Automatic)

Vercel provides automatic SSL for:
- Custom domains
- Preview deployments

### CloudFlare SSL

1. Add site to CloudFlare
2. Update nameservers
3. Enable SSL/TLS → Full (strict)
4. Enable "Always Use HTTPS"

### Self-Managed (Docker/K8s)

Using Let's Encrypt with certbot:

```bash
# Install certbot
apt install certbot

# Get certificate
certbot certonly --standalone -d tpm.company.com -d api.tpm.company.com

# Auto-renewal (cron)
0 0 * * * certbot renew --quiet
```

Nginx SSL configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name tpm.company.com;

    ssl_certificate /etc/letsencrypt/live/tpm.company.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tpm.company.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
}
```

---

## Rollback Procedures

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback <deployment-url>

# Or via dashboard:
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "..." → "Promote to Production"
```

### Docker Rollback

```bash
# List available tags
docker images tpm-api

# Rollback to previous version
docker compose -f docker-compose.prod.yml down
VERSION=1.2.2 docker compose -f docker-compose.prod.yml up -d
```

### Database Rollback

```bash
# Rollback last migration
pnpm db:migrate:rollback

# Restore from backup
psql $DATABASE_URL < backup-20240101.sql
```

### Emergency Procedures

1. **Immediate Actions**:
   - Rollback deployment
   - Check error logs
   - Notify stakeholders

2. **Investigation**:
   - Review recent changes
   - Check monitoring dashboards
   - Analyze error patterns

3. **Resolution**:
   - Fix issue in development
   - Test thoroughly
   - Deploy with fix

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Rollback plan prepared

### Deployment

- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Deploy to production

### Post-Deployment

- [ ] Verify health checks
- [ ] Monitor for 30 minutes
- [ ] Check critical user flows
- [ ] Update release notes
- [ ] Notify team of completion

---

## Support

For deployment issues:
- **Slack**: #tpm-devops
- **Email**: devops@company.com
- **On-call**: See PagerDuty schedule
