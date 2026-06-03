import { NextRequest, NextResponse } from "next/server";
import {
  createAnVoyagesDirectClientFromEnv,
  handleTravelOpsDirectControlBody,
  type TravelOpsDirectControlEnv,
} from "@vierp/travelops/backoffice/direct-channel-control";
import { hasErpPermission } from "@/lib/erp-access-policy";
import { appendErpAuditEvent, getErpUserFromRequest } from "@/lib/erp-auth-server";

const routePath = "/api/travelops/anvoyages/direct-control";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let actorRef = "unknown";

  try {
    const authorization = await authorizeRequest(request);
    if (authorization instanceof NextResponse) return authorization;
    actorRef = authorization.actorRef;

    const body = await readJsonBody(request);
    const result = await handleTravelOpsDirectControlBody(
      { ...body, actorRef },
      { anvoyages: createAnVoyagesDirectClientFromEnv(getDirectControlEnv()) },
    );

    await appendErpAuditEvent({
      actorId: authorization.actorId,
      actorEmail: authorization.actorEmail,
      module: "travelops",
      action: String(body.action ?? "direct-control"),
      target: String(body.externalOptionId ?? body.externalPropertyId ?? body.channelCode ?? "anvoyages"),
      status: result.status < 400 ? "success" : "failure",
      metadata: {
        httpStatus: result.status,
        channelCode: body.channelCode,
        tenantId: body.tenantId,
      },
    }).catch(() => undefined);

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    await appendErpAuditEvent({
      actorEmail: actorRef,
      module: "travelops",
      action: "direct-control",
      status: "failure",
      message: error instanceof Error ? error.message : String(error),
    }).catch(() => undefined);

    return toErrorResponse(error);
  }
}

function getDirectControlEnv(): TravelOpsDirectControlEnv {
  return {
    ANVOYAGES_API_BASE_URL: process.env.ANVOYAGES_API_BASE_URL,
    ANVOYAGES_BASE_URL: process.env.ANVOYAGES_BASE_URL,
    ANVOYAGES_SERVICE_TOKEN: process.env.ANVOYAGES_SERVICE_TOKEN,
    ANVOYAGES_ADMIN_TOKEN: process.env.ANVOYAGES_ADMIN_TOKEN,
    ANVOYAGES_JWT: process.env.ANVOYAGES_JWT,
  };
}

async function authorizeRequest(request: NextRequest): Promise<
  | {
      actorRef: string;
      actorId?: string;
      actorEmail?: string;
    }
  | NextResponse
> {
  const user = await getErpUserFromRequest(request).catch(() => null);

  if (user) {
    if (!hasErpPermission(user, "travelops:write")) {
      return NextResponse.json(
        { ok: false, code: "FORBIDDEN", error: "Missing permission travelops:write" },
        { status: 403 },
      );
    }

    return {
      actorRef: `erp:${user.email}`,
      actorId: user.id,
      actorEmail: user.email,
    };
  }

  return authorizeServiceToken(request);
}

function authorizeServiceToken(request: NextRequest):
  | {
      actorRef: string;
      actorEmail?: string;
    }
  | NextResponse {
  const controlToken =
    process.env.VIETERP_TRAVELOPS_CONTROL_TOKEN ?? process.env.TRAVELOPS_DIRECT_CONTROL_TOKEN;
  const headerToken =
    request.headers.get("x-erp-control-token") ?? request.headers.get("x-travelops-control-token");

  if (!controlToken) {
    return NextResponse.json(
      {
        ok: false,
        code: "CONFIG_MISSING",
        error: "VIETERP_TRAVELOPS_CONTROL_TOKEN is not configured",
      },
      { status: 500 },
    );
  }

  if (headerToken !== controlToken) {
    return NextResponse.json(
      { ok: false, code: "UNAUTHENTICATED", error: "Login required or invalid service token" },
      { status: 401 },
    );
  }

  return {
    actorRef: "service:travelops-direct-control",
    actorEmail: "service:travelops-direct-control",
  };
}

async function readJsonBody(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw apiError(400, "BAD_REQUEST", "Request body must be a JSON object");
    }
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw apiError(400, "BAD_REQUEST", "Request body must be valid JSON");
    }
    throw error;
  }
}

function toErrorResponse(error: unknown) {
  if (isApiError(error)) {
    return NextResponse.json(
      { ok: false, code: error.code, error: error.message },
      { status: error.status },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      code: "INTERNAL_ERROR",
      error: error instanceof Error ? error.message : String(error),
      path: routePath,
    },
    { status: 500 },
  );
}

function apiError(status: number, code: string, message: string) {
  const error = new Error(message) as Error & { status: number; code: string };
  error.status = status;
  error.code = code;
  return error;
}

function isApiError(error: unknown): error is Error & { status: number; code: string } {
  return error instanceof Error && "status" in error && "code" in error;
}
