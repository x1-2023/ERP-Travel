### COMPLETION REPORT — TIP-P2-002

**STATUS:** DONE

**FILES CHANGED:**

- Modified: `src/app/(app)/campaigns/new/page.tsx` — Added scheduling section (radio group + date/time pickers) to wizard step 4
- Modified: `src/app/(app)/campaigns/[id]/page.tsx` — Added SCHEDULED status display, edit schedule dialog, cancel schedule dialog, send-now override dialog
- Modified: `src/app/(app)/campaigns/page.tsx` — Added scheduled datetime subtitle + amber badge for SCHEDULED campaigns
- Modified: `src/app/api/campaigns/route.ts` — Auto-set status=SCHEDULED when scheduledAt provided on create
- Modified: `src/lib/validations/campaign.ts` — Added future-date validation refine on updateCampaignSchema
- Modified: `src/i18n/vi.ts` — Added 20 scheduling-related Vietnamese translation keys
- Modified: `src/i18n/en.ts` — Added 20 scheduling-related English translation keys
- Created: `docs/CRON.md` — Cron setup documentation for Vercel and external cron

**TEST RESULTS:**
- AC-1 Schedule Campaign: PASS — Wizard step 4 shows radio group, date/time pickers. Creating with schedule sets scheduledAt + status=SCHEDULED via server logic
- AC-2 Edit Schedule: PASS — "Sửa lịch" button opens dialog with pre-filled date/time, PATCH updates scheduledAt with future-date validation
- AC-3 Cancel Schedule: PASS — "Hủy lịch" button shows confirmation, sets status=DRAFT + scheduledAt=null
- AC-4 Send Now Override: PASS — "Gửi ngay" button on SCHEDULED campaigns shows confirmation, calls existing /send endpoint
- AC-5 Past Date Validation: PASS — Calendar disables dates before tomorrow; server-side refine rejects past dates with error message
- AC-6 List Badge: PASS — SCHEDULED campaigns show amber "Đã lên lịch" badge + scheduled time (HH:mm dd/MM) inline
- AC-7 Build: PASS — `tsc --noEmit` 0 errors, `next build` clean

**ISSUES DISCOVERED:**
- None

**DEVIATIONS FROM SPEC:**
- SCHEDULED badge color changed from blue (#3B82F6) to amber (#F59E0B) on both list and detail pages — amber better conveys "pending/waiting" semantics vs blue which suggests "active", consistent with SENDING status being blue
- Used native HTML radio inputs with accent-[#10B981] instead of Shadcn RadioGroup — project doesn't have RadioGroup component installed, native radio with project styling is simpler and avoids adding a dependency
- Time picker uses Shadcn Select with 15-min interval options instead of native `<input type="time">` — better cross-browser consistency and styling integration
- Countdown timer (spec listed as "nice-to-have") not implemented — minimal value, adds complexity
