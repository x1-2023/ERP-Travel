# Architecture Overview - Trade Promotion Management System

This document describes the system architecture, design decisions, and component interactions.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Application Architecture](#application-architecture)
4. [Data Architecture](#data-architecture)
5. [Security Architecture](#security-architecture)
6. [Integration Architecture](#integration-architecture)
7. [Infrastructure](#infrastructure)
8. [Scalability & Performance](#scalability--performance)
9. [Design Decisions](#design-decisions)

---

## System Overview

### Purpose

The Trade Promotion Management (TPM) System manages the complete lifecycle of trade promotions:

- **Planning**: Create and configure promotions
- **Approval**: Multi-level approval workflows
- **Execution**: Track active promotions
- **Settlement**: Process claims and payments
- **Analytics**: Measure ROI and effectiveness

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Web App     │  │  Mobile App  │  │  External    │              │
│  │  (React)     │  │  (Future)    │  │  Systems     │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
└─────────┼─────────────────┼─────────────────┼───────────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │ HTTPS/REST
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API Layer                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    API Gateway / Load Balancer                │  │
│  │                    (Rate Limiting, Auth, Logging)             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Auth        │  │  Promotion   │  │  Finance     │              │
│  │  Service     │  │  Service     │  │  Service     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────────────┐
│                         Data Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  PostgreSQL  │  │    Redis     │  │  Object      │              │
│  │  (Primary)   │  │  (Cache)     │  │  Storage     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| React 18 | UI Framework | Component model, ecosystem, team expertise |
| TypeScript | Type Safety | Catch errors early, better DX |
| Vite | Build Tool | Fast builds, modern ESM support |
| TanStack Query | Server State | Caching, sync, devtools |
| Zustand | Client State | Simple, lightweight |
| Tailwind CSS | Styling | Utility-first, consistent design |
| shadcn/ui | Components | Customizable, accessible |

### Backend

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| Node.js 20 | Runtime | JavaScript ecosystem, async I/O |
| Express/Hono | HTTP Framework | Mature, flexible middleware |
| TypeScript | Type Safety | Consistent with frontend |
| Prisma | ORM | Type-safe queries, migrations |
| Zod | Validation | Runtime type checking |
| Pino | Logging | High performance, structured |

### Data

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| PostgreSQL 15 | Primary Database | ACID, JSON support, mature |
| Redis 7 | Cache/Sessions | Fast, versatile data structures |
| S3/Cloudflare R2 | Object Storage | Scalable file storage |

### Infrastructure

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| Vercel | Hosting | Serverless, global CDN |
| GitHub Actions | CI/CD | Native integration |
| Docker | Containerization | Consistent environments |
| Neon | Managed PostgreSQL | Serverless, branching |

---

## Application Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Application                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Router (React Router)                 │  │
│  │  /dashboard  /promotions  /claims  /finance  /reports    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      Page Components                      │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │  │
│  │  │Dashboard│  │Promotions│ │ Claims  │  │ Finance │     │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘     │  │
│  └───────┼────────────┼───────────┼────────────┼────────────┘  │
│          │            │           │            │                 │
│  ┌───────▼────────────▼───────────▼────────────▼────────────┐  │
│  │                    Feature Components                     │  │
│  │  PromotionList, PromotionForm, ClaimTable, Charts, etc.  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      State Layer                          │  │
│  │  ┌─────────────────┐      ┌─────────────────┐            │  │
│  │  │  TanStack Query │      │     Zustand     │            │  │
│  │  │  (Server State) │      │  (Client State) │            │  │
│  │  └────────┬────────┘      └────────┬────────┘            │  │
│  └───────────┼─────────────────────────┼────────────────────┘  │
│              │                         │                         │
│  ┌───────────▼─────────────────────────▼────────────────────┐  │
│  │                     Services Layer                        │  │
│  │  API Client (Fetch), Auth Service, Storage Service        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Express Server                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Middleware Stack                      │  │
│  │  CORS → Security → Rate Limit → Auth → Logging → Handler │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      Route Handlers                       │  │
│  │  /api/auth    /api/promotions    /api/claims    /api/...  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Service Layer                         │  │
│  │  AuthService  PromotionService  ClaimService  Finance...  │  │
│  │                                                           │  │
│  │  • Business Logic                                         │  │
│  │  • Validation                                             │  │
│  │  • Authorization                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Repository Layer                        │  │
│  │  ┌─────────────────┐      ┌─────────────────┐            │  │
│  │  │     Prisma      │      │      Redis      │            │  │
│  │  │   (Database)    │      │    (Cache)      │            │  │
│  │  └─────────────────┘      └─────────────────┘            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
Client Request
      │
      ▼
┌─────────────┐
│   CORS      │──── Reject if origin not allowed
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Security   │──── Add security headers
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Rate Limit  │──── Return 429 if exceeded
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Auth     │──── Validate JWT, attach user
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Authorize  │──── Check permissions
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Validate   │──── Validate request body
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Handler   │──── Process request
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Service   │──── Execute business logic
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Database   │──── Persist/retrieve data
└──────┬──────┘
       │
       ▼
Response
```

---

## Data Architecture

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │  Promotion  │       │   Customer  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │──┐    │ id          │    ┌──│ id          │
│ email       │  │    │ code        │    │  │ name        │
│ name        │  │    │ name        │    │  │ taxCode     │
│ role        │  ├───▶│ createdBy   │    │  │ region      │
│ status      │  │    │ status      │    │  │ channel     │
└─────────────┘  │    │ budget      │    │  └─────────────┘
                 │    │ region      │    │
                 │    └──────┬──────┘    │
                 │           │           │
                 │           ▼           │
                 │    ┌─────────────┐    │
                 │    │    Claim    │    │
                 │    ├─────────────┤    │
                 │    │ id          │    │
                 └───▶│ createdBy   │◀───┘
                      │ promotionId │
                      │ customerId  │
                      │ amount      │
                      │ status      │
                      └──────┬──────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │   Accrual   │ │  Deduction  │ │   Journal   │
       ├─────────────┤ ├─────────────┤ ├─────────────┤
       │ id          │ │ id          │ │ id          │
       │ promotionId │ │ claimId     │ │ type        │
       │ amount      │ │ amount      │ │ debit       │
       │ period      │ │ invoiceNo   │ │ credit      │
       └─────────────┘ └─────────────┘ └─────────────┘
```

### Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      Promotion Lifecycle                          │
└──────────────────────────────────────────────────────────────────┘

1. PLANNING
   ┌─────────┐     ┌─────────┐     ┌─────────┐
   │ Create  │────▶│ Review  │────▶│ Approve │
   │ Draft   │     │ Budget  │     │         │
   └─────────┘     └─────────┘     └────┬────┘
                                        │
2. EXECUTION                            ▼
   ┌─────────┐     ┌─────────┐     ┌─────────┐
   │ Active  │────▶│ Track   │────▶│ Claims  │
   │ Promo   │     │ Sales   │     │ Created │
   └─────────┘     └─────────┘     └────┬────┘
                                        │
3. SETTLEMENT                           ▼
   ┌─────────┐     ┌─────────┐     ┌─────────┐
   │ Verify  │────▶│ Create  │────▶│ Post to │
   │ Claims  │     │ Accrual │     │ GL      │
   └─────────┘     └─────────┘     └────┬────┘
                                        │
4. RECONCILIATION                       ▼
   ┌─────────┐     ┌─────────┐     ┌─────────┐
   │ Match   │────▶│ Process │────▶│ Close   │
   │ Deduct  │     │ Payment │     │ Period  │
   └─────────┘     └─────────┘     └─────────┘
```

---

## Security Architecture

### Authentication Flow

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│  Client  │                    │   API    │                    │    DB    │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │                               │                               │
     │  POST /auth/login             │                               │
     │  {email, password}            │                               │
     │──────────────────────────────▶│                               │
     │                               │  SELECT user WHERE email      │
     │                               │──────────────────────────────▶│
     │                               │                               │
     │                               │◀──────────────────────────────│
     │                               │  Verify password (bcrypt)     │
     │                               │                               │
     │                               │  Generate JWT + Refresh       │
     │                               │                               │
     │  {accessToken, refreshToken}  │                               │
     │◀──────────────────────────────│                               │
     │                               │                               │
     │  GET /api/promotions          │                               │
     │  Authorization: Bearer xxx    │                               │
     │──────────────────────────────▶│                               │
     │                               │  Verify JWT                   │
     │                               │  Check permissions            │
     │                               │                               │
     │  {promotions: [...]}          │                               │
     │◀──────────────────────────────│                               │
     │                               │                               │
```

### Authorization Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        RBAC Model                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User ──────▶ Role ──────▶ Permissions                          │
│                                                                  │
│  ┌─────────┐    ┌─────────────┐    ┌────────────────────────┐   │
│  │  Admin  │───▶│    admin    │───▶│ * (all permissions)    │   │
│  └─────────┘    └─────────────┘    └────────────────────────┘   │
│                                                                  │
│  ┌─────────┐    ┌─────────────┐    ┌────────────────────────┐   │
│  │ Finance │───▶│   finance   │───▶│ finance:*, reports:*   │   │
│  │ Manager │    │   manager   │    │ promotions:read        │   │
│  └─────────┘    └─────────────┘    └────────────────────────┘   │
│                                                                  │
│  ┌─────────┐    ┌─────────────┐    ┌────────────────────────┐   │
│  │  Sales  │───▶│  sales_rep  │───▶│ promotions:read        │   │
│  │   Rep   │    │             │    │ claims:create,read     │   │
│  └─────────┘    └─────────────┘    └────────────────────────┘   │
│                                                                  │
│  + Row-Level Security based on region/team assignment           │
└─────────────────────────────────────────────────────────────────┘
```

### Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Stack                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Network                                                │
│  ├── CloudFlare WAF (DDoS protection, bot filtering)            │
│  ├── TLS 1.3 encryption                                         │
│  └── IP allowlisting (admin panel)                              │
│                                                                  │
│  Layer 2: Application                                            │
│  ├── Helmet.js security headers                                 │
│  ├── CORS strict origin validation                              │
│  ├── Rate limiting (per IP, per user)                           │
│  └── Input validation (Zod schemas)                             │
│                                                                  │
│  Layer 3: Authentication                                         │
│  ├── JWT with short expiry (15 min)                             │
│  ├── Refresh token rotation                                     │
│  ├── Password hashing (bcrypt, cost 12)                         │
│  └── Account lockout after failed attempts                      │
│                                                                  │
│  Layer 4: Authorization                                          │
│  ├── Role-based access control (RBAC)                           │
│  ├── Row-level security (RLS)                                   │
│  └── Principle of least privilege                               │
│                                                                  │
│  Layer 5: Data                                                   │
│  ├── Encryption at rest (AES-256)                               │
│  ├── Encryption in transit (TLS)                                │
│  ├── PII field encryption                                       │
│  └── Audit logging                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration Architecture

### External System Integrations

```
┌─────────────────────────────────────────────────────────────────┐
│                     TPM System                                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Integration Layer                        │  │
│  │                                                           │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │  │
│  │  │   ERP   │  │   DMS   │  │   BI    │  │  Email  │     │  │
│  │  │ Adapter │  │ Adapter │  │ Adapter │  │ Service │     │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘     │  │
│  └───────┼────────────┼───────────┼────────────┼────────────┘  │
│          │            │           │            │                 │
└──────────┼────────────┼───────────┼────────────┼─────────────────┘
           │            │           │            │
           ▼            ▼           ▼            ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │   SAP    │  │   DMS    │  │  Power   │  │ SendGrid │
    │   ERP    │  │  System  │  │   BI     │  │          │
    └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### API Integration Patterns

```
1. Synchronous REST API
   ┌────────┐         ┌────────┐
   │ Client │───GET──▶│  TPM   │───Response──▶
   └────────┘         └────────┘

2. Webhook Events
   ┌────────┐         ┌────────┐
   │  TPM   │──Event─▶│External│
   │        │◀──ACK───│ System │
   └────────┘         └────────┘

3. Batch Import/Export
   ┌────────┐         ┌────────┐         ┌────────┐
   │  ERP   │───CSV──▶│  Queue │───Batch─▶│  TPM   │
   └────────┘         └────────┘         └────────┘
```

---

## Infrastructure

### Deployment Architecture

```
                         Internet
                            │
                            ▼
                    ┌───────────────┐
                    │  CloudFlare   │
                    │  (CDN + WAF)  │
                    └───────┬───────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │  Vercel    │  │  Vercel    │  │  Vercel    │
     │  Edge      │  │  Edge      │  │  Edge      │
     │  (Region A)│  │  (Region B)│  │  (Region C)│
     └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
                           ▼
                    ┌───────────────┐
                    │    Vercel     │
                    │   Functions   │
                    │   (API)       │
                    └───────┬───────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │   Neon     │  │  Upstash   │  │    R2      │
     │ PostgreSQL │  │   Redis    │  │  Storage   │
     └────────────┘  └────────────┘  └────────────┘
```

---

## Scalability & Performance

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                     Caching Layers                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  L1: Browser Cache                                               │
│  ├── Static assets (1 year)                                     │
│  ├── API responses (Cache-Control headers)                      │
│  └── Service Worker (offline support)                           │
│                                                                  │
│  L2: CDN Cache (CloudFlare/Vercel)                              │
│  ├── Static files (immutable)                                   │
│  ├── API responses (stale-while-revalidate)                     │
│  └── Edge caching for common queries                            │
│                                                                  │
│  L3: Application Cache (Redis)                                   │
│  ├── Session data (TTL: 1 day)                                  │
│  ├── User permissions (TTL: 5 min)                              │
│  ├── Frequently accessed data (TTL: varies)                     │
│  └── Rate limit counters                                        │
│                                                                  │
│  L4: Database Cache                                              │
│  ├── Query result cache                                         │
│  └── Connection pooling                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Performance Optimizations

| Area | Optimization | Impact |
|------|--------------|--------|
| Frontend | Code splitting | Smaller initial bundle |
| Frontend | Image optimization | Faster load times |
| Frontend | React Query caching | Reduced API calls |
| API | Response compression | Smaller payloads |
| API | Pagination | Limited data transfer |
| API | Database indexing | Faster queries |
| Database | Connection pooling | Reduced latency |
| Database | Read replicas | Horizontal scaling |

---

## Design Decisions

### Why Monorepo?

**Decision**: Use pnpm workspaces monorepo

**Rationale**:
- Shared code between frontend and backend
- Atomic commits across packages
- Simplified dependency management
- Consistent tooling configuration

**Trade-offs**:
- Larger repository size
- More complex CI/CD
- Learning curve for team

### Why PostgreSQL?

**Decision**: PostgreSQL over MySQL/MongoDB

**Rationale**:
- Strong ACID compliance for financial data
- JSON support for flexible schemas
- Row-level security features
- Excellent TypeScript support (Prisma)

### Why Serverless?

**Decision**: Vercel serverless over traditional servers

**Rationale**:
- Auto-scaling without management
- Global edge deployment
- Pay-per-use cost model
- Simplified operations

**Trade-offs**:
- Cold start latency
- Execution time limits
- Stateless requirements

### Why TanStack Query?

**Decision**: TanStack Query over Redux/SWR

**Rationale**:
- Built-in caching and synchronization
- Automatic background refetching
- Optimistic updates support
- Excellent TypeScript support

---

## Appendix

### Related Documents

- [Developer Guide](../guides/developer-guide.md)
- [Deployment Guide](../guides/deployment-guide.md)
- [API Reference](../api/openapi.yaml)

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-01 | Initial architecture |
| 1.1 | 2024-06-01 | Added caching layer |
| 2.0 | 2025-01-01 | Migrated to serverless |
