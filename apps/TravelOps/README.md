# VietERP TravelOps

TravelOps is the vertical module for travel agencies and tour operators. It owns tour products, departures, bookings, passengers, suppliers, vouchers, guide assignments, travel documents, incidents, and tour-level finance snapshots.

## Scope

- Tour catalog: `TourPackage`, `TourItineraryDay`, `TourPriceTier`
- Back-office pricing: `TravelRateRule`
- Inventory/yield control: `TravelInventoryBlock`
- Sales and reservations: `TourDeparture`, `Booking`, `BookingPassenger`
- Suppliers and contracts: `Supplier`, `SupplierContract`, `SupplierRate`
- Operations: `ServiceVoucher`, `GuideAssignment`, `TravelDocument`, `TravelInsurancePolicy`, `TourIncident`
- Finance: `TourCostLine`, `BookingPayment`, `AgentCommission`, `TourProfitSnapshot`
- Integration: `TravelSalesChannel`, `VietErpEntityMap`, direct AnVoyages apply helpers

## VietERP Mapping

TravelOps keeps its own operational database tables and stores cross-module references to avoid changing existing modules too early.

| TravelOps area | VietERP module | Mapping purpose |
| --- | --- | --- |
| Booking | CRM | Lead, opportunity, customer journey |
| Booking, payment | Accounting | AR invoice, deposit, payment, VAT reconciliation |
| Supplier, cost line | Accounting | Vendor, AP bill, commission payable |
| Tour departure | PM | Project, task checklist, incidents |
| Operator, guide | HRM | Employee assignment and responsibility |
| Passport, visa, voucher | Documents | File storage and verification state |
| Profit snapshot | ExcelAI | Workbook dataset for margin analysis |

## AnVoyages Booking CRM Integration

`x1-2023/AnVoyages-Booking---CRM` should be treated as a booking channel, not copied wholesale into VietERP. The integration kit in `src/integrations/anvoyages` maps AnVoyages `Property`, `ProductOption`, `Booking`, `Supplier`, and `Payment` records into TravelOps entities.

Direct apply helpers update AnVoyages immediately from the ERP save flow:

- Property/package price rules: `PATCH /api/properties/:id`
- Room/cabin/package option rates: `PATCH /api/properties/options/:optionId/rate`
- Daily inventory overrides: `PATCH /api/properties/options/:optionId/inventory`

Use `applyAnVoyagesPropertyRateDirectly`, `applyAnVoyagesOptionRateDirectly`, and `applyAnVoyagesInventoryDirectly` when ERP users change back-office pricing or inventory. These calls are synchronous and should return API errors directly to the ERP user.

See `docs/ANVOYAGES_VIETERP_INTEGRATION.md` for the comparison and target workflow.

## Commands

```bash
npm run db:validate --workspace @vierp/travelops
npm run db:generate --workspace @vierp/travelops
npm run db:push --workspace @vierp/travelops
npm run db:seed --workspace @vierp/travelops
npm run typecheck --workspace @vierp/travelops
```

Set `DATABASE_URL` before running Prisma commands that connect to PostgreSQL.
