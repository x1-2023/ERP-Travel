# Travel Back-Office Module Suite

VietERP should be the back-office ERP for the travel business. AnVoyages remains the customer-facing booking website.

## Required Modules

| Module | Required | Travel responsibility |
| --- | --- | --- |
| AnVoyages Booking CRM | Yes | Public booking website and booking channel under TravelOps |
| TravelOps | Yes | Product catalog, bookings, departures, seasonal pricing, inventory, direct channel control |
| Accounting | Yes | AR invoice, AP bill, deposits, VAT, commissions, bank reconciliation, departure margin |
| HRM | Yes | Sales owner, operator, guide, driver, document verifier, payroll references |
| PM | Yes | Departure projects, operating checklists, incidents, purchase requests |
| CRM | Yes | Leads, opportunities, customers, repeat booking history, channel attribution |
| ExcelAI | Yes | Price simulation, occupancy/yield analysis, revenue and margin reports |
| Documents | Yes | Passport, visa, tickets, vouchers, contracts, insurance files |
| Notifications | Optional | Direct apply failure alerts, low inventory, guide/operator assignment changes |

## Price and Inventory Flow

1. Back-office user edits room/cabin/package base price in TravelOps.
2. Seasonal or holiday uplift is stored as `TravelRateRule`.
3. Stop-sell, request-only, or adjusted room count is stored as `TravelInventoryBlock`.
4. TravelOps calls AnVoyages immediately when the ERP user saves:
   - `PATCH /api/properties/:id` for property-level price rules.
   - `PATCH /api/properties/options/:optionId/rate` for room/cabin/package option price rules.
   - `PATCH /api/properties/options/:optionId/inventory` for daily availability overrides.
5. If AnVoyages returns an error, the ERP save flow surfaces that error immediately instead of queueing a retry job.
6. New AnVoyages bookings flow back into TravelOps and then into CRM, Accounting, PM, HRM, Documents, and ExcelAI.

## ERP Dashboard

The ERP dashboard package exposes a `travel` preset and module registry. It includes:

- AnVoyages Booking CRM as the public booking channel submodule.
- TravelOps as the travel system of record.
- Accounting, HRM, PM, CRM, ExcelAI, Documents, and Notifications as back-office modules.

AnVoyages source is tracked as a Git submodule at `apps/AnVoyages-Booking-CRM`.

```bash
git submodule update --init --recursive
npm run build --workspace @vierp/dashboard
```

## Why This Shape

The ERP must own finance, people, supplier settlement, approvals, and reporting. The website should not own those. The website only needs the latest sellable price, availability, and booking capture workflow.
