import { NextRequest, NextResponse } from "next/server";
import { publicAccessPolicy } from "@/lib/erp-access-policy";
import { requireErpPermission, toApiErrorResponse } from "@/lib/erp-auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireErpPermission(request, "users:read");
    if (user instanceof NextResponse) return user;

    return NextResponse.json({ ok: true, policy: publicAccessPolicy() });
  } catch (error) {
    return toApiErrorResponse(error, "/api/erp/access-control");
  }
}
