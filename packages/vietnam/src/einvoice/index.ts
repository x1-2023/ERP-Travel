/**
 * E-Invoice Module
 * Handles generation, validation, and provider integration for Vietnamese e-invoices
 * Nghị định 123/2020/NĐ-CP compliance
 */

export * from "./types.js";
export * from "./generator.js";
export * from "./providers.js";

import * as generator from "./generator.js";
import * as providers from "./providers.js";

export default {
  generator,
  providers,
};
