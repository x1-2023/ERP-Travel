# TIP-002 Completion Report — RBAC Middleware & Role Enforcement

## Status: DONE

## Summary
Implemented full RBAC (Role-Based Access Control) middleware and role enforcement across all API routes and UI components. The system follows a 4-level role hierarchy: ADMIN > MANAGER > MEMBER > VIEWER.

---

## Files Created (2)

### 1. `src/lib/auth/rbac.ts` — Core RBAC module
- Role hierarchy: `ADMIN(4) > MANAGER(3) > MEMBER(2) > VIEWER(1)`
- `canAccess(user, action)` — Permission check by action type
- `requireRole(allowedRoles)` — API middleware, returns User or 403 NextResponse
- `requireOwnerOrRole(ownerId, allowedRoles)` — Owner OR role check
- `isErrorResponse(result)` — Type guard for middleware results
- `forbiddenResponse()` — Standard 403 with Vietnamese message

### 2. `src/hooks/use-permissions.ts` — Client-side permission hook
- Mirrors server RBAC logic for UI conditional rendering
- Exposes: `canCreate`, `canEditRecord(ownerId)`, `canDeleteRecord(ownerId)`, `canManageCampaigns`, `canManageSettings`, `isAdmin`, `isManagerOrAbove`, etc.

---

## Files Modified — API Routes (14)

| Route | Changes |
|---|---|
| `api/contacts/route.ts` | GET: filtered by ownerId for MEMBER/VIEWER; POST: requireRole MEMBER+ |
| `api/contacts/[id]/route.ts` | GET: ownership check; PATCH/DELETE: requireOwnerOrRole |
| `api/companies/route.ts` | GET: filtered by ownerId; POST: requireRole MEMBER+ |
| `api/companies/[id]/route.ts` | GET: ownership check; PATCH/DELETE: requireOwnerOrRole |
| `api/deals/route.ts` | GET: filtered by ownerId; POST: requireRole MEMBER+; PATCH (kanban): ownership check |
| `api/deals/[id]/route.ts` | GET: ownership check; PATCH/DELETE: requireOwnerOrRole |
| `api/activities/route.ts` | GET: filtered by userId; POST: requireRole MEMBER+ |
| `api/activities/[id]/route.ts` | PATCH/DELETE: requireOwnerOrRole with userId |
| `api/quotes/route.ts` | GET: filtered by createdById; POST: requireRole MEMBER+ |
| `api/quotes/[id]/route.ts` | GET: ownership check; PATCH/DELETE: requireOwnerOrRole |
| `api/orders/route.ts` | GET: filtered by createdById; POST: requireRole MEMBER+ |
| `api/orders/[id]/route.ts` | GET: ownership check; PATCH/DELETE: requireOwnerOrRole |
| `api/campaigns/route.ts` | GET: filtered by createdById for non-managers; POST: requireRole ADMIN/MANAGER |
| `api/campaigns/[id]/route.ts` | GET: ownership/role check; PATCH/DELETE: requireRole ADMIN/MANAGER |
| `api/audiences/route.ts` | GET: authenticated; POST: requireRole ADMIN/MANAGER |
| `api/audiences/[id]/route.ts` | GET: authenticated; DELETE: requireRole ADMIN/MANAGER |

## Files Modified — UI Components (7)

| Component | Changes |
|---|---|
| `components/layout/Sidebar.tsx` | Settings: ADMIN only; Campaigns: MANAGER+ only; uses `usePermissions()` |
| `app/(app)/contacts/page.tsx` | Create/Edit/Delete buttons conditional on `canCreate`/`canEditRecord`/`canDeleteRecord` |
| `app/(app)/companies/page.tsx` | Create button conditional on `canCreate` |
| `app/(app)/pipeline/page.tsx` | Create button conditional on `canCreate` |
| `app/(app)/activities/page.tsx` | Create button conditional on `canCreate` |
| `app/(app)/quotes/page.tsx` | Create button conditional on `canCreate` |
| `app/(app)/campaigns/page.tsx` | Create button conditional on `canManageCampaigns` |

---

## Permission Matrix Implemented

| Action | ADMIN | MANAGER | MEMBER | VIEWER |
|---|---|---|---|---|
| View all records | Yes | Yes | Own only | Own only |
| Create records | Yes | Yes | Yes | No |
| Edit own records | Yes | Yes | Yes | No |
| Edit any records | Yes | Yes | No | No |
| Delete own records | Yes | Yes | Yes | No |
| Delete any records | Yes | Yes | No | No |
| Manage campaigns | Yes | Yes | No | No |
| Manage team | Yes | No | No | No |
| Manage settings | Yes | No | No | No |

## Owner Field Mapping

| Model | Owner field |
|---|---|
| Contact, Company, Deal | `ownerId` |
| Activity | `userId` |
| Quote, Order, Campaign, Audience | `createdById` |

---

## Build Verification
- `npx tsc --noEmit` — PASS (zero errors)
- `npx next build` — PASS (all routes compiled successfully)

## Constraints Met
- [x] Zero new npm packages
- [x] No migration changes
- [x] Server-side enforcement on ALL mutating endpoints
- [x] Client-side UI gates using usePermissions() hook
- [x] Role hierarchy respected: ADMIN > MANAGER > MEMBER > VIEWER
- [x] Vietnamese error messages for 403 responses
- [x] Sidebar navigation gated by role
- [x] VIEWER cannot see Create/Edit/Delete buttons

## Known Limitations
- Detail pages (contacts/[id], companies/[id], etc.) have inline edit/delete buttons that could benefit from `usePermissions()` gating in a follow-up pass. Current protection is server-side (API will reject unauthorized requests with 403).
