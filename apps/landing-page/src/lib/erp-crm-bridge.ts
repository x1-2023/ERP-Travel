import { createHmac } from "crypto";
import type { PublicErpUser } from "./erp-access-policy";

const BRIDGE_TOKEN_TTL_SECONDS = 120;

export type ErpCrmBridgePayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
  department: string;
  permissions: string[];
  iat: number;
  exp: number;
};

export function createErpCrmBridgeToken(user: PublicErpUser): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: ErpCrmBridgePayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
    permissions: user.permissions,
    iat: now,
    exp: now + BRIDGE_TOKEN_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", getBridgeSecret()).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function getCrmPublicBaseUrl() {
  return (
    process.env.CRM_PUBLIC_URL ??
    process.env.NEXT_PUBLIC_CRM_URL ??
    process.env.CRM_BASE_URL ??
    "http://127.0.0.1:3018"
  ).replace(/\/$/, "");
}

function getBridgeSecret(): string {
  const secret = process.env.ERP_CRM_BRIDGE_SECRET ?? process.env.ERP_SESSION_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error("ERP_CRM_BRIDGE_SECRET must be configured");
  }
  return secret;
}
