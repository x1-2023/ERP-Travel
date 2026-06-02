### COMPLETION REPORT — TIP-007

**STATUS:** DONE

**FILES CHANGED:**

Created:
- `src/lib/quotes/status.ts` — Quote status helpers (isQuoteExpired, daysUntilExpiry, getQuoteStatusColor, getQuoteStatusLabel)
- `src/app/api/quotes/[id]/send/route.ts` — POST endpoint: generate PDF, send email with attachment, update status DRAFT→SENT, create activity log
- `src/app/api/quotes/check-expiry/route.ts` — POST endpoint: auto-expire overdue quotes, send reminder emails for quotes expiring within 3 days (MANAGER+ only)

Modified:
- `prisma/schema.prisma` — Added `sentAt DateTime?` field to Quote model
- `src/app/(app)/quotes/[id]/page.tsx` — Major update: replaced simple "Gửi báo giá" button with send dialog modal (email input, message textarea, PDF attachment note), added expiry indicator badges (amber/red based on days remaining), disabled send for expired quotes, added placeholder "Tạo bản sao" button for expired quotes, RBAC-gated send button

**SCHEMA CHANGES:**
- Quote model: added `sentAt DateTime?` — tracks when quote was last sent via email
- Applied via `prisma db push`

**TEST RESULTS:**

- AC-1 Send Quote Email: PASS — POST `/api/quotes/[id]/send` generates PDF via `generateQuotePDF()`, sends email via `sendEmail()` with PDF attachment (`{quoteNumber}.pdf`), updates status DRAFT→SENT + sets sentAt, creates Activity (type: EMAIL), returns `{ success, messageId, sentTo }`. Dialog shows email input (prefilled from contact), optional message textarea, "PDF sẽ được đính kèm tự động" note. Success → toast + close dialog + invalidate queries.

- AC-2 Resend Quote: PASS — When quote status is already SENT, button text shows "Gửi lại báo giá". API keeps status as SENT, updates sentAt, activity log says "Gửi lại báo giá {number}". Recipient email can be changed in dialog.

- AC-3 Send Validation: PASS — API validates: (1) quote exists → 404, (2) status must be DRAFT or SENT → 400, (3) must have items → 400 "Báo giá chưa có sản phẩm", (4) contact must have email (or override provided) → 400 "Liên hệ chưa có email". PDF failure → 500 "Không thể tạo PDF". Email failure → 500 "Không thể gửi email" (status NOT changed).

- AC-4 Expiry Auto Expire: PASS — POST `/api/quotes/check-expiry` queries SENT quotes with validUntil <= now, updates each to EXPIRED, creates Activity "Báo giá {number} đã hết hạn". Returns `{ expired: count, reminders: count }`.

- AC-5 Expiry Reminder Email: PASS — Same endpoint queries SENT quotes with validUntil between now and now+3 days. For each with contact email, checks for duplicate reminders (EmailLog within 24h), sends email using `quote-expiring` template with daysLeft/viewUrl, creates Activity, logs to EmailLog.

- AC-6 Expiry UI Indicator: PASS — Quote detail page shows:
  - daysLeft > 7: plain text "Hiệu lực đến: {date}"
  - daysLeft <= 7 && > 3: amber badge "Còn {X} ngày" with Clock icon
  - daysLeft <= 3 && > 0: red badge "Sắp hết hạn! Còn {X} ngày" with AlertTriangle icon
  - daysLeft <= 0: red badge "ĐÃ HẾT HẠN" with AlertTriangle icon
  - Quote EXPIRED status: red "ĐÃ HẾT HẠN" badge, send button hidden, placeholder "Tạo bản sao" button shown (disabled)

- AC-7 Build & No Regression: PASS — `tsc --noEmit` zero errors, `next build` success, all routes compiled including new `/api/quotes/[id]/send` and `/api/quotes/check-expiry`.

**ISSUES DISCOVERED:**
- None

**DEVIATIONS FROM SPEC:**
- **Expiry check-expiry duplicate prevention**: Added 24-hour dedup check via EmailLog query to prevent sending multiple reminders for the same quote within a day. Spec didn't mention this but it's essential for cron job safety.
- **Activity type for expired quotes**: Used `NOTE` type instead of `EMAIL` for auto-expired quote activities, since no email is sent when a quote expires — only status update. Reminders use `EMAIL` type since an email is actually sent.
- **"Tạo bản sao" placeholder**: Shows as a disabled button on expired quotes. Spec said "placeholder UI only" — implemented exactly that.

**SUGGESTIONS FOR CHỦ THẦU:**
- The check-expiry endpoint should be called via Vercel Cron or external scheduler (e.g., daily at 8am). Example Vercel cron config: `{ "path": "/api/quotes/check-expiry", "schedule": "0 8 * * *" }`
- Consider adding a `quoteId` field to EmailLog for better quote-level email tracking (currently uses subject string matching for dedup).
- TIP-007 completes the core business flow: Create Quote → Generate PDF → Send Email → Track Expiry. The M2 milestone (Email & PDF) is now fully achieved.
