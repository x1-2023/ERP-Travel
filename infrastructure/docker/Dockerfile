# ============================================================
# ERP Ecosystem — Multi-stage Dockerfile
# Supports all apps via build arg: APP_NAME
# ============================================================

# ── Stage 1: Dependencies ────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy workspace config
COPY package.json package-lock.json* turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY packages/auth/package.json ./packages/auth/
COPY packages/events/package.json ./packages/events/
COPY packages/feature-flags/package.json ./packages/feature-flags/
COPY packages/master-data/package.json ./packages/master-data/
COPY packages/ai-copilot/package.json ./packages/ai-copilot/
COPY packages/sdk/package.json ./packages/sdk/
COPY packages/admin/package.json ./packages/admin/
COPY packages/notifications/package.json ./packages/notifications/
COPY packages/saas/package.json ./packages/saas/
COPY packages/tpm-shared/package.json ./packages/tpm-shared/

# Copy all app package.json files
COPY apps/*/package.json ./apps/

RUN npm ci --prefer-offline

# ── Stage 2: Builder ─────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma clients
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma 2>/dev/null || true
RUN if [ -f "apps/${APP_NAME}/prisma/schema.prisma" ]; then \
      npx prisma generate --schema=apps/${APP_NAME}/prisma/schema.prisma; \
    fi

# Build with Turborepo (only target app + dependencies)
RUN npx turbo build --filter=${APP_NAME}

# ── Stage 3: Runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat dumb-init

WORKDIR /app

ARG APP_NAME
ENV APP_NAME=${APP_NAME}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 erp
USER erp

# Copy built app
COPY --from=builder --chown=erp:nodejs /app/apps/${APP_NAME}/.next/standalone ./
COPY --from=builder --chown=erp:nodejs /app/apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static
COPY --from=builder --chown=erp:nodejs /app/apps/${APP_NAME}/public ./apps/${APP_NAME}/public

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/${APP_NAME}/server.js"]
