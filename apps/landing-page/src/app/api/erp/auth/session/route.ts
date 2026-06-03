import { NextRequest, NextResponse } from "next/server";
import { publicAccessPolicy } from "@/lib/erp-access-policy";
import { getErpUserFromRequest, toApiErrorResponse } from "@/lib/erp-auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getErpUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ ok: false, code: "UNAUTHENTICATED", error: "Login required" }, { status: 401 });
    }

    return NextResponse.json({ ok: true, user, policy: publicAccessPolicy() });
  } catch (error) {
    return toApiErrorResponse(error, "/api/erp/auth/session");
  }
}
