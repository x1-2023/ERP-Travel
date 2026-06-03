import { NextRequest, NextResponse } from "next/server";
import {
  appendErpAuditEvent,
  requireErpPermission,
  toApiErrorResponse,
  updateErpUser,
  validateUpdateUserBody,
} from "@/lib/erp-auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    const actor = await requireErpPermission(request, "users:write");
    if (actor instanceof NextResponse) return actor;

    const input = validateUpdateUserBody(await request.json());
    const user = await updateErpUser(context.params.id, input);

    await appendErpAuditEvent({
      actorId: actor.id,
      actorEmail: actor.email,
      module: "users",
      action: "update",
      target: user.email,
      status: "success",
      metadata: { role: user.role, department: user.department, active: user.active },
    }).catch(() => undefined);

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return toApiErrorResponse(error, "/api/erp/users/[id]");
  }
}
