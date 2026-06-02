### COMPLETION REPORT — TIP-004

**STATUS:** DONE

**FILES CHANGED:**

Created:
- `src/lib/api/rate-limit.ts` — In-memory rate limiter with 5 preset tiers (general 100/min, auth 10/min, email 20/min, pdf 10/min, search 30/min), stale entry cleanup every 60s
- `src/lib/api/errors.ts` — ApiError class, predefined errors (BadRequest, Unauthorized, Forbidden, NotFound, Conflict, RateLimited, InternalError), Prisma error mapping (P2002→409, P2025→404, P2003→400), handleApiError wrapper
- `src/lib/api/response.ts` — API response wrappers (apiSuccess, apiCreated, apiNoContent)
- `src/lib/api/sanitize.ts` — Input sanitization (sanitizeString: trim/null bytes/HTML entities/length limit, sanitizeObject: deep string sanitization, sanitizeHtml: strip dangerous tags/attributes, allow safe formatting)
- `src/lib/logger.ts` — Structured JSON logger with info/warn/error/audit methods, timestamp + level + message format

Modified:
- `next.config.mjs` — Added security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy) for all routes + CORS headers for /api/* (origin from NEXT_PUBLIC_APP_URL)
- `src/app/api/auth/register/route.ts` — Rate limit (auth tier, IP-based), sanitized name input, structured logging (audit log on register, error logging), standardized error handling
- `src/app/api/auth/me/route.ts` — Standardized error handling via handleApiError + apiSuccess
- `src/app/api/quotes/[id]/send/route.ts` — Rate limit (email tier), structured logging (audit log on send, error logging for PDF/email failures), standardized error handling
- `src/app/api/email/send/route.ts` — Rate limit (email tier), structured logging, standardized error handling
- `src/app/api/quotes/[id]/pdf/route.ts` — Rate limit (pdf tier), structured logging, standardized error handling
- `src/app/api/orders/[id]/pdf/route.ts` — Rate limit (pdf tier), structured logging, standardized error handling
- `src/app/api/quotes/check-expiry/route.ts` — Standardized error handling, structured logging, replaced console.error

**RATE LIMIT TIERS:**
| Tier | Limit | Window | Key | Applied To |
|------|-------|--------|-----|------------|
| Auth | 10/min | 60s | IP | /api/auth/register |
| Email | 20/min | 60s | userId | /api/quotes/[id]/send, /api/email/send |
| PDF | 10/min | 60s | userId | /api/quotes/[id]/pdf, /api/orders/[id]/pdf |
| Search | 30/min | 60s | userId | Available for /api/search |
| General | 100/min | 60s | userId | Available for all other routes |

**TEST RESULTS:**

- AC-1 Rate Limiting: PASS — In-memory store with per-key tracking. Auth tier uses IP (x-forwarded-for), others use userId. Returns 429 with Retry-After header when exceeded. Stale entries cleaned every 60s via setInterval.

- AC-2 Error Responses: PASS — All hardened routes use standardized format: `{ error: "status text", code: "ERROR_CODE", message: "Vietnamese message" }`. No stack traces in responses. ApiError class with statusCode/code/details.

- AC-3 Prisma Errors: PASS — handleApiError maps: P2002 → 409 Conflict with field name, P2025 → 404 Not Found, P2003 → 400 Foreign Key Error, P2014 → 400 Relation Error, PrismaClientValidationError → 400. Unknown Prisma errors → 500 with generic message.

- AC-4 Sanitization: PASS — sanitizeString encodes `<>&"'` as HTML entities, trims whitespace, removes null bytes, limits to 10K chars. sanitizeObject deep-sanitizes all strings in nested objects/arrays. sanitizeHtml strips `<script>`, `<iframe>`, `<embed>`, `<object>`, `<style>` tags and `on*` event handlers, allows safe formatting tags. Applied to user name in register route.

- AC-5 Security Headers: PASS — Added via next.config.mjs headers(): X-Content-Type-Options: nosniff, X-Frame-Options: DENY, X-XSS-Protection: 1; mode=block, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy: camera=(), microphone=(), geolocation=(). CORS for /api/* with origin from env var, max-age 86400.

- AC-6 Structured Logging: PASS — logger.ts outputs JSON with timestamp/level/message. logger.error includes error message (stack in dev only). logger.audit for security events (user.register, quote.send). Replaced console.error in all hardened routes.

- AC-7 Build & No Regression: PASS — `tsc --noEmit` zero errors, `next build` success, all routes compiled.

**ROUTES HARDENED:**
1. `/api/auth/register` — rate limit (auth/IP) + sanitization + error handling + audit logging
2. `/api/auth/me` — error handling + response wrapper
3. `/api/quotes/[id]/send` — rate limit (email) + error handling + audit logging
4. `/api/email/send` — rate limit (email) + error handling + logging
5. `/api/quotes/[id]/pdf` — rate limit (pdf) + error handling + logging
6. `/api/orders/[id]/pdf` — rate limit (pdf) + error handling + logging
7. `/api/quotes/check-expiry` — error handling + logging

**ISSUES DISCOVERED:**
- None

**DEVIATIONS FROM SPEC:**
- **CORS via next.config.mjs headers()**: Spec suggested either middleware.ts or next.config.js. Used next.config.mjs headers() as it's the simplest approach and doesn't add complexity to the existing middleware. Did not create a separate `src/lib/api/cors.ts` — the CORS config is self-contained in next.config.mjs.
- **Sanitization not applied to ALL routes**: Per spec constraint #2, only applied sanitizeString to register (name field). Other routes can adopt sanitization incrementally when touched.
- **Logger audit doesn't include IP/requestId yet**: The logger.audit method accepts arbitrary data but doesn't auto-extract IP or generate requestId. Can be added in Phase 3 when request context middleware is implemented.

**SUGGESTIONS FOR CHỦ THẦU:**
- Remaining CRUD routes (contacts, companies, deals, etc.) can adopt the error handling pattern incrementally. The `handleApiError` + `apiSuccess` pattern is ready to use.
- For production deployment, consider adding `requestId` generation in middleware and passing it through to the logger for request tracing.
- The in-memory rate limiter resets on server restart. For Vercel deployment (serverless), each function instance has its own store — this provides basic per-instance protection. For stricter rate limiting, upgrade to Redis (Upstash) in Phase 3.
- Input sanitization is available via `sanitizeObject(body)` — apply it in routes that accept user-generated content (contact notes, campaign HTML content, etc.).
