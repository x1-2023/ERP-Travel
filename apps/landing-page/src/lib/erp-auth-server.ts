import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import {
  type ErpDepartment,
  type ErpPermission,
  type ErpRole,
  type PublicErpUser,
  hasErpPermission,
  isErpDepartment,
  isErpRole,
  resolveRolePermissions,
} from "./erp-access-policy";

export const ERP_SESSION_COOKIE = "vierp_erp_session";

const PASSWORD_ALGORITHM = "pbkdf2_sha256";
const PASSWORD_ITERATIONS = 210000;
const PASSWORD_KEY_LENGTH = 32;
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export interface StoredErpUser {
  id: string;
  email: string;
  name: string;
  title?: string;
  department: ErpDepartment;
  role: ErpRole;
  extraPermissions?: ErpPermission[];
  active: boolean;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface ErpAuditEvent {
  id?: string;
  at?: string;
  actorId?: string;
  actorEmail?: string;
  module: string;
  action: string;
  target?: string;
  status: "success" | "failure";
  ip?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

type SessionPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

type UserStore = {
  users: StoredErpUser[];
};

export async function listErpUsers(): Promise<PublicErpUser[]> {
  const store = await readUserStore();
  return store.users.map(toPublicUser);
}

export async function verifyErpCredentials(email: string, password: string): Promise<PublicErpUser | null> {
  const normalizedEmail = normalizeEmail(email);
  const store = await readUserStore();
  const storedUser = store.users.find((user) => user.email === normalizedEmail);

  if (!storedUser?.active || !verifyPassword(password, storedUser.passwordHash)) {
    return null;
  }

  storedUser.lastLoginAt = new Date().toISOString();
  storedUser.updatedAt = storedUser.lastLoginAt;
  await writeUserStore(store);

  return toPublicUser(storedUser);
}

export async function createErpUser(input: {
  email: string;
  name: string;
  password: string;
  role: ErpRole;
  department: ErpDepartment;
  title?: string;
  active?: boolean;
  extraPermissions?: ErpPermission[];
}): Promise<PublicErpUser> {
  validatePassword(input.password);
  const store = await readUserStore();
  const email = normalizeEmail(input.email);

  if (store.users.some((user) => user.email === email)) {
    throw apiError(409, "USER_EXISTS", "A user with this email already exists");
  }

  const now = new Date().toISOString();
  const user: StoredErpUser = {
    id: `erp_${randomBytes(10).toString("hex")}`,
    email,
    name: requireNonEmpty(input.name, "name"),
    title: normalizeOptionalString(input.title),
    role: input.role,
    department: input.department,
    extraPermissions: input.extraPermissions ?? [],
    active: input.active ?? true,
    passwordHash: hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
  };

  store.users.push(user);
  await writeUserStore(store);
  return toPublicUser(user);
}

export async function updateErpUser(
  id: string,
  input: Partial<{
    email: string;
    name: string;
    password: string;
    role: ErpRole;
    department: ErpDepartment;
    title: string;
    active: boolean;
    extraPermissions: ErpPermission[];
  }>,
): Promise<PublicErpUser> {
  const store = await readUserStore();
  const user = store.users.find((item) => item.id === id);
  if (!user) throw apiError(404, "USER_NOT_FOUND", "User not found");

  if (input.email !== undefined) {
    const email = normalizeEmail(input.email);
    if (store.users.some((item) => item.id !== id && item.email === email)) {
      throw apiError(409, "USER_EXISTS", "A user with this email already exists");
    }
    user.email = email;
  }

  if (input.name !== undefined) user.name = requireNonEmpty(input.name, "name");
  if (input.title !== undefined) user.title = normalizeOptionalString(input.title);
  if (input.role !== undefined) user.role = input.role;
  if (input.department !== undefined) user.department = input.department;
  if (input.active !== undefined) user.active = Boolean(input.active);
  if (input.extraPermissions !== undefined) user.extraPermissions = input.extraPermissions;
  if (input.password !== undefined && input.password.length > 0) {
    validatePassword(input.password);
    user.passwordHash = hashPassword(input.password);
  }

  user.updatedAt = new Date().toISOString();
  await writeUserStore(store);
  return toPublicUser(user);
}

export function createErpSessionToken(user: Pick<PublicErpUser, "id" | "email">): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signSessionPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function setErpSessionCookie(response: NextResponse, user: PublicErpUser) {
  response.cookies.set(ERP_SESSION_COOKIE, createErpSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookieEnabled(),
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearErpSessionCookie(response: NextResponse) {
  response.cookies.set(ERP_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookieEnabled(),
    path: "/",
    maxAge: 0,
  });
}

export async function getErpUserFromRequest(request: NextRequest): Promise<PublicErpUser | null> {
  const token = request.cookies.get(ERP_SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  const store = await readUserStore();
  const user = store.users.find((item) => item.id === payload.sub && item.email === payload.email);
  if (!user?.active) return null;

  return toPublicUser(user);
}

export async function requireErpPermission(
  request: NextRequest,
  permission: ErpPermission,
): Promise<PublicErpUser | NextResponse> {
  const user = await getErpUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, code: "UNAUTHENTICATED", error: "Login required" }, { status: 401 });
  }

  if (!hasErpPermission(user, permission)) {
    return NextResponse.json(
      { ok: false, code: "FORBIDDEN", error: `Missing permission ${permission}` },
      { status: 403 },
    );
  }

  return user;
}

export async function appendErpAuditEvent(event: ErpAuditEvent) {
  const normalizedEvent: Required<Pick<ErpAuditEvent, "id" | "at">> & ErpAuditEvent = {
    id: event.id ?? `audit_${randomBytes(10).toString("hex")}`,
    at: event.at ?? new Date().toISOString(),
    ...event,
  };
  const logPath = getAuditLogPath();
  await fs.mkdir(path.dirname(logPath), { recursive: true });
  await fs.appendFile(logPath, `${JSON.stringify(normalizedEvent)}\n`, "utf8");
}

export async function readErpAuditEvents(limit = 50): Promise<ErpAuditEvent[]> {
  const logPath = getAuditLogPath();
  try {
    const content = await fs.readFile(logPath, "utf8");
    return content
      .split(/\r?\n/)
      .filter(Boolean)
      .slice(-limit)
      .map((line) => JSON.parse(line) as ErpAuditEvent)
      .reverse();
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return [];
    throw error;
  }
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, "sha256");
  return [
    PASSWORD_ALGORITHM,
    String(PASSWORD_ITERATIONS),
    salt.toString("base64url"),
    hash.toString("base64url"),
  ].join("$");
}

export function apiError(status: number, code: string, message: string) {
  const error = new Error(message) as Error & { status: number; code: string };
  error.status = status;
  error.code = code;
  return error;
}

export function toApiErrorResponse(error: unknown, fallbackPath?: string) {
  if (isApiError(error)) {
    return NextResponse.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
  }

  return NextResponse.json(
    {
      ok: false,
      code: "INTERNAL_ERROR",
      error: error instanceof Error ? error.message : String(error),
      path: fallbackPath,
    },
    { status: 500 },
  );
}

export function validateCreateUserBody(body: unknown) {
  if (!isRecord(body)) throw apiError(400, "BAD_REQUEST", "Request body must be a JSON object");
  const role = body.role;
  const department = body.department;
  if (!isErpRole(role)) throw apiError(400, "BAD_ROLE", "Invalid role");
  if (!isErpDepartment(department)) throw apiError(400, "BAD_DEPARTMENT", "Invalid department");

  return {
    email: requireNonEmpty(body.email, "email"),
    name: requireNonEmpty(body.name, "name"),
    password: requireNonEmpty(body.password, "password"),
    title: typeof body.title === "string" ? body.title : undefined,
    role,
    department,
    active: typeof body.active === "boolean" ? body.active : undefined,
  };
}

export function validateUpdateUserBody(body: unknown) {
  if (!isRecord(body)) throw apiError(400, "BAD_REQUEST", "Request body must be a JSON object");
  const update: Partial<{
    email: string;
    name: string;
    password: string;
    title: string;
    role: ErpRole;
    department: ErpDepartment;
    active: boolean;
  }> = {};

  if (body.email !== undefined) update.email = requireNonEmpty(body.email, "email");
  if (body.name !== undefined) update.name = requireNonEmpty(body.name, "name");
  if (body.password !== undefined) update.password = requireNonEmpty(body.password, "password");
  if (body.title !== undefined && typeof body.title === "string") update.title = body.title;
  if (body.active !== undefined) update.active = Boolean(body.active);
  if (body.role !== undefined) {
    if (!isErpRole(body.role)) throw apiError(400, "BAD_ROLE", "Invalid role");
    update.role = body.role;
  }
  if (body.department !== undefined) {
    if (!isErpDepartment(body.department)) throw apiError(400, "BAD_DEPARTMENT", "Invalid department");
    update.department = body.department;
  }

  return update;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [algorithm, iterationsText, saltText, hashText] = storedHash.split("$");
  if (algorithm !== PASSWORD_ALGORITHM || !iterationsText || !saltText || !hashText) return false;

  const iterations = Number(iterationsText);
  if (!Number.isInteger(iterations) || iterations < 100000) return false;

  const salt = Buffer.from(saltText, "base64url");
  const expectedHash = Buffer.from(hashText, "base64url");
  const actualHash = pbkdf2Sync(password, salt, iterations, expectedHash.length, "sha256");

  return actualHash.length === expectedHash.length && timingSafeEqual(actualHash, expectedHash);
}

async function readUserStore(): Promise<UserStore> {
  const storePath = getUserStorePath();
  try {
    const content = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(content) as UserStore;
    return { users: Array.isArray(parsed.users) ? parsed.users.map(normalizeStoredUser) : [] };
  } catch (error) {
    if (!isNodeError(error) || error.code !== "ENOENT") throw error;
  }

  const usersFromEnv = readUsersFromEnv();
  if (usersFromEnv.length > 0) {
    return { users: usersFromEnv.map(normalizeStoredUser) };
  }

  return { users: [] };
}

async function writeUserStore(store: UserStore) {
  const storePath = getUserStorePath();
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  const tempPath = `${storePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify({ users: store.users }, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  await fs.rename(tempPath, storePath);
}

function readUsersFromEnv(): StoredErpUser[] {
  const rawUsers = process.env.ERP_USERS_JSON;
  if (!rawUsers) return [];
  const parsed = JSON.parse(rawUsers) as unknown;
  if (!Array.isArray(parsed)) {
    throw apiError(500, "AUTH_CONFIG_INVALID", "ERP_USERS_JSON must be an array");
  }
  return parsed as StoredErpUser[];
}

function normalizeStoredUser(user: StoredErpUser): StoredErpUser {
  if (!isErpRole(user.role)) throw apiError(500, "AUTH_CONFIG_INVALID", `Invalid role for ${user.email}`);
  if (!isErpDepartment(user.department)) {
    throw apiError(500, "AUTH_CONFIG_INVALID", `Invalid department for ${user.email}`);
  }
  return {
    ...user,
    email: normalizeEmail(user.email),
    name: user.name || user.email,
    active: user.active !== false,
    extraPermissions: user.extraPermissions ?? [],
  };
}

function toPublicUser(user: StoredErpUser): PublicErpUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    title: user.title,
    department: user.department,
    role: user.role,
    permissions: resolveRolePermissions(user.role, user.extraPermissions ?? []),
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };
}

function verifySessionToken(token: string): SessionPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signSessionPayload(encodedPayload);
  if (!safeStringEqual(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (!payload.sub || !payload.email || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function signSessionPayload(encodedPayload: string): string {
  return createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");
}

function getSessionSecret(): string {
  const secret = process.env.ERP_SESSION_SECRET ?? process.env.VIETERP_TRAVELOPS_CONTROL_TOKEN;
  if (!secret || secret.length < 24) {
    throw apiError(500, "AUTH_CONFIG_MISSING", "ERP_SESSION_SECRET must be configured");
  }
  return secret;
}

function getUserStorePath(): string {
  return process.env.ERP_AUTH_STORE_PATH ?? path.join(process.cwd(), ".data", "erp-users.json");
}

function getAuditLogPath(): string {
  return process.env.ERP_AUDIT_LOG_PATH ?? path.join(process.cwd(), ".data", "erp-audit.jsonl");
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function safeStringEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function isSecureCookieEnabled(): boolean {
  if (process.env.ERP_COOKIE_SECURE === "false") return false;
  if (process.env.ERP_COOKIE_SECURE === "true") return true;
  return process.env.NODE_ENV === "production";
}

function normalizeEmail(value: string): string {
  const email = requireNonEmpty(value, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw apiError(400, "BAD_EMAIL", "Email is invalid");
  }
  return email;
}

function requireNonEmpty(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw apiError(400, "BAD_REQUEST", `${field} is required`);
  }
  return value.trim();
}

function normalizeOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function validatePassword(password: string) {
  if (password.length < 12) {
    throw apiError(400, "WEAK_PASSWORD", "Password must be at least 12 characters");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isApiError(error: unknown): error is Error & { status: number; code: string } {
  return error instanceof Error && "status" in error && "code" in error;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
