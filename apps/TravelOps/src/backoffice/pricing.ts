export type RateRuleType =
  | "SEASONAL"
  | "DATE_RANGE"
  | "WEEKDAY"
  | "HOLIDAY"
  | "EVENT"
  | "OCCUPANCY"
  | "MANUAL";

export type RateAdjustmentType =
  | "FIXED_PRICE"
  | "AMOUNT_INCREASE"
  | "PERCENT_INCREASE"
  | "AMOUNT_DISCOUNT"
  | "PERCENT_DISCOUNT";

export interface BaseRate {
  currency?: string;
  basePrice: number;
  adultPrice?: number;
  childPrice?: number;
  extraFee?: number;
}

export interface TravelPricingRule {
  id?: string;
  name: string;
  ruleType?: RateRuleType;
  adjustmentType: RateAdjustmentType;
  priority?: number;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  months?: number[];
  weekdays?: number[];
  holidayDates?: string[];
  basePrice?: number | string | null;
  adultPrice?: number | string | null;
  childPrice?: number | string | null;
  adjustmentAmount?: number | string | null;
  adjustmentPercent?: number | string | null;
  extraFee?: number | string | null;
  minNights?: number | null;
  requiredMealName?: string | null;
  requiredMealPrice?: number | string | null;
  requiredMealChargeType?: "guest" | "adult" | "room" | string | null;
  isActive?: boolean;
}

export interface ResolvedRate extends BaseRate {
  appliedRule?: TravelPricingRule;
  minNights?: number;
  requiredMealName?: string;
  requiredMealPrice?: number;
  requiredMealChargeType?: string;
}

export interface AnVoyagesPricingRulePayload {
  name?: string;
  startDate?: string;
  endDate?: string;
  months?: number[];
  weekdays?: number[];
  holidayDates?: string[];
  price?: number;
  basePrice?: number;
  adultPrice?: number;
  childPrice?: number;
  extraFee?: number;
  minNights?: number;
  requiredMealName?: string;
  requiredMealPrice?: number;
  requiredMealChargeType?: string;
  priority?: number;
}

export function resolveRateForDate(
  baseRate: BaseRate,
  rules: readonly TravelPricingRule[],
  date: string | Date
): ResolvedRate {
  const targetDate = normalizeDate(date);
  const matchedRule = [...rules]
    .filter((rule) => rule.isActive !== false && matchesRateRule(targetDate, rule))
    .sort(compareRateRulePriority)[0];

  if (!matchedRule) {
    return { ...baseRate };
  }

  return applyRateRule(baseRate, matchedRule);
}

export function buildAnVoyagesPricingRules(
  rules: readonly TravelPricingRule[],
  baseRate?: BaseRate
): AnVoyagesPricingRulePayload[] {
  return [...rules]
    .filter((rule) => rule.isActive !== false)
    .sort(compareRateRulePriority)
    .map((rule) => {
      const fixed = baseRate ? applyRateRule(baseRate, rule) : undefined;

      return compactObject({
        name: rule.name,
        startDate: rule.startDate ? toDateKey(rule.startDate) : undefined,
        endDate: rule.endDate ? toDateKey(rule.endDate) : undefined,
        months: rule.months?.length ? rule.months : undefined,
        weekdays: rule.weekdays?.length ? rule.weekdays : undefined,
        holidayDates: rule.holidayDates?.length ? rule.holidayDates : undefined,
        price: fixed?.basePrice ?? numberOrUndefined(rule.basePrice),
        basePrice: fixed?.basePrice ?? numberOrUndefined(rule.basePrice),
        adultPrice: fixed?.adultPrice ?? numberOrUndefined(rule.adultPrice),
        childPrice: fixed?.childPrice ?? numberOrUndefined(rule.childPrice),
        extraFee: fixed?.extraFee ?? numberOrUndefined(rule.extraFee),
        minNights: rule.minNights ?? undefined,
        requiredMealName: rule.requiredMealName ?? undefined,
        requiredMealPrice: numberOrUndefined(rule.requiredMealPrice),
        requiredMealChargeType: rule.requiredMealChargeType ?? undefined,
        priority: rule.priority ?? 0
      });
    });
}

export function buildAnVoyagesPropertyPricingPatch(
  baseRate: BaseRate,
  rules: readonly TravelPricingRule[]
) {
  return compactObject({
    basePrice: money(baseRate.basePrice),
    adultPrice: baseRate.adultPrice === undefined ? undefined : money(baseRate.adultPrice),
    childPrice: baseRate.childPrice === undefined ? undefined : money(baseRate.childPrice),
    extraFee: baseRate.extraFee === undefined ? undefined : money(baseRate.extraFee),
    pricingRules: buildAnVoyagesPricingRules(rules, baseRate)
  });
}

export function applyRateRule(baseRate: BaseRate, rule: TravelPricingRule): ResolvedRate {
  const basePrice = applyAdjustment(baseRate.basePrice, rule, rule.basePrice);
  const adultPrice = applyAdjustment(baseRate.adultPrice ?? baseRate.basePrice, rule, rule.adultPrice);
  const childPrice = applyAdjustment(baseRate.childPrice ?? adultPrice, rule, rule.childPrice);
  const extraFee = numberOrUndefined(rule.extraFee) ?? baseRate.extraFee;

  return compactObject({
    currency: baseRate.currency,
    basePrice,
    adultPrice,
    childPrice,
    extraFee,
    appliedRule: rule,
    minNights: rule.minNights ?? undefined,
    requiredMealName: rule.requiredMealName ?? undefined,
    requiredMealPrice: numberOrUndefined(rule.requiredMealPrice),
    requiredMealChargeType: rule.requiredMealChargeType ?? undefined
  }) as ResolvedRate;
}

export function matchesRateRule(date: Date, rule: TravelPricingRule) {
  const dateKey = toDateKey(date);
  const month = date.getUTCMonth() + 1;
  const weekday = date.getUTCDay();
  const holidayDates = rule.holidayDates ?? [];
  const months = rule.months ?? [];
  const weekdays = rule.weekdays ?? [];

  if (holidayDates.length > 0 && holidayDates.includes(dateKey)) {
    return true;
  }

  if (holidayDates.length > 0 && months.length === 0 && weekdays.length === 0 && !rule.startDate && !rule.endDate) {
    return false;
  }

  if (months.length > 0 && !months.includes(month)) {
    return false;
  }

  if (weekdays.length > 0 && !weekdays.includes(weekday)) {
    return false;
  }

  if (rule.startDate && date < normalizeDate(rule.startDate)) {
    return false;
  }

  if (rule.endDate && date > normalizeDate(rule.endDate)) {
    return false;
  }

  return Boolean(
    months.length > 0 ||
      weekdays.length > 0 ||
      holidayDates.length > 0 ||
      rule.startDate ||
      rule.endDate ||
      rule.ruleType === "MANUAL" ||
      rule.ruleType === "OCCUPANCY"
  );
}

function applyAdjustment(currentValue: number, rule: TravelPricingRule, fixedOverride?: number | string | null) {
  const fixedValue = numberOrUndefined(fixedOverride);
  if (fixedValue !== undefined) {
    return money(fixedValue);
  }

  const amount = numberOrUndefined(rule.adjustmentAmount) ?? 0;
  const percent = numberOrUndefined(rule.adjustmentPercent) ?? 0;

  switch (rule.adjustmentType) {
    case "AMOUNT_INCREASE":
      return money(currentValue + amount);
    case "PERCENT_INCREASE":
      return money(currentValue * (1 + percent / 100));
    case "AMOUNT_DISCOUNT":
      return money(Math.max(currentValue - amount, 0));
    case "PERCENT_DISCOUNT":
      return money(Math.max(currentValue * (1 - percent / 100), 0));
    case "FIXED_PRICE":
    default:
      return money(currentValue);
  }
}

function compareRateRulePriority(a: TravelPricingRule, b: TravelPricingRule) {
  const priorityDiff = Number(b.priority ?? 0) - Number(a.priority ?? 0);
  if (priorityDiff !== 0) return priorityDiff;
  return getRateRuleSpecificity(b) - getRateRuleSpecificity(a);
}

function getRateRuleSpecificity(rule: TravelPricingRule) {
  return [
    rule.holidayDates?.length ? 8 : 0,
    rule.startDate || rule.endDate ? 4 : 0,
    rule.weekdays?.length ? 2 : 0,
    rule.months?.length ? 1 : 0
  ].reduce((sum, value) => sum + value, 0);
}

function normalizeDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function toDateKey(value: string | Date) {
  return normalizeDate(value).toISOString().slice(0, 10);
}

function numberOrUndefined(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function compactObject<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as Partial<T>;
}
