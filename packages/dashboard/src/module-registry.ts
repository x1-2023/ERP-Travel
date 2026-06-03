export interface DashboardModuleRegistryItem {
  id: string;
  name: string;
  group: 'core' | 'travel' | 'finance' | 'people' | 'operations' | 'analytics' | 'channel';
  sourcePath: string;
  dashboardPreset?: string;
  parentModule?: string;
  role: string;
  healthKey: string;
}

export const dashboardModuleRegistry = [
  {
    id: 'anvoyages-booking-crm',
    name: 'AnVoyages Booking CRM',
    group: 'channel',
    sourcePath: 'apps/AnVoyages-Booking-CRM',
    dashboardPreset: 'travel',
    parentModule: 'TravelOps',
    role: 'Public booking website and lightweight CRM channel',
    healthKey: 'anvoyages',
  },
  {
    id: 'travelops',
    name: 'TravelOps',
    group: 'travel',
    sourcePath: 'apps/TravelOps',
    dashboardPreset: 'travel',
    role: 'Travel ERP system of record for bookings, pricing, inventory, suppliers, and operations',
    healthKey: 'travelops',
  },
  {
    id: 'accounting',
    name: 'Accounting',
    group: 'finance',
    sourcePath: 'apps/Accounting',
    dashboardPreset: 'travel',
    role: 'Invoices, deposits, AP bills, commissions, VAT, and margin reporting',
    healthKey: 'accounting',
  },
  {
    id: 'hrm',
    name: 'HRM',
    group: 'people',
    sourcePath: 'apps/HRM',
    dashboardPreset: 'travel',
    role: 'Operators, guides, sales owners, assignments, and payroll references',
    healthKey: 'hrm',
  },
  {
    id: 'pm',
    name: 'PM',
    group: 'operations',
    sourcePath: 'apps/PM',
    dashboardPreset: 'travel',
    role: 'Departure projects, operating checklists, incidents, and purchase requests',
    healthKey: 'pm',
  },
  {
    id: 'crm',
    name: 'CRM',
    group: 'core',
    sourcePath: 'apps/CRM',
    dashboardPreset: 'travel',
    role: 'Leads, opportunities, customers, communication history, and channel attribution',
    healthKey: 'crm',
  },
  {
    id: 'excelai',
    name: 'ExcelAI',
    group: 'analytics',
    sourcePath: 'apps/ExcelAI',
    dashboardPreset: 'travel',
    role: 'Yield analysis, seasonal pricing simulation, occupancy, and margin reports',
    healthKey: 'excelai',
  },
] as const satisfies readonly DashboardModuleRegistryItem[];

export type DashboardModuleId = (typeof dashboardModuleRegistry)[number]['id'];
