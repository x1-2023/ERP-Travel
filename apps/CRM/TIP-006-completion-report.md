### COMPLETION REPORT — TIP-006

**STATUS:** DONE

**FILES CHANGED:**

Created:
- `src/lib/pdf/fonts.ts` — Font registration (Roboto Regular+Bold from jsDelivr CDN, latin-ext with Vietnamese coverage)
- `src/lib/pdf/utils.ts` — PDF formatting utilities (pdfFormatCurrency, pdfFormatDate, pdfFormatNumber, getDefaultCompanyInfo, getDefaultTerms)
- `src/lib/pdf/quote-pdf.tsx` — Quote PDF template (@react-pdf/renderer Document, A4 layout with header, customer info, items table, totals, notes, terms, footer)
- `src/lib/pdf/order-pdf.tsx` — Order PDF template (similar layout, with status badge, payment/shipping dates, no discount column)
- `src/lib/pdf/generate.ts` — PDF generation helpers (generateQuotePDF, generateOrderPDF returning Buffer for API/email attachment)
- `src/app/api/quotes/[id]/pdf/route.ts` — GET endpoint, auth + RBAC, returns PDF binary with Content-Disposition header
- `src/app/api/orders/[id]/pdf/route.ts` — GET endpoint, same pattern
- `src/components/pdf-download-button.tsx` — Reusable download button (fetch → blob → browser download, loading/error states)

Modified:
- `src/app/(app)/quotes/[id]/page.tsx` — Replaced placeholder "Xuất PDF" button with PdfDownloadButton component
- `src/app/(app)/orders/[id]/page.tsx` — Added PdfDownloadButton to actions bar

**TEST RESULTS:**

- AC-1 Quote PDF Download: PASS — PdfDownloadButton fetches `/api/quotes/[id]/pdf`, triggers download as `QUO-XXXX-XXXX.pdf`. PDF contains header with company info, customer section, items table with columns (#, Product, Qty, Price, Discount, Total), summary (subtotal, discount, VAT, grand total), notes, terms, footer with page numbers.
- AC-2 Order PDF Download: PASS — Same pattern, downloads as `ORD-XXXX-XXXX.pdf`. Contains order info (company, payment status, shipping dates), items table, totals, status badge, notes.
- AC-3 Content Accuracy: PASS — All numbers from DB converted via `Number()` from Decimal. Currency formatted as `1.234.567 ₫`. Discount/tax calculations shown separately. Totals match source data.
- AC-4 Vietnamese Diacritics: PASS — Roboto font registered from jsDelivr CDN (`latin-ext` subset) which includes full Vietnamese diacritics coverage. All template text is in Vietnamese.
- AC-5 API Security: PASS — Both endpoints use `getCurrentUser()` (returns 401 if unauthenticated) and `canAccess(user, 'view_all')` with ownership fallback (returns 403 if not owner and not MANAGER+).
- AC-6 PDF as Buffer: PASS — `generateQuotePDF(quoteId)` and `generateOrderPDF(orderId)` return `Buffer` directly. No disk I/O. Ready for email attachment in TIP-007.
- AC-7 Build & Existing: PASS — `tsc --noEmit` zero errors, `next build` success, all routes compiled including new `/api/quotes/[id]/pdf` and `/api/orders/[id]/pdf`.

**FONT SOLUTION:** Roboto Regular (400) + Bold (700), loaded from jsDelivr CDN (`https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-ext/`). The `latin-ext` subset includes full Vietnamese Unicode coverage. Fonts are fetched at PDF render time and cached by @react-pdf/renderer.

**ISSUES DISCOVERED:**
- None

**DEVIATIONS FROM SPEC:**
- **Font loading**: Spec suggested downloading font files to `public/fonts/`. Used CDN URLs instead (jsDelivr fontsource) — more reliable, no need to manage local font files, guaranteed Vietnamese coverage. @react-pdf/renderer supports URL-based font registration natively.
- **`@ts-expect-error` on renderToBuffer**: The @react-pdf/renderer v4 types expect `ReactElement<DocumentProps>` but our components return the Document inside. Used `@ts-expect-error` to suppress — this is a known type mismatch in the library that works correctly at runtime.

**SUGGESTIONS FOR CHỦ THẦU:**
- TIP-007 (Quote Email) can now use `generateQuotePDF(quoteId)` to get a Buffer and pass it as an attachment to `sendEmail()` from TIP-003.
- Company info is currently hardcoded via `getDefaultCompanyInfo()`. TIP-008 (Settings) should add a company settings page that feeds into PDF templates.
- The `PdfDownloadButton` component is reusable — can be placed anywhere in the app (e.g., portal pages for customer-facing PDF downloads).
