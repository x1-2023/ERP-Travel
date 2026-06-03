import {
  BaseRate,
  TravelPricingRule,
  buildAnVoyagesPricingRules,
  buildAnVoyagesPropertyPricingPatch
} from "../../backoffice/pricing";

export interface TravelOpsChannelTarget {
  channelCode: string;
  baseUrl?: string;
  externalPropertyId?: string;
  externalOptionId?: string;
}

export interface TravelOpsInventoryBlockForChannel {
  date: string | Date;
  totalUnits: number;
  closed?: boolean;
  status?: "OPEN" | "CLOSED" | "STOP_SELL" | "REQUEST_ONLY" | string;
  note?: string | null;
}

export interface AnVoyagesOutboundRequest {
  method: "PATCH" | "POST" | "DELETE";
  endpoint: string;
  body: Record<string, unknown>;
}

export interface AnVoyagesDirectClientConfig {
  baseUrl: string;
  bearerToken?: string;
  headers?: Record<string, string>;
  fetch?: AnVoyagesFetch;
}

export interface AnVoyagesDirectApplyResult {
  request: AnVoyagesOutboundRequest;
  status: number;
  response?: unknown;
}

export interface AnVoyagesFetchResponse {
  ok: boolean;
  status: number;
  statusText?: string;
  text: () => Promise<string>;
}

export interface AnVoyagesFetchInit {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

export type AnVoyagesFetch = (input: string, init: AnVoyagesFetchInit) => Promise<AnVoyagesFetchResponse>;

export class AnVoyagesDirectApplyError extends Error {
  readonly request: AnVoyagesOutboundRequest;
  readonly status?: number;
  readonly response?: unknown;

  constructor(message: string, request: AnVoyagesOutboundRequest, status?: number, response?: unknown) {
    super(message);
    this.name = "AnVoyagesDirectApplyError";
    this.request = request;
    this.status = status;
    this.response = response;
  }
}

export function buildAnVoyagesPropertyRateRequest(input: {
  externalPropertyId: string;
  baseRate: BaseRate;
  rules: readonly TravelPricingRule[];
}) {
  return {
    method: "PATCH",
    endpoint: `/api/properties/${input.externalPropertyId}`,
    body: buildAnVoyagesPropertyPricingPatch(input.baseRate, input.rules)
  } satisfies AnVoyagesOutboundRequest;
}

export function buildAnVoyagesOptionRateRequest(input: {
  externalOptionId: string;
  baseRate: BaseRate;
  costPrice?: number;
  inventoryQuantity?: number;
  rules: readonly TravelPricingRule[];
}) {
  return {
    method: "PATCH",
    endpoint: `/api/properties/options/${input.externalOptionId}/rate`,
    body: compactObject({
      basePrice: input.baseRate.basePrice,
      adultPrice: input.baseRate.adultPrice,
      childPrice: input.baseRate.childPrice,
      costPrice: input.costPrice,
      inventoryQuantity: input.inventoryQuantity,
      pricingRules: buildAnVoyagesPricingRules(input.rules, input.baseRate)
    })
  } satisfies AnVoyagesOutboundRequest;
}

export function buildAnVoyagesInventoryRequest(
  externalOptionId: string,
  block: TravelOpsInventoryBlockForChannel
) {
  return {
    method: "PATCH",
    endpoint: `/api/properties/options/${externalOptionId}/inventory`,
    body: {
      date: toDateKey(block.date),
      totalUnits: Math.max(Math.round(block.totalUnits), 0),
      closed: block.closed === true || block.status === "CLOSED" || block.status === "STOP_SELL",
      note: block.note ?? undefined
    }
  } satisfies AnVoyagesOutboundRequest;
}

export function buildAnVoyagesBulkInventoryRequests(
  externalOptionId: string,
  blocks: readonly TravelOpsInventoryBlockForChannel[]
) {
  return blocks.map((block) => buildAnVoyagesInventoryRequest(externalOptionId, block));
}

export async function applyAnVoyagesRequestDirectly(
  request: AnVoyagesOutboundRequest,
  client: AnVoyagesDirectClientConfig
): Promise<AnVoyagesDirectApplyResult> {
  const fetchFn = client.fetch ?? (globalThis as { fetch?: AnVoyagesFetch }).fetch;
  if (!fetchFn) {
    throw new AnVoyagesDirectApplyError("No fetch implementation is available for direct AnVoyages apply", request);
  }

  const response = await fetchFn(buildAnVoyagesUrl(client.baseUrl, request.endpoint), {
    method: request.method,
    headers: compactObject({
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: client.bearerToken ? `Bearer ${client.bearerToken}` : undefined,
      ...client.headers
    }) as Record<string, string>,
    body: JSON.stringify(request.body)
  });
  const responseBody = parseResponseBody(await response.text());

  if (!response.ok) {
    throw new AnVoyagesDirectApplyError(
      `AnVoyages direct apply failed with HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`,
      request,
      response.status,
      responseBody
    );
  }

  return {
    request,
    status: response.status,
    response: responseBody
  };
}

export function applyAnVoyagesPropertyRateDirectly(
  input: Parameters<typeof buildAnVoyagesPropertyRateRequest>[0],
  client: AnVoyagesDirectClientConfig
) {
  return applyAnVoyagesRequestDirectly(buildAnVoyagesPropertyRateRequest(input), client);
}

export function applyAnVoyagesOptionRateDirectly(
  input: Parameters<typeof buildAnVoyagesOptionRateRequest>[0],
  client: AnVoyagesDirectClientConfig
) {
  return applyAnVoyagesRequestDirectly(buildAnVoyagesOptionRateRequest(input), client);
}

export function applyAnVoyagesInventoryDirectly(
  externalOptionId: string,
  block: TravelOpsInventoryBlockForChannel,
  client: AnVoyagesDirectClientConfig
) {
  return applyAnVoyagesRequestDirectly(buildAnVoyagesInventoryRequest(externalOptionId, block), client);
}

export function applyAnVoyagesBulkInventoryDirectly(
  externalOptionId: string,
  blocks: readonly TravelOpsInventoryBlockForChannel[],
  client: AnVoyagesDirectClientConfig
) {
  return Promise.all(blocks.map((block) => applyAnVoyagesInventoryDirectly(externalOptionId, block, client)));
}

function buildAnVoyagesUrl(baseUrl: string, endpoint: string) {
  return `${baseUrl.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
}

function parseResponseBody(body: string) {
  if (!body) return undefined;
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return body;
  }
}

function toDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);
  return date.toISOString().slice(0, 10);
}

function compactObject<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as Partial<T>;
}
