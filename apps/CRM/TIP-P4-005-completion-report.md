### COMPLETION REPORT — TIP-P4-005

**STATUS:** DONE

**FILES CHANGED:**

- Created: `src/lib/api-docs/openapi.ts` — Complete OpenAPI 3.0.0 specification
- Created: `src/app/(app)/api-docs/page.tsx` — Swagger UI page (client-side, dynamic import)
- Created: `src/app/api/docs/openapi/route.ts` — Raw JSON spec endpoint (public)
- Modified: `src/components/layout/Sidebar.tsx` — Added "API Docs" nav item with BookOpen icon
- Modified: `src/hooks/use-permissions.ts` — Added `canViewApiDocs: isAtLeast('MANAGER')`
- Modified: `src/i18n/en.ts` — Added `nav.apiDocs: 'API Docs'`
- Modified: `src/i18n/vi.ts` — Added `nav.apiDocs: 'Tài liệu API'`

**ENDPOINTS DOCUMENTED:** 113 (across 75 paths)
**SCHEMAS DEFINED:** 18 (ErrorResponse, PaginatedResponse, Contact, CreateContact, Company, CreateCompany, Deal, CreateDeal, Quote, SalesOrder, SupportTicket, Campaign, Notification, Webhook, Activity, Product, PortalUser, AudienceRule)
**TAGS:** 21 (Auth, Contacts, Companies, Deals, Quotes, Orders, Activities, Tickets, Campaigns, Audiences, Email Templates, Notifications, Webhooks, Analytics, Settings, Users, Products, Search, Tracking, Portal, Internal)

**TEST RESULTS:**

- AC-1: Swagger UI Renders — `/api-docs` builds as static page (9.2 kB), SwaggerUI loaded via dynamic import ✅
- AC-2: Endpoint Count — 113 endpoints documented (≥60 target) ✅
- AC-3: Each Route Has Schemas — All endpoints have method, path, summary, operationId, request/response schemas, status codes ✅
- AC-4: RBAC Documented — Security requirements (BearerAuth/PortalSession) and role noted in descriptions (e.g., "ADMIN only", "MANAGER+") ✅
- AC-5: Portal Routes Separate — Portal tag with PortalSession auth scheme, clearly separated from CRM routes ✅
- AC-6: Raw Spec Downloadable — `GET /api/docs/openapi` returns valid OpenAPI 3.0 JSON with CORS header ✅
- AC-7: Build & Tests:
  - `tsc --noEmit` — PASS ✅
  - `next build` — PASS (both `/api-docs` and `/api/docs/openapi` in output) ✅
  - `pnpm test:unit` — 189 passed ✅
  - `pnpm test:e2e` — 45 passed ✅

**APP BUGS FOUND:** None

**DEVIATIONS FROM SPEC:**

- Used `dynamic(() => import('swagger-ui-react'), { ssr: false })` instead of direct import — swagger-ui-react requires browser APIs and fails during SSR
- Endpoint count exceeds spec estimate: 113 vs ~75+ — includes all discovered routes (products, search, tracking, pipeline, health, etc.)
- 21 tags vs 16 specified — added Products, Search, Tracking, Activities, Internal tags to cover all discovered route domains
- Sidebar link uses `canViewApiDocs` permission (MANAGER+) instead of hardcoded ADMIN+MANAGER check — follows existing permission pattern
