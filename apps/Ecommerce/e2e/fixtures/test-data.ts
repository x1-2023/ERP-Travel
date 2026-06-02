/**
 * Test data for Ecommerce E2E tests
 * Vietnamese products, addresses, and order data
 */

export const TEST_PRODUCTS = {
  laptop: {
    name: '[E2E] Laptop Dell XPS 13',
    description: 'Laptop hiệu năng cao cho công việc chuyên nghiệp',
    price: '2500000',
    category: 'Điện toán',
    sku: `SKU-LAPTOP-${Date.now()}`,
  },
  mouse: {
    name: '[E2E] Chuột Logitech MX Master 3',
    description: 'Chuột không dây ergonomic',
    price: '1500000',
    category: 'Phụ kiện',
    sku: `SKU-MOUSE-${Date.now()}`,
  },
  keyboard: {
    name: '[E2E] Bàn phím Cơ Keychron',
    description: 'Bàn phím cơ chuyên game',
    price: '3500000',
    category: 'Phụ kiện',
    sku: `SKU-KEYBOARD-${Date.now()}`,
  },
  monitor: {
    name: '[E2E] Màn hình LG UltraWide 38 inch',
    description: 'Màn hình siêu rộng 38 inch',
    price: '8500000',
    category: 'Màn hình',
    sku: `SKU-MONITOR-${Date.now()}`,
  },
}

export const TEST_ADDRESSES = {
  hanoi: {
    fullName: '[E2E] Nguyễn Văn A',
    phone: '0901234567',
    street: '123 Đường Láng',
    ward: 'Phường Đồng Tâm',
    district: 'Quận Hoàn Kiếm',
    city: 'Hà Nội',
    country: 'Việt Nam',
    postalCode: '100000',
  },
  hcm: {
    fullName: '[E2E] Trần Thị B',
    phone: '0912345678',
    street: '456 Nguyễn Hữu Cảnh',
    ward: 'Phường 22',
    district: 'Quận Bình Thạnh',
    city: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
    postalCode: '700000',
  },
}

export const TEST_ORDERS = {
  order1: {
    customer: '[E2E] Customer One',
    email: `test-${Date.now()}@ecommerce.local`,
    phone: '0901111111',
    status: 'pending',
    items: ['laptop', 'mouse'],
    shippingMethod: 'GHN',
  },
  order2: {
    customer: '[E2E] Customer Two',
    email: `test-${Date.now() + 1}@ecommerce.local`,
    phone: '0902222222',
    status: 'processing',
    items: ['keyboard'],
    shippingMethod: 'GHN',
  },
}

export const PAYMENT_METHODS = {
  vnpay: {
    name: 'VNPay',
    type: 'vnpay',
  },
  momo: {
    name: 'MoMo',
    type: 'momo',
  },
  cod: {
    name: 'Thanh toán khi nhận hàng',
    type: 'cod',
  },
}

export const ORDER_STATUSES = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipped: 'Đã gửi',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
}

export const SHIPPING_METHODS = {
  ghn: {
    name: 'Giao Hàng Nhanh (GHN)',
    code: 'GHN',
    estimatedDays: '2-3 ngày',
  },
  vtp: {
    name: 'Viettel Post',
    code: 'VTP',
    estimatedDays: '3-4 ngày',
  },
}
