import { NextRequest, NextResponse } from "next/server";
import { readErpAuditEvents, requireErpPermission, toApiErrorResponse } from "@/lib/erp-auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const actor = await requireErpPermission(request, "audit:read");
    if (actor instanceof NextResponse) return actor;

    const limit = Number(request.nextUrl.searchParams.get("limit") ?? 50);
    const events = await readErpAuditEvents(Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50);
    return NextResponse.json({ ok: true, events });
  } catch (error) {
    return toApiErrorResponse(error, "/api/erp/audit");
  }
}
