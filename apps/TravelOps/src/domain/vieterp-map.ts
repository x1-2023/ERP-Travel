import { TravelOpsEntityName } from "./entities";

export type VietErpModuleName =
  | "Accounting"
  | "CRM"
  | "HRM"
  | "PM"
  | "ExcelAI"
  | "MasterData"
  | "Documents"
  | "Notifications";

export interface VietErpModuleMapping {
  travelOpsEntity: TravelOpsEntityName;
  module: VietErpModuleName;
  targetEntity: string;
  relation: "source" | "target" | "sync" | "reference";
  purpose: string;
}

export const vietErpModuleMappings = [
  {
    travelOpsEntity: "Booking",
    module: "CRM",
    targetEntity: "Lead/Opportunity",
    relation: "sync",
    purpose: "Convert travel inquiries into bookings while preserving sales funnel history."
  },
  {
    travelOpsEntity: "Booking",
    module: "Accounting",
    targetEntity: "ARInvoice",
    relation: "target",
    purpose: "Issue customer invoices, record receivables, deposits, VAT, and payment reconciliation."
  },
  {
    travelOpsEntity: "TourDeparture",
    module: "PM",
    targetEntity: "Project",
    relation: "target",
    purpose: "Run each departure as an operational project with tasks, checklists, and issues."
  },
  {
    travelOpsEntity: "TourDeparture",
    module: "HRM",
    targetEntity: "Employee",
    relation: "reference",
    purpose: "Assign operators, tour leaders, guides, and back-office owners."
  },
  {
    travelOpsEntity: "Supplier",
    module: "MasterData",
    targetEntity: "Supplier",
    relation: "sync",
    purpose: "Share vendor identity for hotels, transport, airlines, DMCs, guides, and insurance providers."
  },
  {
    travelOpsEntity: "TourCostLine",
    module: "Accounting",
    targetEntity: "APBill",
    relation: "target",
    purpose: "Convert supplier costs into payables and travel gross margin reporting."
  },
  {
    travelOpsEntity: "BookingPayment",
    module: "Accounting",
    targetEntity: "Payment/BankTransaction",
    relation: "target",
    purpose: "Reconcile customer deposits and final payments."
  },
  {
    travelOpsEntity: "TravelDocument",
    module: "Documents",
    targetEntity: "File",
    relation: "reference",
    purpose: "Store passports, visas, tickets, contracts, vouchers, and insurance documents outside the operational row."
  },
  {
    travelOpsEntity: "TourProfitSnapshot",
    module: "ExcelAI",
    targetEntity: "WorkbookDataset",
    relation: "target",
    purpose: "Export margin snapshots for analysis, forecasting, and management reporting."
  }
] as const satisfies readonly VietErpModuleMapping[];
