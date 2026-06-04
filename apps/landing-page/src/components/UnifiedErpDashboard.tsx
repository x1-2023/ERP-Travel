"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Database,
  FileSpreadsheet,
  KanbanSquare,
  LogOut,
  Plane,
  ShieldCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { TravelDirectChannelControl } from "@vierp/dashboard/components";
import {
  type ErpDepartment,
  type ErpPermission,
  type ErpModule,
  type ErpRole,
  type PublicErpUser,
  erpDepartments,
  erpModules,
  erpRoles,
  hasErpPermission,
} from "@/lib/erp-access-policy";

type AuditEvent = {
  id?: string;
  at?: string;
  actorEmail?: string;
  module: string;
  action: string;
  target?: string;
  status: "success" | "failure";
  message?: string;
};

type UserDraft = {
  role: ErpRole;
  department: ErpDepartment;
  active: boolean;
};

const iconByModule: Record<ErpModule, LucideIcon> = {
  travelops: Plane,
  anvoyages: Building2,
  crm: BriefcaseBusiness,
  accounting: Calculator,
  hrm: Users,
  excelai: FileSpreadsheet,
  pm: KanbanSquare,
  system: Database,
  users: Users,
  audit: Activity,
};

const serviceRows = [
  ["ERP Dashboard", "Next.js", "3012/root", "Unified control shell and RBAC"],
  ["TravelOps API", "Next API", "/api/travelops/anvoyages/direct-control", "Session-protected direct channel changes"],
  ["AnVoyages API", "NestJS", "3021", "Booking channel backend"],
  ["PostgreSQL", "Docker", "15432", "TravelOps and AnVoyages databases"],
  ["Redis", "Docker", "16379", "Cache and job-ready runtime"],
  ["Cloudflare Tunnel", "systemd", "trycloudflare", "External test access"],
];

const crmLaunchUrl = "/api/erp/crm/launch?next=/travelops";

export default function UnifiedErpDashboard() {
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [user, setUser] = useState<PublicErpUser | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [users, setUsers] = useState<PublicErpUser[]>([]);
  const [userDrafts, setUserDrafts] = useState<Record<string, UserDraft>>({});
  const [usersLoading, setUsersLoading] = useState(false);
  const [savingUserId, setSavingUserId] = useState("");
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    title: "",
    password: "",
    role: "OPS_MANAGER" as ErpRole,
    department: "OPERATIONS" as ErpDepartment,
  });
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserMessage, setCreateUserMessage] = useState("");

  useEffect(() => {
    void loadSession();
  }, []);

  useEffect(() => {
    if (!user) return;
    if (hasPermission("users:read")) void loadUsers();
    if (hasPermission("audit:read")) void loadAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const readableModules = useMemo(() => {
    if (!user) return [];
    return erpModules.filter((module) => hasPermission(module.readPermission));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function hasPermission(permission: ErpPermission) {
    return hasErpPermission(user, permission);
  }

  async function loadSession() {
    setSessionLoading(true);
    setSessionError("");
    try {
      const response = await fetch("/api/erp/auth/session", { credentials: "include" });
      const body = await response.json().catch(() => null);
      if (response.ok && body?.user) {
        setUser(body.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : String(error));
    } finally {
      setSessionLoading(false);
    }
  }

  async function login(event: FormEvent) {
    event.preventDefault();
    setLoginLoading(true);
    setSessionError("");

    try {
      const response = await fetch("/api/erp/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.user) {
        throw new Error(body?.error || "Login failed");
      }
      setUser(body.user);
      setLoginPassword("");
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoginLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/erp/auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    setUser(null);
    setUsers([]);
    setAuditEvents([]);
  }

  async function loadUsers() {
    setUsersLoading(true);
    try {
      const response = await fetch("/api/erp/users", { credentials: "include" });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || "Cannot load users");
      setUsers(body.users ?? []);
      setUserDrafts(
        Object.fromEntries(
          (body.users ?? []).map((item: PublicErpUser) => [
            item.id,
            { role: item.role, department: item.department, active: item.active },
          ]),
        ),
      );
    } finally {
      setUsersLoading(false);
    }
  }

  async function loadAudit() {
    const response = await fetch("/api/erp/audit?limit=30", { credentials: "include" });
    const body = await response.json().catch(() => null);
    if (response.ok) setAuditEvents(body.events ?? []);
  }

  async function createUser(event: FormEvent) {
    event.preventDefault();
    setCreateUserLoading(true);
    setCreateUserMessage("");

    try {
      const response = await fetch("/api/erp/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newUser),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || "Cannot create user");

      setCreateUserMessage(`Created ${body.user.email}`);
      setNewUser({
        email: "",
        name: "",
        title: "",
        password: "",
        role: "OPS_MANAGER",
        department: "OPERATIONS",
      });
      await loadUsers();
      if (hasPermission("audit:read")) await loadAudit();
    } catch (error) {
      setCreateUserMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setCreateUserLoading(false);
    }
  }

  async function saveUser(userId: string) {
    const draft = userDrafts[userId];
    if (!draft) return;
    setSavingUserId(userId);

    try {
      const response = await fetch(`/api/erp/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(draft),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || "Cannot update user");
      await loadUsers();
      if (hasPermission("audit:read")) await loadAudit();
    } catch (error) {
      setCreateUserMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setSavingUserId("");
    }
  }

  if (sessionLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] text-[#111827]">
        <div className="rounded-lg border border-[#d9dde5] bg-white px-5 py-4 text-sm font-medium">
          Loading ERP session...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-4 text-[#111827]">
        <form onSubmit={login} className="w-full max-w-md rounded-lg border border-[#d9dde5] bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-emerald-700">
            <ShieldCheck size={15} />
            <span>ERP Secure Access</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold">VietERP Login</h1>
          <p className="mt-1 text-sm leading-6 text-[#5f6b7a]">
            Dang nhap bang tai khoan noi bo de dieu hanh TravelOps, CRM, Accounting, HRM, ExcelAI,
            PM va user permissions.
          </p>
          <label className="mt-5 block">
            <span className="text-xs font-semibold text-[#5f6b7a]">Email</span>
            <input
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-[#cfd6df] px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              autoComplete="username"
              required
            />
          </label>
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-[#5f6b7a]">Password</span>
            <input
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-[#cfd6df] px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              autoComplete="current-password"
              required
            />
          </label>
          {sessionError && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {sessionError}
            </div>
          )}
          <button
            type="submit"
            disabled={loginLoading}
            className="mt-5 h-10 w-full rounded-md bg-[#111827] px-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loginLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#111827]">
      <div className="border-b border-[#d9dde5] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-emerald-700">
              <ShieldCheck size={15} />
              <span>ERP Control Center</span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-[#0f172a]">VietERP Unified Dashboard</h1>
            <p className="mt-1 max-w-3xl text-sm text-[#526070]">
              Mot man hinh dieu hanh user, phong ban, module, CRM channel va TravelOps direct control.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-md border border-[#cfd6df] bg-[#f8fafc] px-3 py-2 text-sm">
              <span className="font-semibold">{user.name}</span>
              <span className="ml-2 text-[#5f6b7a]">{roleLabel(user.role)}</span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-md border border-[#cfd6df] bg-white px-3 py-2 text-sm font-medium text-[#1f2937]"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden lg:block">
          <nav className="sticky top-5 rounded-lg border border-[#d9dde5] bg-white p-2">
            {readableModules.map((item) => {
              const Icon = iconByModule[item.id];
              return (
                <a
                  key={item.id}
                  href={item.id === "crm" ? crmLaunchUrl : `#${item.id}-control`}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#374151] hover:bg-[#f0f3f6]"
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        <div className="space-y-5">
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {erpModules.map((item) => {
              const Icon = iconByModule[item.id];
              const canRead = hasPermission(item.readPermission);
              const canWrite = hasPermission(item.writePermission);
              return (
                <a
                  key={item.id}
                  href={canRead ? (item.id === "crm" ? crmLaunchUrl : `#${item.id}-control`) : "#access-control"}
                  className={`rounded-lg border bg-white p-4 transition ${
                    canRead ? "border-[#d9dde5] hover:border-[#aeb8c4]" : "border-[#e5e7eb] opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#d9dde5] bg-[#f8fafc]">
                      <Icon size={18} />
                    </div>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        canWrite
                          ? "bg-emerald-50 text-emerald-700"
                          : canRead
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {canWrite ? "Write" : canRead ? "Read" : "No access"}
                    </span>
                  </div>
                  <div className="mt-4 text-base font-semibold text-[#111827]">{item.label}</div>
                  <div className="mt-1 text-sm leading-5 text-[#5f6b7a]">{item.purpose}</div>
                </a>
              );
            })}
          </section>

          <section id="travelops-control" className="rounded-lg border border-[#d9dde5] bg-white p-4">
            <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                  <Plane size={17} />
                  <span>TravelOps and AnVoyages Control</span>
                </div>
                <p className="mt-1 text-sm text-[#5f6b7a]">
                  Price, seasonal rules, inventory and stop-sell are now protected by logged-in ERP
                  permissions.
                </p>
              </div>
              <div className="rounded-md border border-[#d9dde5] bg-[#f8fafc] px-3 py-2 text-xs text-[#5f6b7a]">
                Required: <span className="font-mono font-semibold text-[#111827]">travelops:write</span>
              </div>
            </div>
            {hasPermission("travelops:write") ? (
              <TravelDirectChannelControl
                tenantId="travel-company"
                channelCode="anvoyages"
                actorRef={`erp:${user.email}`}
                className="border-[#d9dde5] shadow-none"
              />
            ) : (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                Tai khoan nay chi xem duoc module, khong co quyen sua gia/tong phong.
              </div>
            )}
          </section>

          <section id="crm-control" className="rounded-lg border border-[#d9dde5] bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BriefcaseBusiness size={17} />
                  <span>CRM Booking Channel</span>
                </div>
                <p className="mt-1 text-sm text-[#5f6b7a]">
                  ERP keeps CRM as an operating module. Access depends on crm:read/crm:write permissions.
                </p>
              </div>
              <a
                href={crmLaunchUrl}
                className={`rounded-md px-3 py-2 text-sm font-semibold ${
                  hasPermission("crm:read") ? "bg-[#111827] text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                Open CRM Module
              </a>
            </div>
          </section>

          <section id="access-control" className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-lg border border-[#d9dde5] bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Users size={17} />
                <span>Users, Roles and Departments</span>
              </div>

              {hasPermission("users:read") ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-xs uppercase text-[#64748b]">
                      <tr>
                        <th className="border-b border-[#e2e6ec] px-2 py-2">User</th>
                        <th className="border-b border-[#e2e6ec] px-2 py-2">Role</th>
                        <th className="border-b border-[#e2e6ec] px-2 py-2">Department</th>
                        <th className="border-b border-[#e2e6ec] px-2 py-2">Active</th>
                        <th className="border-b border-[#e2e6ec] px-2 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? (
                        <tr>
                          <td className="px-2 py-3 text-[#5f6b7a]" colSpan={5}>
                            Loading users...
                          </td>
                        </tr>
                      ) : (
                        users.map((item) => {
                          const draft = userDrafts[item.id] ?? {
                            role: item.role,
                            department: item.department,
                            active: item.active,
                          };
                          return (
                            <tr key={item.id} className="border-b border-[#eef2f7] last:border-b-0">
                              <td className="px-2 py-2">
                                <div className="font-semibold">{item.name}</div>
                                <div className="text-xs text-[#5f6b7a]">{item.email}</div>
                              </td>
                              <td className="px-2 py-2">
                                <select
                                  value={draft.role}
                                  disabled={!hasPermission("users:write")}
                                  onChange={(event) =>
                                    setUserDrafts((current) => ({
                                      ...current,
                                      [item.id]: { ...draft, role: event.target.value as ErpRole },
                                    }))
                                  }
                                  className="h-9 rounded-md border border-[#cfd6df] bg-white px-2 text-xs"
                                >
                                  {erpRoles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                      {role.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                <select
                                  value={draft.department}
                                  disabled={!hasPermission("users:write")}
                                  onChange={(event) =>
                                    setUserDrafts((current) => ({
                                      ...current,
                                      [item.id]: { ...draft, department: event.target.value as ErpDepartment },
                                    }))
                                  }
                                  className="h-9 rounded-md border border-[#cfd6df] bg-white px-2 text-xs"
                                >
                                  {erpDepartments.map((department) => (
                                    <option key={department.id} value={department.id}>
                                      {department.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                <label className="flex items-center gap-2 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={draft.active}
                                    disabled={!hasPermission("users:write")}
                                    onChange={(event) =>
                                      setUserDrafts((current) => ({
                                        ...current,
                                        [item.id]: { ...draft, active: event.target.checked },
                                      }))
                                    }
                                  />
                                  {draft.active ? "Active" : "Disabled"}
                                </label>
                              </td>
                              <td className="px-2 py-2 text-right">
                                {hasPermission("users:write") && (
                                  <button
                                    onClick={() => void saveUser(item.id)}
                                    disabled={savingUserId === item.id}
                                    className="rounded-md bg-[#111827] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                                  >
                                    {savingUserId === item.id ? "Saving" : "Save"}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                  Tai khoan nay khong co quyen xem danh sach user.
                </div>
              )}
            </div>

            <div className="space-y-5">
              {hasPermission("users:write") && (
                <form onSubmit={createUser} className="rounded-lg border border-[#d9dde5] bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <UserPlus size={17} />
                    <span>Create Internal User</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <input
                      value={newUser.email}
                      onChange={(event) => setNewUser((current) => ({ ...current, email: event.target.value }))}
                      placeholder="email@company.vn"
                      className="h-9 w-full rounded-md border border-[#cfd6df] px-3 text-sm"
                      type="email"
                      required
                    />
                    <input
                      value={newUser.name}
                      onChange={(event) => setNewUser((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Full name"
                      className="h-9 w-full rounded-md border border-[#cfd6df] px-3 text-sm"
                      required
                    />
                    <input
                      value={newUser.title}
                      onChange={(event) => setNewUser((current) => ({ ...current, title: event.target.value }))}
                      placeholder="Title"
                      className="h-9 w-full rounded-md border border-[#cfd6df] px-3 text-sm"
                    />
                    <input
                      value={newUser.password}
                      onChange={(event) => setNewUser((current) => ({ ...current, password: event.target.value }))}
                      placeholder="Temporary password, min 12 chars"
                      className="h-9 w-full rounded-md border border-[#cfd6df] px-3 text-sm"
                      type="password"
                      required
                    />
                    <select
                      value={newUser.role}
                      onChange={(event) => setNewUser((current) => ({ ...current, role: event.target.value as ErpRole }))}
                      className="h-9 w-full rounded-md border border-[#cfd6df] bg-white px-3 text-sm"
                    >
                      {erpRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newUser.department}
                      onChange={(event) =>
                        setNewUser((current) => ({ ...current, department: event.target.value as ErpDepartment }))
                      }
                      className="h-9 w-full rounded-md border border-[#cfd6df] bg-white px-3 text-sm"
                    >
                      {erpDepartments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {createUserMessage && <div className="mt-2 text-xs text-[#5f6b7a]">{createUserMessage}</div>}
                  <button
                    type="submit"
                    disabled={createUserLoading}
                    className="mt-3 h-9 w-full rounded-md bg-[#111827] text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {createUserLoading ? "Creating..." : "Create user"}
                  </button>
                </form>
              )}

              <div className="rounded-lg border border-[#d9dde5] bg-white p-4">
                <div className="text-sm font-semibold">Departments</div>
                <div className="mt-3 space-y-3">
                  {erpDepartments.map((department) => (
                    <div key={department.id} className="border-t border-[#eef2f7] pt-3 first:border-t-0 first:pt-0">
                      <div className="text-sm font-semibold">{department.label}</div>
                      <div className="text-xs text-[#5f6b7a]">{department.purpose}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-lg border border-[#d9dde5] bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Bot size={17} />
                <span>Role Permission Matrix</span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {erpRoles.map((role) => (
                  <div key={role.id} className="rounded-md border border-[#e2e6ec] bg-[#fbfcfd] p-3">
                    <div className="text-sm font-semibold">{role.label}</div>
                    <div className="mt-1 text-xs leading-5 text-[#5f6b7a]">{role.purpose}</div>
                    <div className="mt-2 text-xs font-semibold text-[#2563eb]">
                      {role.permissions.includes("*") ? "All permissions" : `${role.permissions.length} permissions`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="system-control" className="rounded-lg border border-[#d9dde5] bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Database size={17} />
                <span>Runtime Control Surface</span>
              </div>
              <div className="mt-4 space-y-3">
                {serviceRows.map(([name, kind, target, note]) => (
                  <div key={name} className="border-t border-[#e2e6ec] pt-3 first:border-t-0 first:pt-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold">{name}</div>
                      <div className="rounded-md bg-[#eef2f7] px-2 py-1 text-xs font-medium text-[#475569]">
                        {kind}
                      </div>
                    </div>
                    <div className="mt-1 font-mono text-xs text-[#2563eb]">{target}</div>
                    <div className="mt-1 text-xs leading-5 text-[#5f6b7a]">{note}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {hasPermission("audit:read") && (
            <section id="audit-control" className="rounded-lg border border-[#d9dde5] bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Activity size={17} />
                <span>Audit Log</span>
              </div>
              <div className="mt-3 grid gap-2">
                {auditEvents.length === 0 ? (
                  <div className="text-sm text-[#5f6b7a]">No audit events yet.</div>
                ) : (
                  auditEvents.map((event) => (
                    <div key={event.id ?? `${event.at}-${event.action}`} className="rounded-md border border-[#eef2f7] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold">
                          {event.module}:{event.action}
                        </div>
                        <div
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            event.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                          }`}
                        >
                          {event.status}
                        </div>
                      </div>
                      <div className="mt-1 text-xs leading-5 text-[#5f6b7a]">
                        {event.at} · {event.actorEmail ?? "system"} · {event.target ?? "-"}
                      </div>
                      {event.message && <div className="mt-1 text-xs text-red-700">{event.message}</div>}
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function roleLabel(role: ErpRole) {
  return erpRoles.find((item) => item.id === role)?.label ?? role;
}
