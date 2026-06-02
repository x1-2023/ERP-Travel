# VietERP TravelOps

TravelOps is the vertical module for travel agencies and tour operators. It owns tour products, departures, bookings, passengers, suppliers, vouchers, guide assignments, travel documents, incidents, and tour-level finance snapshots.

## Scope

- Tour catalog: `TourPackage`, `TourItineraryDay`, `TourPriceTier`
- Sales and reservations: `TourDeparture`, `Booking`, `BookingPassenger`
- Suppliers and contracts: `Supplier`, `SupplierContract`, `SupplierRate`
- Operations: `ServiceVoucher`, `GuideAssignment`, `TravelDocument`, `TravelInsurancePolicy`, `TourIncident`
- Finance: `TourCostLine`, `BookingPayment`, `AgentCommission`, `TourProfitSnapshot`
- Integration: `VietErpEntityMap`

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

## Commands

```bash
npm run db:validate --workspace @vierp/travelops
npm run db:generate --workspace @vierp/travelops
npm run db:push --workspace @vierp/travelops
npm run db:seed --workspace @vierp/travelops
npm run typecheck --workspace @vierp/travelops
```

Set `DATABASE_URL` before running Prisma commands that connect to PostgreSQL.
