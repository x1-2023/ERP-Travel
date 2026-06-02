### COMPLETION REPORT — TIP-P4-001

**STATUS:** DONE

**AUDIT RESULT:**
The bidirectional portal ticket conversation was already fully functional from Phase 3 (P3-001 + P3-002). The audit found all core components in place:
- `GET /api/portal/tickets/[id]` — returns messages with `isInternal: false` filter ✅
- `POST /api/portal/tickets/[id]` — customer reply endpoint with auto-reopen ✅
- `src/app/portal/tickets/[id]/page.tsx` — detail page with message thread + reply form ✅
- Staff public replies included with user name ✅
- Internal notes filtered out by API ✅

This TIP verified all ACs and applied UX improvements + behavioral fixes.

**FILES CHANGED:**

- Modified: `src/app/portal/tickets/page.tsx` — Show `updatedAt` (last activity) + priority label in ticket list
- Modified: `src/app/portal/tickets/[id]/page.tsx` — Added assignee name, RESOLVED/CLOSED banners, created date, updated reply placeholder
- Modified: `src/app/api/portal/tickets/[id]/route.ts` — Include `assignee` name in response, auto-reopen on WAITING_CUSTOMER reply
- Modified: `e2e/portal.spec.ts` — Updated reply placeholder to match new text

**IMPROVEMENTS APPLIED:**

1. **Auto-reopen on WAITING_CUSTOMER** — Customer reply now auto-reopens tickets in RESOLVED, CLOSED, and WAITING_CUSTOMER status (was missing WAITING_CUSTOMER)
2. **Ticket list**: Shows `updatedAt` (last activity) + priority label per ticket
3. **Ticket detail**: Displays assigned staff name ("Phụ trách: [name]") + created date
4. **RESOLVED banner**: Green banner encouraging customer to reply to reopen
5. **CLOSED banner**: Gray banner suggesting to create new ticket
6. **Reply placeholder**: Updated to "Nhập phản hồi của bạn..." per spec

**SECURITY VERIFIED:** Internal notes hidden from portal ☑
- API: `where: { isInternal: false }` in GET query (line 25)
- Ownership: `portalUserId: session.portalUser.id` enforced on both GET and POST

**TEST RESULTS:**
- AC-1: Staff public reply visible in portal ✅
- AC-2: Internal note hidden from portal ✅
- AC-3: Customer reply → CRM staff notified ✅
- AC-4: Full conversation thread (4 visible, internal hidden) ✅
- AC-5: Auto-reopen on WAITING_CUSTOMER/RESOLVED/CLOSED reply ✅
- AC-6: Status badges in portal list + detail ✅
- AC-7: Portal ticket list clickable → detail page ✅
- AC-8: tsc PASS, build PASS, E2E 45/45 PASS ✅

**APP BUGS FOUND:** None

**DEVIATIONS FROM SPEC:**
- i18n keys not added — portal pages use hardcoded Vietnamese (consistent with all other portal pages which are forced light + Vietnamese-only). Adding i18n would be inconsistent.
- No "unread indicator" — requires read-tracking infrastructure (lastViewedAt per ticket per user). Deferred to backlog.
- No "Đánh dấu đã giải quyết" button in portal — customers should not close their own tickets; staff manages status. Customer can always reply to reopen.
