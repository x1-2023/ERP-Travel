/**
 * Vietnamese Currency (VNĐ) Formatting and Conversion Utilities
 * Handles VND formatting, number-to-words conversion, and parsing
 */

const CURRENCY_SYMBOL = "₫";
const DECIMAL_SEPARATOR = ",";
const THOUSANDS_SEPARATOR = ".";

/**
 * Format amount as Vietnamese Dong
 * Example: 1234567 => "1.234.567 ₫"
 *
 * @param amount - Amount in VNĐ (integer, no decimals)
 * @returns Formatted string with thousands separator and currency symbol
 */
export function formatVND(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new Error("Amount must be a finite number");
  }

  const roundedAmount = Math.round(amount);
  const formatted = roundedAmount
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);

  return `${formatted} ${CURRENCY_SYMBOL}`;
}

/**
 * Format amount with decimal places
 * Example: 1234567.89 => "1.234.567,89 ₫"
 *
 * @param amount - Amount in VNĐ
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatVNDWithDecimals(amount: number, decimals: number = 0): string {
  if (!Number.isFinite(amount)) {
    throw new Error("Amount must be a finite number");
  }

  if (decimals < 0 || decimals > 2) {
    throw new Error("Decimals must be between 0 and 2");
  }

  const fixed = amount.toFixed(decimals);
  const [integerPart, decimalPart] = fixed.split(".");

  const formatted = parseInt(integerPart, 10)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);

  if (decimals === 0) {
    return `${formatted} ${CURRENCY_SYMBOL}`;
  }

  return `${formatted}${DECIMAL_SEPARATOR}${decimalPart} ${CURRENCY_SYMBOL}`;
}

/**
 * Vietnamese number words
 */
const ONES = [
  "",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

const TENS = [
  "",
  "mười",
  "hai mươi",
  "ba mươi",
  "bốn mươi",
  "năm mươi",
  "sáu mươi",
  "bảy mươi",
  "tám mươi",
  "chín mươi",
];

const SCALE = [
  "",
  "nghìn",
  "triệu",
  "tỷ",
  "nghìn tỷ",
  "triệu tỷ",
];

/**
 * Convert number to Vietnamese words
 * Example: 1234567 => "Một triệu hai trăm ba mươi bốn nghìn năm trăm sáu mươi bảy đồng"
 *
 * @param amount - Amount in VNĐ (integer)
 * @returns Vietnamese text representation
 */
export function numberToWordsVN(amount: number): string {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error("Amount must be a non-negative integer");
  }

  if (amount === 0) {
    return "Không đồng";
  }

  const parts: string[] = [];
  let scale = 0;

  while (amount > 0 && scale < SCALE.length) {
    const chunk = amount % 1000;
    if (chunk !== 0) {
      const chunkWords = convertChunkToWords(chunk);
      if (scale > 0) {
        parts.unshift(`${chunkWords} ${SCALE[scale]}`);
      } else {
        parts.unshift(chunkWords);
      }
    }
    amount = Math.floor(amount / 1000);
    scale++;
  }

  const result = parts.join(" ").trim();
  return result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
}

/**
 * Convert three-digit chunk to Vietnamese words
 */
function convertChunkToWords(num: number): string {
  if (num === 0) {
    return "";
  }

  const parts: string[] = [];

  const hundreds = Math.floor(num / 100);
  if (hundreds > 0) {
    parts.push(`${ONES[hundreds]} trăm`);
  }

  const remainder = num % 100;
  if (remainder > 0) {
    if (remainder < 10) {
      if (remainder > 0) {
        parts.push(ONES[remainder]);
      }
    } else if (remainder === 10) {
      parts.push("mười");
    } else if (remainder < 20) {
      parts.push(`mười ${ONES[remainder - 10]}`);
    } else {
      const tens = Math.floor(remainder / 10);
      const ones = remainder % 10;
      parts.push(TENS[tens]);
      if (ones > 0) {
        parts.push(ONES[ones]);
      }
    }
  }

  return parts.join(" ");
}

/**
 * Parse Vietnamese formatted number
 * Example: "1.234.567 ₫" => 1234567
 *
 * @param formatted - Formatted Vietnamese number string
 * @returns Parsed integer amount
 */
export function parseVND(formatted: string): number {
  if (!formatted || typeof formatted !== "string") {
    throw new Error("Input must be a non-empty string");
  }

  // Remove currency symbol and whitespace
  let cleaned = formatted
    .replace(CURRENCY_SYMBOL, "")
    .replace(/\s/g, "")
    .trim();

  // Replace thousands separator
  cleaned = cleaned.replace(new RegExp("\\" + THOUSANDS_SEPARATOR, "g"), "");

  // Replace decimal separator if present
  cleaned = cleaned.replace(DECIMAL_SEPARATOR, ".");

  const parsed = parseFloat(cleaned);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Invalid number format");
  }

  return Math.round(parsed);
}

/**
 * Convert between currency amounts
 */
export function convertCurrency(
  amount: number,
  exchangeRate: number
): number {
  if (amount < 0 || exchangeRate <= 0) {
    throw new Error("Invalid amount or exchange rate");
  }

  return Math.round(amount * exchangeRate);
}

/**
 * Calculate percentage of amount
 */
export function calculatePercentage(amount: number, percentage: number): number {
  if (amount < 0 || percentage < 0 || percentage > 100) {
    throw new Error("Invalid amount or percentage");
  }

  return Math.round((amount * percentage) / 100);
}

/**
 * Add amounts
 */
export function addAmounts(...amounts: number[]): number {
  const sum = amounts.reduce((acc, val) => {
    if (val < 0) {
      throw new Error("Amounts must be non-negative");
    }
    return acc + val;
  }, 0);

  return Math.round(sum);
}

/**
 * Subtract amounts
 */
export function subtractAmounts(minuend: number, subtrahend: number): number {
  if (minuend < 0 || subtrahend < 0) {
    throw new Error("Amounts must be non-negative");
  }

  return Math.max(0, Math.round(minuend - subtrahend));
}

/**
 * Check if value is valid currency amount
 */
export function isValidCurrencyAmount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    Number.isInteger(value)
  );
}

/**
 * Compare two currency amounts
 */
export function compareCurrencyAmounts(
  amount1: number,
  amount2: number
): -1 | 0 | 1 {
  if (amount1 < amount2) return -1;
  if (amount1 > amount2) return 1;
  return 0;
}

export default {
  formatVND,
  formatVNDWithDecimals,
  numberToWordsVN,
  parseVND,
  convertCurrency,
  calculatePercentage,
  addAmounts,
  subtractAmounts,
  isValidCurrencyAmount,
  compareCurrencyAmounts,
};
