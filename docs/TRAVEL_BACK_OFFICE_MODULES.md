# Travel Back-Office Module Suite

VietERP should be the back-office ERP for the travel business. AnVoyages remains the customer-facing booking website.

## Required Modules

| Module | Required | Travel responsibility |
| --- | --- | --- |
| TravelOps | Yes | Product catalog, bookings, departures, seasonal pricing, inventory, channel sync |
| Accounting | Yes | AR invoice, AP bill, deposits, VAT, commissions, bank reconciliation, departure margin |
| HRM | Yes | Sales owner, operator, guide, driver, document verifier, payroll references |
| PM | Yes | Departure projects, operating checklists, incidents, purchase requests |
| CRM | Yes | Leads, opportunities, customers, repeat booking history, channel attribution |
| ExcelAI | Yes | Price simulation, occupancy/yield analysis, revenue and margin reports |
| Documents | Yes | Passport, visa, tickets, vouchers, contracts, insurance files |
| Notifications | Optional | Sync failure alerts, low inventory, guide/operator assignment changes |

## Price and Inventory Flow

1. Back-office user edits room/cabin/package base price in TravelOps.
2. Seasonal or holiday uplift is stored as `TravelRateRule`.
3. Stop-sell, request-only, or adjusted room count is stored as `TravelInventoryBlock`.
4. TravelOps creates `TravelChannelSyncJob` rows for AnVoyages.
5. Sync worker calls AnVoyages:
   - `PATCH /api/properties/:id` for property-level price rules.
   - `PATCH /api/properties/options/:optionId/rate` for room/cabin/package option price rules.
   - `PATCH /api/properties/options/:optionId/inventory` for daily availability overrides.
6. New AnVoyages bookings flow back into TravelOps and then into CRM, Accounting, PM, HRM, Documents, and ExcelAI.

## Why This Shape

The ERP must own finance, people, supplier settlement, approvals, and reporting. The website should not own those. The website only needs the latest sellable price, availability, and booking capture workflow.
