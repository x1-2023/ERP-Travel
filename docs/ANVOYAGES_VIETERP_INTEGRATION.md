# AnVoyages to VietERP Integration

This compares `x1-2023/AnVoyages-Booking---CRM` with VietERP TravelOps and defines the integration path.

## Summary

AnVoyages is strongest as the public booking storefront and lightweight travel CRM. VietERP TravelOps should become the back-office system of record for operations, accounting integration, project execution, HR assignments, supplier settlement, and reporting.

Do not copy AnVoyages directly into VietERP as another full app. Keep it as a booking channel and sync its entities into TravelOps.

## Source Model Comparison

| AnVoyages entity | Current role | VietERP target |
| --- | --- | --- |
| `Location` | Destination landing page and SEO | `TourPackage.destinationRegion` plus metadata |
| `Property` | Sellable hotel, homestay, tour, cruise, transport product | `TourPackage` |
| `ProductOption` | Room/cabin/package/vehicle variant, price and capacity | `TourPriceTier` plus inventory metadata |
| `ProductOptionInventory` | Date-level unit availability | Future `TravelInventoryBlock` or PM capacity task |
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
3. AnVoyages pushes booking events to VietERP, or VietERP pulls periodic snapshots from AnVoyages.
4. TravelOps writes Accounting/CRM/PM/HRM references after back-office actions are created.
5. `VietErpEntityMap` stores source IDs, sync direction, retry state, and external refs.

## Mapping Rules Implemented

The initial integration kit lives in `apps/TravelOps/src/integrations/anvoyages`.

- `Property` -> `TourPackage`
- `ProductOption` -> `TourPriceTier`
- `Supplier` -> `Supplier`
- `Booking` -> generated `TourDeparture` plus `Booking`
- `Payment` -> `BookingPayment`

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
- Add a TravelOps API endpoint or worker to persist the normalized import plan.
- Add inventory-specific entity if hotel/cruise room/cabin inventory needs ERP-grade controls.
- Decide whether marketing CMS/blog stays in AnVoyages or moves to a separate content module.
