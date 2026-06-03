export type TravelOpsEntityGroup =
  | "product"
  | "pricing"
  | "inventory"
  | "sales"
  | "operation"
  | "supplier"
  | "finance"
  | "document"
  | "integration";

export interface TravelOpsEntityDefinition {
  name: string;
  group: TravelOpsEntityGroup;
  table: string;
  ownsFinancialImpact: boolean;
  primaryVietErpRefs: string[];
}

export const travelOpsEntities = [
  {
    name: "TourPackage",
    group: "product",
    table: "travel_tour_packages",
    ownsFinancialImpact: false,
    primaryVietErpRefs: ["CRM.Campaign", "PM.ProjectTemplate", "Accounting.CostCenter"]
  },
  {
    name: "TourItineraryDay",
    group: "product",
    table: "travel_itinerary_days",
    ownsFinancialImpact: false,
    primaryVietErpRefs: []
  },
  {
    name: "TourPriceTier",
    group: "pricing",
    table: "travel_price_tiers",
    ownsFinancialImpact: true,
    primaryVietErpRefs: ["Accounting.Item"]
  },
  {
    name: "TravelRateRule",
    group: "pricing",
    table: "travel_rate_rules",
    ownsFinancialImpact: true,
    primaryVietErpRefs: ["Accounting.RevenueAccount", "HRM.Employee", "ExcelAI.WorkbookDataset"]
  },
  {
    name: "TravelInventoryBlock",
    group: "inventory",
    table: "travel_inventory_blocks",
    ownsFinancialImpact: true,
    primaryVietErpRefs: ["PM.Task", "HRM.Employee", "Notifications.Alert"]
  },
  {
    name: "TravelSalesChannel",
    group: "integration",
    table: "travel_sales_channels",
    ownsFinancialImpact: false,
    primaryVietErpRefs: ["CRM.Channel", "Notifications.Alert"]
  },
  {
    name: "TourDeparture",
    group: "operation",
    table: "travel_departures",
    ownsFinancialImpact: true,
    primaryVietErpRefs: ["PM.Project", "HRM.Employee", "Accounting.CostCenter"]
  },
  {
    name: "Booking",
    group: "sales",
    table: "travel_bookings",
    ownsFinancialImpact: true,
    primaryVietErpRefs: ["CRM.Lead", "CRM.Opportunity", "MasterData.Customer", "Accounting.ARInvoice"]
  },
  {
    name: "BookingPassenger",
    group: "sales",
    table: "travel_booking_passengers",
    ownsFinancialImpact: false,
    primaryVietErpRefs: ["MasterData.Contact"]
  },
  {
    name: "Supplier",
    group: "supplier",
    table: "travel_suppliers",
    ownsFinancialImpact: true,
    primaryVietErpRefs: ["MasterData.Supplier", "CRM.Account", "Accounting.Vendor"]
  },
  {
    name: "SupplierContract",
    group: "supplier",
    table: "travel_supplier_contracts",
    ownsFinancialImpact: true,
    primaryVietErpRefs: ["Documents.File", "Accounting.VendorContract"]
  },
  {
    name: "SupplierRate",
    group: "supplier",
    table: "travel_supplier_rates",
    ownsFinancialImpact: true,
    primaryVietErpRefs: ["Accounting.Item"]
  },
  {
    name: "TourCostLine",
    group: "finance",
    table: "travel_cost_lines",
    ownsFinancialImpact: true,
    primaryVietErpRefs: ["Accounting.APBill", "PM.PurchaseRequest"]
  },
  {
    name: "BookingPayment",
    group: "finance",
    table: "travel_booking_payments",
    ownsFinancialImpact: true,
    primaryVietErpRefs: ["Accounting.Payment", "Accounting.BankTransaction"]
  },
  {
    name: "AgentCommission",
    group: "finance",
    table: "travel_agent_commissions",
    ownsFinancialImpact: true,
    primaryVietErpRefs: ["Accounting.APBill", "Accounting.Payment"]
  },
  {
    name: "ServiceVoucher",
    group: "operation",
    table: "travel_service_vouchers",
    ownsFinancialImpact: false,
    primaryVietErpRefs: ["Documents.File", "Notifications.Message"]
  },
  {
    name: "GuideAssignment",
    group: "operation",
    table: "travel_guide_assignments",
    ownsFinancialImpact: true,
    primaryVietErpRefs: ["HRM.Employee", "MasterData.Supplier", "PM.Task"]
  },
  {
    name: "TravelDocument",
    group: "document",
    table: "travel_documents",
    ownsFinancialImpact: false,
    primaryVietErpRefs: ["Documents.File"]
  },
  {
    name: "TravelInsurancePolicy",
    group: "document",
    table: "travel_insurance_policies",
    ownsFinancialImpact: true,
    primaryVietErpRefs: ["Accounting.APBill", "Documents.File"]
  },
  {
    name: "TourIncident",
    group: "operation",
    table: "travel_incidents",
    ownsFinancialImpact: false,
    primaryVietErpRefs: ["PM.Issue", "Notifications.Alert"]
  },
  {
    name: "TourProfitSnapshot",
    group: "finance",
    table: "travel_profit_snapshots",
    ownsFinancialImpact: true,
    primaryVietErpRefs: ["Accounting.Report"]
  },
  {
    name: "VietErpEntityMap",
    group: "integration",
    table: "travel_vieterp_entity_maps",
    ownsFinancialImpact: false,
    primaryVietErpRefs: ["Accounting", "CRM", "HRM", "PM", "MasterData"]
  }
] as const satisfies readonly TravelOpsEntityDefinition[];

export type TravelOpsEntityName = (typeof travelOpsEntities)[number]["name"];
