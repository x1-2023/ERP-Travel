# TravelOps Entity Map

This document maps the travel-company vertical into VietERP without forcing unrelated module rewrites.

## Entity Ownership

| Entity | Owner | Main job |
| --- | --- | --- |
| `TourPackage` | TravelOps | Reusable tour product and commercial template |
| `TourItineraryDay` | TravelOps | Day-by-day operating plan |
| `TourPriceTier` | TravelOps | Pax-based package pricing |
| `TravelRateRule` | TravelOps plus Accounting/ExcelAI | Seasonal, holiday, weekday, event, manual, and occupancy price rules |
| `TravelInventoryBlock` | TravelOps plus PM | Daily room/cabin/vehicle/package availability, stop-sell, and request-only controls |
| `TravelSalesChannel` | TravelOps plus CRM | AnVoyages, OTA, social, manual, and API channel configuration |
| `TravelChannelSyncJob` | TravelOps plus Notifications | Retryable sync log for prices, inventory, bookings, payments, and suppliers |
| `TourDeparture` | TravelOps | Concrete departure date, capacity, and operating budget |
| `Booking` | TravelOps | Reservation, pax count, revenue, and invoice reference |
| `BookingPassenger` | TravelOps | Passenger identity, passport, visa, and special requests |
| `Supplier` | TravelOps plus MasterData | Hotels, transport, airlines, guides, insurance, DMCs |
| `SupplierContract` | TravelOps | Commercial terms and cancellation rules |
| `SupplierRate` | TravelOps | Contracted buy rates by service category |
| `TourCostLine` | TravelOps plus Accounting | Direct cost estimate and AP bill reference |
| `BookingPayment` | TravelOps plus Accounting | Deposit, final payment, bank transaction reference |
| `AgentCommission` | TravelOps plus Accounting | Agent payable and settlement state |
| `ServiceVoucher` | TravelOps | Supplier service order/voucher |
| `GuideAssignment` | TravelOps plus HRM | Guide/operator assignment |
| `TravelDocument` | TravelOps plus Documents | Passport, visa, ticket, voucher, contract file state |
| `TravelInsurancePolicy` | TravelOps | Insurance policy and provider reference |
| `TourIncident` | TravelOps plus PM | Operational issue, severity, resolution owner |
| `TourProfitSnapshot` | TravelOps plus Accounting/ExcelAI | Revenue, cost, margin snapshot |
| `VietErpEntityMap` | TravelOps | Cross-module ID map and sync status |

## Workflow Map

1. CRM inquiry creates or links a `Booking`.
2. Booking confirmation creates an Accounting AR invoice and customer deposit plan.
3. Confirmed booking increases `TourDeparture.confirmedPax`.
4. Departure creation can create a PM project from the package template.
5. Supplier reservations create `ServiceVoucher` rows and estimated `TourCostLine` rows.
6. Supplier invoices map cost lines to Accounting AP bills.
7. Guide/operator assignments reference HRM employees or external guide suppliers.
8. Documents store passports, visas, tickets, contracts, vouchers, and insurance files.
9. Completed departures generate `TourProfitSnapshot` rows for management reports and ExcelAI analysis.
10. Back-office users update `TravelRateRule` or `TravelInventoryBlock`; TravelOps publishes changes to AnVoyages through `TravelChannelSyncJob`.

## Integration Boundary

TravelOps should not duplicate core accounting ledgers, HR employee records, CRM pipeline records, or document binary storage. It stores operational state and keeps cross-module references:

- `customerRef`, `crmLeadRef`, `crmOpportunityRef`
- `accountingInvoiceRef`, `accountingBillRef`, `accountingPaymentRef`
- `pmProjectRef`, `purchaseRequestRef`
- `operatorEmployeeRef`, `guideEmployeeRef`, `createdByEmployeeRef`
- `fileRef`, `documentRef`
- `sourceSystem`, `sourceRecordId`, `TravelSalesChannel`, `TravelChannelSyncJob`

Use `VietErpEntityMap` when a relation needs sync metadata, retries, external IDs, or bidirectional mapping.
