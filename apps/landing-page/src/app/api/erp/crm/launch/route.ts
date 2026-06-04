import { NextRequest, NextResponse } from "next/server";
import { createErpCrmBridgeToken, getCrmPublicBaseUrl } from "@/lib/erp-crm-bridge";
import { appendErpAuditEvent, requireErpPermission, toApiErrorResponse } from "@/lib/erp-auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const actor = await requireErpPermission(request, "crm:read");
    if (actor instanceof NextResponse) return actor;

    const nextPath = normalizeNextPath(request.nextUrl.searchParams.get("next"));
    const token = createErpCrmBridgeToken(actor);
    const target = new URL("/api/erp-bridge/login", getCrmPublicBaseUrl());
    target.searchParams.set("token", token);
    target.searchParams.set("next", nextPath);

    await appendErpAuditEvent({
      actorId: actor.id,
      actorEmail: actor.email,
      module: "crm",
      action: "launch",
      target: nextPath,
      status: "success",
    }).catch(() => undefined);

    return NextResponse.redirect(target);
  } catch (error) {
    return toApiErrorResponse(error, "/api/erp/crm/launch");
  }
}

function normalizeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/travelops";
  return value;
}
