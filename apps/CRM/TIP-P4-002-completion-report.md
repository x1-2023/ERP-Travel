### COMPLETION REPORT — TIP-P4-002

**STATUS:** DONE

**FILES CHANGED:**

- Created: `src/lib/events/handlers/order-automation-handler.ts` — Event handler that auto-creates SalesOrder when quote is accepted (checks settings, generates order number, copies items, emits ORDER_CREATED, notifies owner)
- Modified: `src/lib/events/handlers/index.ts` — Register orderAutomationHandlers
- Modified: `src/lib/settings/types.ts` — Added `OrderSettings` interface with `autoOrderFromQuote: boolean`
- Modified: `src/lib/settings/index.ts` — Added `order` default settings (autoOrderFromQuote: true), exported `OrderSettings` type
- Modified: `src/lib/validations/settings.ts` — Added `orderSettingsSchema` Zod schema, added to `settingsSchemaMap`
- Modified: `src/app/api/settings/[key]/route.ts` — Added `'order'` to VALID_KEYS
- Modified: `src/app/api/quotes/[id]/route.ts` — Include `order` relation in GET response (bidirectional link)
- Modified: `src/app/(app)/quotes/[id]/page.tsx` — Added linked order banner card with link, hide "Tạo đơn hàng" button when order exists
- Modified: `src/app/(app)/orders/[id]/page.tsx` — Added linked quote banner card with link
- Modified: `src/app/(app)/settings/page.tsx` — Added `OrderAutomationSection` component with toggle switch in Notifications tab

**AUTOMATION FLOW:**
```
Portal: Quote ACCEPTED
  → QUOTE_ACCEPTED event emitted
  → order-automation-handler receives event
  → Checks Setting 'order.autoOrderFromQuote' (default: ON)
  → Checks no existing order for this quote
  → Fetches quote + items
  → Generates ORD-YYYY-NNNN order number
  → Creates SalesOrder with all items copied
  → Uses quote's taxPercent (not hardcoded 10%)
  → Notes: "Tự động tạo từ báo giá QUO-xxxx"
  → Emits ORDER_CREATED event (triggers webhooks)
  → Notifies quote owner via in-app notification
```

**SETTINGS TOGGLE:**
- Settings → Notifications tab → "Tự động hóa" section
- Toggle: "Tự động tạo đơn hàng khi báo giá được chấp nhận"
- Default: ON
- ADMIN only

**BIDIRECTIONAL LINKS:**
- Quote detail → "Đơn hàng liên kết: ORD-xxxx" card (clickable, shows total)
- Order detail → "Từ báo giá: QUO-xxxx" card (clickable, shows total)

**TEST RESULTS:**
- AC-1: Quote accepted → SalesOrder auto-created with items + total ✅
- AC-2: Order linked to quote (bidirectional links in UI) ✅
- AC-3: Notification sent to quote owner about auto-created order ✅
- AC-4: Setting toggle: OFF → no auto-order ✅
- AC-5: Existing manual order creation still works ✅
- AC-6: tsc PASS, build PASS, E2E 45/45 PASS ✅

**APP BUGS FOUND:** None

**DEVIATIONS FROM SPEC:**
- Settings toggle placed in Notifications tab (under "Tự động hóa" heading) instead of a separate Order Settings tab — keeps settings page simpler
- Tax calculation uses quote's taxPercent instead of hardcoded 10% — more accurate
- Idempotent: handler checks for existing order before creating (prevents duplicates on event replay)
