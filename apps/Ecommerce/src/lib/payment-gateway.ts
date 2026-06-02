// ============================================================
// E-commerce Payment Gateway Integration
// Supports: VNPay, MoMo, ZaloPay, COD, Bank Transfer
// Vietnamese payment ecosystem
// ============================================================

import Decimal from 'decimal.js';
import * as crypto from 'crypto';

// ─── Types ───────────────────────────────────────────────────

export interface PaymentGatewayConfig {
  vnpay?: {
    tmnCode: string;
    secretKey: string;
    url: string;
    returnUrl: string;
    apiUrl: string;
  };
  momo?: {
    partnerCode: string;
    accessKey: string;
    secretKey: string;
    endpoint: string;
    returnUrl: string;
    ipnUrl: string;
  };
  zalopay?: {
    appId: string;
    key1: string;
    key2: string;
    endpoint: string;
    callbackUrl: string;
  };
  bankTransfer?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branch: string;
    qrTemplate?: string;
  };
}

export interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: Decimal;
  currency: string;
  method: string;
  description: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  returnUrl?: string;
  ipAddress?: string;
  locale?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;       // Redirect URL for online payment
  qrCode?: string;           // QR code data for bank transfer
  bankInfo?: BankTransferInfo;
  message: string;
  rawResponse?: Record<string, any>;
}

export interface BankTransferInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  amount: string;
  transferContent: string;   // Nội dung chuyển khoản
  qrData?: string;           // VietQR data
}

export interface PaymentCallback {
  provider: string;
  transactionId: string;
  orderId: string;
  amount: Decimal;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';
  message: string;
  rawData: Record<string, any>;
  signature: string;
  isValid: boolean;
}

export interface RefundRequest {
  transactionId: string;
  orderId: string;
  amount: Decimal;
  reason: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  message: string;
}

// ─── VNPay Gateway ───────────────────────────────────────────

/**
 * VNPay — Vietnam's largest payment gateway
 * Supports: ATM cards (Napas), international cards, QR Pay, bank accounts
 * Docs: https://sandbox.vnpayment.vn/apis/
 */
export class VNPayGateway {
  constructor(private config: NonNullable<PaymentGatewayConfig['vnpay']>) {}

  /**
   * Create VNPay payment URL
   * Customer will be redirected to VNPay for payment
   */
  createPaymentUrl(request: PaymentRequest): PaymentResponse {
    const createDate = this.formatDate(new Date());
    const orderId = request.orderNumber.replace(/[^a-zA-Z0-9]/g, '');

    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.config.tmnCode,
      vnp_Locale: request.locale || 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: request.description.substring(0, 255),
      vnp_OrderType: 'other',
      vnp_Amount: request.amount.mul(100).toFixed(0), // VNPay: amount × 100
      vnp_ReturnUrl: request.returnUrl || this.config.returnUrl,
      vnp_IpAddr: request.ipAddress || '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    // Sort params alphabetically and create query string
    const sortedParams = Object.keys(params).sort().reduce(
      (result, key) => { result[key] = params[key]; return result; },
      {} as Record<string, string>
    );

    const queryString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    // HMAC SHA512 signature
    const hmac = crypto.createHmac('sha512', this.config.secretKey);
    const signature = hmac.update(queryString).digest('hex');

    const paymentUrl = `${this.config.url}?${queryString}&vnp_SecureHash=${signature}`;

    return {
      success: true,
      transactionId: orderId,
      paymentUrl,
      message: 'Đang chuyển hướng đến VNPay...',
    };
  }

  /**
   * Verify VNPay callback/return signature
   */
  verifyCallback(params: Record<string, string>): PaymentCallback {
    const secureHash = params.vnp_SecureHash;

    // Remove hash params before verification
    const verifyParams = { ...params };
    delete verifyParams.vnp_SecureHash;
    delete verifyParams.vnp_SecureHashType;

    const sortedQuery = Object.keys(verifyParams).sort()
      .map(key => `${key}=${encodeURIComponent(verifyParams[key])}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', this.config.secretKey);
    const expectedHash = hmac.update(sortedQuery).digest('hex');
    const isValid = secureHash === expectedHash;

    const responseCode = params.vnp_ResponseCode;
    let status: PaymentCallback['status'] = 'PENDING';
    let message = '';

    if (responseCode === '00') {
      status = 'SUCCESS';
      message = 'Thanh toán thành công';
    } else if (responseCode === '24') {
      status = 'CANCELLED';
      message = 'Khách hàng hủy thanh toán';
    } else {
      status = 'FAILED';
      message = `Thanh toán thất bại (Mã: ${responseCode})`;
    }

    return {
      provider: 'VNPAY',
      transactionId: params.vnp_TransactionNo || '',
      orderId: params.vnp_TxnRef || '',
      amount: new Decimal(params.vnp_Amount || '0').div(100),
      status,
      message,
      rawData: params,
      signature: secureHash,
      isValid,
    };
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }
}

// ─── MoMo Gateway ────────────────────────────────────────────

/**
 * MoMo — Vietnam's largest e-wallet
 * ~31 million users
 * Supports: QR Pay, ATM, Credit Card
 */
export class MoMoGateway {
  constructor(private config: NonNullable<PaymentGatewayConfig['momo']>) {}

  /**
   * Create MoMo payment request
   * Returns payment URL for redirect or QR code
   */
  createPayment(request: PaymentRequest): PaymentResponse {
    const requestId = `MOMO-${Date.now()}`;
    const orderId = request.orderNumber;

    // Build signature: accessKey + amount + extraData + ipnUrl + orderId + orderInfo + partnerCode + redirectUrl + requestId + requestType
    const rawSignature = [
      `accessKey=${this.config.accessKey}`,
      `amount=${request.amount.toFixed(0)}`,
      `extraData=`,
      `ipnUrl=${this.config.ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${request.description}`,
      `partnerCode=${this.config.partnerCode}`,
      `redirectUrl=${request.returnUrl || this.config.returnUrl}`,
      `requestId=${requestId}`,
      `requestType=payWithMethod`,
    ].join('&');

    const signature = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(rawSignature)
      .digest('hex');

    // In production: POST to MoMo API and get payUrl
    // Here we build the request body for reference
    const requestBody = {
      partnerCode: this.config.partnerCode,
      requestId,
      amount: request.amount.toFixed(0),
      orderId,
      orderInfo: request.description,
      redirectUrl: request.returnUrl || this.config.returnUrl,
      ipnUrl: this.config.ipnUrl,
      requestType: 'payWithMethod',
      extraData: '',
      lang: 'vi',
      signature,
    };

    return {
      success: true,
      transactionId: requestId,
      paymentUrl: `${this.config.endpoint}/v2/gateway/api/create`,
      message: 'Đang kết nối MoMo...',
      rawResponse: requestBody,
    };
  }

  /**
   * Verify MoMo IPN callback
   */
  verifyCallback(data: Record<string, any>): PaymentCallback {
    const rawSignature = [
      `accessKey=${this.config.accessKey}`,
      `amount=${data.amount}`,
      `extraData=${data.extraData || ''}`,
      `message=${data.message}`,
      `orderId=${data.orderId}`,
      `orderInfo=${data.orderInfo}`,
      `orderType=${data.orderType}`,
      `partnerCode=${data.partnerCode}`,
      `payType=${data.payType}`,
      `requestId=${data.requestId}`,
      `responseTime=${data.responseTime}`,
      `resultCode=${data.resultCode}`,
      `transId=${data.transId}`,
    ].join('&');

    const expectedSignature = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(rawSignature)
      .digest('hex');

    const isValid = data.signature === expectedSignature;
    const status: PaymentCallback['status'] = data.resultCode === 0 ? 'SUCCESS' : 'FAILED';

    return {
      provider: 'MOMO',
      transactionId: String(data.transId || ''),
      orderId: String(data.orderId || ''),
      amount: new Decimal(data.amount || 0),
      status,
      message: data.message || (status === 'SUCCESS' ? 'Thanh toán MoMo thành công' : 'Thanh toán MoMo thất bại'),
      rawData: data,
      signature: data.signature || '',
      isValid,
    };
  }
}

// ─── ZaloPay Gateway ─────────────────────────────────────────

/**
 * ZaloPay — Zalo's payment platform
 * Deep integration with Zalo app (~75M users)
 */
export class ZaloPayGateway {
  constructor(private config: NonNullable<PaymentGatewayConfig['zalopay']>) {}

  createPayment(request: PaymentRequest): PaymentResponse {
    const transId = Date.now();
    const appTransId = `${this.formatDate(new Date())}_${transId}`;

    const orderData = {
      app_id: this.config.appId,
      app_trans_id: appTransId,
      app_user: request.customerPhone,
      app_time: Date.now(),
      amount: request.amount.toFixed(0),
      item: JSON.stringify([]),
      description: request.description,
      embed_data: JSON.stringify({ redirecturl: request.returnUrl }),
      bank_code: '',
      callback_url: this.config.callbackUrl,
    };

    // HMAC SHA256: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
    const data = `${orderData.app_id}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.item}`;
    const mac = crypto
      .createHmac('sha256', this.config.key1)
      .update(data)
      .digest('hex');

    return {
      success: true,
      transactionId: appTransId,
      paymentUrl: `${this.config.endpoint}/v2/create`,
      message: 'Đang kết nối ZaloPay...',
      rawResponse: { ...orderData, mac },
    };
  }

  verifyCallback(data: Record<string, any>): PaymentCallback {
    const mac = crypto
      .createHmac('sha256', this.config.key2)
      .update(data.data || '')
      .digest('hex');

    const isValid = mac === data.mac;

    let parsedData: Record<string, any> = {};
    try {
      parsedData = JSON.parse(data.data || '{}');
    } catch { /* ignore */ }

    return {
      provider: 'ZALOPAY',
      transactionId: String(parsedData.zp_trans_id || ''),
      orderId: String(parsedData.app_trans_id || ''),
      amount: new Decimal(parsedData.amount || 0),
      status: isValid ? 'SUCCESS' : 'FAILED',
      message: isValid ? 'Thanh toán ZaloPay thành công' : 'Chữ ký không hợp lệ',
      rawData: data,
      signature: data.mac || '',
      isValid,
    };
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear().toString().slice(-2)}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  }
}

// ─── Bank Transfer (VietQR) ──────────────────────────────────

/**
 * VietQR — Vietnamese interbank QR standard
 * Supports all 63 banks via Napas network
 */
export class BankTransferGateway {
  constructor(private config: NonNullable<PaymentGatewayConfig['bankTransfer']>) {}

  createPayment(request: PaymentRequest): PaymentResponse {
    // Transfer content format: [OrderNumber] [CustomerName]
    const transferContent = `${request.orderNumber} ${request.customerName}`
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .substring(0, 50);

    const bankInfo: BankTransferInfo = {
      bankName: this.config.bankName,
      accountNumber: this.config.accountNumber,
      accountName: this.config.accountName,
      branch: this.config.branch,
      amount: request.amount.toFixed(0),
      transferContent,
      qrData: this.generateVietQR(request.amount, transferContent),
    };

    return {
      success: true,
      transactionId: `BT-${Date.now()}`,
      bankInfo,
      qrCode: bankInfo.qrData,
      message: `Vui lòng chuyển khoản ${request.amount.toFixed(0)} VNĐ với nội dung: ${transferContent}`,
    };
  }

  /**
   * Generate VietQR data string
   * Format per VietQR specification (Napas EMVCo QR)
   */
  private generateVietQR(amount: Decimal, content: string): string {
    // Simplified VietQR data — in production use VietQR API
    const bankBin = this.getBankBIN(this.config.bankName);
    return [
      `00020101021238`,
      `53037045802VN`,
      `6304`, // CRC placeholder
      `bank:${bankBin}`,
      `acc:${this.config.accountNumber}`,
      `amount:${amount.toFixed(0)}`,
      `memo:${content}`,
    ].join('|');
  }

  private getBankBIN(bankName: string): string {
    const bins: Record<string, string> = {
      'Vietcombank': '970436',
      'VietinBank': '970415',
      'BIDV': '970418',
      'Techcombank': '970407',
      'MB Bank': '970422',
      'ACB': '970416',
      'Sacombank': '970403',
      'VPBank': '970432',
      'TPBank': '970423',
      'HDBank': '970437',
      'OCB': '970448',
      'SHB': '970443',
    };
    return bins[bankName] || '970436'; // Default: Vietcombank
  }
}

// ─── COD Handler ─────────────────────────────────────────────

/**
 * Cash on Delivery — still dominant in Vietnam (~60% of e-commerce)
 */
export class CODHandler {
  createPayment(request: PaymentRequest): PaymentResponse {
    return {
      success: true,
      transactionId: `COD-${Date.now()}`,
      message: `Thanh toán khi nhận hàng: ${request.amount.toFixed(0)} VNĐ`,
    };
  }
}

// ─── Payment Gateway Factory ─────────────────────────────────

export class PaymentGatewayManager {
  private vnpay?: VNPayGateway;
  private momo?: MoMoGateway;
  private zalopay?: ZaloPayGateway;
  private bankTransfer?: BankTransferGateway;
  private cod: CODHandler;

  constructor(config: PaymentGatewayConfig) {
    if (config.vnpay) this.vnpay = new VNPayGateway(config.vnpay);
    if (config.momo) this.momo = new MoMoGateway(config.momo);
    if (config.zalopay) this.zalopay = new ZaloPayGateway(config.zalopay);
    if (config.bankTransfer) this.bankTransfer = new BankTransferGateway(config.bankTransfer);
    this.cod = new CODHandler();
  }

  /**
   * Create payment for any supported method
   */
  createPayment(request: PaymentRequest): PaymentResponse {
    switch (request.method) {
      case 'VNPAY':
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        if (!this.vnpay) throw new Error('VNPay chưa được cấu hình');
        return this.vnpay.createPaymentUrl(request);

      case 'MOMO':
        if (!this.momo) throw new Error('MoMo chưa được cấu hình');
        return this.momo.createPayment(request);

      case 'ZALOPAY':
        if (!this.zalopay) throw new Error('ZaloPay chưa được cấu hình');
        return this.zalopay.createPayment(request);

      case 'BANK_TRANSFER':
        if (!this.bankTransfer) throw new Error('Thông tin ngân hàng chưa được cấu hình');
        return this.bankTransfer.createPayment(request);

      case 'COD':
        return this.cod.createPayment(request);

      default:
        throw new Error(`Phương thức thanh toán không được hỗ trợ: ${request.method}`);
    }
  }

  /**
   * Verify payment callback from any provider
   */
  verifyCallback(provider: string, data: Record<string, any>): PaymentCallback {
    switch (provider.toUpperCase()) {
      case 'VNPAY':
        if (!this.vnpay) throw new Error('VNPay chưa được cấu hình');
        return this.vnpay.verifyCallback(data);

      case 'MOMO':
        if (!this.momo) throw new Error('MoMo chưa được cấu hình');
        return this.momo.verifyCallback(data);

      case 'ZALOPAY':
        if (!this.zalopay) throw new Error('ZaloPay chưa được cấu hình');
        return this.zalopay.verifyCallback(data);

      default:
        throw new Error(`Không hỗ trợ callback từ: ${provider}`);
    }
  }

  /**
   * Get available payment methods for a storefront
   */
  getAvailableMethods(): Array<{ method: string; name: string; icon: string; available: boolean }> {
    return [
      { method: 'COD', name: 'Thanh toán khi nhận hàng', icon: '💵', available: true },
      { method: 'BANK_TRANSFER', name: 'Chuyển khoản ngân hàng', icon: '🏦', available: !!this.bankTransfer },
      { method: 'VNPAY', name: 'VNPay (ATM/Visa/QR)', icon: '💳', available: !!this.vnpay },
      { method: 'MOMO', name: 'Ví MoMo', icon: '📱', available: !!this.momo },
      { method: 'ZALOPAY', name: 'ZaloPay', icon: '📲', available: !!this.zalopay },
      { method: 'CREDIT_CARD', name: 'Visa/Mastercard', icon: '💳', available: !!this.vnpay },
      { method: 'INSTALLMENT', name: 'Trả góp 0%', icon: '📋', available: !!this.vnpay },
    ];
  }
}

/**
 * Factory function
 */
export function createPaymentGateway(config: PaymentGatewayConfig): PaymentGatewayManager {
  return new PaymentGatewayManager(config);
}
