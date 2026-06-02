/**
 * Tax Calculation and Reporting Module
 * Covers VAT, PIT, CIT and compliance with Vietnamese regulations
 */

export * from "./vat.js";
export * from "./pit.js";
export * from "./cit.js";
export * from "./reports.js";

// Re-export common functions
import * as vat from "./vat.js";
import * as pit from "./pit.js";
import * as cit from "./cit.js";
import * as reports from "./reports.js";

export default {
  vat,
  pit,
  cit,
  reports,
};
