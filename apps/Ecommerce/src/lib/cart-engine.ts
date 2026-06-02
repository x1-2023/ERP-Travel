// ============================================================
// E-commerce Cart & Checkout Engine
// Shopping cart, promotion application, checkout flow
// ============================================================

import Decimal from 'decimal.js';
import { calculatePrice, formatVND, EcommerceError } from './catalog-engine';

// ─── Types ───────────────────────────────────────────────────

export interface CartState {
  id: string;
  tenantId: string;
  customerId?: string;
  sessionId?: string;
  items: CartItemState[];
  couponCode?: string;
  appliedPromotions: AppliedPromotion[];
  subtotal: Decimal;
  taxAmount: Decimal;
  shippingFee: Decimal;
  discount: Decimal;
  total: Decimal;
  itemCount: number;
  updatedAt: Date;
}

export interface CartItemState {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  sku: string;
  image?: string;
  quantity: number;
  unitPrice: Decimal;
  vatRate: Decimal;
  lineSubtotal: Decimal;
  lineTax: Decimal;
  lineTotal: Decimal;
  inStock: boolean;
  maxQuantity: number;
}

export interface AppliedPromotion {
  promotionId: string;
  name: string;
  code?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y' | 'BUNDLE_PRICE';
  discountAmount: Decimal;
  description: string;
}

export interface PromotionRule {
  id: string;
  name: string;
  code?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y' | 'BUNDLE_PRICE';
  value: Decimal;
  maxDiscount?: Decimal;
  minOrderAmount?: Decimal;
  minQuantity?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  usageLimit?: number;
  usageCount: number;
  perCustomerLimit?: number;
  startDate: Date;
  endDate: Date;
  // Buy X Get Y
  buyQuantity?: number;
  getQuantity?: number;
  getProductIds?: string[];
}

export interface CheckoutRequest {
  cartId: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: string;
  shippingProvider?: string;
  notes?: string;
  couponCode?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;     // Số nhà, đường
  ward: string;       // Phường/Xã
  district: string;   // Quận/Huyện
  city: string;       // Thành phố
  province: string;   // Tỉnh
  postalCode?: string;
}

export interface CheckoutResult {
  orderId: string;
  orderNumber: string;
  total: Decimal;
  paymentMethod: string;
  paymentUrl?: string; // Redirect URL for online payment
  estimatedDelivery?: Date;
  message: string;
}

export interface ShippingRate {
  provider: string;
  providerName: string;
  serviceName: string;
  fee: Decimal;
  estimatedDays: number;
  codSupported: boolean;
}

// ─── Cart Calculations ───────────────────────────────────────

/**
 * Recalculate cart totals from items
 * Vietnam convention: prices shown WITH VAT
 */
export function recalculateCart(
  items: CartItemState[],
  promotions: AppliedPromotion[] = [],
  shippingFee: Decimal = new Decimal(0)
): Pick<CartState, 'subtotal' | 'taxAmount' | 'discount' | 'shippingFee' | 'total' | 'itemCount'> {
  let subtotal = new Decimal(0);
  let taxAmount = new Decimal(0);
  let itemCount = 0;

  for (const item of items) {
    const linePrice = item.unitPrice.mul(item.quantity);
    const lineTax = linePrice.mul(item.vatRate.div(100));

    item.lineSubtotal = linePrice;
    item.lineTax = lineTax;
    item.lineTotal = linePrice.add(lineTax);

    subtotal = subtotal.add(linePrice);
    taxAmount = taxAmount.add(lineTax);
    itemCount += item.quantity;
  }

  // Sum all promotion discounts
  let discount = promotions.reduce(
    (sum, p) => sum.add(p.discountAmount),
    new Decimal(0)
  );

  // Check for free shipping promotion
  const hasFreeShipping = promotions.some(p => p.type === 'FREE_SHIPPING');
  const effectiveShipping = hasFreeShipping ? new Decimal(0) : shippingFee;

  // Total = subtotal + tax + shipping - discount
  const total = Decimal.max(
    subtotal.add(taxAmount).add(effectiveShipping).sub(discount),
    new Decimal(0)
  );

  return {
    subtotal,
    taxAmount,
    shippingFee: effectiveShipping,
    discount,
    total,
    itemCount,
  };
}

/**
 * Validate and apply a promotion/coupon to cart
 */
export function applyPromotion(
  promotion: PromotionRule,
  cartItems: CartItemState[],
  cartSubtotal: Decimal,
  customerId?: string,
  customerUsageCount: number = 0,
  now: Date = new Date()
): AppliedPromotion {
  // 1. Check dates
  if (now < promotion.startDate || now > promotion.endDate) {
    throw new EcommerceError(
      'PROMOTION_EXPIRED',
      'Mã giảm giá đã hết hạn hoặc chưa bắt đầu',
      400
    );
  }

  // 2. Check usage limits
  if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
    throw new EcommerceError(
      'PROMOTION_LIMIT_REACHED',
      'Mã giảm giá đã hết lượt sử dụng',
      400
    );
  }

  if (promotion.perCustomerLimit && customerUsageCount >= promotion.perCustomerLimit) {
    throw new EcommerceError(
      'PROMOTION_CUSTOMER_LIMIT',
      'Bạn đã sử dụng hết lượt cho mã giảm giá này',
      400
    );
  }

  // 3. Check minimum order
  if (promotion.minOrderAmount && cartSubtotal.lt(promotion.minOrderAmount)) {
    throw new EcommerceError(
      'PROMOTION_MIN_ORDER',
      `Đơn hàng tối thiểu ${formatVND(promotion.minOrderAmount)} để áp dụng mã giảm giá`,
      400
    );
  }

  // 4. Check minimum quantity
  if (promotion.minQuantity) {
    const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQty < promotion.minQuantity) {
      throw new EcommerceError(
        'PROMOTION_MIN_QTY',
        `Cần tối thiểu ${promotion.minQuantity} sản phẩm để áp dụng`,
        400
      );
    }
  }

  // 5. Calculate discount based on type
  let discountAmount: Decimal;
  let description: string;

  switch (promotion.type) {
    case 'PERCENTAGE': {
      discountAmount = cartSubtotal.mul(promotion.value.div(100));
      if (promotion.maxDiscount && discountAmount.gt(promotion.maxDiscount)) {
        discountAmount = promotion.maxDiscount;
      }
      description = `Giảm ${promotion.value}%${promotion.maxDiscount ? ` (tối đa ${formatVND(promotion.maxDiscount)})` : ''}`;
      break;
    }

    case 'FIXED_AMOUNT': {
      discountAmount = Decimal.min(promotion.value, cartSubtotal);
      description = `Giảm ${formatVND(promotion.value)}`;
      break;
    }

    case 'FREE_SHIPPING': {
      discountAmount = new Decimal(0); // Handled in recalculateCart
      description = 'Miễn phí vận chuyển';
      break;
    }

    case 'BUY_X_GET_Y': {
      // Simplified: discount = value of Y items
      const eligibleItems = cartItems.filter(
        item => !promotion.applicableProducts?.length ||
                promotion.applicableProducts.includes(item.productId)
      );
      const totalEligibleQty = eligibleItems.reduce((sum, i) => sum + i.quantity, 0);
      const buyQty = promotion.buyQuantity || 1;
      const getQty = promotion.getQuantity || 1;
      const sets = Math.floor(totalEligibleQty / (buyQty + getQty));

      if (sets <= 0) {
        throw new EcommerceError(
          'PROMOTION_NOT_APPLICABLE',
          `Cần mua ${buyQty} sản phẩm để được tặng ${getQty}`,
          400
        );
      }

      // Discount = cheapest items * getQty * sets
      const sortedPrices = eligibleItems
        .flatMap(item => Array(item.quantity).fill(item.unitPrice))
        .sort((a, b) => a.cmp(b));

      discountAmount = new Decimal(0);
      for (let i = 0; i < sets * getQty && i < sortedPrices.length; i++) {
        discountAmount = discountAmount.add(sortedPrices[i]);
      }

      description = `Mua ${buyQty} tặng ${getQty}`;
      break;
    }

    case 'BUNDLE_PRICE': {
      discountAmount = cartSubtotal.sub(promotion.value);
      if (discountAmount.lt(0)) discountAmount = new Decimal(0);
      description = `Giá combo ${formatVND(promotion.value)}`;
      break;
    }

    default:
      discountAmount = new Decimal(0);
      description = promotion.name;
  }

  return {
    promotionId: promotion.id,
    name: promotion.name,
    code: promotion.code,
    type: promotion.type,
    discountAmount,
    description,
  };
}

// ─── Shipping Calculator ─────────────────────────────────────

/**
 * Vietnamese shipping providers rate calculation
 * Simplified rates — in production, call provider APIs
 */
export function calculateShippingRates(
  address: ShippingAddress,
  totalWeight: number, // kg
  orderTotal: Decimal,
  origin: { province: string } = { province: 'Hồ Chí Minh' }
): ShippingRate[] {
  const isSameProvince = normalizeProvince(address.province) === normalizeProvince(origin.province);
  const isUrban = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'].some(
    city => normalizeProvince(address.province).includes(normalizeProvince(city))
  );

  const baseRates: ShippingRate[] = [
    {
      provider: 'GHN',
      providerName: 'Giao Hàng Nhanh',
      serviceName: isSameProvince ? 'Nội thành' : 'Liên tỉnh',
      fee: calculateProviderFee('GHN', totalWeight, isSameProvince, isUrban),
      estimatedDays: isSameProvince ? 1 : (isUrban ? 2 : 4),
      codSupported: true,
    },
    {
      provider: 'GHTK',
      providerName: 'Giao Hàng Tiết Kiệm',
      serviceName: 'Tiêu chuẩn',
      fee: calculateProviderFee('GHTK', totalWeight, isSameProvince, isUrban),
      estimatedDays: isSameProvince ? 2 : (isUrban ? 3 : 5),
      codSupported: true,
    },
    {
      provider: 'VIETTEL_POST',
      providerName: 'Viettel Post',
      serviceName: 'Chuyển phát nhanh',
      fee: calculateProviderFee('VIETTEL_POST', totalWeight, isSameProvince, isUrban),
      estimatedDays: isSameProvince ? 1 : (isUrban ? 2 : 3),
      codSupported: true,
    },
    {
      provider: 'J_AND_T',
      providerName: 'J&T Express',
      serviceName: 'Express',
      fee: calculateProviderFee('J_AND_T', totalWeight, isSameProvince, isUrban),
      estimatedDays: isSameProvince ? 2 : (isUrban ? 3 : 5),
      codSupported: true,
    },
  ];

  // Add GrabExpress for same-city urban orders under 20kg
  if (isSameProvince && isUrban && totalWeight <= 20) {
    baseRates.unshift({
      provider: 'GRAB_EXPRESS',
      providerName: 'GrabExpress',
      serviceName: 'Giao nhanh 2h',
      fee: calculateProviderFee('GRAB_EXPRESS', totalWeight, true, true),
      estimatedDays: 0, // Same day
      codSupported: false,
    });
  }

  return baseRates.sort((a, b) => a.fee.cmp(b.fee));
}

function calculateProviderFee(
  provider: string,
  weight: number,
  isSameProvince: boolean,
  isUrban: boolean
): Decimal {
  // Base rates per provider (VND) — simplified
  const rates: Record<string, { base: number; perKg: number; sameCity: number }> = {
    GHN:          { base: 22000, perKg: 5500, sameCity: 16500 },
    GHTK:         { base: 18000, perKg: 5000, sameCity: 15000 },
    VIETTEL_POST: { base: 20000, perKg: 5000, sameCity: 16000 },
    J_AND_T:      { base: 19000, perKg: 4800, sameCity: 15500 },
    GRAB_EXPRESS:  { base: 30000, perKg: 8000, sameCity: 25000 },
  };

  const rate = rates[provider] || rates.GHTK;
  const baseFee = isSameProvince ? rate.sameCity : rate.base;
  const extraWeight = Math.max(0, weight - 0.5); // First 500g included in base
  const extraFee = Math.ceil(extraWeight / 0.5) * rate.perKg;

  // Remote area surcharge
  const remoteSurcharge = !isUrban && !isSameProvince ? 5000 : 0;

  return new Decimal(baseFee + extraFee + remoteSurcharge);
}

function normalizeProvince(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(tỉnh|thành phố|tp\.?)\s*/i, '')
    .trim();
}

// ─── Order Number Generator ──────────────────────────────────

/**
 * Generate order number: DH-2026-000001
 * DH = Đơn Hàng
 */
export function generateOrderNumber(
  year: number = new Date().getFullYear(),
  sequence: number
): string {
  const paddedSeq = String(sequence).padStart(6, '0');
  return `DH-${year}-${paddedSeq}`;
}

// ─── Checkout Validation ─────────────────────────────────────

export interface CheckoutValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
}

/**
 * Validate checkout request before processing
 */
export function validateCheckout(request: CheckoutRequest): CheckoutValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  if (!request.customerName?.trim()) {
    errors.push({ field: 'customerName', message: 'Vui lòng nhập họ tên' });
  }

  if (!request.customerPhone?.trim()) {
    errors.push({ field: 'customerPhone', message: 'Vui lòng nhập số điện thoại' });
  } else if (!/^(0[3-9]\d{8}|84[3-9]\d{8})$/.test(request.customerPhone.replace(/\s/g, ''))) {
    errors.push({ field: 'customerPhone', message: 'Số điện thoại không hợp lệ' });
  }

  if (request.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.customerEmail)) {
    errors.push({ field: 'customerEmail', message: 'Email không hợp lệ' });
  }

  const addr = request.shippingAddress;
  if (!addr) {
    errors.push({ field: 'shippingAddress', message: 'Vui lòng nhập địa chỉ giao hàng' });
  } else {
    if (!addr.street?.trim()) errors.push({ field: 'shippingAddress.street', message: 'Vui lòng nhập địa chỉ' });
    if (!addr.ward?.trim()) errors.push({ field: 'shippingAddress.ward', message: 'Vui lòng chọn Phường/Xã' });
    if (!addr.district?.trim()) errors.push({ field: 'shippingAddress.district', message: 'Vui lòng chọn Quận/Huyện' });
    if (!addr.province?.trim()) errors.push({ field: 'shippingAddress.province', message: 'Vui lòng chọn Tỉnh/Thành phố' });
  }

  const validMethods = ['COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY', 'ZALOPAY', 'CREDIT_CARD', 'DEBIT_CARD', 'INSTALLMENT', 'WALLET'];
  if (!validMethods.includes(request.paymentMethod)) {
    errors.push({ field: 'paymentMethod', message: 'Phương thức thanh toán không hợp lệ' });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ─── Abandoned Cart Detection ────────────────────────────────

export interface AbandonedCartInfo {
  cartId: string;
  customerId?: string;
  itemCount: number;
  total: Decimal;
  abandonedAt: Date;
  hoursSinceAbandoned: number;
  reminderSent: boolean;
}

/**
 * Detect abandoned carts (active carts not updated in X hours)
 */
export function detectAbandonedCarts(
  carts: Array<{
    id: string;
    customerId?: string;
    itemCount: number;
    total: string;
    updatedAt: Date;
    reminderSent?: boolean;
  }>,
  thresholdHours: number = 2,
  now: Date = new Date()
): AbandonedCartInfo[] {
  return carts
    .filter(cart => {
      const hoursSince = (now.getTime() - cart.updatedAt.getTime()) / (1000 * 60 * 60);
      return hoursSince >= thresholdHours && cart.itemCount > 0;
    })
    .map(cart => {
      const hoursSinceAbandoned = (now.getTime() - cart.updatedAt.getTime()) / (1000 * 60 * 60);
      return {
        cartId: cart.id,
        customerId: cart.customerId,
        itemCount: cart.itemCount,
        total: new Decimal(cart.total),
        abandonedAt: cart.updatedAt,
        hoursSinceAbandoned: Math.round(hoursSinceAbandoned * 10) / 10,
        reminderSent: cart.reminderSent || false,
      };
    })
    .sort((a, b) => b.hoursSinceAbandoned - a.hoursSinceAbandoned);
}
