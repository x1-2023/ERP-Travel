// ============================================================
// E-commerce Catalog Engine
// Product management, pricing, search, inventory
// ============================================================

import Decimal from 'decimal.js';

// ─── Types ───────────────────────────────────────────────────

export interface CatalogProduct {
  id: string;
  tenantId: string;
  sku: string;
  barcode?: string;
  name: string;
  nameEn?: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  type: 'PHYSICAL' | 'DIGITAL' | 'SERVICE' | 'BUNDLE' | 'SUBSCRIPTION';
  status: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'ARCHIVED';
  basePrice: string; // Decimal as string
  salePrice?: string;
  costPrice?: string;
  vatRate: string;
  trackInventory: boolean;
  stockQuantity: number;
  lowStockAlert: number;
  weight?: string;
  dimensions?: { length: string; width: string; height: string };
  masterProductId?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  categories: string[];
  averageRating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>; // { color: "Đỏ", size: "XL" }
  price?: string;
  costPrice?: string;
  stock: number;
  barcode?: string;
  image?: string;
  isActive: boolean;
}

export interface PriceCalculation {
  basePrice: Decimal;
  salePrice?: Decimal;
  effectivePrice: Decimal;
  vatRate: Decimal;
  vatAmount: Decimal;
  priceWithVAT: Decimal;
  priceWithoutVAT: Decimal;
  discountPercent?: Decimal;
  savingsAmount?: Decimal;
}

export interface ProductFilter {
  tenantId: string;
  storefrontId?: string;
  search?: string;
  categoryIds?: string[];
  minPrice?: string;
  maxPrice?: string;
  types?: string[];
  statuses?: string[];
  inStock?: boolean;
  isFeatured?: boolean;
  sortBy?: 'name' | 'price_asc' | 'price_desc' | 'newest' | 'bestselling' | 'rating';
  page?: number;
  limit?: number;
}

export interface InventoryUpdate {
  productId: string;
  variantId?: string;
  type: 'ORDER' | 'RETURN' | 'ADJUSTMENT' | 'RESTOCK' | 'SYNC';
  quantity: number; // Positive = add, Negative = deduct
  reference?: string;
  actor?: string;
}

export interface StockCheckResult {
  productId: string;
  variantId?: string;
  available: boolean;
  currentStock: number;
  requestedQty: number;
  shortfall: number;
}

// ─── Pricing Engine ──────────────────────────────────────────

/**
 * Calculate product price with VAT (Vietnam standard: giá đã bao gồm VAT)
 * Follows Thông tư 39/2014/TT-BTC on invoice pricing
 */
export function calculatePrice(
  basePrice: string,
  vatRate: string,
  salePrice?: string
): PriceCalculation {
  const base = new Decimal(basePrice);
  const vat = new Decimal(vatRate);
  const sale = salePrice ? new Decimal(salePrice) : undefined;

  const effectivePrice = sale && sale.lt(base) ? sale : base;
  const vatMultiplier = vat.div(100);
  const vatAmount = effectivePrice.mul(vatMultiplier);
  const priceWithVAT = effectivePrice.add(vatAmount);
  const priceWithoutVAT = effectivePrice;

  const result: PriceCalculation = {
    basePrice: base,
    effectivePrice,
    vatRate: vat,
    vatAmount,
    priceWithVAT,
    priceWithoutVAT,
  };

  if (sale && sale.lt(base)) {
    result.salePrice = sale;
    result.savingsAmount = base.sub(sale);
    result.discountPercent = base.sub(sale).div(base).mul(100).toDecimalPlaces(1);
  }

  return result;
}

/**
 * Calculate display price for Vietnamese market
 * VN convention: prices shown WITH VAT included
 * Round to nearest 1000 VND for clean display
 */
export function calculateDisplayPrice(
  basePrice: string,
  vatRate: string,
  options: { roundTo?: number; taxIncluded?: boolean } = {}
): string {
  const { roundTo = 1000, taxIncluded = true } = options;
  const price = calculatePrice(basePrice, vatRate);
  const displayPrice = taxIncluded ? price.priceWithVAT : price.priceWithoutVAT;

  if (roundTo > 0) {
    const rounded = displayPrice.div(roundTo).round().mul(roundTo);
    return rounded.toString();
  }
  return displayPrice.toDecimalPlaces(0).toString();
}

/**
 * Format price in VND
 */
export function formatVND(amount: string | number | Decimal): string {
  const num = typeof amount === 'string' || typeof amount === 'number'
    ? new Decimal(amount)
    : amount;
  const formatted = num.toDecimalPlaces(0).toNumber().toLocaleString('vi-VN');
  return `${formatted} ₫`;
}

/**
 * Calculate bundle price with automatic discount
 */
export function calculateBundlePrice(
  items: Array<{ price: string; quantity: number }>,
  bundleDiscount: string // Percentage discount
): { originalTotal: Decimal; bundlePrice: Decimal; savings: Decimal } {
  const originalTotal = items.reduce(
    (sum, item) => sum.add(new Decimal(item.price).mul(item.quantity)),
    new Decimal(0)
  );

  const discount = new Decimal(bundleDiscount).div(100);
  const savings = originalTotal.mul(discount);
  const bundlePrice = originalTotal.sub(savings);

  return { originalTotal, bundlePrice, savings };
}

// ─── Inventory Management ────────────────────────────────────

/**
 * Check stock availability for multiple items
 * Used before cart checkout to verify all items in stock
 */
export function checkStockAvailability(
  items: Array<{ productId: string; variantId?: string; quantity: number }>,
  inventory: Map<string, number> // key = productId or productId:variantId
): StockCheckResult[] {
  return items.map(item => {
    const key = item.variantId ? `${item.productId}:${item.variantId}` : item.productId;
    const currentStock = inventory.get(key) ?? 0;
    const available = currentStock >= item.quantity;
    const shortfall = available ? 0 : item.quantity - currentStock;

    return {
      productId: item.productId,
      variantId: item.variantId,
      available,
      currentStock,
      requestedQty: item.quantity,
      shortfall,
    };
  });
}

/**
 * Process inventory update and return new stock level
 */
export function processInventoryUpdate(
  currentStock: number,
  update: InventoryUpdate
): { newStock: number; log: InventoryLogEntry } {
  const newStock = currentStock + update.quantity;

  if (newStock < 0 && update.type !== 'ADJUSTMENT') {
    throw new EcommerceError(
      'INSUFFICIENT_STOCK',
      `Không đủ tồn kho. Hiện có: ${currentStock}, yêu cầu: ${Math.abs(update.quantity)}`,
      400
    );
  }

  const log: InventoryLogEntry = {
    productId: update.productId,
    variantId: update.variantId,
    type: update.type,
    quantity: update.quantity,
    previousQty: currentStock,
    newQty: Math.max(0, newStock),
    reference: update.reference,
    actor: update.actor,
    timestamp: new Date(),
  };

  return { newStock: Math.max(0, newStock), log };
}

export interface InventoryLogEntry {
  productId: string;
  variantId?: string;
  type: string;
  quantity: number;
  previousQty: number;
  newQty: number;
  reference?: string;
  actor?: string;
  timestamp: Date;
}

/**
 * Detect low stock products that need reorder
 */
export function detectLowStock(
  products: Array<{ id: string; name: string; stock: number; lowStockAlert: number }>
): Array<{ id: string; name: string; stock: number; threshold: number; deficit: number }> {
  return products
    .filter(p => p.stock <= p.lowStockAlert)
    .map(p => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      threshold: p.lowStockAlert,
      deficit: p.lowStockAlert - p.stock,
    }))
    .sort((a, b) => a.stock - b.stock);
}

// ─── Product Search & Filter ─────────────────────────────────

/**
 * Build search query conditions from filter
 * Returns Prisma-compatible where clause
 */
export function buildProductFilterQuery(filter: ProductFilter): Record<string, any> {
  const where: Record<string, any> = {
    tenantId: filter.tenantId,
    deletedAt: null,
  };

  if (filter.search) {
    const searchTerm = filter.search.trim();
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { nameEn: { contains: searchTerm, mode: 'insensitive' } },
      { sku: { contains: searchTerm, mode: 'insensitive' } },
      { barcode: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  if (filter.categoryIds?.length) {
    where.categories = {
      some: { categoryId: { in: filter.categoryIds } },
    };
  }

  if (filter.minPrice || filter.maxPrice) {
    where.basePrice = {};
    if (filter.minPrice) where.basePrice.gte = new Decimal(filter.minPrice);
    if (filter.maxPrice) where.basePrice.lte = new Decimal(filter.maxPrice);
  }

  if (filter.types?.length) {
    where.type = { in: filter.types };
  }

  if (filter.statuses?.length) {
    where.status = { in: filter.statuses };
  } else {
    where.status = 'ACTIVE'; // Default: only active products
  }

  if (filter.inStock === true) {
    where.OR = [
      { trackInventory: false },
      { stockQuantity: { gt: 0 } },
    ];
  }

  return where;
}

/**
 * Build sort order from filter
 */
export function buildProductSortOrder(
  sortBy?: ProductFilter['sortBy']
): Record<string, string>[] {
  switch (sortBy) {
    case 'price_asc':
      return [{ basePrice: 'asc' }];
    case 'price_desc':
      return [{ basePrice: 'desc' }];
    case 'newest':
      return [{ createdAt: 'desc' }];
    case 'name':
      return [{ name: 'asc' }];
    case 'rating':
      // Requires computed field or raw query
      return [{ createdAt: 'desc' }];
    case 'bestselling':
      // Requires order count aggregation
      return [{ createdAt: 'desc' }];
    default:
      return [{ createdAt: 'desc' }];
  }
}

/**
 * Generate SEO-friendly slug from Vietnamese product name
 */
export function generateSlug(name: string): string {
  const vietnameseMap: Record<string, string> = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd', 'Đ': 'd',
  };

  return name
    .toLowerCase()
    .split('')
    .map(char => vietnameseMap[char] || char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Errors ──────────────────────────────────────────────────

export class EcommerceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'EcommerceError';
  }
}
