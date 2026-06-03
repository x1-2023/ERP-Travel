export type ErpDepartment =
  | "EXECUTIVE"
  | "OPERATIONS"
  | "SALES"
  | "FINANCE"
  | "HR"
  | "PMO"
  | "DATA";

export type ErpRole =
  | "OWNER"
  | "GENERAL_MANAGER"
  | "OPS_MANAGER"
  | "SALES_MANAGER"
  | "ACCOUNTANT"
  | "HR_MANAGER"
  | "PM_MANAGER"
  | "DATA_ANALYST"
  | "VIEWER";

export type ErpModule =
  | "travelops"
  | "anvoyages"
  | "crm"
  | "accounting"
  | "hrm"
  | "excelai"
  | "pm"
  | "system"
  | "users"
  | "audit";

export type ErpAction = "read" | "write" | "admin";
export type ErpPermission = `${ErpModule}:${ErpAction}` | "*";

export interface ErpDepartmentDefinition {
  id: ErpDepartment;
  label: string;
  owner: string;
  purpose: string;
}

export interface ErpRoleDefinition {
  id: ErpRole;
  label: string;
  defaultDepartment: ErpDepartment;
  purpose: string;
  permissions: readonly ErpPermission[];
}

export interface ErpModuleDefinition {
  id: ErpModule;
  label: string;
  ownerDepartment: ErpDepartment;
  purpose: string;
  readPermission: ErpPermission;
  writePermission: ErpPermission;
}

export interface PublicErpUser {
  id: string;
  email: string;
  name: string;
  title?: string;
  department: ErpDepartment;
  role: ErpRole;
  permissions: ErpPermission[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export const erpDepartments: ErpDepartmentDefinition[] = [
  {
    id: "EXECUTIVE",
    label: "Ban giam doc",
    owner: "CEO / Founder",
    purpose: "Company-wide control, approvals, and risk ownership.",
  },
  {
    id: "OPERATIONS",
    label: "Dieu hanh tour",
    owner: "Operations Manager",
    purpose: "Tours, rooms, suppliers, availability, stop-sell, and incidents.",
  },
  {
    id: "SALES",
    label: "Kinh doanh / CRM",
    owner: "Sales Manager",
    purpose: "Leads, customers, quotes, bookings, and channel follow-up.",
  },
  {
    id: "FINANCE",
    label: "Ke toan",
    owner: "Chief Accountant",
    purpose: "Deposits, receivables, payables, tax, supplier settlement, margin.",
  },
  {
    id: "HR",
    label: "Nhan su",
    owner: "HR Manager",
    purpose: "Employees, guides, drivers, payroll references, and access changes.",
  },
  {
    id: "PMO",
    label: "Du an / PM",
    owner: "Project Manager",
    purpose: "Departure tasks, checklists, documentation, and execution status.",
  },
  {
    id: "DATA",
    label: "Data / ExcelAI",
    owner: "Data Lead",
    purpose: "Excel imports, reconciliation, reports, and automation quality.",
  },
];

export const erpModules: ErpModuleDefinition[] = [
  {
    id: "travelops",
    label: "TravelOps",
    ownerDepartment: "OPERATIONS",
    purpose: "Tour, room, rate, inventory, supplier, and operating rules.",
    readPermission: "travelops:read",
    writePermission: "travelops:write",
  },
  {
    id: "anvoyages",
    label: "AnVoyages",
    ownerDepartment: "OPERATIONS",
    purpose: "Booking website channel, direct price apply, and inventory control.",
    readPermission: "anvoyages:read",
    writePermission: "anvoyages:write",
  },
  {
    id: "crm",
    label: "CRM",
    ownerDepartment: "SALES",
    purpose: "Leads, contacts, deals, orders, customer support, and campaigns.",
    readPermission: "crm:read",
    writePermission: "crm:write",
  },
  {
    id: "accounting",
    label: "Accounting",
    ownerDepartment: "FINANCE",
    purpose: "Receivables, payables, deposits, tax, and booking profit.",
    readPermission: "accounting:read",
    writePermission: "accounting:write",
  },
  {
    id: "hrm",
    label: "HRM",
    ownerDepartment: "HR",
    purpose: "Employees, departments, roster, guides, and access requests.",
    readPermission: "hrm:read",
    writePermission: "hrm:write",
  },
  {
    id: "excelai",
    label: "ExcelAI",
    ownerDepartment: "DATA",
    purpose: "Supplier sheets, room allotments, import/export, and reconciliation.",
    readPermission: "excelai:read",
    writePermission: "excelai:write",
  },
  {
    id: "pm",
    label: "PM",
    ownerDepartment: "PMO",
    purpose: "Tour departure projects, tasks, documents, and incidents.",
    readPermission: "pm:read",
    writePermission: "pm:write",
  },
  {
    id: "system",
    label: "System",
    ownerDepartment: "EXECUTIVE",
    purpose: "Runtime services, database, tunnel, deploy status, and settings.",
    readPermission: "system:read",
    writePermission: "system:write",
  },
  {
    id: "users",
    label: "Users",
    ownerDepartment: "HR",
    purpose: "User accounts, roles, departments, and permission assignment.",
    readPermission: "users:read",
    writePermission: "users:write",
  },
  {
    id: "audit",
    label: "Audit",
    ownerDepartment: "EXECUTIVE",
    purpose: "Security, direct-control, login, and access-change events.",
    readPermission: "audit:read",
    writePermission: "audit:write",
  },
];

const allReadPermissions = erpModules.map((module) => module.readPermission);

export const erpRoles: ErpRoleDefinition[] = [
  {
    id: "OWNER",
    label: "Owner / Super Admin",
    defaultDepartment: "EXECUTIVE",
    purpose: "Full control for founder and trusted company admin.",
    permissions: ["*"],
  },
  {
    id: "GENERAL_MANAGER",
    label: "General Manager",
    defaultDepartment: "EXECUTIVE",
    purpose: "Operate all departments except low-level system administration.",
    permissions: [
      ...allReadPermissions,
      "travelops:write",
      "anvoyages:write",
      "crm:write",
      "accounting:write",
      "hrm:write",
      "excelai:write",
      "pm:write",
      "users:read",
      "audit:read",
    ],
  },
  {
    id: "OPS_MANAGER",
    label: "Operations Manager",
    defaultDepartment: "OPERATIONS",
    purpose: "Manage tours, rates, inventory, suppliers, and departure execution.",
    permissions: [
      "travelops:read",
      "travelops:write",
      "anvoyages:read",
      "anvoyages:write",
      "crm:read",
      "accounting:read",
      "hrm:read",
      "pm:read",
      "pm:write",
      "excelai:read",
      "audit:read",
    ],
  },
  {
    id: "SALES_MANAGER",
    label: "Sales / CRM Manager",
    defaultDepartment: "SALES",
    purpose: "Manage leads, customers, quotes, booking handoff, and campaigns.",
    permissions: [
      "crm:read",
      "crm:write",
      "travelops:read",
      "anvoyages:read",
      "accounting:read",
      "pm:read",
      "excelai:read",
    ],
  },
  {
    id: "ACCOUNTANT",
    label: "Accountant",
    defaultDepartment: "FINANCE",
    purpose: "Manage accounting, settlements, deposits, payables, and reporting.",
    permissions: [
      "accounting:read",
      "accounting:write",
      "crm:read",
      "travelops:read",
      "anvoyages:read",
      "excelai:read",
      "audit:read",
    ],
  },
  {
    id: "HR_MANAGER",
    label: "HR Manager",
    defaultDepartment: "HR",
    purpose: "Manage staff, departments, roster, and internal account lifecycle.",
    permissions: [
      "hrm:read",
      "hrm:write",
      "users:read",
      "users:write",
      "pm:read",
      "travelops:read",
      "audit:read",
    ],
  },
  {
    id: "PM_MANAGER",
    label: "Project Manager",
    defaultDepartment: "PMO",
    purpose: "Manage tour departure tasks, documents, blockers, and incidents.",
    permissions: ["pm:read", "pm:write", "travelops:read", "crm:read", "hrm:read", "excelai:read"],
  },
  {
    id: "DATA_ANALYST",
    label: "ExcelAI / Data Analyst",
    defaultDepartment: "DATA",
    purpose: "Run imports, reconcile supplier sheets, and prepare reports.",
    permissions: ["excelai:read", "excelai:write", "travelops:read", "crm:read", "accounting:read"],
  },
  {
    id: "VIEWER",
    label: "Viewer",
    defaultDepartment: "EXECUTIVE",
    purpose: "Read-only visibility for advisors or temporary reviewers.",
    permissions: allReadPermissions,
  },
];

export function resolveRolePermissions(role: ErpRole, extraPermissions: ErpPermission[] = []): ErpPermission[] {
  const roleDefinition = erpRoles.find((item) => item.id === role);
  const rolePermissions = roleDefinition?.permissions ?? [];

  if (rolePermissions.includes("*")) {
    return ["*"];
  }

  return Array.from(new Set([...rolePermissions, ...extraPermissions])).sort();
}

export function hasErpPermission(
  user: Pick<PublicErpUser, "active" | "permissions"> | null | undefined,
  permission: ErpPermission,
) {
  if (!user?.active) return false;
  return user.permissions.includes("*") || user.permissions.includes(permission);
}

export function publicAccessPolicy() {
  return {
    departments: erpDepartments,
    roles: erpRoles,
    modules: erpModules,
  };
}

export function isErpRole(value: unknown): value is ErpRole {
  return typeof value === "string" && erpRoles.some((role) => role.id === value);
}

export function isErpDepartment(value: unknown): value is ErpDepartment {
  return typeof value === "string" && erpDepartments.some((department) => department.id === value);
}
