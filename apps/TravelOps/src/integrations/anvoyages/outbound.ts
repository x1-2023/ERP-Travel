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

function toDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);
  return date.toISOString().slice(0, 10);
}

function compactObject<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as Partial<T>;
}
