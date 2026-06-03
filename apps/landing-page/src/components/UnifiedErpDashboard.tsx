"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Bot,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Database,
  FileSpreadsheet,
  KanbanSquare,
  Plane,
  Settings2,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { TravelDirectChannelControl } from "@vierp/dashboard/components";

type ModuleItem = {
  name: string;
  status: string;
  owner: string;
  href: string;
  icon: LucideIcon;
};

const modules: ModuleItem[] = [
  {
    name: "TravelOps",
    status: "Control enabled",
    owner: "Tour, room, supplier, booking ops",
    href: "#travelops-control",
    icon: Plane,
  },
  {
    name: "AnVoyages",
    status: "Direct channel",
    owner: "Booking website and inventory API",
    href: "#travelops-control",
    icon: Building2,
  },
  {
    name: "Accounting",
    status: "Service linked",
    owner: "Receivable, payable, profit",
    href: "/accounting",
    icon: Calculator,
  },
  {
    name: "HRM",
    status: "Service linked",
    owner: "Operator, guide, sales team",
    href: "/hrm",
    icon: Users,
  },
  {
    name: "ExcelAI",
    status: "Service linked",
    owner: "Import, reconcile, spreadsheet AI",
    href: "/excelai",
    icon: FileSpreadsheet,
  },
  {
    name: "PM",
    status: "Service linked",
    owner: "Tour execution and tasks",
    href: "/pm",
    icon: KanbanSquare,
  },
  {
    name: "CRM",
    status: "Back office API",
    owner: "Leads, customers, deals",
    href: "/crm",
    icon: BriefcaseBusiness,
  },
  {
    name: "System",
    status: "Runtime active",
    owner: "Postgres, Redis, tunnel, services",
    href: "#system-control",
    icon: Database,
  },
];

const operations = [
  ["Booking Control", "Price, seasonal rules, inventory and stop-sell"],
  ["Finance Flow", "Booking payment, supplier payable and profit snapshots"],
  ["People Flow", "Sales owner, operator, guide and driver references"],
  ["Execution Flow", "PM tasks, tour departures, incidents and documents"],
  ["Data Flow", "ExcelAI import/export and reconciliation"],
];

const serviceRows = [
  ["ERP Dashboard", "Next.js", "3012/root", "Runs this unified control shell"],
  ["TravelOps API", "Next API", "/api/travelops/anvoyages/direct-control", "Applies direct channel changes"],
  ["AnVoyages API", "NestJS", "3021", "Booking channel backend"],
  ["PostgreSQL", "Docker", "15432", "TravelOps and AnVoyages databases"],
  ["Redis", "Docker", "16379", "Cache and job-ready runtime"],
  ["Cloudflare Tunnel", "systemd", "trycloudflare", "External test access"],
];

const nextWork = [
  ["Accounting rules", "Map booking revenue, deposits, supplier settlement and tax policy."],
  ["HRM roster", "Assign guides/operators from HRM and sync availability into tour departures."],
  ["ExcelAI import", "Upload room allotment and supplier rate sheets into TravelOps tables."],
];

export default function UnifiedErpDashboard() {
  const [controlToken, setControlToken] = useState("");

  const requestHeaders = useMemo(() => {
    const trimmed = controlToken.trim();
    return trimmed ? { "x-erp-control-token": trimmed } : undefined;
  }, [controlToken]);

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
              Một màn hình điều khiển cho toàn bộ module: TravelOps, AnVoyages, Accounting, HRM, CRM,
              ExcelAI, PM và hạ tầng runtime.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              className="rounded-md border border-[#cfd6df] bg-white px-3 py-2 text-sm font-medium text-[#1f2937]"
              href="#system-control"
            >
              System
            </a>
            <a
              className="rounded-md bg-[#111827] px-3 py-2 text-sm font-semibold text-white"
              href="#travelops-control"
            >
              TravelOps Control
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden lg:block">
          <nav className="sticky top-5 rounded-lg border border-[#d9dde5] bg-white p-2">
            {modules.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#374151] hover:bg-[#f0f3f6]"
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-5">
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="rounded-lg border border-[#d9dde5] bg-white p-4 transition hover:border-[#aeb8c4]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#d9dde5] bg-[#f8fafc]">
                    <item.icon size={18} />
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {item.status}
                  </span>
                </div>
                <div className="mt-4 text-base font-semibold text-[#111827]">{item.name}</div>
                <div className="mt-1 text-sm leading-5 text-[#5f6b7a]">{item.owner}</div>
              </a>
            ))}
          </section>

          <section id="travelops-control" className="rounded-lg border border-[#d9dde5] bg-white p-4">
            <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                  <Plane size={17} />
                  <span>TravelOps and AnVoyages Control</span>
                </div>
                <p className="mt-1 text-sm text-[#5f6b7a]">
                  Điều chỉnh giá phòng, giá option, rule mùa cao điểm và tồn phòng trực tiếp từ
                  dashboard ERP.
                </p>
              </div>
              <label className="block xl:w-96">
                <span className="text-xs font-semibold text-[#5f6b7a]">ERP control token</span>
                <input
                  type="password"
                  value={controlToken}
                  onChange={(event) => setControlToken(event.target.value)}
                  placeholder="x-erp-control-token"
                  className="mt-1 h-10 w-full rounded-md border border-[#cfd6df] bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
            </div>
            <TravelDirectChannelControl
              tenantId="travel-company"
              channelCode="anvoyages"
              actorRef="erp-unified-dashboard"
              requestHeaders={requestHeaders}
              className="border-[#d9dde5] shadow-none"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-lg border border-[#d9dde5] bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                <Activity size={17} />
                <span>Operating Workflows</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {operations.map(([label, value]) => (
                  <div key={label} className="rounded-md border border-[#e2e6ec] bg-[#fbfcfd] p-3">
                    <div className="text-sm font-semibold text-[#111827]">{label}</div>
                    <div className="mt-1 text-sm leading-5 text-[#5f6b7a]">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div id="system-control" className="rounded-lg border border-[#d9dde5] bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                <Settings2 size={17} />
                <span>Runtime Control Surface</span>
              </div>
              <div className="mt-4 space-y-3">
                {serviceRows.map(([name, kind, target, note]) => (
                  <div key={name} className="border-t border-[#e2e6ec] pt-3 first:border-t-0 first:pt-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-[#111827]">{name}</div>
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

          <section className="rounded-lg border border-[#d9dde5] bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
              <Bot size={17} />
              <span>Next Control Work</span>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {nextWork.map(([title, text]) => (
                <div key={title} className="rounded-md border border-[#e2e6ec] bg-[#fbfcfd] p-3">
                  <div className="text-sm font-semibold">{title}</div>
                  <div className="mt-1 text-sm leading-5 text-[#5f6b7a]">{text}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
