# AnVoyages Booking CRM Submodule

AnVoyages is tracked as a child module of ERP-Travel:

```bash
apps/AnVoyages-Booking-CRM
```

It remains an independent GitHub repository:

```bash
https://github.com/x1-2023/AnVoyages-Booking---CRM.git
```

## Clone ERP With Submodules

```bash
git clone --recurse-submodules https://github.com/x1-2023/ERP-Travel.git
```

If ERP was already cloned:

```bash
git submodule update --init --recursive
```

## Dashboard Relationship

AnVoyages is not the ERP system of record. It is the public booking channel under TravelOps.

The dashboard preset `travel` includes:

- AnVoyages Booking CRM
- TravelOps
- Accounting
- HRM
- PM
- CRM
- ExcelAI
- Documents
- Notifications

Back-office users should manage pricing and inventory in TravelOps, then publish to AnVoyages through channel sync jobs.
