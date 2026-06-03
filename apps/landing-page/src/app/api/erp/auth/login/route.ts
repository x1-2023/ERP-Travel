import { NextRequest, NextResponse } from "next/server";
import { publicAccessPolicy } from "@/lib/erp-access-policy";
import {
  appendErpAuditEvent,
  setErpSessionCookie,
  toApiErrorResponse,
  verifyErpCredentials,
} from "@/lib/erp-auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email ?? "";
    const password = body.password ?? "";
    const user = await verifyErpCredentials(email, password);

    if (!user) {
      await appendErpAuditEvent({
        actorEmail: email.toLowerCase(),
        module: "auth",
        action: "login",
        status: "failure",
        ip: getClientIp(request),
        message: "Invalid credentials",
      }).catch(() => undefined);

      return NextResponse.json(
        { ok: false, code: "INVALID_CREDENTIALS", error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ ok: true, user, policy: publicAccessPolicy() });
    setErpSessionCookie(response, user);

    await appendErpAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      module: "auth",
      action: "login",
      status: "success",
      ip: getClientIp(request),
    }).catch(() => undefined);

    return response;
  } catch (error) {
    return toApiErrorResponse(error, "/api/erp/auth/login");
  }
}

function getClientIp(request: NextRequest): string | undefined {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
}
