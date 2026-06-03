import {
  AnVoyagesDirectApplyError,
  AnVoyagesDirectApplyResult,
  AnVoyagesDirectClientConfig,
  TravelOpsInventoryBlockForChannel,
  applyAnVoyagesInventoryDirectly,
  applyAnVoyagesOptionRateDirectly,
  applyAnVoyagesPropertyRateDirectly
} from "../integrations/anvoyages/outbound";
import { BaseRate, TravelPricingRule } from "./pricing";

export type TravelOpsDirectControlAction = "PROPERTY_RATE" | "OPTION_RATE" | "INVENTORY";

export interface TravelOpsDirectControlEnv {
  ANVOYAGES_API_BASE_URL?: string;
  ANVOYAGES_BASE_URL?: string;
  ANVOYAGES_SERVICE_TOKEN?: string;
  ANVOYAGES_ADMIN_TOKEN?: string;
  ANVOYAGES_JWT?: string;
}

export interface TravelOpsDirectControlTarget {
  tenantId: string;
  channelCode?: string;
  packageId?: string;
  priceTierId?: string;
  actorRef?: string;
}

export interface TravelOpsPropertyRateEdit extends TravelOpsDirectControlTarget {
  action?: "PROPERTY_RATE";
  externalPropertyId: string;
  baseRate: BaseRate;
  rules?: readonly TravelPricingRule[];
}

export interface TravelOpsOptionRateEdit extends TravelOpsDirectControlTarget {
  action?: "OPTION_RATE";
  externalOptionId: string;
  baseRate: BaseRate;
  costPrice?: number;
  inventoryQuantity?: number;
  rules?: readonly TravelPricingRule[];
}

export interface TravelOpsInventoryEdit extends TravelOpsDirectControlTarget {
  action?: "INVENTORY";
  externalOptionId: string;
  block: TravelOpsInventoryBlockForChannel;
}

export type TravelOpsDirectControlCommand =
  | (TravelOpsPropertyRateEdit & { action: "PROPERTY_RATE" })
  | (TravelOpsOptionRateEdit & { action: "OPTION_RATE" })
  | (TravelOpsInventoryEdit & { action: "INVENTORY" });

export interface TravelOpsDirectApplyRecord {
  action: TravelOpsDirectControlAction;
  tenantId: string;
  channelCode?: string;
  packageId?: string;
  priceTierId?: string;
  externalPropertyId?: string;
  externalOptionId?: string;
  actorRef?: string;
  request: AnVoyagesDirectApplyResult["request"];
  response?: unknown;
  httpStatus: number;
  appliedAt: string;
}

export interface TravelOpsDirectApplyFailure {
  action: TravelOpsDirectControlAction;
  tenantId?: string;
  channelCode?: string;
  packageId?: string;
  priceTierId?: string;
  externalPropertyId?: string;
  externalOptionId?: string;
  actorRef?: string;
  httpStatus?: number;
  errorMessage: string;
  response?: unknown;
  failedAt: string;
}

type TravelOpsDirectApplyFailureInput = Partial<TravelOpsDirectControlTarget> & {
  externalPropertyId?: string;
  externalOptionId?: string;
};

export interface TravelOpsDirectControlRepository {
  recordDirectApplySuccess?: (record: TravelOpsDirectApplyRecord) => Promise<unknown>;
  recordDirectApplyFailure?: (record: TravelOpsDirectApplyFailure) => Promise<unknown>;
}

export interface TravelOpsDirectControlDependencies {
  anvoyages: AnVoyagesDirectClientConfig;
  repository?: TravelOpsDirectControlRepository;
}

export interface TravelOpsDirectControlResult {
  action: TravelOpsDirectControlAction;
  applied: AnVoyagesDirectApplyResult;
  recorded?: unknown;
}

export interface TravelOpsDirectControlHttpResult {
  status: number;
  body: {
    ok: boolean;
    data?: unknown;
    error?: string;
    details?: unknown;
  };
}

export class TravelOpsDirectControlValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TravelOpsDirectControlValidationError";
  }
}

export function createAnVoyagesDirectClientFromEnv(
  env: TravelOpsDirectControlEnv,
  overrides: Partial<AnVoyagesDirectClientConfig> = {}
): AnVoyagesDirectClientConfig {
  const baseUrl = normalizeAnVoyagesBaseUrl(env.ANVOYAGES_API_BASE_URL ?? env.ANVOYAGES_BASE_URL ?? "");
  if (!baseUrl) {
    throw new Error("ANVOYAGES_API_BASE_URL or ANVOYAGES_BASE_URL is required for direct AnVoyages control");
  }

  return {
    baseUrl,
    bearerToken: env.ANVOYAGES_SERVICE_TOKEN ?? env.ANVOYAGES_ADMIN_TOKEN ?? env.ANVOYAGES_JWT,
    ...overrides
  };
}

export async function applyTravelOpsDirectControlCommand(
  command: TravelOpsDirectControlCommand,
  dependencies: TravelOpsDirectControlDependencies
): Promise<TravelOpsDirectControlResult> {
  switch (command.action) {
    case "PROPERTY_RATE":
      return applyTravelOpsPropertyRateEdit(command, dependencies);
    case "OPTION_RATE":
      return applyTravelOpsOptionRateEdit(command, dependencies);
    case "INVENTORY":
      return applyTravelOpsInventoryEdit(command, dependencies);
    default:
      return assertNever(command);
  }
}

export async function handleTravelOpsDirectControlBody(
  body: unknown,
  dependencies: TravelOpsDirectControlDependencies
): Promise<TravelOpsDirectControlHttpResult> {
  try {
    const command = parseTravelOpsDirectControlCommand(body);
    const result = await applyTravelOpsDirectControlCommand(command, dependencies);

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          action: result.action,
          httpStatus: result.applied.status,
          response: result.applied.response,
          request: result.applied.request
        }
      }
    };
  } catch (error) {
    return {
      status: getHttpStatusForError(error),
      body: {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        details: error instanceof AnVoyagesDirectApplyError ? error.response : undefined
      }
    };
  }
}

export function parseTravelOpsDirectControlCommand(body: unknown): TravelOpsDirectControlCommand {
  if (!isRecord(body)) {
    throw new TravelOpsDirectControlValidationError("Request body must be an object");
  }

  switch (body.action) {
    case "PROPERTY_RATE":
      return {
        action: "PROPERTY_RATE",
        tenantId: requireString(body.tenantId, "tenantId"),
        channelCode: optionalString(body.channelCode),
        packageId: optionalString(body.packageId),
        priceTierId: optionalString(body.priceTierId),
        actorRef: optionalString(body.actorRef),
        externalPropertyId: requireString(body.externalPropertyId, "externalPropertyId"),
        baseRate: parseBaseRate(body.baseRate),
        rules: parseRules(body.rules)
      };
    case "OPTION_RATE":
      return {
        action: "OPTION_RATE",
        tenantId: requireString(body.tenantId, "tenantId"),
        channelCode: optionalString(body.channelCode),
        packageId: optionalString(body.packageId),
        priceTierId: optionalString(body.priceTierId),
        actorRef: optionalString(body.actorRef),
        externalOptionId: requireString(body.externalOptionId, "externalOptionId"),
        baseRate: parseBaseRate(body.baseRate),
        costPrice: optionalNumber(body.costPrice, "costPrice"),
        inventoryQuantity: optionalInteger(body.inventoryQuantity, "inventoryQuantity"),
        rules: parseRules(body.rules)
      };
    case "INVENTORY":
      return {
        action: "INVENTORY",
        tenantId: requireString(body.tenantId, "tenantId"),
        channelCode: optionalString(body.channelCode),
        packageId: optionalString(body.packageId),
        priceTierId: optionalString(body.priceTierId),
        actorRef: optionalString(body.actorRef),
        externalOptionId: requireString(body.externalOptionId, "externalOptionId"),
        block: parseInventoryBlock(body.block)
      };
    default:
      throw new TravelOpsDirectControlValidationError("action must be PROPERTY_RATE, OPTION_RATE, or INVENTORY");
  }
}

export async function applyTravelOpsPropertyRateEdit(
  input: TravelOpsPropertyRateEdit,
  dependencies: TravelOpsDirectControlDependencies
): Promise<TravelOpsDirectControlResult> {
  assertBaseTarget(input);
  assertNonEmpty(input.externalPropertyId, "externalPropertyId");
  assertBaseRate(input.baseRate);

  try {
    const applied = await applyAnVoyagesPropertyRateDirectly(
      {
        externalPropertyId: input.externalPropertyId,
        baseRate: normalizeBaseRate(input.baseRate),
        rules: input.rules ?? []
      },
      dependencies.anvoyages
    );
    const recorded = await dependencies.repository?.recordDirectApplySuccess?.(
      buildSuccessRecord("PROPERTY_RATE", input, applied)
    );

    return { action: "PROPERTY_RATE", applied, recorded };
  } catch (error) {
    await dependencies.repository?.recordDirectApplyFailure?.(buildFailureRecord("PROPERTY_RATE", input, error));
    throw error;
  }
}

export async function applyTravelOpsOptionRateEdit(
  input: TravelOpsOptionRateEdit,
  dependencies: TravelOpsDirectControlDependencies
): Promise<TravelOpsDirectControlResult> {
  assertBaseTarget(input);
  assertNonEmpty(input.externalOptionId, "externalOptionId");
  assertBaseRate(input.baseRate);
  if (input.costPrice !== undefined) assertNonNegativeNumber(input.costPrice, "costPrice");
  if (input.inventoryQuantity !== undefined) assertNonNegativeInteger(input.inventoryQuantity, "inventoryQuantity");

  try {
    const applied = await applyAnVoyagesOptionRateDirectly(
      {
        externalOptionId: input.externalOptionId,
        baseRate: normalizeBaseRate(input.baseRate),
        costPrice: input.costPrice,
        inventoryQuantity: input.inventoryQuantity,
        rules: input.rules ?? []
      },
      dependencies.anvoyages
    );
    const recorded = await dependencies.repository?.recordDirectApplySuccess?.(
      buildSuccessRecord("OPTION_RATE", input, applied)
    );

    return { action: "OPTION_RATE", applied, recorded };
  } catch (error) {
    await dependencies.repository?.recordDirectApplyFailure?.(buildFailureRecord("OPTION_RATE", input, error));
    throw error;
  }
}

export async function applyTravelOpsInventoryEdit(
  input: TravelOpsInventoryEdit,
  dependencies: TravelOpsDirectControlDependencies
): Promise<TravelOpsDirectControlResult> {
  assertBaseTarget(input);
  assertNonEmpty(input.externalOptionId, "externalOptionId");
  assertDateLike(input.block.date, "block.date");
  assertNonNegativeInteger(input.block.totalUnits, "block.totalUnits");

  try {
    const applied = await applyAnVoyagesInventoryDirectly(input.externalOptionId, input.block, dependencies.anvoyages);
    const recorded = await dependencies.repository?.recordDirectApplySuccess?.(
      buildSuccessRecord("INVENTORY", input, applied)
    );

    return { action: "INVENTORY", applied, recorded };
  } catch (error) {
    await dependencies.repository?.recordDirectApplyFailure?.(buildFailureRecord("INVENTORY", input, error));
    throw error;
  }
}

function buildSuccessRecord(
  action: TravelOpsDirectControlAction,
  input: TravelOpsPropertyRateEdit | TravelOpsOptionRateEdit | TravelOpsInventoryEdit,
  applied: AnVoyagesDirectApplyResult
): TravelOpsDirectApplyRecord {
  return {
    action,
    tenantId: input.tenantId,
    channelCode: input.channelCode,
    packageId: input.packageId,
    priceTierId: input.priceTierId,
    externalPropertyId: "externalPropertyId" in input ? input.externalPropertyId : undefined,
    externalOptionId: "externalOptionId" in input ? input.externalOptionId : undefined,
    actorRef: input.actorRef,
    request: applied.request,
    response: applied.response,
    httpStatus: applied.status,
    appliedAt: new Date().toISOString()
  };
}

function buildFailureRecord(
  action: TravelOpsDirectControlAction,
  input: TravelOpsDirectApplyFailureInput,
  error: unknown
): TravelOpsDirectApplyFailure {
  const directError = error instanceof AnVoyagesDirectApplyError ? error : undefined;

  return {
    action,
    tenantId: input.tenantId,
    channelCode: input.channelCode,
    packageId: input.packageId,
    priceTierId: input.priceTierId,
    externalPropertyId: input.externalPropertyId,
    externalOptionId: input.externalOptionId,
    actorRef: input.actorRef,
    httpStatus: directError?.status,
    errorMessage: error instanceof Error ? error.message : String(error),
    response: directError?.response,
    failedAt: new Date().toISOString()
  };
}

function normalizeAnVoyagesBaseUrl(value: string) {
  return value.trim().replace(/\/api\/?$/, "").replace(/\/+$/, "");
}

function assertBaseTarget(input: TravelOpsDirectControlTarget) {
  assertNonEmpty(input.tenantId, "tenantId");
}

function assertBaseRate(baseRate: BaseRate) {
  assertNonNegativeNumber(baseRate.basePrice, "baseRate.basePrice");
  if (baseRate.adultPrice !== undefined) assertNonNegativeNumber(baseRate.adultPrice, "baseRate.adultPrice");
  if (baseRate.childPrice !== undefined) assertNonNegativeNumber(baseRate.childPrice, "baseRate.childPrice");
  if (baseRate.extraFee !== undefined) assertNonNegativeNumber(baseRate.extraFee, "baseRate.extraFee");
}

function normalizeBaseRate(baseRate: BaseRate): BaseRate {
  return {
    currency: baseRate.currency,
    basePrice: money(baseRate.basePrice),
    adultPrice: baseRate.adultPrice === undefined ? undefined : money(baseRate.adultPrice),
    childPrice: baseRate.childPrice === undefined ? undefined : money(baseRate.childPrice),
    extraFee: baseRate.extraFee === undefined ? undefined : money(baseRate.extraFee)
  };
}

function assertNonEmpty(value: string | undefined, field: string) {
  if (!value || !value.trim()) {
    throw new TravelOpsDirectControlValidationError(`${field} is required`);
  }
}

function assertNonNegativeNumber(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new TravelOpsDirectControlValidationError(`${field} must be a non-negative number`);
  }
}

function assertNonNegativeInteger(value: number, field: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new TravelOpsDirectControlValidationError(`${field} must be a non-negative integer`);
  }
}

function assertDateLike(value: string | Date, field: string) {
  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new TravelOpsDirectControlValidationError(`${field} must be a valid date`);
  }
}

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function assertNever(value: never): never {
  throw new Error(`Unsupported direct control action: ${String(value)}`);
}

function getHttpStatusForError(error: unknown) {
  if (error instanceof TravelOpsDirectControlValidationError) return 400;
  if (error instanceof AnVoyagesDirectApplyError) return 502;
  return 500;
}

function parseBaseRate(value: unknown): BaseRate {
  if (!isRecord(value)) {
    throw new TravelOpsDirectControlValidationError("baseRate must be an object");
  }

  return {
    currency: optionalString(value.currency),
    basePrice: requireNumber(value.basePrice, "baseRate.basePrice"),
    adultPrice: optionalNumber(value.adultPrice, "baseRate.adultPrice"),
    childPrice: optionalNumber(value.childPrice, "baseRate.childPrice"),
    extraFee: optionalNumber(value.extraFee, "baseRate.extraFee")
  };
}

function parseInventoryBlock(value: unknown): TravelOpsInventoryBlockForChannel {
  if (!isRecord(value)) {
    throw new TravelOpsDirectControlValidationError("block must be an object");
  }

  return {
    date: requireDateLike(value.date, "block.date"),
    totalUnits: requireInteger(value.totalUnits, "block.totalUnits"),
    closed: optionalBoolean(value.closed, "block.closed"),
    status: optionalString(value.status),
    note: optionalString(value.note) ?? null
  };
}

function parseRules(value: unknown): readonly TravelPricingRule[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new TravelOpsDirectControlValidationError("rules must be an array");
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new TravelOpsDirectControlValidationError(`rules.${index} must be an object`);
    }

    return {
      id: optionalString(item.id),
      name: requireString(item.name, `rules.${index}.name`),
      ruleType: optionalString(item.ruleType) as TravelPricingRule["ruleType"],
      adjustmentType: requireString(item.adjustmentType, `rules.${index}.adjustmentType`) as TravelPricingRule["adjustmentType"],
      priority: optionalInteger(item.priority, `rules.${index}.priority`),
      startDate: optionalDateLike(item.startDate, `rules.${index}.startDate`),
      endDate: optionalDateLike(item.endDate, `rules.${index}.endDate`),
      months: optionalNumberArray(item.months, `rules.${index}.months`),
      weekdays: optionalNumberArray(item.weekdays, `rules.${index}.weekdays`),
      holidayDates: optionalStringArray(item.holidayDates, `rules.${index}.holidayDates`),
      basePrice: optionalNumber(item.basePrice, `rules.${index}.basePrice`),
      adultPrice: optionalNumber(item.adultPrice, `rules.${index}.adultPrice`),
      childPrice: optionalNumber(item.childPrice, `rules.${index}.childPrice`),
      adjustmentAmount: optionalNumber(item.adjustmentAmount, `rules.${index}.adjustmentAmount`),
      adjustmentPercent: optionalNumber(item.adjustmentPercent, `rules.${index}.adjustmentPercent`),
      extraFee: optionalNumber(item.extraFee, `rules.${index}.extraFee`),
      minNights: optionalInteger(item.minNights, `rules.${index}.minNights`),
      requiredMealName: optionalString(item.requiredMealName),
      requiredMealPrice: optionalNumber(item.requiredMealPrice, `rules.${index}.requiredMealPrice`),
      requiredMealChargeType: optionalString(item.requiredMealChargeType),
      isActive: optionalBoolean(item.isActive, `rules.${index}.isActive`)
    };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string) {
  const parsed = optionalString(value);
  if (!parsed) throw new TravelOpsDirectControlValidationError(`${field} is required`);
  return parsed;
}

function optionalString(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value);
}

function requireNumber(value: unknown, field: string) {
  const parsed = optionalNumber(value, field);
  if (parsed === undefined) throw new TravelOpsDirectControlValidationError(`${field} is required`);
  return parsed;
}

function optionalNumber(value: unknown, field: string) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new TravelOpsDirectControlValidationError(`${field} must be a number`);
  return parsed;
}

function requireInteger(value: unknown, field: string) {
  const parsed = optionalInteger(value, field);
  if (parsed === undefined) throw new TravelOpsDirectControlValidationError(`${field} is required`);
  return parsed;
}

function optionalInteger(value: unknown, field: string) {
  const parsed = optionalNumber(value, field);
  if (parsed === undefined) return undefined;
  if (!Number.isInteger(parsed)) throw new TravelOpsDirectControlValidationError(`${field} must be an integer`);
  return parsed;
}

function optionalBoolean(value: unknown, field: string) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new TravelOpsDirectControlValidationError(`${field} must be a boolean`);
}

function requireDateLike(value: unknown, field: string) {
  const parsed = optionalDateLike(value, field);
  if (!parsed) throw new TravelOpsDirectControlValidationError(`${field} is required`);
  return parsed;
}

function optionalDateLike(value: unknown, field: string) {
  if (value === undefined || value === null || value === "") return undefined;
  if (value instanceof Date) {
    assertDateLike(value, field);
    return value;
  }

  const parsed = String(value);
  assertDateLike(parsed, field);
  return parsed;
}

function optionalNumberArray(value: unknown, field: string) {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw new TravelOpsDirectControlValidationError(`${field} must be an array`);
  return value.map((item, index) => requireInteger(item, `${field}.${index}`));
}

function optionalStringArray(value: unknown, field: string) {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw new TravelOpsDirectControlValidationError(`${field} must be an array`);
  return value.map((item, index) => requireString(item, `${field}.${index}`));
}
