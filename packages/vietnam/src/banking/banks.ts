/**
 * Vietnamese Bank Directory
 * Top 20 commercial banks with metadata for VietQR and transfers
 */

import { BankCode, BankInfo } from "../types/index.js";

/**
 * Complete bank directory
 * Includes: code, name, English name, SWIFT code, BIN for VietQR
 */
const VIETNAMESE_BANKS: Record<BankCode, BankInfo> = {
  VCB: {
    code: BankCode.VCB,
    name: "Ngân hàng Ngoại thương Việt Nam",
    englishName: "Vietcombank",
    swiftCode: "BFTVVNVX",
    bin: "970436",
  },
  BIDV: {
    code: BankCode.BIDV,
    name: "Ngân hàng Đầu tư và Phát triển Việt Nam",
    englishName: "Bank for Investment and Development of Vietnam",
    swiftCode: "BIDVVNVX",
    bin: "970418",
  },
  TCB: {
    code: BankCode.TCB,
    name: "Ngân hàng Kỹ thương Việt Nam",
    englishName: "Techcombank",
    swiftCode: "TECHVNVX",
    bin: "970407",
  },
  MB: {
    code: BankCode.MB,
    name: "Ngân hàng Quân đội",
    englishName: "MB Bank",
    swiftCode: "MSCBVNVX",
    bin: "970422",
  },
  VPB: {
    code: BankCode.VPB,
    name: "Ngân hàng VPBank",
    englishName: "VPBank",
    swiftCode: "VPBKVNVX",
    bin: "970432",
  },
  ACB: {
    code: BankCode.ACB,
    name: "Ngân hàng Á Châu",
    englishName: "Asia Commercial Bank",
    swiftCode: "ASCBVNVX",
    bin: "970425",
  },
  SHB: {
    code: BankCode.SHB,
    name: "Ngân hàng SHB",
    englishName: "SHB",
    swiftCode: "SHBKVNVX",
    bin: "970443",
  },
  TPB: {
    code: BankCode.TPB,
    name: "Ngân hàng TPBank",
    englishName: "TPBank",
    swiftCode: "TPBKVNVX",
    bin: "970423",
  },
  HDB: {
    code: BankCode.HDB,
    name: "Ngân hàng HDBank",
    englishName: "HDBank",
    swiftCode: "HDBKVNVX",
    bin: "970437",
  },
  STB: {
    code: BankCode.STB,
    name: "Ngân hàng Sacombank",
    englishName: "Sacombank",
    swiftCode: "SACOMVN",
    bin: "970424",
  },
  EXB: {
    code: BankCode.EXB,
    name: "Ngân hàng Xuất nhập khẩu Việt Nam",
    englishName: "Exim Bank",
    swiftCode: "EXIMBVN",
    bin: "970419",
  },
  MBB: {
    code: BankCode.MBB,
    name: "Ngân hàng Quân đội",
    englishName: "Military Commercial Bank",
    swiftCode: "MCBKVNVX",
    bin: "970426",
  },
  VIB: {
    code: BankCode.VIB,
    name: "Ngân hàng VIB",
    englishName: "Vietnam International Bank",
    swiftCode: "VIBKVNVX",
    bin: "970441",
  },
  CTG: {
    code: BankCode.CTG,
    name: "Ngân hàng SeABank",
    englishName: "Southeast Asia Bank",
    swiftCode: "CTGDVNVX",
    bin: "970412",
  },
  OCB: {
    code: BankCode.OCB,
    name: "Ngân hàng Phương Đông",
    englishName: "Orient Commercial Bank",
    swiftCode: "ORCBVNVX",
    bin: "970448",
  },
  VRB: {
    code: BankCode.VRB,
    name: "Ngân hàng VRB",
    englishName: "Vietnam Rubber Bank",
    swiftCode: "VRBBVNVX",
    bin: "970456",
  },
  NAB: {
    code: BankCode.NAB,
    name: "Ngân hàng Nam Á",
    englishName: "Nam A Bank",
    swiftCode: "NAMAVNVX",
    bin: "970452",
  },
  BVB: {
    code: BankCode.BVB,
    name: "Ngân hàng BVBANK",
    englishName: "BVBANK",
    swiftCode: "BVBKVNVX",
    bin: "970450",
  },
  PGB: {
    code: BankCode.PGB,
    name: "Ngân hàng PGB",
    englishName: "PGB",
    swiftCode: "PGBKVNVX",
    bin: "970445",
  },
  BAB: {
    code: BankCode.BAB,
    name: "Ngân hàng Bắc Á",
    englishName: "Bac A Bank",
    swiftCode: "NASCVNVX",
    bin: "970409",
  },
};

/**
 * Get bank information by code
 */
export function getBankByCode(code: BankCode): BankInfo | null {
  return VIETNAMESE_BANKS[code] || null;
}

/**
 * Get all banks
 */
export function getAllBanks(): BankInfo[] {
  return Object.values(VIETNAMESE_BANKS);
}

/**
 * Search bank by name
 */
export function searchBankByName(name: string): BankInfo[] {
  const searchTerm = name.toLowerCase();
  return getAllBanks().filter(
    (bank) =>
      bank.name.toLowerCase().includes(searchTerm) ||
      bank.englishName.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get bank by BIN (Bank Identification Number)
 */
export function getBankByBIN(bin: string): BankInfo | null {
  return (
    getAllBanks().find((bank) => bank.bin === bin) || null
  );
}

/**
 * Get bank by SWIFT code
 */
export function getBankBySWIFT(swiftCode: string): BankInfo | null {
  return (
    getAllBanks().find((bank) => bank.swiftCode === swiftCode) || null
  );
}

/**
 * Check if bank code exists
 */
export function isBankCodeValid(code: string): code is BankCode {
  return code in VIETNAMESE_BANKS;
}

/**
 * Get all bank codes
 */
export function getAllBankCodes(): BankCode[] {
  return Object.keys(VIETNAMESE_BANKS) as BankCode[];
}

/**
 * Format bank information for display
 */
export function formatBankInfo(bank: BankInfo): string {
  return `${bank.name} (${bank.englishName}) - ${bank.code}`;
}

/**
 * Common bank shortcuts
 */
export const MAJOR_BANKS = {
  VIETCOMBANK: getBankByCode(BankCode.VCB),
  BIDV: getBankByCode(BankCode.BIDV),
  TECHCOMBANK: getBankByCode(BankCode.TCB),
  MB_BANK: getBankByCode(BankCode.MB),
  VPBANK: getBankByCode(BankCode.VPB),
};

export default {
  getBankByCode,
  getAllBanks,
  searchBankByName,
  getBankByBIN,
  getBankBySWIFT,
  isBankCodeValid,
  getAllBankCodes,
  formatBankInfo,
  MAJOR_BANKS,
};
