import {
  AnVoyagesBooking,
  AnVoyagesLocation,
  AnVoyagesPayment,
  AnVoyagesProductOption,
  AnVoyagesProperty,
  AnVoyagesSnapshot,
  AnVoyagesSupplier
} from "./types";

export const ANVOYAGES_SOURCE_SYSTEM = "anvoyages";

export interface TravelOpsImportPlan {
  tourPackages: Record<string, unknown>[];
  priceTiers: Record<string, unknown>[];
  departures: Record<string, unknown>[];
  bookings: Record<string, unknown>[];
  suppliers: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  entityMaps: Record<string, unknown>[];
}

export function buildAnVoyagesImportPlan(snapshot: AnVoyagesSnapshot, tenantId: string): TravelOpsImportPlan {
  const locationsById = new Map((snapshot.locations ?? []).map((location) => [location.id, location]));
  const propertiesById = new Map((snapshot.properties ?? []).map((property) => [property.id, property]));
  const optionsById = new Map((snapshot.productOptions ?? []).map((option) => [option.id, option]));

  const tourPackages = (snapshot.properties ?? []).map((property) => {
    return mapPropertyToTourPackage(property, tenantId, locationsById.get(property.locationId));
  });

  const priceTiers = (snapshot.productOptions ?? []).map((option) => {
    return mapProductOptionToPriceTier(option, tenantId);
  });

  const suppliers = (snapshot.suppliers ?? []).map((supplier) => {
    return mapSupplierToTravelOpsSupplier(supplier, tenantId);
  });

  const bookingPlans = (snapshot.bookings ?? []).map((booking) => {
    return mapBookingToTravelOpsBooking(
      booking,
      tenantId,
      booking.propertyId ? propertiesById.get(booking.propertyId) : undefined,
      booking.productOptionId ? optionsById.get(booking.productOptionId) : undefined
    );
  });

  const payments = (snapshot.payments ?? []).map((payment) => {
    return mapPaymentToBookingPayment(payment, tenantId);
  });

  return {
    tourPackages,
    priceTiers,
    suppliers,
    departures: bookingPlans.map((plan) => plan.departure),
    bookings: bookingPlans.map((plan) => plan.booking),
    payments,
    entityMaps: [
      ...tourPackages.map((payload) => buildEntityMap(tenantId, "TourPackage", payload, "Property")),
      ...priceTiers.map((payload) => buildEntityMap(tenantId, "TourPriceTier", payload, "ProductOption")),
      ...suppliers.map((payload) => buildEntityMap(tenantId, "Supplier", payload, "Supplier")),
      ...bookingPlans.map((plan) => buildEntityMap(tenantId, "Booking", plan.booking, "Booking")),
      ...payments.map((payload) => buildEntityMap(tenantId, "BookingPayment", payload, "Payment"))
    ]
  };
}

export function mapPropertyToTourPackage(
  property: AnVoyagesProperty,
  tenantId: string,
  location?: AnVoyagesLocation
) {
  const durationDays = Math.max(Number(property.durationDays ?? 1), 1);
  const images = parseStringArray(property.images);
  const amenities = [
    ...parseStringArray(property.amenities),
    ...parseStringArray(property.amenitiesVi),
    ...parseStringArray(property.amenitiesEn)
  ];

  return {
    tenantId,
    code: buildStableCode("AVP", property.id),
    sourceSystem: ANVOYAGES_SOURCE_SYSTEM,
    sourceRecordId: property.id,
    slug: location?.slug ? `${location.slug}-${property.id.slice(0, 8)}` : undefined,
    name: property.name,
    nameVi: property.nameVi,
    nameEn: property.nameEn,
    description: property.description,
    descriptionVi: property.descriptionVi,
    descriptionEn: property.descriptionEn,
    market: "DOMESTIC",
    type: mapPropertyTypeToTourType(property.type),
    status: property.isActive === false ? "PAUSED" : "ACTIVE",
    destinationCountry: "VN",
    destinationRegion: location?.nameVi ?? location?.name ?? location?.nameEn,
    durationDays,
    durationNights: Math.max(durationDays - 1, 0),
    minPax: 1,
    maxPax: property.maxGuests,
    defaultCurrency: "VND",
    defaultAdultPrice: toMoneyString(property.adultPrice ?? property.basePrice),
    defaultChildPrice: property.childPrice === null || property.childPrice === undefined ? undefined : toMoneyString(property.childPrice),
    defaultCostEstimate: toMoneyString(property.costPrice ?? 0),
    tags: uniqueStrings([property.type, location?.slug, location?.nameVi, location?.nameEn]),
    images,
    amenities: uniqueStrings(amenities),
    seoTitleVi: property.seoTitleVi ?? location?.seoTitleVi,
    seoTitleEn: property.seoTitleEn ?? location?.seoTitleEn,
    seoDescriptionVi: property.seoDescriptionVi ?? location?.seoDescriptionVi,
    seoDescriptionEn: property.seoDescriptionEn ?? location?.seoDescriptionEn,
    metadata: compactObject({
      anvoyagesLocationId: property.locationId,
      anvoyagesSupplierId: property.supplierId,
      propertyType: property.type,
      basePrice: property.basePrice,
      extraFee: property.extraFee,
      pricingRules: parseJson(property.pricingRules),
      seoKeywordsVi: property.seoKeywordsVi,
      seoKeywordsEn: property.seoKeywordsEn,
      sourceImageUrl: location?.imageUrl
    })
  };
}

export function mapProductOptionToPriceTier(option: AnVoyagesProductOption, tenantId: string) {
  return {
    tenantId,
    packageSourceSystem: ANVOYAGES_SOURCE_SYSTEM,
    packageSourceRecordId: option.propertyId,
    sourceSystem: ANVOYAGES_SOURCE_SYSTEM,
    sourceRecordId: option.id,
    optionType: option.optionType ?? "package",
    name: option.name,
    nameVi: option.nameVi,
    nameEn: option.nameEn,
    minPax: 1,
    maxPax: option.maxGuests,
    currency: "VND",
    adultPrice: toMoneyString(option.adultPrice ?? option.basePrice),
    childPrice: option.childPrice === null || option.childPrice === undefined ? undefined : toMoneyString(option.childPrice),
    costPrice: toMoneyString(option.costPrice ?? 0),
    inventoryQuantity: option.inventoryQuantity,
    metadata: compactObject({
      description: option.description,
      descriptionVi: option.descriptionVi,
      descriptionEn: option.descriptionEn,
      maxAdults: option.maxAdults,
      maxChildren: option.maxChildren,
      durationDays: option.durationDays,
      pricingRules: parseJson(option.pricingRules),
      sortOrder: option.sortOrder
    })
  };
}

export function mapSupplierToTravelOpsSupplier(supplier: AnVoyagesSupplier, tenantId: string) {
  return {
    tenantId,
    code: buildStableCode("AVS", supplier.id),
    sourceSystem: ANVOYAGES_SOURCE_SYSTEM,
    sourceRecordId: supplier.id,
    name: supplier.name,
    type: mapSupplierType(supplier.type),
    status: "ACTIVE",
    country: "VN",
    contactName: supplier.contactPerson,
    contactEmail: supplier.email,
    contactPhone: supplier.phone,
    defaultCurrency: "VND",
    notes: supplier.notes,
    metadata: compactObject({
      anvoyagesType: supplier.type,
      address: supplier.address,
      contractRate: supplier.contractRate
    })
  };
}

export function mapBookingToTravelOpsBooking(
  booking: AnVoyagesBooking,
  tenantId: string,
  property?: AnVoyagesProperty,
  option?: AnVoyagesProductOption
) {
  const bookingNo = booking.bookingCode ?? buildStableCode("AVB", booking.id);
  const startDate = toDateOnly(booking.checkIn);
  const endDate = toDateOnly(booking.checkOut);
  const departureCode = buildDepartureCode(property?.id ?? booking.propertyId ?? booking.id, startDate);
  const paidAmount = Number(booking.paidAmount ?? 0);
  const grossAmount = Number(booking.totalPrice ?? 0);
  const depositAmount = Number(booking.depositAmount ?? 0);

  return {
    departure: {
      tenantId,
      packageSourceSystem: ANVOYAGES_SOURCE_SYSTEM,
      packageSourceRecordId: property?.id ?? booking.propertyId,
      code: departureCode,
      sourceSystem: ANVOYAGES_SOURCE_SYSTEM,
      sourceRecordId: `${property?.id ?? booking.propertyId ?? "booking"}:${startDate}`,
      startDate,
      endDate,
      status: mapBookingStatusToDepartureStatus(booking.status),
      capacity: Math.max(Number(option?.inventoryQuantity ?? property?.maxGuests ?? booking.guests ?? 1), 1),
      bookedPax: Number(booking.guests ?? 1),
      confirmedPax: isConfirmedLikeStatus(booking.status) ? Number(booking.guests ?? 1) : 0,
      waitlistedPax: 0,
      currency: "VND",
      revenueTarget: toMoneyString(grossAmount),
      costBudget: toMoneyString(booking.totalCost ?? 0),
      notes: "Generated from AnVoyages booking import."
    },
    booking: {
      tenantId,
      departureCode,
      bookingNo,
      sourceSystem: ANVOYAGES_SOURCE_SYSTEM,
      sourceRecordId: booking.id,
      sourceBookingCode: booking.bookingCode,
      source: "WEBSITE",
      customerType: "INDIVIDUAL",
      status: mapBookingStatus(booking.status),
      externalStatus: booking.status,
      customerRef: booking.customerId,
      contactName: booking.customerName,
      contactEmail: booking.email,
      contactPhone: booking.phone,
      paxCount: Number(booking.guests ?? 1),
      adultCount: Number(booking.adultCount ?? booking.guests ?? 1),
      childCount: Number(booking.childCount ?? 0),
      infantCount: 0,
      currency: "VND",
      grossAmount: toMoneyString(grossAmount),
      discountAmount: "0",
      taxAmount: "0",
      netAmount: toMoneyString(grossAmount),
      depositDueAmount: toMoneyString(depositAmount),
      paidAmount: toMoneyString(paidAmount),
      balanceDueAmount: toMoneyString(Math.max(grossAmount - paidAmount, 0)),
      travelStartDate: startDate,
      travelEndDate: endDate,
      bookingIntent: booking.bookingIntent,
      requestedPaymentMethod: booking.requestedPaymentMethod,
      paymentReference: booking.paymentReference,
      transferContent: booking.transferContent,
      bookedAt: booking.createdAt ? toIsoString(booking.createdAt) : undefined,
      confirmedAt: isConfirmedLikeStatus(booking.status) ? toIsoString(booking.updatedAt ?? booking.createdAt ?? new Date()) : undefined,
      cancelledAt: booking.status === "cancelled" ? toIsoString(booking.updatedAt ?? booking.createdAt ?? new Date()) : undefined,
      notes: booking.note,
      metadata: compactObject({
        adminNote: booking.adminNote,
        paymentStatus: booking.paymentStatus,
        depositPercent: booking.depositPercent,
        discountCode: booking.discountCode,
        productOptionId: booking.productOptionId,
        productOptionName: booking.productOptionName,
        productOptionType: booking.productOptionType,
        productOptionPrice: booking.productOptionPrice,
        productOptionDurationDays: booking.productOptionDurationDays,
        productOptionQuantity: booking.productOptionQuantity,
        profit: booking.profit
      })
    }
  };
}

export function mapPaymentToBookingPayment(payment: AnVoyagesPayment, tenantId: string) {
  return {
    tenantId,
    bookingSourceSystem: ANVOYAGES_SOURCE_SYSTEM,
    bookingSourceRecordId: payment.bookingId,
    paymentNo: payment.referenceCode ?? buildStableCode("AVPAY", payment.id),
    sourceSystem: ANVOYAGES_SOURCE_SYSTEM,
    sourceRecordId: payment.id,
    method: mapPaymentMethod(payment.method),
    status: "PAID",
    amount: toMoneyString(payment.amount),
    currency: "VND",
    paidAt: payment.createdAt ? toIsoString(payment.createdAt) : undefined,
    bankTransactionRef: payment.referenceCode,
    accountingPaymentRef: payment.referenceCode,
    notes: payment.note,
    metadata: compactObject({
      anvoyagesType: payment.type,
      transferContent: payment.transferContent
    })
  };
}

export function mapBookingStatus(status?: string | null) {
  switch (status) {
    case "quoted":
      return "QUOTED";
    case "confirmed":
    case "deposit":
    case "paid":
      return "CONFIRMED";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    case "contacted":
      return "QUOTED";
    case "pending":
    default:
      return "INQUIRY";
  }
}

function mapBookingStatusToDepartureStatus(status?: string | null) {
  switch (status) {
    case "confirmed":
    case "deposit":
    case "paid":
      return "GUARANTEED";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    default:
      return "OPEN";
  }
}

function mapPropertyTypeToTourType(type?: string | null) {
  switch (type) {
    case "cruise":
      return "CRUISE";
    case "hotel":
    case "homestay":
      return "STAY";
    case "transport":
    case "car-rental":
      return "TRANSPORT";
    case "addon":
      return "ADDON";
    case "tour":
    default:
      return "PACKAGE";
  }
}

function mapSupplierType(type?: string | null) {
  switch (type) {
    case "hotel":
      return "HOTEL";
    case "cruise":
      return "DMC";
    case "transport":
      return "TRANSPORT";
    case "tour_operator":
      return "DMC";
    default:
      return "OTHER";
  }
}

function mapPaymentMethod(method?: string | null) {
  switch (method) {
    case "cash":
      return "CASH";
    case "card":
      return "CARD";
    case "e_wallet":
      return "E_WALLET";
    default:
      return "BANK_TRANSFER";
  }
}

function buildEntityMap(tenantId: string, sourceEntityType: string, payload: Record<string, unknown>, targetEntityType: string) {
  return {
    tenantId,
    sourceEntityType,
    sourceEntityId: String(payload.sourceRecordId ?? payload.paymentNo ?? payload.bookingNo ?? payload.code),
    targetModule: "MASTER_DATA",
    targetEntityType,
    targetEntityId: String(payload.sourceRecordId ?? payload.paymentNo ?? payload.bookingNo ?? payload.code),
    direction: "INBOUND",
    syncStatus: "PENDING",
    externalRef: `${ANVOYAGES_SOURCE_SYSTEM}:${targetEntityType}:${payload.sourceRecordId ?? payload.paymentNo ?? payload.bookingNo ?? payload.code}`
  };
}

function buildStableCode(prefix: string, id: string) {
  return `${prefix}-${id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toUpperCase()}`;
}

function buildDepartureCode(sourceId: string, startDate: string) {
  return `${buildStableCode("AVD", sourceId)}-${startDate.replace(/-/g, "")}`;
}

function toMoneyString(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? String(Math.round(amount * 10000) / 10000) : "0";
}

function toDateOnly(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10);
}

function toIsoString(value: string | Date) {
  return new Date(value).toISOString();
}

function isConfirmedLikeStatus(status?: string | null) {
  return ["confirmed", "deposit", "paid", "completed"].includes(status ?? "");
}

function parseStringArray(value?: string | null) {
  const parsed = parseJson(value);
  if (Array.isArray(parsed)) {
    return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  return [];
}

function parseJson(value?: string | null) {
  if (!value) return undefined;

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function compactObject(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

function uniqueStrings(values: Array<string | undefined | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim()))];
}
