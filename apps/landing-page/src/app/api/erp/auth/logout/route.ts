import { NextRequest, NextResponse } from "next/server";
import { appendErpAuditEvent, clearErpSessionCookie, getErpUserFromRequest } from "@/lib/erp-auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await getErpUserFromRequest(request).catch(() => null);
  const response = NextResponse.json({ ok: true });
  clearErpSessionCookie(response);

  if (user) {
    await appendErpAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      module: "auth",
      action: "logout",
      status: "success",
    }).catch(() => undefined);
  }

  return response;
}
