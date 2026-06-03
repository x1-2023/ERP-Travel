export interface TravelBackOfficeModule {
  module: string;
  role: string;
  required: boolean;
  travelResponsibilities: string[];
  integrationRefs: string[];
}

export const travelBackOfficeModules = [
  {
    module: "AnVoyages Booking CRM",
    role: "Public booking channel under TravelOps",
    required: true,
    travelResponsibilities: [
      "Customer-facing booking website",
      "Public product, room, cabin, package, and transport browsing",
      "Booking capture, payment handoff, and customer self-service states",
      "Receives price and inventory publishing from TravelOps"
    ],
    integrationRefs: ["TravelSalesChannel", "TravelChannelSyncJob", "VietErpEntityMap"]
  },
  {
    module: "TravelOps",
    role: "Travel vertical system of record",
    required: true,
    travelResponsibilities: [
      "Tour, room, cabin, package, and transport product catalog",
      "Seasonal pricing rules and channel publishing",
      "Inventory blocks, stop-sell days, and request-only dates",
      "Bookings, passengers, vouchers, guide assignment, supplier cost lines"
    ],
    integrationRefs: ["TourPackage", "TourPriceTier", "TravelRateRule", "TravelInventoryBlock", "Booking"]
  },
  {
    module: "Accounting",
    role: "Finance and statutory accounting",
    required: true,
    travelResponsibilities: [
      "AR invoices for bookings and deposits",
      "AP bills for hotels, cruises, guides, transport, insurance, visa services",
      "VAT, bank reconciliation, revenue recognition, commission payable",
      "Gross margin and cost center reporting per departure"
    ],
    integrationRefs: ["accountingInvoiceRef", "accountingBillRef", "accountingPaymentRef", "accountingCostCenterRef"]
  },
  {
    module: "HRM",
    role: "People and assignment management",
    required: true,
    travelResponsibilities: [
      "Sales owner, tour operator, guide, and driver assignment",
      "Duty roster, attendance, payroll references for in-house guides",
      "Responsibility tracking for incidents and document verification"
    ],
    integrationRefs: ["operatorEmployeeRef", "guideEmployeeRef", "createdByEmployeeRef", "approvedByEmployeeRef"]
  },
  {
    module: "PM",
    role: "Departure execution and checklist control",
    required: true,
    travelResponsibilities: [
      "Create a project per guaranteed departure or MICE group",
      "Run checklist tasks for supplier confirmation, documents, rooming list, tickets",
      "Track operational incidents and purchase requests"
    ],
    integrationRefs: ["pmProjectRef", "pmTaskRef", "purchaseRequestRef"]
  },
  {
    module: "CRM",
    role: "Sales funnel and customer history",
    required: true,
    travelResponsibilities: [
      "Capture AnVoyages inquiries as leads/opportunities",
      "Preserve customer interactions and repeat-booking history",
      "Segment agents, corporates, families, and FIT customers"
    ],
    integrationRefs: ["crmLeadRef", "crmOpportunityRef", "crmAccountRef"]
  },
  {
    module: "ExcelAI",
    role: "Analysis and planning workspace",
    required: true,
    travelResponsibilities: [
      "Export booking and margin snapshots",
      "Analyze seasonal pickup, occupancy, room/cabin yield, and package profitability",
      "Support ad-hoc price simulations and supplier cost comparisons"
    ],
    integrationRefs: ["TourProfitSnapshot", "TravelRateRule", "BookingPayment"]
  },
  {
    module: "Documents",
    role: "Controlled file storage",
    required: true,
    travelResponsibilities: [
      "Store passports, visas, vouchers, contracts, insurance policies, tickets",
      "Keep verification status and expiry tracking"
    ],
    integrationRefs: ["fileRef", "documentRef"]
  },
  {
    module: "Notifications",
    role: "Operational alerts",
    required: false,
    travelResponsibilities: [
      "Alert for new web bookings, payment success, low inventory, stop-sell conflicts",
      "Notify guide/operator when assignment changes"
    ],
    integrationRefs: ["TravelChannelSyncJob", "TourIncident"]
  }
] as const satisfies readonly TravelBackOfficeModule[];
