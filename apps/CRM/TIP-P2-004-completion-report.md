# TIP-P2-004 Completion Report — E2E Tests: Auth + Core CRUD

## Status: DONE

## Test Suites Summary

| Suite | File | Tests | Pass | Fail | Skip |
|-------|------|-------|------|------|------|
| Auth | `e2e/auth.spec.ts` | 5 | 5 | 0 | 0 |
| Contacts | `e2e/contacts.spec.ts` | 6 | 6 | 0 | 0 |
| Companies | `e2e/companies.spec.ts` | 3 | 3 | 0 | 0 |
| Deals | `e2e/deals.spec.ts` | 3 | 3 | 0 | 0 |
| RBAC | `e2e/rbac.spec.ts` | 6 | 6 | 0 | 0 |
| Search | `e2e/search.spec.ts` | 2 | 2 | 0 | 0 |
| Smoke (P2-003) | `e2e/smoke.spec.ts` | 4 | 4 | 0 | 0 |
| **Total** | **7 files** | **29** | **29** | **0** | **0** |

## Run Time
- Run 1: 2.6 min (29/29 pass)
- Run 2: 1.9 min (29/29 pass)

## Test Details

### Auth (`auth.spec.ts` — 5 tests)
1. **redirect to login when not authenticated** — unauthenticated page.goto('/dashboard') → redirects to /login
2. **login with valid credentials redirects to dashboard** — fills email/password, clicks login, verifies /dashboard URL
3. **login with invalid credentials shows error** — wrong password shows Vietnamese error toast
4. **login with non-existent email shows error** — non-existent email shows error toast
5. **logout clears session and redirects to login** — clicks user menu dropdown, clicks logout, verifies /login URL

### Contacts CRUD (`contacts.spec.ts` — 6 tests)
1. **list contacts shows seed data** — verifies table rows with [TEST] prefix contacts
2. **create new contact** — fills first/last name + email via placeholders, waits for POST response, verifies redirect
3. **create contact with validation errors** — submits empty form, checks `.border-red-500` validation indicators
4. **search contacts filters results** — types "TEST" in search input, verifies filtered rows appear
5. **contact detail page shows info** — clicks table row, verifies detail page loads with 'Ghi cuộc gọi' quick action
6. **delete contact removes it from list** — creates contact, navigates to detail, handles window.confirm() dialog, verifies removal

### Companies CRUD (`companies.spec.ts` — 3 tests)
1. **list companies shows seed data** — verifies `.glass-card-static` company cards with [TEST] prefix
2. **create company** — fills name/email/city via placeholders, clicks 'Lưu công ty', verifies redirect to /companies
3. **company detail shows contacts tab** — clicks first company card, verifies 'Liên hệ' and 'Deal' tabs visible

### Deals (`deals.spec.ts` — 3 tests)
1. **pipeline view shows stages** — verifies 'Pipeline' heading and `.kanban-column` elements
2. **create deal** — selects stage via Radix combobox, fills title (#title) and value (#value), waits for POST 201 response, verifies redirect
3. **deal detail page shows info** — clicks first deal link in kanban, verifies detail URL and 'Quay lại' button

### RBAC Enforcement (`rbac.spec.ts` — 6 tests)
1. **ADMIN sees settings in sidebar** — adminPage fixture, verifies 'Cài đặt' link visible
2. **MEMBER does not see settings** — memberPage fixture, verifies 'Cài đặt' link NOT visible
3. **VIEWER cannot see create buttons (contacts)** — viewerPage, verifies 'Thêm liên hệ' NOT visible
4. **VIEWER cannot see create button (pipeline)** — viewerPage, verifies 'Thêm deal' NOT visible
5. **ADMIN can see save button (settings)** — adminPage, navigates to /settings, verifies 'Lưu' button visible
6. **MEMBER cannot see save button (settings)** — memberPage, navigates to /settings, verifies 'Lưu' button NOT visible

### Global Search (`search.spec.ts` — 2 tests)
1. **Cmd+K opens command palette** — Meta+KeyK keystroke, verifies `[role="dialog"] [role="combobox"]` visible
2. **search returns results for seed data** — opens palette, types "TEST", verifies `[role="listbox"]` populates

## APP BUGS FOUND & FIXED

### Bug 1: Zod validation schemas reject `null` from forms
- **Symptom**: Contact and company creation silently failed — POST never fired
- **Root cause**: Form components convert empty optional fields to `null` (e.g., `form.source || null`), but Zod schemas only had `.optional()` which accepts `undefined`, not `null`
- **Files fixed**:
  - `src/lib/validations/contact.ts` — added `.nullable()` to `source` field
  - `src/lib/validations/company.ts` — added `.nullable()` to `industry` and `size` fields

### Bug 2: Deal creation sends wrong `pipelineId`
- **Symptom**: Deal create form submits but API returns validation error — `pipelineId` is required
- **Root cause**: `usePipeline()` types response as `{ config: PipelineConfig, stages }` but API returns flat object (`{ id, name, stages }`). Form accessed `pipelineData?.config?.id` which is always `undefined` at runtime
- **File fixed**: `src/app/(app)/pipeline/new/page.tsx` — changed to `(pipelineData as any)?.id ?? pipelineData?.config?.id`

## Test Data Strategy
- Seed data uses `[TEST]` prefix (created in global-setup, cleaned in global-teardown)
- E2E-created data uses `[E2E]` prefix (cleaned in global-teardown)
- `e2e/helpers/seed.helper.ts` handles both prefixes in cleanup

## Deviations from Spec
- **Contacts**: 6 tests instead of 7 — combined "view detail" into single test since edit buttons are stubs (no onClick handler)
- **Companies**: 3 tests instead of 4 — no delete company test since company cards don't have delete action in the current UI
- **Deals**: 3 tests as specified
- **Search**: 2 tests instead of 3 — no "search navigates to result" test since cmdk results are display-only in current implementation
- **Total**: 25 new tests (+ 4 smoke from P2-003 = 29 total), within the 18-25 target range

## Build Verification
- `tsc --noEmit` — passes (0 errors)
- `next build` — passes (all pages compile)
- Idempotent: 29/29 pass on consecutive runs
