#!/usr/bin/env node
import { pbkdf2Sync, randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const roles = new Set([
  "OWNER",
  "GENERAL_MANAGER",
  "OPS_MANAGER",
  "SALES_MANAGER",
  "ACCOUNTANT",
  "HR_MANAGER",
  "PM_MANAGER",
  "DATA_ANALYST",
  "VIEWER",
]);

const departments = new Set(["EXECUTIVE", "OPERATIONS", "SALES", "FINANCE", "HR", "PMO", "DATA"]);

const args = parseArgs(process.argv.slice(2));
const storePath = resolve(args.store ?? process.env.ERP_AUTH_STORE_PATH ?? ".deploy/erp-users.json");
const email = requiredArg(args.email, "email").toLowerCase();
const password = requiredArg(args.password, "password");
const role = requiredArg(args.role, "role");
const department = requiredArg(args.department, "department");
const name = requiredArg(args.name, "name");
const title = args.title;

if (!roles.has(role)) throw new Error(`Invalid role: ${role}`);
if (!departments.has(department)) throw new Error(`Invalid department: ${department}`);
if (password.length < 12) throw new Error("Password must be at least 12 characters");

const store = readStore(storePath);
const now = new Date().toISOString();
const existing = store.users.find((user) => user.email === email);

if (existing) {
  existing.name = name;
  existing.title = title;
  existing.role = role;
  existing.department = department;
  existing.passwordHash = hashPassword(password);
  existing.active = args.active === "false" ? false : true;
  existing.updatedAt = now;
  console.log(`updated ${email} in ${storePath}`);
} else {
  store.users.push({
    id: `erp_${randomBytes(10).toString("hex")}`,
    email,
    name,
    title,
    role,
    department,
    extraPermissions: [],
    active: args.active === "false" ? false : true,
    passwordHash: hashPassword(password),
    createdAt: now,
    updatedAt: now,
  });
  console.log(`created ${email} in ${storePath}`);
}

writeStore(storePath, store);

function hashPassword(value) {
  const salt = randomBytes(16);
  const iterations = 210000;
  const hash = pbkdf2Sync(value, salt, iterations, 32, "sha256");
  return ["pbkdf2_sha256", String(iterations), salt.toString("base64url"), hash.toString("base64url")].join("$");
}

function readStore(filePath) {
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8"));
    return { users: Array.isArray(parsed.users) ? parsed.users : [] };
  } catch (error) {
    if (error.code === "ENOENT") return { users: [] };
    throw error;
  }
}

function writeStore(filePath, store) {
  mkdirSync(dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  writeFileSync(tempPath, `${JSON.stringify(store, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  renameSync(tempPath, filePath);
}

function parseArgs(input) {
  const parsed = {};
  for (let index = 0; index < input.length; index += 1) {
    const token = input[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = input[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = "true";
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function requiredArg(value, name) {
  if (!value) throw new Error(`Missing --${name}`);
  return value;
}
