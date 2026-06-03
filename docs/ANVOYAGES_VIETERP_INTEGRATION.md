# AnVoyages to VietERP Integration

This compares `x1-2023/AnVoyages-Booking---CRM` with VietERP TravelOps and defines the integration path.

## Summary

AnVoyages is strongest as the public booking storefront and lightweight travel CRM. VietERP TravelOps should become the back-office system of record for operations, accounting integration, project execution, HR assignments, supplier settlement, and reporting.

Do not copy AnVoyages directly into VietERP as another full app. Keep it as a booking channel under TravelOps and let ERP apply back-office price and inventory edits directly to AnVoyages.

## Source Model Comparison

| AnVoyages entity | Current role | VietERP target |
| --- | --- | --- |
| `Location` | Destination landing page and SEO | `TourPackage.destinationRegion` plus metadata |
| `Property` | Sellable hotel, homestay, tour, cruise, transport product | `TourPackage` |
| `ProductOption` | Room/cabin/package/vehicle variant, price and capacity | `TourPriceTier` plus inventory metadata |
| `ProductOptionInventory` | Date-level unit availability | `TravelInventoryBlock` |
| `Booking` | Public booking, status, payment intent, Sepay reference | `Booking` plus generated `TourDeparture` |
| `Customer` | Web lead/customer identity | CRM customer/contact reference |
| `Lead` | Web CRM lead | CRM lead/opportunity reference |
| `Supplier` | Hotel/cruise/transport/tour vendor | `Supplier` |
| `Payment` | Deposit/final/refund payment event | `BookingPayment` and Accounting payment reference |
| `Communication` | Customer interaction log | CRM activity or notification log |
| `IntegrationChannel` | Social/payment/ERP connectors | TravelOps integration config or shared integrations |
| `AutomationRule` | Lightweight CRM automation | CRM/Notifications automation |
| `BlogPost` | Marketing content | Keep in AnVoyages or CMS, not TravelOps |

## Recommended Architecture

1. AnVoyages remains the customer-facing website.
2. VietERP TravelOps owns operational data after booking capture.
3. AnVoyages pushes booking events to VietERP, or VietERP imports booking snapshots from AnVoyages.
4. TravelOps writes Accounting/CRM/PM/HRM references after back-office actions are created.
5. `VietErpEntityMap` stores source IDs, direction, status, and external refs.
6. ERP operators manage room/cabin/package price rules in `TravelRateRule` and inventory in `TravelInventoryBlock`; the ERP save action calls AnVoyages immediately.

## Mapping Rules Implemented

The initial integration kit lives in `apps/TravelOps/src/integrations/anvoyages`.

- `Property` -> `TourPackage`
- `ProductOption` -> `TourPriceTier`
- `Supplier` -> `Supplier`
- `Booking` -> generated `TourDeparture` plus `Booking`
- `Payment` -> `BookingPayment`
- `TravelRateRule` -> AnVoyages `pricingRules`
- `TravelInventoryBlock` -> AnVoyages `ProductOptionInventory`

Status conversion:

| AnVoyages status | TravelOps booking status | Departure status |
| --- | --- | --- |
| `pending` | `INQUIRY` | `OPEN` |
| `contacted` | `QUOTED` | `OPEN` |
| `quoted` | `QUOTED` | `OPEN` |
| `confirmed` | `CONFIRMED` | `GUARANTEED` |
| `deposit` | `CONFIRMED` | `GUARANTEED` |
| `paid` | `CONFIRMED` | `GUARANTEED` |
| `completed` | `COMPLETED` | `COMPLETED` |
| `cancelled` | `CANCELLED` | `CANCELLED` |

## Work Still Needed

- Add an authenticated webhook endpoint in AnVoyages for `booking.created`, `booking.updated`, and `payment.paid`.
- Add a TravelOps API endpoint or importer to persist the normalized booking import plan.
- Wire the TravelOps ERP UI save action to `applyAnVoyages*Directly` with an AnVoyages service token.
- Decide whether marketing CMS/blog stays in AnVoyages or moves to a separate content module.

## Back-Office Price and Inventory Publishing

TravelOps now owns the ERP-side entities needed for back-office pricing:

| ERP entity | Purpose | AnVoyages endpoint |
| --- | --- | --- |
| `TravelRateRule` | Seasonal, holiday, weekday, event, manual, and occupancy price rules | `PATCH /api/properties/:id` or `PATCH /api/properties/options/:optionId/rate` |
| `TravelInventoryBlock` | Daily room/cabin/vehicle/package availability, stop-sell, request-only, closed dates | `PATCH /api/properties/options/:optionId/inventory` |
| `TravelSalesChannel` | Channel config for AnVoyages, OTA, social, manual/API channels | Direct API target config |

The AnVoyages backend supports `PATCH /api/properties/options/:optionId/rate` so ERP can change room/cabin option rates without recreating all property options.

## Direct ERP Apply

TravelOps exports direct AnVoyages apply helpers in `apps/TravelOps/src/integrations/anvoyages/outbound.ts`.

- `applyAnVoyagesPropertyRateDirectly`
- `applyAnVoyagesOptionRateDirectly`
- `applyAnVoyagesInventoryDirectly`
- `applyAnVoyagesBulkInventoryDirectly`

These helpers call AnVoyages synchronously. If AnVoyages rejects the change, ERP should show the failure to the operator and keep the ERP-side save inside a transaction boundary that can be rolled back or marked as failed.

TravelOps also exports an API-neutral command handler from `apps/TravelOps/src/backoffice/direct-channel-control.ts`.

- `handleTravelOpsDirectControlBody`
- `applyTravelOpsDirectControlCommand`
- `createAnVoyagesDirectClientFromEnv`

Recommended mount path for the ERP dashboard/API app:

```text
POST /api/travelops/anvoyages/direct-control
```

The CRM app now mounts this route at the path above. Browser requests use CRM
`ADMIN` or `MANAGER` RBAC. Server-to-server tests can pass
`x-erp-control-token: $VIETERP_TRAVELOPS_CONTROL_TOKEN`.

Supported actions:

```json
{ "action": "PROPERTY_RATE" }
{ "action": "OPTION_RATE" }
{ "action": "INVENTORY" }
```
