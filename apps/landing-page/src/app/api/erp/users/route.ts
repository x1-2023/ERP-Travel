import { NextRequest, NextResponse } from "next/server";
import {
  appendErpAuditEvent,
  createErpUser,
  listErpUsers,
  requireErpPermission,
  toApiErrorResponse,
  validateCreateUserBody,
} from "@/lib/erp-auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const actor = await requireErpPermission(request, "users:read");
    if (actor instanceof NextResponse) return actor;

    return NextResponse.json({ ok: true, users: await listErpUsers() });
  } catch (error) {
    return toApiErrorResponse(error, "/api/erp/users");
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireErpPermission(request, "users:write");
    if (actor instanceof NextResponse) return actor;

    const input = validateCreateUserBody(await request.json());
    const user = await createErpUser(input);

    await appendErpAuditEvent({
      actorId: actor.id,
      actorEmail: actor.email,
      module: "users",
      action: "create",
      target: user.email,
      status: "success",
      metadata: { role: user.role, department: user.department },
    }).catch(() => undefined);

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error, "/api/erp/users");
  }
}
